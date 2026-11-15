const log = document.getElementById('log');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}
async function section(title, fn) {
  print(title);
  try {
    await fn();
  } catch (e) {
    print('  !! 想定外: ' + e);
  }
}

function counter(label) {
  let i = 0;
  return new ReadableStream({
    pull(c) {
      c.enqueue(i++);
    },
    cancel(reason) {
      print('  [' + label + '] cancel(reason=' + reason + ')');
    },
  });
}

async function run() {
  if (typeof ReadableStream.prototype[Symbol.asyncIterator] !== 'function') {
    print('未対応');
    return;
  }

  await section('1) ループ内で throw する', async () => {
    try {
      for await (const n of counter('s1')) {
        if (n === 1) throw new Error('boom');
      }
    } catch (e) {
      print('  catch: ' + e.message);
    }
  });

  await section('2) ストリーム側が controller.error() する', async () => {
    const s = new ReadableStream({
      start(c) {
        c.enqueue('x');
        c.error(new Error('source failed'));
      },
    });
    try {
      for await (const v of s) print('  chunk: ' + v);
    } catch (e) {
      print('  catch: ' + e.message);
    }
  });

  await section('3) TextDecoderStream でマルチバイトを跨ぐ', async () => {
    const bytes = new TextEncoder().encode('日本語ストリーム');
    const src = new ReadableStream({
      start(c) {
        c.enqueue(bytes.slice(0, 4)); // 「日」の途中で切る
        c.enqueue(bytes.slice(4));
        c.close();
      },
    });
    let out = '';
    for await (const s of src.pipeThrough(new TextDecoderStream())) {
      print('  chunk: ' + JSON.stringify(s));
      out += s;
    }
    print('  結合: ' + out);
  });

  await section('4) ReadableStream.from() で async generator を読む', async () => {
    if (typeof ReadableStream.from !== 'function') {
      print('  ReadableStream.from は未対応');
      return;
    }
    async function* gen() {
      yield 1;
      yield 2;
    }
    for await (const v of ReadableStream.from(gen())) print('  v = ' + v);
  });

  await section('5) tee() の片方だけ break する', async () => {
    const [a, b] = counter('s5').tee();
    const loopA = (async () => {
      for await (const n of a) {
        if (n === 1) break;
      }
      print('  a のループが終了');
    })();
    const timeout = new Promise((r) => setTimeout(r, 300, 'timeout'));
    const first = await Promise.race([loopA.then(() => 'done'), timeout]);
    print('  a が break してから 300ms 後: ' + first);
    print('  b を読んで break する:');
    let k = 0;
    for await (const n of b) {
      print('  b: ' + n);
      if (++k === 3) break;
    }
    await loopA;
  });

  await section('6) ロック済みストリームに for await', async () => {
    const s = counter('s6');
    const reader = s.getReader();
    try {
      for await (const n of s) print('  n = ' + n);
    } catch (e) {
      print('  ' + e.name + ': ' + e.message);
    }
    reader.releaseLock();
  });

  await section('7) 同じストリームに for await を 2 つ並行', async () => {
    const s = new ReadableStream({
      start(c) {
        [1, 2, 3].forEach((v) => c.enqueue(v));
        c.close();
      },
    });
    const first = s[Symbol.asyncIterator]();
    try {
      s[Symbol.asyncIterator]();
      print('  2 本目の iterator が作れた');
    } catch (e) {
      print('  2 本目: ' + e.name);
    }
    await first.return();
  });

  await section('8) break したストリームをもう一度読む', async () => {
    const s = counter('s8');
    for await (const n of s) if (n === 0) break;
    try {
      for await (const n of s) print('  n = ' + n);
      print('  何も読めずにループ終了');
    } catch (e) {
      print('  ' + e.name + ': ' + e.message);
    }
  });

  await section('9) fetch body は break 後に再利用できるか', async () => {
    const res = new Response('abc');
    for await (const c of res.body) break;
    try {
      await res.text();
    } catch (e) {
      print('  res.text(): ' + e.name + ': ' + e.message);
    }
    print('  bodyUsed = ' + res.bodyUsed);
  });
}

run().catch((e) => print('error: ' + e));
