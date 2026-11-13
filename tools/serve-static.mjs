// E2E 用の静的サーバ（apps/web/dist を配信）。
// astro preview は非対話環境でバックグラウンド起動になり Playwright の webServer と相性が悪いので使わない。
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = normalize(process.argv[2] ?? 'apps/web/dist');
const port = Number(process.argv[3] ?? 4321);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  let file = normalize(join(root, pathname));
  if (!file.startsWith(root)) {
    res.statusCode = 403;
    res.end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }
  res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(port, () => console.log(`web: http://localhost:${port}`));
