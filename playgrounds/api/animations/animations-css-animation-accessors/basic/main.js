const log = document.getElementById('log');
const support = document.getElementById('support');
const box = document.getElementById('box');
function print(msg) {
  console.log(msg);
  log.textContent += msg + '\n';
}

if (!('animation' in AnimationEvent.prototype)) {
  support.textContent = '未対応: AnimationEvent.animation がありません';
} else {
  support.textContent = '対応: event.animation が使えます';

  box.addEventListener('animationstart', (e) => {
    const a = e.animation;
    print('animationstart: ' + a.constructor.name + ' / animationName = ' + a.animationName);
    print('  effect.target === box ? ' + (a.effect.target === box));
    print('  playState = ' + a.playState);
  });
  box.addEventListener('animationend', (e) => {
    print('animationend: playState = ' + e.animation.playState);
  });
  box.addEventListener('transitionrun', (e) => {
    const a = e.animation;
    print('transitionrun: ' + a.constructor.name + ' / transitionProperty = ' + a.transitionProperty);
  });

  // 比較: これまでは getAnimations() から探す必要があった
  box.addEventListener('animationstart', (e) => {
    const found = box.getAnimations().find((a) => a.animationName === e.animationName);
    print('  getAnimations() で探した結果と同一? ' + (found === e.animation));
  });

  box.classList.add('run');
  // transition は「変化前のスタイル」が必要なので、1 フレーム待ってから opacity を変える
  requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('fade')));
}
