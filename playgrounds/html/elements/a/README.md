## 試したこと

- **`href` の有無で別物になる。** `href` ありは `:any-link` に一致し、`focus()` でフォーカスでき、文字色は既定の青（`rgb(0, 0, 238)`）だった。
  `href` なしは `:any-link` に一致せず、`focus()` してもフォーカスは移らず、色は本文のまま（黒）。リンクではなく、ただのテキストとして扱われる。
- **`href` を分解して読める。** 相対 URL の `/docs/guide?lang=ja&q=a%20b#install` を書くと、
  `a.href` はこのページの URL を基準に解決された絶対 URL になり、`protocol` / `host` / `hostname` / `port` / `origin` / `pathname` / `search` / `hash` がそれぞれ読めた。
  `getAttribute('href')` は書いたままの相対 URL を返す。
- **プロパティで書き換えると `href` が変わる。** `pathname` / `search` / `hash` / `protocol` を代入すると、`a.href` が組み直された。
  `getAttribute('href')` の値も、同じく書き換わった。

## ハマりどころ

- 書き換えるときの文字は、自動でパーセントエンコードされる。`pathname = '/changed path'` は `/changed%20path`、
  `search = 'q=日本語'` は `?q=%E6%97%A5%E6%9C%AC%E8%AA%9E` になった。
- `search` に `?` を付けなくても、付いた形（`?q=...`）で `href` に入る。`hash = ''` を代入すると `#` ごと消える。
- `href` は、書いたままの値と解決後の値が別々に取れる（`getAttribute('href')` と `a.href`）。
  相対 URL のまま比較したいときは `getAttribute` を使う。
- この Playground は、リンクを実際にクリックして遷移するところまでは試していない（sandbox の iframe が遷移してしまうため）。
  `target` / `rel` / `download` の挙動も未確認。

## アクセシビリティの注意

- **`href` なしの `<a>` は、`tabIndex` が `0` なのにフォーカスできない。**
  `tabIndex` の値だけ見ると「フォーカスできそう」に見えるが、実際には `focus()` が効かず（`document.activeElement` が変わらなかった）、
  色も本文のままで、リンクとして見えない。プレースホルダーのリンクを作るなら、`href` を付けるか、`<a>` をやめる。
- 「ボタンのように動く `<a>`」（クリックで何かを実行するだけ）は、`href` を付けないと `:any-link` に一致せず、フォーカスもできなかった。
  操作するものは `<button>` にする方がよい（Enter / Space で操作できることは、一般的な知識で、この Playground では試していない）。
- 未確認: Tab キーでの実際の移動、スクリーンリーダーでの読み上げ（`href` なしがリンクとして読まれないか）。
