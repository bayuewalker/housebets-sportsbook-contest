import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const portFlag = args.indexOf('--port');
const port = Number(portFlag === -1 ? 4173 : args[portFlag + 1]) || 4173;
const base = resolve('dist');

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const path = resolve(base, relative);
    if (!path.startsWith(base + sep) && path !== base) {
      res.writeHead(403).end();
      return;
    }
    const content = await readFile(path);
    res.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    }).end(content);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Housebets preview listening on ${port}`);
});
