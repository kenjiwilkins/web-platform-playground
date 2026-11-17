const log = document.getElementById('log');
const support = document.getElementById('support');
const range = document.getElementById('range');
const val = document.getElementById('val');
const bar = document.getElementById('bar');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

support.textContent = CSS.supports('width', 'calc(progress(5, 0, 10) * 100px)')
  ? '対応: progress() が使えます'
  : '未対応: progress() が使えません';

function update() {
  val.textContent = range.value;
  bar.style.setProperty('--v', range.value);
}
range.addEventListener('input', update);
update();

// 2. 範囲の外（0 から 10 の範囲での位置）
print('範囲 0〜10 での progress(x):');
const probe = document.createElement('div');
document.body.append(probe);
for (const x of [-5, 0, 5, 10, 15]) {
  probe.style.setProperty('--p', 'progress(' + x + ', 0, 10)');
  probe.style.marginLeft = 'calc(var(--p) * 100px)';
  print('  x=' + x + ' -> margin-left=' + getComputedStyle(probe).marginLeft);
}
probe.remove();
