const $ = (id) => document.getElementById(id);
const list = $('list');
const status = $('status');
const pagesEl = $('pages');
const log = $('log');

$('support').textContent =
  typeof Array.prototype.splice === 'function'
    ? '対応: Array.prototype.splice'
    : '未対応: Array.prototype.splice がありません';

const initial = () =>
  Array.from({ length: 23 }, (_, i) => ({ id: i + 1, title: 'タスク ' + (i + 1) }));
let items = initial();
let nextId = items.length + 1;
let page = 1;
let size = 5;
let lastOp = '';

const totalPages = () => Math.max(1, Math.ceil(items.length / size));

// ページの切り出し: コピーに splice して、取り出した要素を返す（元の配列は変えない）
function currentPageItems() {
  const copy = items.slice();
  return copy.splice((page - 1) * size, size);
}

function pageNumbers(current, total) {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

function render() {
  page = Math.min(page, totalPages()); // 削除でページ数が減ったとき
  const rows = currentPageItems();
  const start = (page - 1) * size;

  list.textContent = '';
  if (rows.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'タスクがありません';
    list.append(li);
  }
  rows.forEach((it, i) => {
    const li = document.createElement('li');
    li.className = 'item';
    const no = document.createElement('span');
    no.className = 'no';
    no.textContent = '#' + (start + i + 1);
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = it.title;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'del';
    del.textContent = '削除';
    del.setAttribute('aria-label', it.title + ' を削除');
    del.addEventListener('click', () => remove(it.id));
    li.append(no, title, del);
    list.append(li);
  });

  status.textContent =
    items.length === 0
      ? '0 件'
      : items.length + ' 件中 ' + (start + 1) + '–' + (start + rows.length) + ' 件を表示（' + page + ' / ' + totalPages() + ' ページ）';

  pagesEl.textContent = '';
  for (const n of pageNumbers(page, totalPages())) {
    if (n === '…') {
      const s = document.createElement('span');
      s.className = 'gap';
      s.textContent = '…';
      s.setAttribute('aria-hidden', 'true');
      pagesEl.append(s);
      continue;
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = n;
    b.setAttribute('aria-label', n + ' ページ');
    if (n === page) b.setAttribute('aria-current', 'page');
    b.addEventListener('click', () => go(n));
    pagesEl.append(b);
  }
  $('prev').disabled = page <= 1;
  $('next').disabled = page >= totalPages();
  log.textContent = lastOp + (lastOp ? '\n' : '') + '配列の長さ=' + items.length + ' / ページ=' + page + '/' + totalPages();
}

function go(n) {
  page = Math.min(Math.max(1, n), totalPages());
  lastOp = '';
  render();
}

function remove(id) {
  const i = items.findIndex((it) => it.id === id);
  if (i === -1) return;
  const removed = items.splice(i, 1); // 破壊的に 1 件削除
  lastOp = 'items.splice(' + i + ', 1) -> ' + JSON.stringify(removed.map((r) => r.title));
  console.log(lastOp);
  render();
  list.focus(); // 削除したボタンは消えるので、フォーカスを一覧に戻す
}

function add() {
  const it = { id: nextId, title: 'タスク ' + nextId };
  nextId++;
  const at = (page - 1) * size;
  items.splice(at, 0, it); // このページの先頭に挿入（何も削除しない）
  lastOp = 'items.splice(' + at + ', 0, "' + it.title + '") -> []';
  console.log(lastOp);
  render();
}

$('prev').addEventListener('click', () => go(page - 1));
$('next').addEventListener('click', () => go(page + 1));
$('add').addEventListener('click', add);
$('reset').addEventListener('click', () => {
  items = initial();
  nextId = items.length + 1;
  page = 1;
  lastOp = 'リセット';
  render();
});
$('size').addEventListener('change', (e) => {
  size = Number(e.target.value);
  page = 1;
  lastOp = '';
  render();
});

render();
