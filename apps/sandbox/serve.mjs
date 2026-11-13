// ローカル／E2E 用の簡易サーバ。.vercel/output/config.json の routes のヘッダを再現する。
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('./.vercel/output/', import.meta.url));
const config = JSON.parse(readFileSync(join(out, 'config.json'), 'utf8'));
const port = Number(process.env.PORT ?? 4322);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

createServer((req, res) => {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  for (const route of config.routes) {
    if (new RegExp(route.src).test(pathname)) {
      for (const [key, value] of Object.entries(route.headers ?? {})) res.setHeader(key, value);
    }
  }
  let file = join(out, 'static', pathname);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }
  res.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(port, () => console.log(`sandbox: http://localhost:${port}`));
