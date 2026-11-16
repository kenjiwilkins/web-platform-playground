const log = document.getElementById('log');
const support = document.getElementById('support');
const live = document.getElementById('live');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

const ok = CSS.supports('background-image', 'light-dark(url(a.png), url(b.png))');
support.textContent = ok
  ? '対応: light-dark() に url() を渡せます'
  : '未対応: light-dark() は色しか受け付けません（背景は描かれません）';

// 解決後の値は data: URI が長いので、先頭の種類だけ見せる
function kind(el) {
  const v = getComputedStyle(el).backgroundImage;
  return v === 'none' ? 'none' : decodeURIComponent(v).includes('DARK') ? 'DARK image' : 'LIGHT image';
}
function report() {
  document.querySelectorAll('.box').forEach((el) => {
    print((el.id || el.className) + ': ' + kind(el));
  });
}
report();

document.getElementById('toggle').addEventListener('change', (e) => {
  live.classList.toggle('is-dark', e.target.checked);
  print('--- live を ' + (e.target.checked ? 'dark' : 'light') + ' に');
  print('live: ' + kind(live));
});
