const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

const probe = document.createElement('abbr');
support.textContent =
  probe instanceof HTMLElement
    ? '対応: <abbr> は ' + probe.constructor.name + ' です'
    : '未対応: <abbr> が扱えません';

// 1. title の有無
print('1) title の有無');
for (const id of ['with', 'without']) {
  const el = document.getElementById(id);
  const cs = getComputedStyle(el);
  print(
    '  ' + el.textContent +
      ': title=' + JSON.stringify(el.title) +
      ' / text-decoration=' + cs.textDecorationLine + ' ' + cs.textDecorationStyle +
      ' / tabIndex=' + el.tabIndex
  );
}

// 2. 下線の消去
print('2) 下線');
for (const id of ['plain', 'restored']) {
  const el = document.getElementById(id);
  const cs = getComputedStyle(el);
  print('  ' + id + ': ' + cs.textDecorationLine + ' ' + cs.textDecorationStyle);
}

// 3. JS
print('3) JS から読む');
for (const id of ['a1', 'a2']) {
  const el = document.getElementById(id);
  print('  ' + el.textContent + ' -> title=' + JSON.stringify(el.title) + ' / constructor=' + el.constructor.name);
}
