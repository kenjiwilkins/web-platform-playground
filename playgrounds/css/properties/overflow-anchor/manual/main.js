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
const lines = ['お疲れさま！', '今日の会議、何時から？', '15 時からです', '資料はもう見ましたか？', 'まだ…あとで見ます', 'ポイントは 3 つあります', '1 つ目は納期の件', '2 つ目は予算の件', '3 つ目は体制の件', 'なるほど、助かります', '了解です！'];

function msg(text, me, cls) {
  const d = document.createElement('div');
  d.className = 'msg' + (me ? ' me' : '') + (cls ? ' ' + cls : '');
  d.innerHTML = '<div class="who"></div><div class="bubble"></div>';
  d.querySelector('.who').textContent = me ? 'あなた' : 'Aoi';
  d.querySelector('.bubble').textContent = text;
  return d;
}
function pos(box) {
  return Math.round(box.querySelector('.reading').getBoundingClientRect().top - box.getBoundingClientRect().top);
}

function reset() {
  boxes.forEach((box) => {
    box.replaceChildren();
    for (let i = 0; i < 20; i++) box.append(msg(lines[i % lines.length], i % 3 === 2, i === 7 ? 'reading' : ''));
    box.scrollTop = 300; // 読んでいるメッセージが枠の中ほどに来る位置
    document.getElementById('r-' + box.id).textContent = '';
  });
}

// 自前の補正: 足した高さだけ scrollTop を増やす（チャットの履歴読み込みでよく書く実装）
function loadOlderWithManualFix(box) {
  const before = box.scrollHeight;
  for (let i = 0; i < 3; i++) box.prepend(msg('（過去のメッセージ ' + (i + 1) + '）', false, 'old'));
  box.scrollTop += box.scrollHeight - before;
}

function go() {
  print('--- 過去のメッセージを 3 件読み込む（自前補正つき）');
  boxes.forEach((box) => {
    const b = pos(box);
    loadOlderWithManualFix(box);
    const a = pos(box);
    const moved = a - b;
    const verdict =
      Math.abs(moved) <= 1
        ? '<span class="ok">✓ 読んでいたメッセージは動かなかった</span>'
        : '<span class="ng">✗ ' + Math.abs(moved) + 'px ' + (moved < 0 ? '上へ飛んだ' : '下へずれた') + '</span>';
    document.getElementById('r-' + box.id).innerHTML =
      '位置 ' + b + ' → ' + a + 'px / scrollTop → ' + Math.round(box.scrollTop) + '<br>' + verdict;
    print('  ' + box.id + ': 読んでいたメッセージの位置 ' + b + ' → ' + a + ' px / scrollTop → ' + Math.round(box.scrollTop));
  });
}

document.getElementById('run').addEventListener('click', reset);
document.getElementById('go').addEventListener('click', go);
reset();
setTimeout(go, 1500);
