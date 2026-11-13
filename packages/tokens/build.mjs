// tokens.json（Claude Design System から取り込んだ正本）→ dist/tokens.css を生成する。
// ダークを既定テーマとし、[data-theme="light"] で上書きする。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('./tokens.json', import.meta.url), 'utf8'));
const [primary, ...others] = tokens.color.themes.map((t) => t.id);

const decl = (name, value) => `  --${name}: ${value};`;
const themed = (list, theme) =>
  list.filter((t) => typeof t.value === 'object').map((t) => decl(t.name, t.value[theme]));
const plain = (list) =>
  list.filter((t) => typeof t.value !== 'object').map((t) => decl(t.name, t.value));

const themedFamilies = [tokens.color.tokens, tokens.shadow.tokens];
const plainFamilies = ['spacing', 'radius', 'border-width', 'duration', 'easing'].map(
  (k) => tokens[k].tokens,
);
const typeVars = [
  decl('font-sans', tokens.type.families.sans),
  decl('font-mono', tokens.type.families.mono),
  ...tokens.type.styles.flatMap((s) => [
    decl(`${s.name}-size`, s.fontSize),
    decl(`${s.name}-line`, s.lineHeight),
    decl(`${s.name}-weight`, s.fontWeight),
  ]),
];

const css = [
  `/* ${tokens.name} — generated from tokens.json. Do not edit by hand. */`,
  `:root, [data-theme="${primary}"] {`,
  `  color-scheme: ${primary};`,
  ...themedFamilies.flatMap((f) => themed(f, primary)),
  ...plainFamilies.flatMap(plain),
  ...typeVars,
  '}',
  ...others.flatMap((theme) => [
    `[data-theme="${theme}"] {`,
    `  color-scheme: ${theme};`,
    ...themedFamilies.flatMap((f) => themed(f, theme)),
    '}',
  ]),
  '@media (prefers-reduced-motion: reduce) {',
  '  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }',
  '}',
  '',
].join('\n');

mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/tokens.css', import.meta.url), css);
console.log(
  `tokens.css: ${tokens.color.tokens.length} color tokens × ${tokens.color.themes.length} themes`,
);
