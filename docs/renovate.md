# Renovate の設計

設定は [`renovate.json5`](../renovate.json5)。Mend の Renovate GitHub App で動かす。

## 基本方針

| 項目                  | 設定                                    | 理由                                            |
| --------------------- | --------------------------------------- | ----------------------------------------------- |
| スケジュール          | 月曜 9 時前（JST）                      | PR を週 1 回にまとめる                          |
| 同時 PR 数            | 5                                       | レビューしきれる量に抑える                      |
| 公開からの待機        | 3 日（`minimumReleaseAge`）             | 取り下げられるリリースを避ける。pnpm 側も同じ値 |
| バージョン指定        | 完全固定（pin）                         | アプリなので、入っているバージョンを明確にする  |
| major                 | Dependency Dashboard で承認制           | 破壊的変更は自分のタイミングで                  |
| patch（1.0 以上）     | 自動マージ                              |                                                 |
| 0.x                   | 自動マージしない                        | 0.x は minor でも破壊的変更がありうる           |
| 脆弱性修正            | 即時・待機なし                          |                                                 |
| lockfile メンテナンス | 毎週・自動マージ                        |                                                 |
| GitHub Actions        | digest に固定、minor/patch は自動マージ |                                                 |

自動マージは GitHub のネイティブ自動マージ（`platformAutomerge`）を使う。
`main` の Ruleset の必須チェックが通るまでマージされない。

## グループ

| グループ        | 対象                                      | 自動マージ                              | 理由                                                       |
| --------------- | ----------------------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| web compat data | `@mdn/browser-compat-data` `web-features` | ✓（待機 1 日、スケジュール外でも即 PR） | 新機能検知の起点。下記                                     |
| playwright      | `@playwright/test` ほか                   | ✗                                       | テスト用ブラウザが変わる。落ちたらブラウザ側の変化の可能性 |
| astro           | `astro` `@astrojs/*`                      | patch のみ                              | バージョンを揃える必要がある                               |
| codemirror      | `codemirror` `@codemirror/*` `@lezer/*`   | patch のみ                              | ずれるとエディタが壊れる                                   |
| lint & format   | eslint / prettier 系                      | minor・patch                            | 壊れても CI で分かる                                       |
| typescript      | `typescript`                              | ✗                                       | minor でも型エラーが出うる                                 |

## 互換データの更新 = 新機能の通知

`web-features` が上がるということは、新機能が増えたか Baseline の状態が変わったということ。

1. Renovate が `web compat data` の PR を作る
2. `Feature watch` ワークフローが新旧の差分を取り、**新機能と Baseline の変化を PR にコメント**する
3. CI が通れば自動マージ
4. `main` への push で、**Playground がまだない機能を Issue として起票**する（ラベル `feature-watch`）
5. Issue から `pnpm new ... --feature <id>` で Playground を作る

## Playwright の更新

Playwright を上げるとテスト用ブラウザのビルドも新しくなる。
E2E が落ちたら、依存関係の不具合ではなく**ブラウザの挙動が変わった**可能性が高い。
自動マージせず、落ちたテストの内容を見て Playground の README に記録する。

## Vercel のプレビュー

`renovate/*` ブランチではプレビューデプロイを作らない（`vercel.json` の `git.deploymentEnabled`）。
UI に関係しない更新が大半で、ビルド時間の無駄になるため。見た目を確かめたい更新は手元でビルドする。
自動マージ後の本番デプロイも、devDependencies だけの更新などではビルドを省く（[deploy.md](deploy.md)）。
