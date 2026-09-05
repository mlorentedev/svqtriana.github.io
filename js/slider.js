// Product slider. Lives in its own file rather than inline so the
// Content-Security-Policy can drop 'unsafe-inline' from script-src.
// bxSlider measures the wrapper once, at init, and writes that width onto
// every slide. It used to run while the stylesheets were still loading
// asynchronously, so it measured an unstyled card and produced 555px slides
// inside a 529px viewport. The CSS is render-blocking now, so that specific
// race is gone - but images still settle after DOMContentLoaded, so this
// waits for window load, when the layout is final.
(function () {
  var sliders = [];

  function initSliders() {
    if (typeof jQuery === 'undefined' || !jQuery.fn.bxSlider) {
      return setTimeout(initSliders, 100);
    }
    jQuery('.bxslider').each(function () {
      sliders.push(jQuery(this).bxSlider({
        mode: 'fade',
        auto: true,
        autoStart: true,
        autoControls: false,
        stopAutoOnClick: false,
        pager: true,
        controls: false,
        speed: 800,
        pause: 2500,
        adaptiveHeight: false,
        responsive: true,
        touchEnabled: true,
        infiniteLoop: true,
        preloadImages: 'all',
        easing: 'ease-in-out'
      }));
    });
  }

  // A late webfont or image can still change the card width after load, and
  // bxSlider only re-measures on resize. Re-measure once things settle.
  function reload() {
    sliders.forEach(function (s) {
      if (s && typeof s.reloadSlider === 'function') s.reloadSlider();
    });
  }

  if (document.readyState === 'complete') {
    initSliders();
  } else {
    window.addEventListener('load', initSliders);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(reload, 50); });
  }
})();
