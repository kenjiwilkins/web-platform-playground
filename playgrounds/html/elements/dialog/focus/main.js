const log = document.getElementById('log');
const support = document.getElementById('support');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}
support.textContent =
  typeof HTMLDialogElement === 'function' ? '対応: <dialog> が使えます' : '未対応: HTMLDialogElement がありません';

const dialog = document.getElementById('dialog');
const outside = document.getElementById('outside');

// いまフォーカスのある要素を、人が読める名前にする
function who() {
  const a = document.activeElement;
  if (!a || a === document.body) return 'body（どこにもフォーカスが無い）';
  return '<' + a.localName + '>' + (a.id ? '#' + a.id : '') + (a.textContent && a.localName === 'button' ? ' 「' + a.textContent.trim() + '」' : '');
}

function trial(kind) {
  const opener = document.getElementById(kind === 'modal' ? 'open-modal' : 'open-modeless');
  const open = () => (kind === 'modal' ? dialog.showModal() : dialog.show());
  print('--- ' + (kind === 'modal' ? 'showModal()' : 'show()'));
  opener.focus();
  print('  開く前のフォーカス        : ' + who());
  open();
  print('  開いた直後のフォーカス    : ' + who());
  print('  :modal に一致する?        : ' + dialog.matches(':modal'));
  outside.focus();
  print('  背景の入力欄を focus() した後: ' + who() + (document.activeElement === outside ? '（背景にフォーカスできた）' : '（背景にはフォーカスできなかった）'));
  dialog.close();
  print('  close() の後のフォーカス  : ' + who());
}

// 自動実行（背景は、実行前に毎回フォーカスを外す）
trial('modal');
trial('modeless');

// 手で試す: ボタンで開いて、Esc や OK で閉じたときのフォーカスを見る
// （自動実行の close イベントは非同期で届くので、1 回待ってからリスナーを付ける）
setTimeout(() => {
  dialog.addEventListener('cancel', () => print('  [Esc] cancel イベント'));
  dialog.addEventListener('close', () => print('  [close] 閉じた後のフォーカス: ' + who()));
  document.getElementById('open-modal').addEventListener('click', () => {
    print('--- 手で: showModal()');
    dialog.showModal();
  });
  document.getElementById('open-modeless').addEventListener('click', () => {
    print('--- 手で: show()');
    dialog.show();
  });
}, 0);
