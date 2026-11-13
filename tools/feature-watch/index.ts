/**
 * web-features の2つのバージョンを比べ、新機能と Baseline の変化を Markdown で出力する。
 *
 *   pnpm feature-watch --base <git ref>            # base 時点のバージョンと、今入っているバージョンを比較
 *   pnpm feature-watch --base origin/main --out report.md
 *
 * Renovate が web-features を上げた PR で CI が実行し、結果を PR にコメントする。
 * main にマージされたら、Playground 未作成の新機能について Issue を起票する（--issues-json）。
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { loadPlaygrounds } from '@wpp/schema';
import current from 'web-features/data.json' with { type: 'json' };

type Baseline = 'high' | 'low' | false;
interface Feature {
  kind: string;
  name?: string;
  description?: string;
  group?: string | string[];
  status?: { baseline: Baseline };
}
type Features = Record<string, Feature>;

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    out: { type: 'string' },
    'issues-json': { type: 'string' },
  },
});

const versionAt = (ref: string): string => {
  const pkg = JSON.parse(
    execFileSync('git', ['show', `${ref}:package.json`], { encoding: 'utf8' }),
  ) as { devDependencies?: Record<string, string> };
  const version = pkg.devDependencies?.['web-features'];
  if (!version) throw new Error(`${ref} の package.json に web-features がありません`);
  return version;
};

const download = (version: string): Features => {
  const dir = mkdtempSync(join(tmpdir(), 'web-features-'));
  const tarball = execFileSync('npm', ['pack', `web-features@${version}`, '--silent'], {
    cwd: dir,
    encoding: 'utf8',
  }).trim();
  execFileSync('tar', ['-xzf', tarball], { cwd: dir });
  return (
    JSON.parse(readFileSync(join(dir, 'package', 'data.json'), 'utf8')) as { features: Features }
  ).features;
};

const newVersion = (
  JSON.parse(readFileSync('node_modules/web-features/package.json', 'utf8')) as {
    version: string;
  }
).version;
const oldVersion = values.base ? versionAt(values.base) : newVersion;
const before: Features =
  oldVersion === newVersion ? (current.features as Features) : download(oldVersion);
const after = current.features as Features;

const covered = new Set(loadPlaygrounds().flatMap((pg) => pg.meta.webFeature ?? []));
const label = (b: Baseline | undefined) =>
  b === 'high' ? 'Widely' : b === 'low' ? 'Newly' : b === false ? 'Limited' : '—';

const added = Object.entries(after).filter(
  ([id, f]) => f.kind === 'feature' && (!before[id] || before[id]?.kind !== 'feature'),
);
const changed = Object.entries(after).filter(([id, f]) => {
  const prev = before[id];
  return (
    f.kind === 'feature' && prev?.kind === 'feature' && prev.status?.baseline !== f.status?.baseline
  );
});

const row = ([id, f]: [string, Feature], extra = '') =>
  `| \`${id}\` | ${f.name ?? ''} | ${extra}${label(f.status?.baseline)} | ${covered.has(id) ? '✓' : '—'} |`;

const lines = [
  `## web-features ${oldVersion} → ${newVersion}`,
  '',
  `新機能 **${added.length}** 件 / Baseline の変化 **${changed.length}** 件`,
  '',
];
if (added.length) {
  lines.push('### 新機能', '', '| ID | 名前 | Baseline | Playground |', '|---|---|---|---|');
  lines.push(...added.map((e) => row(e)), '');
}
if (changed.length) {
  lines.push(
    '### Baseline の変化',
    '',
    '| ID | 名前 | Baseline | Playground |',
    '|---|---|---|---|',
  );
  lines.push(...changed.map((e) => row(e, `${label(before[e[0]]?.status?.baseline)} → `)), '');
}
if (!added.length && !changed.length) lines.push('変化はありません。');

const report = lines.join('\n') + '\n';
if (values.out) writeFileSync(values.out, report);
else process.stdout.write(report);

// Playground がまだない新機能・Baseline 入りした機能を Issue 候補として出力する
if (values['issues-json']) {
  const candidates = [...added, ...changed]
    .filter(([id]) => !covered.has(id))
    .map(([id, f]) => ({
      title: `Playground: ${f.name ?? id}`,
      body: [
        `web-features \`${id}\`（${label(f.status?.baseline)}）`,
        '',
        f.description ?? '',
        '',
        `\`pnpm new <category>/<group>/<slug> --feature ${id}\` で雛形を作れます。`,
      ].join('\n'),
      featureId: id,
    }));
  writeFileSync(values['issues-json'], JSON.stringify(candidates, null, 2));
}
