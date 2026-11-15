/**
 * web-features の全機能に対して、Playground がどれだけ追加済みかを集計する。
 *
 *   pnpm coverage                   # docs/coverage.md を更新する
 *   pnpm coverage --candidates 10   # 次に追加する候補を JSON で出力する（ファイルは触らない）
 *
 * 候補の並び順: Baseline Newly（新しい順）→ Limited → Widely（新しい順）。
 * 「最新の Web 標準」を追うのが目的なので、新しく使えるようになった機能を先に出す。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { categories, categoryLabels, findPlaygroundsRoot, loadPlaygrounds } from '@wpp/schema';
import type { Category } from '@wpp/schema';
import data from 'web-features/data.json' with { type: 'json' };

type Baseline = 'high' | 'low' | false;
interface Feature {
  kind: string;
  name?: string;
  description?: string;
  discouraged?: unknown;
  compat_features?: string[];
  status?: { baseline: Baseline; baseline_low_date?: string };
}
type Row = {
  id: string;
  name: string;
  category: Category | 'other';
  baseline: Baseline;
  since: string;
  description: string;
};

const { values } = parseArgs({ options: { candidates: { type: 'string' } } });

/** BCD キーの先頭で Playground のカテゴリを決める。HTML > CSS > JS > API の順に優先する */
const categoryOf = (f: Feature): Category | 'other' => {
  const prefixes = new Set((f.compat_features ?? []).map((k) => k.split('.')[0]));
  if (prefixes.has('html')) return 'html';
  if (prefixes.has('css')) return 'css';
  if (prefixes.has('javascript')) return 'js';
  if (prefixes.has('api')) return 'api';
  return 'other';
};

const features = Object.entries(data.features as Record<string, Feature>);
const rows: Row[] = features
  .filter(([, f]) => f.kind === 'feature' && !f.discouraged)
  .map(([id, f]) => ({
    id,
    name: f.name ?? id,
    category: categoryOf(f),
    baseline: f.status?.baseline ?? false,
    since: f.status?.baseline_low_date?.replace(/^≤/, '') ?? '',
    description: f.description ?? '',
  }));

const playgrounds = loadPlaygrounds();
const covered = new Set(playgrounds.flatMap((pg) => pg.meta.webFeature ?? []));
const byId = new Map(rows.map((r) => [r.id, r]));

const label = (b: Baseline) => (b === 'high' ? 'Widely' : b === 'low' ? 'Newly' : 'Limited');
const rank = (b: Baseline) => (b === 'low' ? 0 : b === false ? 1 : 2);

const candidates = rows
  .filter((r) => r.category !== 'other' && !covered.has(r.id))
  .sort(
    (a, b) =>
      rank(a.baseline) - rank(b.baseline) ||
      b.since.localeCompare(a.since) ||
      a.id.localeCompare(b.id),
  );

if (values.candidates !== undefined) {
  const n = Number(values.candidates) || 10;
  console.log(
    JSON.stringify(
      candidates.slice(0, n).map((r) => ({ ...r, baseline: label(r.baseline) })),
      null,
      2,
    ),
  );
  process.exit(0);
}

const { version } = JSON.parse(readFileSync('node_modules/web-features/package.json', 'utf8')) as {
  version: string;
};
const pct = (a: number, b: number) => (b === 0 ? '—' : `${Math.round((a / b) * 100)}%`);
const cell = (s: string) => s.replaceAll('|', '\\|');

const lines: string[] = [
  '# Playground の追加状況',
  '',
  '> `pnpm coverage` が生成するファイルです。手で編集しないでください。',
  '',
  `- 更新日: ${new Date().toISOString().slice(0, 10)}`,
  `- 基準: web-features ${version}（廃止予定の機能と、HTML/CSS/JS/Web API 以外は集計から除く）`,
  `- Playground: ${playgrounds.length} 件（web-features に紐づく機能: ${covered.size} 件）`,
  '',
  '## カテゴリ別',
  '',
  '| カテゴリ | 追加済み | 全機能 | 割合 |',
  '| --- | ---: | ---: | ---: |',
];
for (const c of categories) {
  const all = rows.filter((r) => r.category === c);
  const done = all.filter((r) => covered.has(r.id)).length;
  lines.push(`| ${categoryLabels[c]} | ${done} | ${all.length} | ${pct(done, all.length)} |`);
}

lines.push(
  '',
  '## Baseline 別',
  '',
  '| Baseline | 追加済み | 全機能 | 割合 |',
  '| --- | ---: | ---: | ---: |',
);
const inScope = rows.filter((r) => r.category !== 'other');
for (const b of ['low', false, 'high'] as const) {
  const all = inScope.filter((r) => r.baseline === b);
  const done = all.filter((r) => covered.has(r.id)).length;
  lines.push(`| ${label(b)} | ${done} | ${all.length} | ${pct(done, all.length)} |`);
}

lines.push(
  '',
  '## 追加済みの Playground',
  '',
  '| パス | 機能 (web-features) | Baseline | 追加日 |',
  '| --- | --- | --- | --- |',
);
for (const pg of [...playgrounds].sort((a, b) => a.path.localeCompare(b.path))) {
  const id = pg.meta.webFeature;
  const row = id ? byId.get(id) : undefined;
  lines.push(
    `| \`${pg.path}\` | ${id ? `\`${id}\`` : '—'} | ${row ? label(row.baseline) : '—'} | ${pg.meta.added} |`,
  );
}

lines.push(
  '',
  '## 次の候補（未追加）',
  '',
  'Baseline Newly（新しい順）→ Limited → Widely の順。上から選ぶのが基本。',
  '',
  '| 機能 (web-features) | 名前 | カテゴリ | Baseline | Newly 入り |',
  '| --- | --- | --- | --- | --- |',
);
for (const r of candidates.slice(0, 20)) {
  lines.push(
    `| \`${r.id}\` | ${cell(r.name)} | ${categoryLabels[r.category as Category]} | ${label(r.baseline)} | ${r.since || '—'} |`,
  );
}
lines.push('', `未追加は他に ${Math.max(candidates.length - 20, 0)} 件。`);

// 紐づけが切れた Playground（機能の改名・統合）は直す必要があるので目立たせる
const dangling = playgrounds.filter((pg) => pg.meta.webFeature && !byId.has(pg.meta.webFeature));
if (dangling.length) {
  lines.push('', '## 要確認', '');
  for (const pg of dangling) {
    lines.push(
      `- \`${pg.path}\`: \`${pg.meta.webFeature}\` が web-features に見つかりません（改名・統合・廃止予定の可能性）`,
    );
  }
}

writeFileSync(join(findPlaygroundsRoot(), '..', 'docs', 'coverage.md'), lines.join('\n') + '\n');
console.log(
  `docs/coverage.md を更新しました（追加済み ${covered.size} / 候補 ${candidates.length} 件）`,
);
