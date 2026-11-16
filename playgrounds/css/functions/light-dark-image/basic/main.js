const log = document.getElementById('log');
const support = document.getElementById('support');
const live = document.getElementById('live');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

const ok = CSS.supports(
  'background-image',
  'light-dark(linear-gradient(red, blue), linear-gradient(blue, red))'
);
support.textContent = ok
  ? '対応: light-dark() に画像を渡せます'
  : '未対応: light-dark() は色しか受け付けません（背景は描かれません）';

function report() {
  document.querySelectorAll('.box').forEach((el) => {
    print((el.id || el.className) + ': ' + getComputedStyle(el).backgroundImage);
  });
}
report();

document.getElementById('toggle').addEventListener('change', (e) => {
  live.classList.toggle('is-dark', e.target.checked);
  print('--- live を ' + (e.target.checked ? 'dark' : 'light') + ' に');
  print('live: ' + getComputedStyle(live).backgroundImage);
});
