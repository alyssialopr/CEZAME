// Sert un build statique en renvoyant index.html pour toute route inconnue (SPA).
import http from 'node:http';
import path from 'node:path';
import handler from 'serve-handler';

const [dir, port] = process.argv.slice(2);
const root = path.resolve(dir);

http
  .createServer((req, res) => handler(req, res, { public: root, rewrites: [{ source: '**', destination: '/index.html' }] }))
  .listen(Number(port), () => console.log(`SPA ${root} sur http://localhost:${port}`));
