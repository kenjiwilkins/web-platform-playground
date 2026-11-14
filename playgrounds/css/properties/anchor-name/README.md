## 試したこと

- `anchor-name` で名前を付けた要素に、`position-anchor` と `anchor()` でツールチップを貼り付ける。
- `position-try-fallbacks` で、画面端にぶつかったときの代替位置を指定する。

## ハマりどころ

- アンカーされる側は `position: absolute` か `fixed` が必要。
- アンカー名は `--` で始まる dashed-ident。
- `position-try-fallbacks` は、ツールチップが**包含ブロック**からはみ出したときに切り替わる。
  スクロールコンテナの見えている範囲ではない。
  - 包含ブロックが `position` のないスクローラの外（初期包含ブロック）だと、iframe に余裕がある限り切り替わらない。
  - スクローラ自体に `position: relative` を付けても切り替わらない。包含ブロックがスクロールできる領域全体になるため。
  - スクローラを包む、スクロールしない要素に `position: relative` を付ける（position-try バリアントの `.frame`）。
- 一度切り替わった位置は、入りきる間は元に戻らない（最後に成功した fallback を覚えている）。
