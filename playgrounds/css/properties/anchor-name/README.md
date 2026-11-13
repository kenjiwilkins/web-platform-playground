## 試したこと

- `anchor-name` で名前を付けた要素に、`position-anchor` と `anchor()` でツールチップを貼り付ける。
- `position-try-fallbacks` で、画面端にぶつかったときの代替位置を指定する。

## ハマりどころ

- アンカーされる側は `position: absolute` か `fixed` が必要。
- アンカー名は `--` で始まる dashed-ident。
