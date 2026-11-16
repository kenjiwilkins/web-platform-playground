## 試したこと

- `background-image: light-dark(linear-gradient(...), linear-gradient(...))` が通った。
  `color-scheme: light` の要素では 1 つ目（gold → orangered）、`color-scheme: dark` の要素では 2 つ目（midnightblue → purple）が
  `getComputedStyle().backgroundImage` に解決された。
- 同じ要素のクラスで `color-scheme` を `light` ⇄ `dark` に切り替えると、背景もそれに追従した（JS で値を書き換えていない）。
- `color-scheme` は要素単位で効くので、OS のダークモード設定に頼らず、同じページで両方を並べて確認できた。

## ハマりどころ

- 解決後の値は `light-dark()` のままではなく、選ばれた側の `linear-gradient(...)` になる。
  どちらが選ばれたかは `getComputedStyle` で見るのが確実。
- 未対応ブラウザでは `light-dark()` に画像を渡した宣言が丸ごと無効になり、背景が描かれない（例外は出ない）。
  `detect` は `CSS.supports('background-image', 'light-dark(linear-gradient(...), ...)')` で判定している。

## url で試したこと

外部ファイルは置かず、`data:image/svg+xml` の SVG を 2 枚（「LIGHT image」「DARK image」と書いたもの）用意した。

- `light-dark(url("data:..."), url("data:..."))` が通った。`color-scheme: light` の箱には LIGHT の画像、`dark` の箱には DARK の画像が出た。
- クラスで `color-scheme` を切り替えると、画像も入れ替わった。グラデーションより、どちらが選ばれたかが文字で一目で分かる。
- `CSS.supports('background-image', 'light-dark(url(a.png), url(b.png))')` は `true` だった（ファイルが実在しなくても判定できる）。

## url のハマりどころ

- `getComputedStyle().backgroundImage` は `url("data:...")` の長い文字列になる。この Playground では中身の文字列に `DARK` を含むかで種類を判定している。
- 箱の中に文字を入れると、画像の文字と重なって読めなかった。ラベルは箱の外（`figcaption`）に出した。
- 外部の画像ファイルを `url()` に渡す場合は試していない。未対応ブラウザでの挙動もこのブラウザでは確かめていない。
