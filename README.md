# Web Platform Playground

HTML / CSS / JavaScript / Web API を、ブラウザで書いて確かめるための Playground 集。
新しい Web 機能が出るたびに Playground を足し、各ブラウザでの動作を自動テストで追いかける。

## 構成

```
apps/
  web/        カタログ＋エディタ UI（Astro, 静的生成）
  sandbox/    コードを実行する専用オリジン（Playground ごとにヘッダを変える）
packages/
  schema/     meta.yaml のスキーマと playgrounds/ のローダー
  runtime/    web ⇄ sandbox の postMessage プロトコル、console 捕捉
  tokens/     デザインシステムのトークン（Claude Design System から取り込み）→ CSS 変数
playgrounds/  コンテンツ本体。URL とディレクトリが 1:1 で対応する
tools/
  scaffold/       pnpm new で Playground の雛形を作る
  feature-watch/  web-features の差分から新機能を検知する
tests/e2e/    Playwright。全 Playground を全ブラウザで実行
```

## URL

| URL                                         | 内容                               |
| ------------------------------------------- | ---------------------------------- |
| `/`                                         | トップ（新着、カテゴリ）           |
| `/{html,css,js,api}/`                       | カテゴリ一覧                       |
| `/css/properties/anchor-name/`              | Playground（最初のバリアント）     |
| `/css/properties/anchor-name/position-try/` | バリアント                         |
| `/scratch/`                                 | 空の Playground                    |
| `/embed/...`                                | 埋め込み用（ヘッダなし、noindex）  |
| `<sandbox>/run/<path>/`                     | sandbox の runner（iframe の中身） |

## 開発

```sh
pnpm install
pnpm build            # tokens → sandbox → web
pnpm dev              # web: http://localhost:4321 / sandbox: http://localhost:4322
pnpm test             # スキーマのテスト
pnpm test:e2e         # Playwright（先に pnpm build）
```

### Playground を追加する

```sh
pnpm new css/properties/field-sizing --feature field-sizing
```

`playgrounds/css/properties/field-sizing/` に `meta.yaml`・`README.md`・`basic/` ができる。
`--feature` に [web-features](https://github.com/web-platform-dx/web-features) の ID を渡すと、説明と仕様 URL が入る。
ブランチは `pg/css-field-sizing`、PR タイトルは `pg(css): add field-sizing`。

### meta.yaml

```yaml
title: anchor-name
summary: 一行の説明
mdn: Web/CSS/anchor-name # MDN の slug
spec: https://drafts.csswg.org/...
webFeature: anchor-positioning # Baseline 表示と feature-watch に使う
detect: CSS.supports('anchor-name', '--a') # sandbox 内で評価する対応判定
requires:
  secureContext: false
  crossOriginIsolated: false # true なら sandbox に COOP/COEP が付く
  permissions: [] # 例: [camera] → Permissions-Policy と iframe allow
tags: [layout]
added: 2026-11-13
variants: [basic, position-try] # 省略時はディレクトリ名順
```

## デプロイ（Vercel）

プロジェクトを2つ作る。どちらも Root Directory を指定する。

| プロジェクト | Root Directory | 環境変数                                                                 |
| ------------ | -------------- | ------------------------------------------------------------------------ |
| web          | `apps/web`     | `PUBLIC_SANDBOX_ORIGIN`（sandbox の URL）、`SITE_URL`                    |
| sandbox      | `apps/sandbox` | `PARENT_ORIGINS`（web の URL。カンマ区切りで複数可。`*` のパターンも可） |

sandbox は web と**別サイト**（別の登録ドメイン、または `*.vercel.app`）に置く。
同じサイトのサブドメインだと Cookie やストレージの分離が弱くなる。

値の書き方、プレビューの扱い、ビルドを省く条件は [docs/deploy.md](docs/deploy.md)。

## 運用

- ブランチ戦略: [docs/branching.md](docs/branching.md)
- Renovate: [docs/renovate.md](docs/renovate.md)
- デプロイとプレビュー: [docs/deploy.md](docs/deploy.md)
