# デプロイとプレビュー（Vercel）

Vercel のプロジェクトは2つ。どちらも `main` へのマージが本番デプロイになる。

| プロジェクト                      | Root Directory | 本番の URL                                         |
| --------------------------------- | -------------- | -------------------------------------------------- |
| `webplatform-playground`          | `apps/web`     | https://web-amber-theta-23.vercel.app              |
| `web-platform-playground-sandbox` | `apps/sandbox` | https://web-platform-playground-sandbox.vercel.app |

チームのスコープは `michael-kenji-wilkins-projects`。プレビューの URL は
`<プロジェクト名>-<hash>-<スコープ>.vercel.app` と `<プロジェクト名>-git-<ブランチ>-<スコープ>.vercel.app` になる。
ただしサブドメインは 1 ラベル 63 文字までなので、長いときは Vercel が短縮する。
このリポジトリではブランチ用の URL が `webplatform-playgroun-git-5fcc55-michael-kenji-wilkins-projects.vercel.app` のように、
プロジェクト名が 21 文字（`webplatform-playgroun`）に切られ、ブランチ名はハッシュになる。
パターンはこの短縮後の共通部分に合わせる。

## 環境変数

| プロジェクト | 変数                    | Production                                       | Preview                        |
| ------------ | ----------------------- | ------------------------------------------------ | ------------------------------ |
| web          | `SITE_URL`              | `https://web-amber-theta-23.vercel.app`          | 同じ（canonical は本番を指す） |
| web          | `PUBLIC_SANDBOX_ORIGIN` | 本番の sandbox                                   | **同じく本番の sandbox**       |
| sandbox      | `PARENT_ORIGINS`        | 本番の web と web のプレビューのパターン（下記） | 使わない                       |

```
PARENT_ORIGINS=https://web-amber-theta-23.vercel.app,https://webplatform-playgroun*-michael-kenji-wilkins-projects.vercel.app
```

値はビルド時に検証される（`packages/schema/src/origin.ts`）。スキームの付け忘れやパス付きの値はビルドが止まる。
変えたら再デプロイが必要（どれもビルド時に埋め込まれる）。ダッシュボードの Redeploy でよい（同じコミットの再デプロイは必ずビルドする）。

## プレビューのルール

1. **`renovate/*` ではプレビューを作らない。** `vercel.json` の `git.deploymentEnabled`。
   UI に関係しない更新が大半で、web compat data の差分は feature-watch のコメントで見る。
2. **変更のないプロジェクトはビルドしない。** `vercel.json` の `ignoreCommand`（`tools/vercel-ignore.mjs`）。
   前回のデプロイ（`VERCEL_GIT_PREVIOUS_SHA`）からの差分で決める。本番デプロイにも効く。
   - ビルドする: そのパッケージか依存パッケージのソース・lockfile 上の依存の変化（turbo で判定）、
     `playgrounds/`、`turbo.json`、`tsconfig.base.json`、`.nvmrc`、`pnpm-workspace.yaml`、
     ルートの `package.json` の devDependencies 以外、`tools/vercel-ignore.mjs` 自身。
   - ビルドしない: `docs/`、`.github/`、`tests/`、`tools/`、`renovate.json5`、ルートの devDependencies だけの変更など。
   - 前回と同じコミットの再デプロイ（Redeploy）は必ずビルドする。環境変数だけを変えたときのため。
   - 判定できないとき（ブランチの初回デプロイ、前回の SHA が clone にない）はビルドする。
   - 省いたデプロイは、Vercel のダッシュボードでは「Canceled」と表示される。
   - turbo-ignore をそのまま使わないのは、`playgrounds/` などパッケージの外の変更を拾えないため。
3. **web のプレビューは本番の sandbox を使う。** sandbox のプレビューは使わない。
   - プレビューは Deployment Protection（Vercel へのログイン）で守られる。別サイトの iframe には
     サードパーティ Cookie が送られないので、web のプレビューから sandbox のプレビューを開けない。
   - sandbox のブランチ URL は長いブランチ名だと短縮されるので、web 側で組み立てられない。
   - runtime や sandbox を変える PR の動作確認は、CI の E2E（3 エンジン）で行う。
     本番の sandbox で確かめたいときは、マージ後に確認する。
4. **本番の sandbox は、web のプレビューをパターンで許可する。**
   - `*` は 1 つだけ、ホストの先頭ラベルの中に置き、前後に固定の文字列が要る。
     `*` は英小文字・数字・ハイフンにだけ一致し、ドットをまたがない（`packages/runtime/src/origin.ts`）。
   - `https://*.vercel.app` のような広いパターンはビルドで止める。誰でもデプロイできるドメインなので。
   - 残るリスク: 他人が `webplatform-playgrounx-michael-kenji-wilkins-projects` という名前のプロジェクトを作ると、
     その本番 URL がパターンに一致する。sandbox のオリジンには Cookie もストレージも守るべきデータがなく、
     できるのは「sandbox でコードを実行させる」ことだけなので許容する。
   - runner は `wpp:ready` を宛先を絞らずに送る（パターンには送れないため）。中身のない合図なので問題ない。
     コードを受け取る `wpp:run` は送信元を照合する。
