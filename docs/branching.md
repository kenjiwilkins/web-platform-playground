# ブランチ戦略

トランクベース（GitHub Flow）。`main` が常に本番で、`main` へのマージが Vercel の本番デプロイになる。
ソロ開発かつ継続デプロイなので、`develop` や `release/*` は置かない。

## ブランチ名

| プレフィックス         | 用途                          | PR タイトルの例                            |
| ---------------------- | ----------------------------- | ------------------------------------------ |
| `pg/<category>-<slug>` | Playground の追加・更新       | `pg(css): add anchor-name`                 |
| `feat/`                | アプリ・ツールの機能追加      | `feat(web): add tag pages`                 |
| `fix/`                 | 不具合修正                    | `fix(sandbox): keep permissions on re-run` |
| `chore/` `docs/` `ci/` | その他                        | `ci: cache playwright browsers`            |
| `renovate/`            | Renovate 専用（手で作らない） | `chore(deps): update astro`                |

ブランチは短命にする。1 PR = 1 Playground か 1 変更。

## マージ

- **squash マージのみ**。PR タイトルがそのままコミットメッセージになる。
- PR タイトルは Conventional Commits（`pr-title` ワークフローで検査）。
- マージ後はブランチを自動削除。

## main の Ruleset

| 設定                                  | 値                                                 |
| ------------------------------------- | -------------------------------------------------- |
| Require a pull request before merging | ON（承認数 0）                                     |
| Require status checks to pass         | `lint` `typecheck` `test` `build` `e2e` `pr-title` |
| Require linear history                | ON                                                 |
| Block force pushes / deletions        | ON                                                 |
| Bypass list                           | リポジトリ管理者（緊急時のみ）                     |

> ⚠️ 必須チェックがない状態で Renovate の自動マージ（`platformAutomerge`）が動くと、CI を待たずにマージされる。
> **Renovate の設定を有効にする前に、必須チェックを設定すること。**

## 必須にしないもの

- `Prerelease browsers`（Chrome Beta での夜間 E2E）: 実験的機能は落ちて当然なので、結果は Issue で知らせるだけ。
- `Feature watch`: 情報を出すだけのジョブ。
