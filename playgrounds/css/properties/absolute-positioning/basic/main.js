const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}
support.textContent = CSS.supports('position', 'absolute')
  ? '対応: position: absolute が使えます'
  : '未対応: position: absolute が使えません';

const $ = (id) => document.getElementById(id);
const rect = (el) => el.getBoundingClientRect();
// 要素の左上が、host の「枠の内側（padding 端）」から何 px の位置か
function offsetIn(el, host) {
  const r = rect(el), h = rect(host);
  const b = parseFloat(getComputedStyle(host).borderLeftWidth);
  return Math.round(r.left - h.left - b) + ', ' + Math.round(r.top - h.top - b);
}

print('1) 包含ブロック（top: 10px; left: 10px の子）');
print('  祖先が relative   : host の左上から (' + offsetIn($('abs-rel'), $('rel')) + ') px');
const n = rect($('abs-none'));
print('  祖先に指定なし    : ページの左上から (' + Math.round(n.left) + ', ' + Math.round(n.top) + ') px  ← host の中ではない');
print('  offsetParent      : rel=' + ($('abs-rel').offsetParent === $('rel') ? '#rel' : '?') +
  ' / none=' + $('abs-none').offsetParent.localName);

print('2) フローから外れる');
print('  absolute の子なし : host の高さ ' + Math.round(rect($('flow-without')).height) + ' px');
print('  1 つ目を absolute : host の高さ ' + Math.round(rect($('flow-with')).height) + ' px（1 つ目の分が詰まった）');
const p1 = rect($('flow-with').children[0]), p2 = rect($('flow-with').children[1]);
print('  absolute の段落と 2 つ目の段落は重なる? ' + (p1.bottom > p2.top && p1.top < p2.bottom));

print('3) transform した祖先（position は static のまま）');
print('  abs の位置        : host の左上から (' + offsetIn($('abs-tf'), $('tf')) + ') px / offsetParent=' + ($('abs-tf').offsetParent === $('tf') ? '#tf' : $('abs-tf').offsetParent.localName));

print('4) 見た目の順と DOM の順');
const a = rect($('btn-a')), b = rect($('btn-b'));
print('  見た目: B の top=' + Math.round(b.top) + ' / A の top=' + Math.round(a.top) + '（B が上、A が下）');
print('  DOM   : A → B');
for (const id of ['btn-a', 'btn-b']) {
  $(id).addEventListener('focus', () => print('  [focus] ' + id));
}
print('  Tab で順に移動して、[focus] の順を見る（見た目の順か、DOM の順か）');
