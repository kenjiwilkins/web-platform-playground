// Vercel の Ignored Build Step。前回のデプロイから、このプロジェクトに関わる変更がなければビルドを省く。
//   使い方（vercel.json の ignoreCommand、Root Directory から実行される）:
//     node ../../tools/vercel-ignore.mjs @wpp/web
//   終了コード: 0 = ビルドしない / 1 = ビルドする（Vercel の約束事）
//
// turbo-ignore をそのまま使わない理由: turbo はワークスペースのパッケージ単位で変更を見るので、
// playgrounds/ や tsconfig.base.json、.nvmrc の変更を「変更なし」と判定してしまう。
// そこで turbo の判定（ソースと lockfile の依存の変化）に、下の ALWAYS の判定を足す。
// 判定できないとき（前回の SHA がない・履歴にない・turbo が失敗）は、安全側に倒してビルドする。
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BUILD = 1;
const SKIP = 0;

/**
 * turbo が拾わないが、どのプロジェクトのビルド結果も変えうるファイル。
 * このスクリプト自身も含める（判定を変えたら、両方のプロジェクトを一度ビルドし直す）。
 */
const ALWAYS = [
  /^playgrounds\//,
  /^tsconfig\.base\.json$/,
  /^\.nvmrc$/,
  /^pnpm-workspace\.yaml$/,
  /^tools\/vercel-ignore\.mjs$/,
];

const pkg = process.argv[2];
const base = process.env.VERCEL_GIT_PREVIOUS_SHA;
const root = new URL('../', import.meta.url).pathname;

function exit(code, reason) {
  console.log(
    `vercel-ignore ${pkg}: ${code === SKIP ? 'ビルドしない' : 'ビルドする'}（${reason}）`,
  );
  process.exit(code);
}

const git = (...args) =>
  execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

if (!pkg) exit(BUILD, 'パッケージ名の指定がない');
if (!base) exit(BUILD, 'VERCEL_GIT_PREVIOUS_SHA がない（このブランチの初回デプロイなど）');
try {
  git('cat-file', '-e', `${base}^{commit}`);
} catch {
  exit(BUILD, `前回の SHA ${base.slice(0, 7)} が clone の履歴にない`);
}

// 同じコミットのデプロイは、ダッシュボードの Redeploy など人が明示的に起こしたもの。
// 環境変数だけを変えたときに必要なので、差分がなくてもビルドする。
if (git('rev-parse', `${base}^{commit}`) === git('rev-parse', 'HEAD')) {
  exit(BUILD, '前回と同じコミットの再デプロイ');
}

const changed = git('diff', '--name-only', base, 'HEAD').split('\n').filter(Boolean);

const hit = changed.find((f) => ALWAYS.some((re) => re.test(f)));
if (hit) exit(BUILD, `${hit} が変わった`);

// ルートの package.json は devDependencies（lint や E2E のツール）以外が変わったときだけビルドする
if (changed.includes('package.json')) {
  const read = (rev) => {
    const json = JSON.parse(git('show', `${rev}:package.json`));
    delete json.devDependencies;
    return JSON.stringify(json);
  };
  if (read(base) !== read('HEAD')) exit(BUILD, 'package.json の devDependencies 以外が変わった');
}

// ソースと依存（lockfile を含む）の変化は turbo に判定させる。
// Ignored Build Step は依存のインストール前に走るので、ルートと同じ版の turbo を npx で使う。
const turboVersion = JSON.parse(readFileSync(`${root}package.json`, 'utf8')).devDependencies.turbo;
let packages;
try {
  const dry = execFileSync(
    'npx',
    ['-y', `turbo@${turboVersion}`, 'run', 'build', `--filter=${pkg}...[${base}]`, '--dry=json'],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  );
  packages = JSON.parse(dry).packages;
} catch (error) {
  exit(BUILD, `turbo の判定に失敗した: ${error.message}`);
}
if (packages.length > 0) exit(BUILD, `${packages.join(', ')} に変更がある`);
exit(SKIP, `${pkg} とその依存に変更がない`);
