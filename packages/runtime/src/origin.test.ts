import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin, originMatches } from './origin.ts';

const pattern = 'https://web-*-team.vercel.app';

test('* を含まないものは完全一致', () => {
  assert.ok(originMatches('https://web.example', 'https://web.example'));
  assert.ok(!originMatches('https://web.example', 'https://web.example.evil'));
  assert.ok(!originMatches('https://web.example', 'http://web.example'));
});

test('* は先頭ラベルの中の英小文字・数字・ハイフンに一致する', () => {
  assert.ok(originMatches(pattern, 'https://web-abc123-team.vercel.app'));
  assert.ok(originMatches(pattern, 'https://web-git-feat-x-team.vercel.app'));
});

test('ドットや空文字、別のスキームには一致しない', () => {
  assert.ok(!originMatches(pattern, 'https://web-team.vercel.app'));
  assert.ok(!originMatches(pattern, 'https://web-a.evil-team.vercel.app'));
  assert.ok(!originMatches(pattern, 'https://web-a-team.vercel.app.evil'));
  assert.ok(!originMatches(pattern, 'http://web-a-team.vercel.app'));
  assert.ok(!originMatches(pattern, 'https://web-A-team.vercel.app'));
  assert.ok(!originMatches(pattern, 'https://evil-web-a-team.vercel.app'));
});

test('許可リストのどれかに一致すれば許可', () => {
  const allowed = ['https://web.example', pattern];
  assert.ok(isAllowedOrigin(allowed, 'https://web.example'));
  assert.ok(isAllowedOrigin(allowed, 'https://web-x-team.vercel.app'));
  assert.ok(!isAllowedOrigin(allowed, 'https://other.vercel.app'));
  assert.ok(!isAllowedOrigin([], 'https://web.example'));
});
