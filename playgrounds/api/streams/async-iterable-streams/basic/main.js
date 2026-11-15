const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

// 0, 1, 2, ... を出し続けるストリーム。cancel されたら cancel() が呼ばれる。
function counter() {
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      controller.enqueue(i++);
    },
    cancel(reason) {
      print('  (source cancel() が呼ばれた, 最後に出した値: ' + (i - 1) + ')');
    },
  });
}

async function run() {
  if (typeof ReadableStream.prototype[Symbol.asyncIterator] !== 'function') {
    support.textContent = '未対応: ReadableStream は async iterable ではありません';
    return;
  }
  support.textContent = '対応: ReadableStream は async iterable です';

  print('1) 有限ストリームを最後まで読む');
  const finite = new ReadableStream({
    start(c) {
      ['a', 'b', 'c'].forEach((v) => c.enqueue(v));
      c.close();
    },
  });
  for await (const chunk of finite) print('  chunk: ' + chunk);

  print('2) break で抜ける（ストリームは cancel される）');
  const s2 = counter();
  for await (const n of s2) {
    print('  n = ' + n);
    if (n === 2) break;
  }
  print('  s2 は読めるか? locked = ' + s2.locked);

  print('3) values({ preventCancel: true }) なら break しても cancel されない');
  const s3 = counter();
  for await (const n of s3.values({ preventCancel: true })) {
    print('  n = ' + n);
    if (n === 1) break;
  }
  print('  続きを読む:');
  const reader = s3.getReader();
  print('  next = ' + (await reader.read()).value);
  await reader.cancel();

  print('4) fetch の body（Uint8Array のチャンク）も同じ書き方');
  const res = new Response('hello streams');
  let bytes = 0;
  for await (const chunk of res.body) bytes += chunk.byteLength;
  print('  合計 ' + bytes + ' bytes');
}

run().catch((e) => print('error: ' + e));
