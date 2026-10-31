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

  // See it in action: tabs (arrow keys move between them) and the gallery.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role=tab]'));
  function show(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (ev) {
      var step = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
      if (!step) return;
      if (root.dir === 'rtl') step = -step;
      var next = tabs[(i + step + tabs.length) % tabs.length];
      show(next); next.focus(); ev.preventDefault();
    });
  });
  // #panel-owner or #panel-scanner opens that tab (shareable links).
  var deep = (location.hash.match(/^#panel-(pos|owner|scanner)$/) || [])[1];
  if (deep) {
    show(document.getElementById('tab-' + deep));
    var target = document.getElementById('preview');
    if (target) target.scrollIntoView();
  }
  document.querySelectorAll('[data-show]').forEach(function (a) {
    a.addEventListener('click', function () {
      var t = document.getElementById('tab-' + a.getAttribute('data-show'));
      if (t) show(t);
    });
  });
  document.querySelectorAll('[data-go]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var id = chip.getAttribute('data-go');
      document.querySelectorAll('[data-slide]').forEach(function (f) {
        f.classList.toggle('on', f.getAttribute('data-slide') === id);
      });
      document.querySelectorAll('[data-go]').forEach(function (c) {
        c.classList.toggle('on', c === chip);
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
    });
  });

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
