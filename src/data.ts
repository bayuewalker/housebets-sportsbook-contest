export type Sport = 'Football' | 'Tennis' | 'Basketball' | 'Esports';
export type Category = 'Popular' | 'Goals' | 'Halves' | 'Handicaps' | 'Goalscorers' | 'Corners & Cards';
export interface Outcome { id: string; label: string; odds: number; previous?: number }
export interface Market { id: string; name: string; category: Category; outcomes: Outcome[]; suspended: boolean }
export interface Fixture { id: string; sport: Sport; league: string; country: string; home: string; away: string; homeCode: string; awayCode: string; colors: [string,string]; live: boolean; clock: string; score: [number,number]; day: 'Today'|'Tomorrow'; time: string; players: string[]; markets: Market[] }
export const categories: Category[] = ['Popular','Goals','Halves','Handicaps','Goalscorers','Corners & Cards'];
export const leagues = ['Premier League','Champions League','LaLiga','Serie A','Bundesliga'];
function market(id: string, name: string, category: Category, labels: string[], prices: number[], suspended = false): Market {
  return {id,name,category,suspended,outcomes:labels.map((label,i)=>({id:`${id}-${i}`,label,odds:prices[i]}))};
}
function footballMarkets(home: string, away: string, odds: number[], players: string[], live: boolean, score: [number,number]): Market[] {
  const goals = score[0] + score[1];
  const mainLine = live ? Math.max(2.5, goals + 0.5) : 2.5;
  const bothScored = live && score.every(n => n > 0);
  return [market('result','Match result','Popular',[home,'Draw',away],odds),market('goals25',`Total goals · ${mainLine}`,'Popular',[`Over ${mainLine}`,`Under ${mainLine}`],[1.62,2.3]),bothScored ? market('parity','Total goals · odd/even','Popular',['Odd','Even'],[1.88,1.92]) : market('btts','Both teams to score','Popular',['Yes','No'],[1.88,1.92]),market('goals35',`Total goals · ${mainLine+1}`,'Goals',[`Over ${mainLine+1}`,`Under ${mainLine+1}`],[2.45,1.55]),market('nextgoal','Next goal','Goals',[home,'No more goals',away],[1.72,4.8,3.4]),market('half','Second half result','Halves',[home,'Draw',away],[1.9,2.6,4.2]),market('halfgoals','Second half goals · 1.5','Halves',['Over 1.5','Under 1.5'],[1.85,1.95]),market('handicap','Asian handicap · -1.0','Handicaps',[`${home} -1.0`,`${away} +1.0`],[1.92,1.9]),market('handicap15','Asian handicap · -1.5','Handicaps',[`${home} -1.5`,`${away} +1.5`],[2.45,1.58]),market('scorer','Next goalscorer','Goalscorers',players,[3.8,4.5,5.2]),market('anyscorer','Anytime goalscorer','Goalscorers',players,[2.2,2.8,3.1]),market('corners','Total corners · 9.5','Corners & Cards',['Over 9.5','Under 9.5'],[1.8,2.05]),market('cards','Total cards · 3.5','Corners & Cards',['Over 3.5','Under 3.5'],[1.75,2.15],true)];
}
function football(id:string,league:string,country:string,home:string,away:string,codes:[string,string],colors:[string,string],live:boolean,score:[number,number],time:string,odds:number[],players:string[],day:'Today'|'Tomorrow'='Today',clock='67:24'):Fixture {
 return {id,sport:'Football',league,country,home,away,homeCode:codes[0],awayCode:codes[1],colors,live,clock:live?clock:'',score,time,day,players,markets:footballMarkets(home,away,odds,players,live,score)};
}
export function createFixtures(): Fixture[] { return [
 football('ars-bha','Premier League','England','Arsenal','Brighton',['ARS','BHA'],['#b94552','#397fbc'],true,[2,1],'LIVE',[1.48,4.6,7.5],['Bukayo Saka','Kai Havertz','Danny Welbeck']),
 football('liv-mun','Premier League','England','Liverpool','Manchester United',['LIV','MUN'],['#c64554','#a74742'],false,[0,0],'20:00',[1.65,4.1,4.8],['Mohamed Salah','Cody Gakpo','Bruno Fernandes']),
 football('rma-bay','Champions League','Europe','Real Madrid','Bayern Munich',['RMA','BAY'],['#a7a7c4','#c74751'],false,[0,0],'21:00',[2.2,3.7,2.9],['Kylian Mbappé','Vinícius Júnior','Harry Kane']),
 football('bar-atm','LaLiga','Spain','Barcelona','Atlético Madrid',['BAR','ATM'],['#7e5aa5','#a45155'],true,[1,0],'LIVE',[1.72,3.6,5.1],['Lamine Yamal','Raphinha','Julián Álvarez'],'Today','38:12'),
 football('int-nap','Serie A','Italy','Inter','Napoli',['INT','NAP'],['#4d6cbb','#55a1ba'],false,[0,0],'20:45',[1.92,3.45,3.9],['Lautaro Martínez','Marcus Thuram','Romelu Lukaku']),
 football('dor-lev','Bundesliga','Germany','Dortmund','Leverkusen',['BVB','LEV'],['#d9b94e','#bd5156'],false,[0,0],'18:30',[2.55,3.6,2.6],['Serhou Guirassy','Julian Brandt','Patrik Schick'],'Tomorrow'),
 {id:'sin-alc',sport:'Tennis',league:'ATP Finals',country:'Italy',home:'Jannik Sinner',away:'Carlos Alcaraz',homeCode:'SIN',awayCode:'ALC',colors:['#be7c4d','#a3a75c'],live:true,clock:'Set 2 · 4–3',score:[1,0],day:'Today',time:'LIVE',players:['Jannik Sinner','Carlos Alcaraz'],markets:[market('winner','Match winner','Popular',['Jannik Sinner','Carlos Alcaraz'],[1.7,2.15])]},
 {id:'bos-nyk',sport:'Basketball',league:'NBA',country:'USA',home:'Boston Celtics',away:'New York Knicks',homeCode:'BOS',awayCode:'NYK',colors:['#459c80','#c7804e'],live:true,clock:'Q3 · 04:32',score:[78,72],day:'Today',time:'LIVE',players:['Jayson Tatum','Jalen Brunson'],markets:[market('winner','Match winner','Popular',['Boston Celtics','New York Knicks'],[1.45,2.8])]},
 {id:'nav-g2',sport:'Esports',league:'CS2 · Major',country:'International',home:'Natus Vincere',away:'G2 Esports',homeCode:'NAVI',awayCode:'G2',colors:['#c5aa4e','#8c94a1'],live:false,clock:'',score:[0,0],day:'Today',time:'19:30',players:['b1t','m0NESY'],markets:[market('winner','Match winner','Popular',['Natus Vincere','G2 Esports'],[1.85,1.95])]},
 ]; }
