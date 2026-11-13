// sandbox（実行専用オリジン）のビルド。
// Vercel の Build Output API (.vercel/output) で出力し、Playground ごとのヘッダを config.json の routes に書く。
// vercel.json と違い、ビルド時に生成したヘッダ設定がそのまま反映される。
import { build } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { loadPlaygrounds, sandboxHeaders } from '@wpp/schema';

const out = new URL('./.vercel/output/', import.meta.url);
const staticDir = new URL('static/', out);

// 親（web）として許可するオリジン。カンマ区切り。
const parentOrigins = (process.env.PARENT_ORIGINS ?? 'http://localhost:4321')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

rmSync(out, { recursive: true, force: true });
mkdirSync(staticDir, { recursive: true });

await build({
  stdin: {
    contents: `import { startRunner } from '@wpp/runtime'; startRunner(${JSON.stringify(parentOrigins)});`,
    resolveDir: new URL('.', import.meta.url).pathname,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  // captureConsole.toString() を文書に埋め込むため、ヘルパー関数の注入を避ける
  keepNames: false,
  outfile: new URL('runner.js', staticDir).pathname,
});

const runnerHtml = `<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><title>sandbox</title><script type="module" src="/runner.js"></script></head>
<body></body>
</html>
`;

const writeRunner = (path) => {
  const dir = new URL(`run/${path}/`, staticDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('index.html', dir), runnerHtml);
};

const defaults = {
  requires: { secureContext: false, crossOriginIsolated: false, permissions: [] },
};
const routes = [];
const playgrounds = loadPlaygrounds();

for (const pg of playgrounds) {
  writeRunner(pg.path);
  routes.push({
    src: `^/run/${pg.path}/?$`,
    headers: Object.fromEntries(sandboxHeaders(pg.meta).map((h) => [h.key, h.value])),
    continue: true,
  });
}
writeRunner('scratch');

writeFileSync(
  new URL('config.json', out),
  JSON.stringify(
    {
      version: 3,
      routes: [
        ...routes,
        {
          src: '/(.*)',
          headers: Object.fromEntries(sandboxHeaders(defaults).map((h) => [h.key, h.value])),
          continue: true,
        },
      ],
    },
    null,
    2,
  ),
);

console.log(`sandbox: ${playgrounds.length} playgrounds, parents = ${parentOrigins.join(', ')}`);
