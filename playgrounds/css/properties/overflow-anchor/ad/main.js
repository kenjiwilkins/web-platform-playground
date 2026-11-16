const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}
support.textContent = CSS.supports('overflow-anchor', 'none')
  ? '対応: overflow-anchor が使えます'
  : '未対応: overflow-anchor は無効です';
support.textContent += '（' + navigator.userAgent.replace(/^Mozilla\/5.0 /, '') + '）';

const boxes = [
  document.getElementById('auto'),
  document.getElementById('none'),
  document.getElementById('ad-none'),
];

function para(i, reading) {
  const p = document.createElement('p');
  p.className = 'para' + (reading ? ' reading' : '');
  p.textContent = '第 ' + i + ' 段落。記事の本文がここに入ります。スクロールしながら読み進めている途中です。';
  return p;
}
function pos(box) {
  return Math.round(box.querySelector('.reading').getBoundingClientRect().top - box.getBoundingClientRect().top);
}

function build(box, adClass) {
  box.replaceChildren();
  const h = document.createElement('h3');
  h.textContent = '記事のタイトル';
  box.append(h);
  for (let i = 1; i <= 2; i++) box.append(para(i, false));
  const ad = document.createElement('div');
  ad.className = 'ad ' + adClass;
  ad.textContent = '広告（Sponsored）';
  box.append(ad);
  for (let i = 3; i <= 14; i++) box.append(para(i, i === 4));
  // 広告の上端を画面の上端にぴったり合わせる（広告が「全部見えている最初の要素」になる。
  // 半分だけかかる位置だと、どの要素がアンカーに選ばれるかがブラウザごとに変わる）
  box.scrollTop = box.querySelector('.ad').offsetTop;
  document.getElementById('r-' + box.id).textContent = '';
}

function reset() {
  build(boxes[0], '');
  build(boxes[1], '');
  build(boxes[2], 'none');
}

function go() {
  print('--- 広告 40px → 160px');
  boxes.forEach((box) => {
    const b = pos(box);
    const st = Math.round(box.scrollTop);
    box.querySelector('.ad').style.height = '160px';
    const a = pos(box);
    const moved = a - b;
    const verdict =
      Math.abs(moved) <= 1
        ? '<span class="ok">✓ 読んでいる段落は動かなかった</span>'
        : '<span class="ng">✗ 段落が ' + moved + 'px 押し下げられた</span>';
    document.getElementById('r-' + box.id).innerHTML =
      '位置 ' + b + ' → ' + a + 'px<br>scrollTop ' + st + ' → ' + Math.round(box.scrollTop) + '<br>' + verdict;
    print('  ' + box.id + ': 読んでいた項目の位置 ' + b + ' → ' + a + ' px / scrollTop ' + st + ' → ' + Math.round(box.scrollTop));
  });
}

document.getElementById('run').addEventListener('click', reset);
document.getElementById('go').addEventListener('click', go);
reset();
setTimeout(go, 1500);
