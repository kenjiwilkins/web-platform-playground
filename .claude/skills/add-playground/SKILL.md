---
name: add-playground
description: 最新の Web 標準（web-features）を確認し、まだ Playground になっていない HTML / CSS / JavaScript / Web API の機能をひとつ選んで追加し、docs/coverage.md（追加状況）を更新する。「新しい Playground を足して」「次に何を追加する？」「追加状況を更新して」と言われたときに使う。
---

# add-playground

Web 標準の新しい機能を **1 回につき 1 つ** Playground として追加し、追加状況のドキュメントを更新する。
作業のルールは `AGENTS.md` と `docs/branching.md` が正。ここでは手順だけを書く。

## 手順

### 1. 現状を確認する

```sh
pnpm coverage --candidates 15
```

web-features のデータ（`node_modules/web-features`）と `playgrounds/**/meta.yaml` の `webFeature` を突き合わせ、
未追加の機能を **Baseline Newly（新しい順）→ Limited → Widely** の順で JSON 出力する。

「最新」を確かめるため、入っている web-features が最新かも見る。

```sh
npm view web-features version   # node_modules/web-features/package.json の version と比べる
```

- 新しいバージョンが出ていても、**このスキルの中では上げない**（Renovate が PR を出す。上げるなら別 PR）。
  差があれば、最後の報告で伝える。
- web-features にまだ載っていない直近の標準（ブラウザの新リリースなど）をユーザーが挙げた場合は、
  MDN と仕様で実在を確かめてから `pnpm new` に `--feature` なしで渡してよい。
  その場合 `meta.yaml` に `webFeature` が無く追加状況に載らないので、報告で触れる。

### 2. 1 つ選ぶ

候補の上から見て、次をすべて満たすものを選ぶ。

- **sandbox 内で完結して動く**: 実機のハード・権限ダイアログ・ログイン・外部サーバーを必須としない。
  `requires`（secureContext / crossOriginIsolated / permissions）で足りる範囲ならよい。
- **観察できる**: 結果が画面か console に出る。未対応ブラウザでも落ちずに「未対応」と分かる。
- **ひとつの機能に絞れる**: 複数機能のまとめ（例: 大量の WebGL 拡張）は避け、1 機能 = 1 Playground にする。
- **Playground で動かす意味がある**: 純粋な内部仕様の差分や、挙動が見えないものは飛ばす。

条件に合わない候補を飛ばしたら、**なぜ飛ばしたかを報告に一行書く**。
迷ったらユーザーに候補を 2〜3 個示して選んでもらう。

### 3. 作る

```sh
pnpm new <category>/<group>/<slug> --feature <web-features の id>
```

- `category` は `html` / `css` / `js` / `api`。`group` は既存に合わせる（例: `css/properties`, `html/elements`）。
  既存の並びは `ls playgrounds/*/*` で見る。
- 雛形に残る `TODO` を **すべて** 埋める。特に `summary`（一行）・`detect`・`tags`。
- `mdn`（MDN の slug）と `bcd`（BCD キー）を足す。実在を確認してから書く。
- `detect` は sandbox 内で評価される式。truthy なら対応。未対応でも例外を出さない書き方にする
  （例: `CSS.supports('...')`, `typeof Foo === 'function'`）。
- 実験的機能は `flags`、権限が要るものは `requires` を `meta.yaml` に書く（スキーマ: `packages/schema/src/meta.ts`）。
- `README.md` の「試したこと」「ハマりどころ」は、実際に動かして分かったことだけを書く。
- バリアントは `basic` から。差が出る使い方が見つかったときだけ増やし、`variants` に順序を書く。

守ること:

- `playgrounds/` 内の HTML/CSS/JS は **整形しない**。素の書き方を残す（Prettier 対象外）。
- 色・余白・フォントを使う **アプリ側（`apps/`）のコード** は `packages/tokens` の CSS 変数だけを使う。
  Playground の中身は例外で、素のブラウザ表示を観察する場所なのでスタイルは自由。
- 依存を足す場合は `pnpm add --save-exact`。

### 4. 動作確認

- `pnpm dev` を起動し、`/<category>/<group>/<slug>/` を開く。表示・console・対応判定バッジを確認する。
  ブラウザが使えなければ、確認できなかったと正直に報告する。
- 必要なら `pnpm build && pnpm test:e2e`（全 Playground が例外なく動くことを見る）。

### 5. 追加状況を更新する

```sh
pnpm coverage
```

`docs/coverage.md` が再生成される（カテゴリ別・Baseline 別の達成率、追加済み一覧、次の候補 20 件）。
**このファイルは手で編集しない**。差分に今回の Playground が追加済みとして現れることを確かめる。
`README.md` の構成や `docs/` を変えた場合は、その内容も合わせる。

### 6. 検証と締め

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

通らなければ直す。落ちたまま終えない。

- ブランチは `pg/<category>-<slug>`、PR タイトルは `pg(<category>): add <slug>`（Conventional Commits）。
- コミット・push・PR 作成は、**ユーザーが求めたときだけ**行う。

## 報告に含めること

- 選んだ機能と、その理由（Baseline の状態・Newly 入りの日付）。飛ばした候補があればその理由。
- 追加したパスと、動作確認でやったこと・できなかったこと。
- `docs/coverage.md` の更新後の数字（追加済み / 全機能）。
- web-features の更新が来ている場合はその旨。

## 補足

- `pnpm` が PATH に無い環境では `node_modules/.bin/tsx tools/coverage-report/index.ts` を直接実行できる。
- 集計の定義（カテゴリの決め方、廃止予定の除外、並び順）は `tools/coverage-report/index.ts` が正。
  変えたくなったらスキルではなくそちらを直す。
