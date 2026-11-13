import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPlaygrounds } from './load.ts';
import { sandboxHeaders } from './headers.ts';

test('全 Playground の meta.yaml がスキーマを満たし、バリアントを持つ', () => {
  const playgrounds = loadPlaygrounds();
  assert.ok(playgrounds.length > 0);
  for (const pg of playgrounds) {
    assert.ok(pg.variants.length > 0, pg.path);
    assert.ok(
      pg.variants.every((v) => v.files.html || v.files.css || v.files.js),
      `${pg.path}: 空のバリアントがある`,
    );
  }
});

test('URL パスは小文字 kebab-case', () => {
  for (const pg of loadPlaygrounds()) {
    assert.match(pg.path, /^[a-z0-9-]+(\/[a-z0-9-]+)*$/, pg.path);
  }
});

test('crossOriginIsolated を要求すると COOP/COEP が付く', () => {
  const keys = sandboxHeaders({
    requires: { secureContext: true, crossOriginIsolated: true, permissions: ['camera'] },
  }).map((h) => h.key);
  assert.ok(keys.includes('Cross-Origin-Opener-Policy'));
  assert.ok(keys.includes('Cross-Origin-Embedder-Policy'));
  assert.ok(keys.includes('Permissions-Policy'));
});
