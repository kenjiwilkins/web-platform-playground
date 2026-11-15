## 試したこと

- `for await (const chunk of stream)` で `ReadableStream` を直接読めた。`getReader()` と `read()` のループを書かなくてよい。
- `break` でループを抜けると、ストリームは **cancel される**（source の `cancel()` が呼ばれた）。
  抜けたあと `locked` は `false` に戻る。ただしストリームはすでに cancel 済みで、続きは読めない。
- `stream.values({ preventCancel: true })` を使うと、`break` しても cancel されない。
  同じストリームを `getReader()` で続きから読めた（`n = 0, 1` で抜けたあと、次の `read()` は `2`）。
- `Response.body`（`Uint8Array` のチャンク）も同じ書き方で読めた。`new Response('hello streams')` で合計 13 bytes。

## ハマりどころ

- 未対応ブラウザでは `for await` が `TypeError`（not async iterable）になる。
  `detect` は `ReadableStream.prototype[Symbol.asyncIterator]` が関数かどうかで判定している。
- `break` 時に source の `cancel()` が受け取る「最後に出した値」は、読んだ値より先に進んでいる。
  `pull()` が先読みでキューを埋めるので、`n === 2` で抜けても `cancel()` 側では `3` まで出している。
- `break` してから `for await` を再開できない。cancel を避けたいときだけ `preventCancel` を使い、
  使い終わったら自分で `reader.cancel()` する（この Playground の 3) も最後に cancel している）。

## edge-cases で試したこと

`edge-cases` バリアントで、端の挙動を動かして確かめた。

- **ループ内で `throw`**: 例外はそのまま呼び出し側の `catch` に届き、ストリームは cancel される。
  ただし source の `cancel(reason)` に渡る `reason` は `undefined` で、投げたエラーではない。
- **`controller.error()`**: `for await` が reject され、`catch` でそのエラーを受け取れる。
- **`pipeThrough(new TextDecoderStream())`**: 「日本語…」をバイト列の途中（「日」の 3 バイト目の手前）で切っても、
  `"日"` / `"本語ストリーム"` の順に出て、結合すると元の文字列に戻った。文字化けしない。
- **ロック済みのストリーム**: `getReader()` 済みのストリームに `for await` すると、`TypeError`
  （`values` が reader を取れない）。ループに入る前に投げられる。
- **iterator を 2 本作る**: 2 本目の `Symbol.asyncIterator` 呼び出しは `TypeError`。同時に 2 か所では読めない。
- **`break` 済みのストリームをもう一度 `for await`**: エラーにならず、何も読めずにループが終わる。
- **`fetch` の body**: `break` で cancel したあと `res.text()` は `TypeError`（body stream already read）。`bodyUsed` は `true`。

## edge-cases のハマりどころ

- **`tee()` の片方で `break` すると、そのループが終わらない。**
  cancel の完了は両方のブランチが cancel されるまで待たされるため、
  `break` した側の `for await` は、もう一方を読み切って cancel するまで終了しなかった（300ms 待っても終了せず）。
  片方だけ `break` してその後ろに処理を書くと、そこで止まって見える。
- `ReadableStream.from()` は、このセッションで使った Browser pane のブラウザでは未対応だった。
  async generator から作る例は動かせていない（未対応でもページは落ちず、その旨を表示する）。
