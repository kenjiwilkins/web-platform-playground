const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

support.textContent =
  typeof HTMLAnchorElement === 'function'
    ? '対応: <a> は HTMLAnchorElement です'
    : '未対応: HTMLAnchorElement がありません';

// 1. href があるかどうか
const withHref = document.getElementById('with');
const noHref = document.getElementById('without');
print('1) href の有無');
for (const [name, a] of [['href あり', withHref], ['href なし', noHref]]) {
  a.focus();
  print(
    '  ' + name +
      ': :any-link=' + a.matches(':any-link') +
      ' / tabIndex=' + a.tabIndex +
      ' / focus できた=' + (document.activeElement === a) +
      ' / color=' + getComputedStyle(a).color
  );
}

// 2. href を分解する（HTMLHyperlinkElementUtils）
const parts = document.getElementById('parts');
print('2) href の分解');
print('  href     = ' + parts.href + '  （相対 URL が、このページの URL を基準に解決される）');
for (const k of ['protocol', 'host', 'hostname', 'port', 'origin', 'pathname', 'search', 'hash']) {
  print('  ' + k.padEnd(9) + '= ' + JSON.stringify(parts[k]));
}
print('  getAttribute("href") = ' + parts.getAttribute('href') + '  （書いたままの値）');

// 3. プロパティで書き換える
const edit = document.getElementById('edit');
print('3) プロパティで書き換える');
print('  最初    : ' + edit.href);
edit.pathname = '/changed path';
print('  pathname = "/changed path"  → ' + edit.href);
edit.search = 'q=日本語';
print('  search = "q=日本語"         → ' + edit.href);
edit.hash = '';
print('  hash = ""                   → ' + edit.href);
edit.protocol = 'http';
print('  protocol = "http"           → ' + edit.href);
print('  getAttribute("href") も変わる? ' + edit.getAttribute('href'));
