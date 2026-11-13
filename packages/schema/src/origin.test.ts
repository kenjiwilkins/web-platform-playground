import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOrigin, parseOriginPattern, parseOrigins } from './origin.ts';

const fb = 'http://localhost:4322';

test('未設定・空文字・空白だけなら fallback を使う', () => {
  assert.equal(parseOrigin(undefined, 'X', fb), fb);
  assert.equal(parseOrigin('', 'X', fb), fb);
  assert.equal(parseOrigin('  ', 'X', fb), fb);
});

test('末尾のスラッシュと前後の空白を取り除く', () => {
  assert.equal(parseOrigin(' https://a.vercel.app/ ', 'X', fb), 'https://a.vercel.app');
});

test('スキームなし・パス付き・http(s) 以外はエラーにする', () => {
  assert.throws(() => parseOrigin('a.vercel.app', 'X', fb), /X/);
  assert.throws(() => parseOrigin('https://a.vercel.app/run/', 'X', fb), /オリジンだけ/);
  assert.throws(() => parseOrigin('ftp://a.example', 'X', fb), /http/);
});

test('カンマ区切りを検証して重複を除く', () => {
  assert.deepEqual(
    parseOrigins('https://a.vercel.app/, https://a.vercel.app,https://b.example', 'X', fb),
    ['https://a.vercel.app', 'https://b.example'],
  );
  assert.deepEqual(parseOrigins(undefined, 'X', 'http://localhost:4321'), [
    'http://localhost:4321',
  ]);
  assert.throws(() => parseOrigins('https://a.vercel.app,b.example', 'X', fb), /X/);
});

test('パターンは https://<prefix>*<suffix>.<domain> の形だけ受け付ける', () => {
  assert.equal(
    parseOriginPattern(' https://web-*-team.vercel.app/ ', 'X'),
    'https://web-*-team.vercel.app',
  );
  assert.deepEqual(parseOrigins('https://web.example, https://web-*-team.vercel.app', 'X', fb), [
    'https://web.example',
    'https://web-*-team.vercel.app',
  ]);
  for (const bad of [
    'https://*.vercel.app',
    'https://web-*.vercel.app',
    'https://*-team.vercel.app',
    'https://web-*-*-team.vercel.app',
    'http://web-*-team.vercel.app',
    'https://web.*-team.vercel.app',
    'https://web-*-team.app',
    'https://web-*-team.vercel.app/run/',
    'https://Web-*-team.vercel.app',
    'web-*-team.vercel.app',
  ]) {
    assert.throws(() => parseOriginPattern(bad, 'X'), /X/, bad);
  }
});
