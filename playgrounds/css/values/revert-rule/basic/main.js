const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

const ok = CSS.supports('background', 'revert-rule');
support.textContent = ok
  ? '対応: revert-rule が使えます'
  : '未対応: var() のフォールバックが無効になり、上の行は --btn-bg が無いボタンの背景が消えます';

document.querySelectorAll('.row').forEach((row) => {
  print('[' + row.className.replace('row ', '') + ']');
  row.querySelectorAll('.btn').forEach((b) => {
    print('  ' + b.textContent.padEnd(20) + getComputedStyle(b).backgroundColor);
  });
});
