const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

support.textContent =
  typeof Array.prototype.splice === 'function'
    ? '対応: Array.prototype.splice があります'
    : '未対応: Array.prototype.splice がありません';

// 各ケースを、毎回新しい配列で試す
function run(label, fn) {
  const a = ['a', 'b', 'c', 'd', 'e'];
  const ret = fn(a);
  print(label + '\n  戻り値=' + JSON.stringify(ret) + ' / 元の配列=' + JSON.stringify(a));
}

run('削除: splice(1, 2)', (a) => a.splice(1, 2));
run('挿入: splice(1, 0, "x", "y")', (a) => a.splice(1, 0, 'x', 'y'));
run('置換: splice(1, 2, "X")', (a) => a.splice(1, 2, 'X'));
run('負の開始位置: splice(-2, 1)', (a) => a.splice(-2, 1));
run('deleteCount を省略: splice(2)', (a) => a.splice(2));
run('deleteCount に undefined: splice(2, undefined)', (a) => a.splice(2, undefined));
run('引数なし: splice()', (a) => a.splice());
run('範囲外: splice(10, 1, "z")', (a) => a.splice(10, 1, 'z'));
run('deleteCount が残りより大きい: splice(3, 99)', (a) => a.splice(3, 99));

print('toSpliced（非破壊版）: ' + typeof Array.prototype.toSpliced);
