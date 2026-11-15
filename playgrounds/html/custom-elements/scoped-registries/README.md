## 試したこと

- `new CustomElementRegistry()` で作ったレジストリに `x-badge` を定義し、`attachShadow({ customElementRegistry })` でシャドウルートに紐づけた。グローバルの `x-badge` と同名でも `define()` が衝突しない。
- 同じ `<x-badge>` でも、置かれたシャドウルートのレジストリの実装でアップグレードされる（表示の `[global]` `[A]` `[B]` で確認できる）。

## ハマりどころ

- `shadow.innerHTML` で作った要素は、そのシャドウルートのレジストリでアップグレードされる。`document.createElement` で作った要素はグローバルのまま。
- 未対応ブラウザでは `attachShadow` が `customElementRegistry` を無視するので、`detect` と同じ条件で分岐してから使う。
