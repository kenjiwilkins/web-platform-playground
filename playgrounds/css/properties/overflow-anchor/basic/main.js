const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

support.textContent = CSS.supports('overflow-anchor', 'none')
  ? '対応: overflow-anchor が使えます'
  : '未対応: overflow-anchor は無効です（ブラウザの既定のアンカー動作に任せます）';

const boxes = [document.getElementById('auto'), document.getElementById('none')];
let seq = 0;

function makeItem(label, cls) {
  const d = document.createElement('div');
  d.className = 'item' + (cls ? ' ' + cls : '');
  d.textContent = label;
  return d;
}

boxes.forEach((box) => {
  for (let i = 1; i <= 20; i++) box.append(makeItem('item ' + i, i === 8 ? 'target' : ''));
  box.scrollTop = 150; // item 6 あたりまでスクロールしておく（先頭だとアンカーが働かない）
});

// target（item 8）が、スクロール枠の上から何 px の位置にあるか
function targetTop(box) {
  return Math.round(
    box.querySelector('.target').getBoundingClientRect().top - box.getBoundingClientRect().top
  );
}

function insertAbove() {
  seq++;
  print('--- 上に 3 件挿入 (' + seq + ' 回目)');
  boxes.forEach((box) => {
    const before = targetTop(box);
    const st = box.scrollTop;
    for (let i = 0; i < 3; i++) box.prepend(makeItem('new ' + seq + '-' + i));
    // レイアウトを強制してから測る
    const after = targetTop(box);
    print(
      '  ' + box.id + ': target の位置 ' + before + ' → ' + after +
        ' px / scrollTop ' + st + ' → ' + Math.round(box.scrollTop)
    );
  });
}

document.getElementById('insert').addEventListener('click', insertAbove);
requestAnimationFrame(() => requestAnimationFrame(insertAbove));
