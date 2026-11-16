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
const names = ['Aoi', 'Ren', 'Mio', 'Sota', 'Hina'];

function post(i, isNew) {
  const d = document.createElement('div');
  d.className = 'post' + (isNew ? ' new' : '');
  const n = names[i % names.length];
  d.innerHTML = '<div class="avatar"></div><div><div class="name"></div><div class="text"></div></div>';
  d.querySelector('.avatar').textContent = n[0];
  d.querySelector('.name').textContent = n;
  d.querySelector('.text').textContent = isNew ? '新着の投稿です (' + (i + 1) + ')' : '少し前の投稿 #' + (i + 1);
  return d;
}
function visibleNew(box) {
  const b = box.getBoundingClientRect();
  return [...box.querySelectorAll('.post.new')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.top >= b.top - 5 && r.bottom <= b.bottom + 1;
  }).length;
}

function reset() {
  boxes.forEach((box) => {
    box.replaceChildren();
    for (let i = 0; i < 20; i++) box.append(post(i, false));
    box.scrollTop = 4; // ほんの少しスクロールした状態（0 だとアンカーは働かない）
    document.getElementById('r-' + box.id).textContent = '';
  });
}

function go() {
  print('--- 新着を上に 3 件追加');
  boxes.forEach((box) => {
    const st = Math.round(box.scrollTop);
    for (let i = 2; i >= 0; i--) box.prepend(post(i, true));
    const n = visibleNew(box);
    const verdict =
      n >= 2
        ? '<span class="ok">✓ 新着が見える</span>'
        : '<span class="ng">✗ 新着が画面の上に隠れた（読み逃す）</span>';
    document.getElementById('r-' + box.id).innerHTML =
      '見えている新着 ' + n + ' / 3 件<br>scrollTop ' + st + ' → ' + Math.round(box.scrollTop) + '<br>' + verdict;
    print('  ' + box.id + ': 見えている新着 ' + n + ' / 3 件, scrollTop ' + st + ' → ' + Math.round(box.scrollTop));
  });
}

document.getElementById('run').addEventListener('click', reset);
document.getElementById('go').addEventListener('click', go);
reset();
setTimeout(go, 1500);
