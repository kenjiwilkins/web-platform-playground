## 試したこと

- `new CustomElementRegistry()` で作ったレジストリに `x-badge` を定義し、`attachShadow({ customElementRegistry })` でシャドウルートに紐づけた。グローバルの `x-badge` と同名でも `define()` が衝突しない。
- 同じ `<x-badge>` でも、置かれたシャドウルートのレジストリの実装でアップグレードされる（ラベルの `[global]` `[A]` `[B]` と、灰色の四角・赤い丸・緑の角丸という見た目の違いで確認できる）。各実装は自分の `<style>` をシャドウ DOM に持つ。

## ハマりどころ

- `shadow.innerHTML` で作った要素は、そのシャドウルートのレジストリでアップグレードされる。`document.createElement` で作った要素はグローバルのまま。
- 未対応ブラウザでは `attachShadow` が `customElementRegistry` を無視するので、`detect` と同じ条件で分岐してから使う。
