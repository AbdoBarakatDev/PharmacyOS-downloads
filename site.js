// PharmacyOS download site (D-187): language, this device's download first,
// the scanner QR, and sections arriving on scroll. Works without it too.
(function () {
  var root = document.documentElement;
  root.classList.remove('noscript');
  var btn = document.getElementById('lang');
  function set(l) {
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (btn) btn.textContent = l === 'ar' ? 'English' : 'العربية';
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  // ?lang=ar or ?lang=en opens the page in that language (shareable).
  var asked = (location.search.match(/[?&]lang=(ar|en)\b/) || [])[1];
  set(asked || saved || ((navigator.language || '').indexOf('ar') === 0 ? 'ar' : 'en'));
  if (btn) btn.onclick = function () { set(root.lang === 'ar' ? 'en' : 'ar'); };

  // This device's download goes first in the hero and is marked on the cards.
  var ua = navigator.userAgent;
  var mine = /Android/i.test(ua) ? 'android' : /iPhone|iPad/i.test(ua) ? 'ios'
    : /Mac/i.test(ua) ? 'macos' : /Win/i.test(ua) ? 'windows' : null;
  if (mine) {
    var hero = document.querySelector('[data-hero="' + mine + '"]');
    var first = document.getElementById('hero-primary');
    if (hero && first) { first.replaceWith(hero); hero.hidden = false; }
    document.querySelectorAll('[data-platform="' + mine + '"]').forEach(function (b) {
      b.classList.add('btn-primary'); b.classList.remove('btn-ghost');
    });
    if (mine === 'android' || mine === 'ios') {
      var s = document.getElementById('product-scanner');
      if (s) s.classList.add('mine');
    }
  }

  // The scanner page's QR, drawn here so it never goes stale.
  // The same page is served by GitHub Pages and by Firebase (D-187): the
  // QR and the link follow the address it was opened from.
  var box = document.getElementById('scanner-qr');
  var link = document.getElementById('scanner-link');
  var here = location.protocol === 'https:'
    ? new URL('scanner/', location.origin + location.pathname).href : null;
  if (here && box) box.setAttribute('data-url', here);
  if (here && link) { link.href = here; link.textContent = here; }
  if (box && window.qrcode) {
    try {
      var q = window.qrcode(0, 'M');
      q.addData(box.getAttribute('data-url'));
      q.make();
      box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) {}
  }

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
