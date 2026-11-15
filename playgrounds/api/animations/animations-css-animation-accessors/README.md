## 試したこと

- `animationstart` の `event.animation` は `CSSAnimation` で、`animationName`（`slide`）と `playState`（`running`）が読めた。
  `animation.effect.target` は、リスナーを付けた要素そのものだった。
- `box.getAnimations().find(...)` で探した結果と `event.animation` は **同一オブジェクト**（`===` が `true`）。
  これまでの「`getAnimations()` から名前で探す」書き方が要らなくなる。
- `transitionrun` の `event.animation` は `CSSTransition` で、`transitionProperty` は `opacity` だった。
- `animationend` の時点では `event.animation.playState` は `finished`。

## ハマりどころ

- `transition` を起こすには「変化前のスタイル」が必要。クラスを 2 つ同時に足しただけでは `transitionrun` が出なかった。
  `requestAnimationFrame` を 2 回挟んでから `opacity` を変えると発火した。
- 未対応ブラウザでは `event.animation` が `undefined` になる。`detect` は `'animation' in AnimationEvent.prototype` で判定している。
- `animationName` や `transitionProperty` は `CSSAnimation` / `CSSTransition` のプロパティで、
  素の `Animation` には無い。型を見て使い分ける。

## multiple で試したこと

同じ要素に `slide 300ms`、`slide 800ms 100ms`、`grow 500ms` の 3 つを同時に走らせた。

- 3 つとも `animationstart` が出て、`event.animation` ごとに `effect.getTiming()` の `duration` / `delay` が違った。
  イベントを出したアニメーションをそのまま特定できる。
- 従来の「`getAnimations()` から `animationName` で探す」書き方は、`grow` と 1 つ目の `slide` では一致した。
  **2 つ目の `slide`（800ms）では 1 つ目の `slide` を拾ってしまい、`event.animation` と一致しなかった**（`false`）。
  同名の `@keyframes` を複数回使うと、名前では区別できない。

## multiple のハマりどころ

- 同名でも区別が必要なのは「同じ要素に同じ `@keyframes` を重ねる」ときだけ。名前が全部違えば従来の書き方でも足りる。
- `animationend` の `event.animation` も、そのイベントを出した側のものだった（300ms の `slide` の終了で `duration 300ms`）。
