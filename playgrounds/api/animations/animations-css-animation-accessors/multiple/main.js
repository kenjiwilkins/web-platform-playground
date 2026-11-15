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
    const t = a.effect.getTiming();
    // 従来の書き方: animationName で探す
    const byName = box.getAnimations().find((x) => x.animationName === e.animationName);
    print(
      'animationstart: ' + e.animationName +
        ' (duration ' + t.duration + 'ms, delay ' + t.delay + 'ms)'
    );
    print('  名前で探した結果は event.animation と同じ? ' + (byName === a));
  });
  box.addEventListener('animationend', (e) => {
    print('animationend: ' + e.animationName + ' (duration ' + e.animation.effect.getTiming().duration + 'ms)');
  });
}
