## 試したこと

- `scroll`: `animation-timeline: scroll()` で、ページ上部の進捗バーをスクロール量に連動させる。
- `view`: `animation-timeline: view()` と `animation-range` で、要素が画面に入る範囲だけフェードインさせる。

## ハマりどころ

- `animation` ショートハンドは `animation-timeline` をリセットする。必ずショートハンドの**後**に書く。
- スクロール駆動では `animation-duration` は無視されるが、Firefox など一部の実装では `auto` 指定が要ることがある。`animation-fill-mode: both` を付けると範囲外でも端の状態が保たれる。
- `view()` の対象は「その要素自身」。親のスクロールコンテナを基準に可視範囲が計算される。
