import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const args=process.argv.slice(2),port=Number(args[args.indexOf('--port')+1])||4173;
const base=resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{try {const raw=new URL(req.url,'http://localhost').pathname;const path=resolve(base,decodeURIComponent(raw).replace(/^\/+/, '')||'index.html');if(!path.startsWith(base+sep)){res.writeHead(403).end();return;}const content=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'}).end(content);}catch{res.writeHead(404).end('Not found');}}).listen(port,'0.0.0.0',()=>console.log(`HOUSE//LIVE preview listening on ${port}`));
