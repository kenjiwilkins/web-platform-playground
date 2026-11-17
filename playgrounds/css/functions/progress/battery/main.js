const log = document.getElementById('log');
const support = document.getElementById('support');
const battery = document.getElementById('battery');
const level = document.getElementById('level');
const val = document.getElementById('val');
const drain = document.getElementById('drain');
const fill = battery.querySelector('.fill');
const warn = document.querySelector('.warn');

support.textContent = CSS.supports('width', 'calc(progress(5, 0, 10) * 100px)')
  ? '対応: progress() が使えます'
  : '未対応: progress() が使えません（バーは描画されません）';

function set(n) {
  level.value = n;
  val.textContent = n;
  battery.style.setProperty('--level', n);
  battery.setAttribute('aria-valuenow', n);
}

level.addEventListener('input', () => set(Number(level.value)));

// 残量ごとの計算結果を console に出す
function report() {
  console.log(
    '残量 ' + level.value + '% -> fill.width=' + getComputedStyle(fill).width +
      ' / opacity(warn)=' + getComputedStyle(warn).opacity
  );
}
level.addEventListener('change', report);

let timer = null;
drain.addEventListener('click', () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    drain.textContent = '放電する';
    report();
    return;
  }
  if (Number(level.value) <= 0) set(100);
  drain.textContent = '止める';
  timer = setInterval(() => {
    const n = Number(level.value) - 1;
    set(n);
    if (n <= 0) {
      clearInterval(timer);
      timer = null;
      drain.textContent = '放電する';
      report();
    }
  }, 80);
});

set(80);
report();
