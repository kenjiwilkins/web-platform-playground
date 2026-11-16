const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

const ok = CSS.supports('background', 'revert-rule');
support.textContent = ok
  ? '対応: revert-rule が使えます'
  : '未対応: revert-rule は無効な値として捨てられます（.rule は tomato のまま）';

const names = { 0: '.card', 1: '+ .warn', 2: '+ revert-rule', 3: '+ revert', 4: '+ unset' };
document.querySelectorAll('.card').forEach((el, i) => {
  print(names[i] + ': ' + getComputedStyle(el).backgroundColor);
});
