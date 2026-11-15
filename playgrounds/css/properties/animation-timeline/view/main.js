const card = document.querySelector('.card');
const style = getComputedStyle(card);
console.log('timeline:', style.animationTimeline);
console.log('range:', style.animationRangeStart, '→', style.animationRangeEnd);
