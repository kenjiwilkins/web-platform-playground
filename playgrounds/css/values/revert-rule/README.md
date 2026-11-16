## 試したこと（basic: ボタンのカスタマイズ口）

コンポーネント側で、種類ごとに背景色を決めた。

```css
.btn {
  background: gray;
}
.btn.primary {
  background: royalblue;
}
.btn.danger {
  background: crimson;
}
```

その上に、利用側が `--btn-bg` で背景だけ上書きできる口を足した。**変数があるときだけ**上書きし、無ければ種類ごとの色のままにしたい。

```css
.btn.btn {
  background: var(--btn-bg, revert-rule);
} /* A */
.btn.btn {
  background: var(--btn-bg, initial);
} /* B */
```

結果（`getComputedStyle().backgroundColor`）:

| ボタン                       | A: `revert-rule` | B: `initial` |
| ---------------------------- | ---------------- | ------------ |
| default                      | gray             | 透明         |
| primary                      | royalblue        | 透明         |
| danger                       | crimson          | 透明         |
| primary + `--btn-bg: purple` | purple           | purple       |

- A は、変数が無いボタンで **宣言ごと無かったことになり**、種類ごとの色が残った。変数があれば、その色になった。
- B は、変数が無いと `initial`（透明）になり、種類ごとの色が全部消えた。

## なぜ initial だと種類ごとの色が消えるのか

- カスケードが先に走り、`.btn.btn { background: var(...) }` が勝つ（specificity が同点で、最後に書いてあるため）。
  `.primary` の royalblue は、この時点で負けて捨てられる。
- `var()` は勝者が決まったあとに展開される。`--btn-bg` が無いと、フォールバックの `initial` が入って `background: initial`（透明）になる。
  負けた規則に戻る処理は無い。
- `revert-rule` に展開された場合は「この宣言を含む規則が無かったことにして、カスケードをやり直す」ので、次に勝つ `.primary` の色が出る。
- 以上は仕様の用語での説明で、ブラウザの内部実装までは確かめていない。デモの結果（上の表）と一致している。

## ハマりどころ

- `initial` の行は背景が消えて、白い文字が白いページに溶けてボタンが見えなくなった。行に暗い下地（`#222`）を敷いて、
  「背景が消えたボタン」の文字が読めるようにした。
- 上書きの規則は、`.primary` / `.danger` と specificity を揃えて **後ろに書く**必要がある（`.btn.btn` にして (0,2,0) に揃えた）。
  `.btn` 単体だと specificity で負けて、そもそも効かない。
- `revert-rule` を使うのは「書かない」では済まない場面。ここでは宣言自体は常に存在していて、
  変数が無いときだけ取り消したいので、`var()` のフォールバックに入れるのが自然だった。
- 未対応ブラウザでは、`var(--btn-bg, revert-rule)` のフォールバックが無効な値になる。
  `--btn-bg` が無いボタンでは宣言が無効になり、その場合は規則が捨てられて前の規則の色になる可能性があるが、
  このブラウザでは未確認。判定は `CSS.supports('background', 'revert-rule')` で行っている。

## cascade で試したこと

仕組みだけを見るバリアント。規則を 3 段重ねた。

1. `.card { background: gold }`
2. `.warn { background: tomato }`（これが勝つ）
3. 最後の規則でキーワードを当てる

- `revert-rule` → tomato。3 段目が無かったことになり、ひとつ前に勝っていた規則の値へ戻った（gold まで戻らない）。
- `revert` → 透明。作者のスタイルを全部捨てて UA まで戻る。
- `unset` → 透明。`background` は継承しないので初期値になる。

## cascade のハマりどころ

- 固定の規則に `revert-rule` と書くのは、その規則を消すのと同じ結果で、使う意味が薄い。実用的な使い方は basic を参照。
- `background` では `revert` と `unset` が同じ結果で、違いが見えない（`display` など UA が値を持つプロパティで試す必要がある。未確認）。

## アクセシビリティの注意

- **背景だけ消えて、文字色が残ると読めなくなる。** `var(--btn-bg, initial)` の行では、`--btn-bg` が無いボタンの背景が透明になった。
  `color: white` はそのまま残るので、白いページでは白地に白文字（コントラスト比 1.00:1）で、ボタンが見えなくなった。この Playground でも最初は見えず、行に暗い下地（`#222`）を敷いて読めるようにした。
  `background` を取り消す書き方をするなら、`color` も一緒に決める。`revert-rule` なら、前の規則の背景（と、それに合わせた文字色）が残るので、この組が壊れにくい。
- **デモ自体の配色にも注意が要る。** 白い文字に対するコントラスト比を計算すると、`gray` は **3.95:1** で、通常サイズの文字の目安 4.5:1（WCAG の AA）を下回った。
  `royalblue` は 4.85:1、`crimson` は 4.99:1、`purple` は 9.42:1。
- `--btn-bg` で利用者が好きな色を入れられるので、文字色とのコントラストは、入れる側が保つ必要がある（コンポーネント側では保証できない）。
- 未確認: 強制カラーモード（`forced-colors`）で、背景色の扱いがどうなるか。
