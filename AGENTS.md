# AGENTS.md

このリポジトリで作業するエージェント向けの約束事。

- パッケージマネージャは pnpm。依存は `--save-exact` で固定する。
- UI の色・余白・フォントは `packages/tokens` の CSS 変数だけを使う。色を直書きしない。
  例外は sandbox のプレビュー領域（素のブラウザ表示を観察する場所なので、スタイルを当てない）。
- Playground の追加は `pnpm new <category>/<group>/<slug>`。`meta.yaml` はスキーマ（`packages/schema/src/meta.ts`）に従う。
- `playgrounds/` 内の HTML/CSS/JS は整形しない（Prettier の対象外）。
- ブランチと PR の規約は `docs/branching.md`。PR タイトルは Conventional Commits。
- 変更後は `pnpm lint && pnpm typecheck && pnpm test && pnpm build` を通す。
