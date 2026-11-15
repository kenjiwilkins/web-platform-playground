const ok = CSS.supports('color', 'alpha(from red / 0.5)')
document.getElementById('support').textContent = ok ? 'alpha() 対応' : 'alpha() 未対応（背景は指定されず透明のまま）'
const log = document.getElementById('log')
document.querySelectorAll('.swatch').forEach((el) => {
  const bg = getComputedStyle(el).backgroundColor
  log.textContent += el.className + ': ' + bg + '\n'
  console.log(el.className, bg)
})
