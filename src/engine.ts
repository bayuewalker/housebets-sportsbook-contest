import { createFixtures, type Fixture, type Market, type Outcome } from './data';
export interface Selection { fixtureId:string; marketId:string; outcomeId:string; acceptedOdds:number; stake:string }
export interface Bet { id:string; fixtureId:string; fixture:string; market:string; outcome:string; odds:number; stake:number; return:number; status:'open'|'won'|'lost'|'cashed'; createdAt:string; cashOffer:number }
export interface State { fixtures:Fixture[]; selections:Selection[]; bets:Bet[]; favorites:string[]; balance:number; failNext:boolean; noLive:boolean; revision:number }
export type Resolved = { fixture:Fixture; market:Market; outcome:Outcome };
export function resolve(s:State, p:Selection):Resolved|undefined { const fixture=s.fixtures.find(f=>f.id===p.fixtureId); const market=fixture?.markets.find(m=>m.id===p.marketId); const outcome=market?.outcomes.find(o=>o.id===p.outcomeId); return fixture&&market&&outcome?{fixture,market,outcome}:undefined; }
export const money=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
export const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function stakeValue(value:string):number { return /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)?Number(value):NaN; }
export function selectionError(s:State,p:Selection):string|undefined {
 const r=resolve(s,p); if(!r) return 'Selection is unavailable. Remove it to continue.';
 if(r.market.suspended) return 'Market suspended. Wait for it to reopen or remove this selection.';
 if(r.outcome.odds!==p.acceptedOdds) return 'Odds changed. Accept the new price to continue.';
 const stake=stakeValue(p.stake); if(!Number.isFinite(stake)||stake<1||stake>1000) return 'Enter a stake from 1 to 1,000 USDT, with up to 2 decimals.';
}
export function initialState():State { return {fixtures:createFixtures(),selections:[],favorites:['team:Arsenal','league:Premier League'],balance:1000,failNext:false,noLive:false,revision:0,bets:[
{id:'HL-1048',fixtureId:'ars-bha',fixture:'Arsenal v Brighton',market:'Match result',outcome:'Arsenal',odds:1.9,stake:25,return:47.5,status:'open',createdAt:'Demo · 18:12',cashOffer:31.2},
{id:'HL-1047',fixtureId:'liv-mun',fixture:'Liverpool v Manchester United',market:'Total goals · 2.5',outcome:'Over 2.5',odds:1.85,stake:20,return:37,status:'won',createdAt:'Demo · Yesterday',cashOffer:0},
{id:'HL-1046',fixtureId:'rma-bay',fixture:'Real Madrid v Bayern Munich',market:'Match result',outcome:'Bayern Munich',odds:2.9,stake:10,return:0,status:'lost',createdAt:'Demo · Yesterday',cashOffer:0}
]}; }
export function toggleSelection(s:State,fixtureId:string,marketId:string,outcomeId:string):void {
 const fixture=s.fixtures.find(f=>f.id===fixtureId),market=fixture?.markets.find(m=>m.id===marketId),outcome=market?.outcomes.find(o=>o.id===outcomeId);
 if(!market||!outcome||market.suspended)return;
 const exists=s.selections.find(p=>p.fixtureId===fixtureId&&p.marketId===marketId&&p.outcomeId===outcomeId);
 if(exists)s.selections=s.selections.filter(p=>p!==exists); else s.selections.push({fixtureId,marketId,outcomeId,acceptedOdds:outcome.odds,stake:'10'}); s.revision++;
}
export function acceptChanges(s:State):void { for(const p of s.selections){const r=resolve(s,p); if(r&&!r.market.suspended)p.acceptedOdds=r.outcome.odds;} s.revision++; }
export function totalStake(s:State):number { return round(s.selections.reduce((n,p)=>n+(Number.isFinite(stakeValue(p.stake))?stakeValue(p.stake):0),0)); }
export function totalReturn(s:State):number { return round(s.selections.reduce((n,p)=>n+(Number.isFinite(stakeValue(p.stake))?round(stakeValue(p.stake)*p.acceptedOdds):0),0)); }
export function placementError(s:State):string|undefined { if(!s.selections.length)return 'Add a selection first.'; for(const p of s.selections){const e=selectionError(s,p);if(e)return e;} if(totalStake(s)>s.balance)return 'Not enough demo balance. Reduce your stakes.'; }
export function placeBets(s:State,now=new Date()):{ok:boolean;message:string} {
 const error=placementError(s);if(error)return {ok:false,message:error};
 if(s.failNext){s.failNext=false;return {ok:false,message:'Bet not placed. Connection interrupted. Your demo balance is unchanged. Try again.'};}
 const amount=totalStake(s),count=s.selections.length;
 const bets:Bet[]=s.selections.map((p,i)=>{const r=resolve(s,p)!;const stake=stakeValue(p.stake);return {id:`HL-${now.getTime()}-${i}`,fixtureId:r.fixture.id,fixture:`${r.fixture.home} v ${r.fixture.away}`,market:r.market.name,outcome:r.outcome.label,odds:p.acceptedOdds,stake,return:round(stake*p.acceptedOdds),status:'open',createdAt:`Demo · ${now.toISOString().slice(11,16)} UTC`,cashOffer:round(stake*.92)};});
 s.balance=round(s.balance-amount);s.bets.unshift(...bets);s.selections=[];s.revision++;return {ok:true,message:`${count} single bet${count===1?'':'s'} placed. ${money(amount)} USDT from your demo balance.`};
}
export function cashOut(s:State,id:string):boolean { const b=s.bets.find(b=>b.id===id); if(!b||b.status!=='open')return false;b.status='cashed';b.return=b.cashOffer;s.balance=round(s.balance+b.cashOffer);s.revision++;return true; }
export function settle(s:State):boolean { const b=s.bets.find(b=>b.status==='open');if(!b)return false;b.status='won';s.balance=round(s.balance+b.return);s.revision++;return true; }
export function moveOdds(s:State):void { const p=s.selections[0]; const r=p?resolve(s,p):undefined; const market=r?.market??s.fixtures[0].markets[0];for(const [i,o] of market.outcomes.entries()){o.previous=o.odds;o.odds=round(Math.max(1.05,o.odds+(i===0?.12:-.08)));} s.revision++; }
export function toggleSuspension(s:State):void {const r=s.selections[0]?resolve(s,s.selections[0]):undefined;const m=r?.market??s.fixtures[0].markets[0];m.suspended=!m.suspended;s.revision++;}
export function searchFixtures(fixtures:Fixture[],query:string):Fixture[] {const q=query.trim().toLocaleLowerCase();return fixtures.filter(f=>[f.home,f.away,f.league,f.sport,...f.players,...f.markets.map(m=>m.name)].some(v=>v.toLocaleLowerCase().includes(q)));}
