const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}
support.textContent = CSS.supports('overflow-anchor', 'none')
  ? '対応: overflow-anchor が使えます'
  : '未対応: overflow-anchor は無効です';

const boxes = [document.getElementById('auto'), document.getElementById('none')];

function para(i, reading) {
  const p = document.createElement('p');
  p.className = 'para' + (reading ? ' reading' : '');
  p.textContent = '第 ' + i + ' 段落。記事の本文がここに入ります。スクロールしながら読み進めている途中です。';
  return p;
}
function pos(box) {
  return Math.round(box.querySelector('.reading').getBoundingClientRect().top - box.getBoundingClientRect().top);
}

function reset() {
  boxes.forEach((box) => {
    box.replaceChildren();
    const n = document.createElement('div');
    n.className = 'notice';
    n.innerHTML = '<div><b>キャンペーンのお知らせ</b><br>期間限定のお知らせが読み込まれました。</div>';
    box.append(n);
    for (let i = 1; i <= 14; i++) box.append(para(i, i === 4));
    box.scrollTop = 120;
    document.getElementById('r-' + box.id).textContent = '';
  });
}

function go() {
  print('--- 上のバナーを 400ms かけて開く（0 → 150px）');
  boxes.forEach((box) => {
    let scrolls = 0;
    const count = () => scrolls++;
    box.addEventListener('scroll', count);
    const b = pos(box);
    const st = Math.round(box.scrollTop);
    box.querySelector('.notice').classList.add('open');
    setTimeout(() => {
      box.removeEventListener('scroll', count);
      const a = pos(box);
      const moved = a - b;
      const verdict =
        Math.abs(moved) <= 1
          ? '<span class="ok">✓ 読んでいる段落は動かなかった</span>（scrollTop を ' + scrolls + ' 回補正）'
          : '<span class="ng">✗ 段落が ' + moved + 'px 押し下げられた</span>（補正なし）';
      document.getElementById('r-' + box.id).innerHTML =
        '位置 ' + b + ' → ' + a + 'px<br>scrollTop ' + st + ' → ' + Math.round(box.scrollTop) + ' / scroll イベント ' + scrolls + ' 回<br>' + verdict;
      print('  ' + box.id + ': 項目の位置 ' + b + ' → ' + a + ' px / scroll イベント ' + scrolls + ' 回 / scrollTop ' + st + ' → ' + Math.round(box.scrollTop));
    }, 700);
  });
}

document.getElementById('run').addEventListener('click', reset);
document.getElementById('go').addEventListener('click', go);
reset();
setTimeout(go, 1500);
