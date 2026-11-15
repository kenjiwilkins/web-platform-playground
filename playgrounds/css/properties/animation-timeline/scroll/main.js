const supported = CSS.supports('animation-timeline', 'scroll()');
console.log('scroll-driven animations supported:', supported);
console.log('timeline:', getComputedStyle(document.querySelector('.progress')).animationTimeline);
