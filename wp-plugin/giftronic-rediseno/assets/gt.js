/* Giftronic Rediseño — interacción de la tienda (sin dependencias salvo jQuery para los eventos de WooCommerce). */
(function () {
  'use strict';
  var D = window.gtData || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var desk = window.matchMedia('(min-width:1024px)');

  /* ---------- Barra de anuncios: rota en pantallas angostas ---------- */
  var tb = $$('.gt-topbar-list li');
  if (tb.length > 1 && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var ti = 0;
    setInterval(function () {
      if (window.innerWidth >= 900) return;
      tb[ti].classList.remove('is-on');
      ti = (ti + 1) % tb.length;
      tb[ti].classList.add('is-on');
    }, 4000);
  }

  /* ---------- Cabecera compacta al bajar ---------- */
  var hdr = $('#gt-hdr');
  if (hdr) {
    var compact = false;
    var onScroll = function () {
      var c = window.scrollY > 120;
      if (c !== compact) { compact = c; hdr.classList.toggle('is-compact', c); if (!c) hdr.classList.remove('show-search'); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Paneles (menú, carrito) ---------- */
  var lastFocus = null;
  function openLayer(id) {
    var l = document.getElementById(id);
    if (!l) return false;
    closeMega();
    lastFocus = document.activeElement;
    l.hidden = false;
    document.body.classList.add('gt-lock');
    var f = $('.gt-sheet [data-close], .gt-sheet a, .gt-sheet button', l);
    if (f) setTimeout(function () { f.focus(); }, 30);
    return true;
  }
  function closeLayers() {
    var any = false;
    $$('.gt-layer').forEach(function (l) { if (!l.hidden) { l.hidden = true; any = true; } });
    if (any) {
      document.body.classList.remove('gt-lock');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    return any;
  }
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]');
    if (o) {
      // En la página del carrito o del checkout no se abre el panel: se navega normal.
      if (o.dataset.open === 'gt-cart' && document.body.classList.contains('woocommerce-cart')) return;
      if (openLayer(o.dataset.open)) e.preventDefault();
      return;
    }
    if (e.target.closest('[data-close]')) { e.preventDefault(); closeLayers(); return; }
    var s = e.target.closest('[data-search]');
    if (s) {
      e.preventDefault();
      closeLayers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (hdr) hdr.classList.add('show-search');
      var q = $('#gt-q');
      if (q) setTimeout(function () { q.focus(); }, 250);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (closeZoom()) return;
    if (closeLayers()) return;
    if (closeFilters()) return;
    if (closeMega(true)) return;
    hideSuggest();
  });

  /* ---------- Mega menú ---------- */
  var megaBtn = $('[data-mega]');
  var mega = $('#gt-mega');
  function closeMega(focusBtn) {
    if (!mega || mega.hidden) return false;
    mega.hidden = true;
    megaBtn.setAttribute('aria-expanded', 'false');
    if (focusBtn) megaBtn.focus();
    return true;
  }
  function selectFam(btn) {
    var i = btn.dataset.fam;
    $$('.gt-mega-fam', mega).forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); });
    $$('.gt-mega-panel', mega).forEach(function (p) { p.hidden = p.id !== 'gt-famp-' + i; });
  }
  if (megaBtn && mega) {
    megaBtn.addEventListener('click', function () {
      var open = mega.hidden;
      mega.hidden = !open;
      megaBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var f = $('.gt-mega-fam[aria-selected="true"]', mega); if (f) f.focus(); }
    });
    mega.addEventListener('click', function (e) { var b = e.target.closest('.gt-mega-fam'); if (b) selectFam(b); });
    mega.addEventListener('mouseover', function (e) { var b = e.target.closest('.gt-mega-fam'); if (b && desk.matches) selectFam(b); });
    mega.addEventListener('keydown', function (e) {
      var b = e.target.closest('.gt-mega-fam');
      if (!b || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
      e.preventDefault();
      var all = $$('.gt-mega-fam', mega), i = all.indexOf(b) + (e.key === 'ArrowDown' ? 1 : -1);
      var n = all[(i + all.length) % all.length];
      n.focus(); selectFam(n);
    });
    document.addEventListener('click', function (e) {
      if (!mega.hidden && !e.target.closest('#gt-mega') && !e.target.closest('[data-mega]')) closeMega();
    });
  }

  /* ---------- Menú móvil: acordeón ---------- */
  document.addEventListener('click', function (e) {
    var h = e.target.closest('.gt-mfam-h');
    if (!h) return;
    var ul = document.getElementById(h.getAttribute('aria-controls'));
    var open = h.getAttribute('aria-expanded') !== 'true';
    h.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (ul) ul.hidden = !open;
  });

  /* ---------- Buscador con sugerencias (Store API de WooCommerce) ---------- */
  var q = $('#gt-q'), sg = $('#gt-suggest'), timer = null, ctrl = null, active = -1;
  function money(p) {
    if (!p || !p.price) return '';
    var n = parseInt(p.price, 10) / Math.pow(10, p.currency_minor_unit || 0);
    return (p.currency_prefix || '$') + ' ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, p.currency_thousand_separator || '.');
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hideSuggest() { if (sg) { sg.hidden = true; q && q.setAttribute('aria-expanded', 'false'); active = -1; } }
  function allUrl(term) { return (D.search || '/?post_type=product') + (D.search && D.search.indexOf('?') > -1 ? '&' : '?') + 's=' + encodeURIComponent(term); }
  function renderSuggest(term, list) {
    var h = '';
    if (list.length) {
      h += '<div class="gt-sg-h">Productos</div>';
      list.forEach(function (p, i) {
        var img = p.images && p.images[0] ? (p.images[0].thumbnail || p.images[0].src) : '';
        var name = document.createElement('textarea'); name.innerHTML = p.name;
        h += '<a class="gt-sg-item" role="option" id="gt-sg-' + i + '" href="' + esc(p.permalink) + '">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '<span></span>') +
          '<span class="gt-sg-name">' + esc(name.value) + '</span><span class="gt-sg-price">' + esc(money(p.prices)) + '</span></a>';
      });
      h += '<a class="gt-sg-all" href="' + esc(allUrl(term)) + '">Ver todos los resultados para «' + esc(term) + '»</a>';
    } else {
      h += '<div class="gt-sg-empty">No hay coincidencias para «' + esc(term) + '». Prueba con la marca o el tipo de producto.</div>';
    }
    sg.innerHTML = h;
    sg.hidden = false;
    q.setAttribute('aria-expanded', 'true');
    active = -1;
  }
  if (q && sg && D.store) {
    q.addEventListener('input', function () {
      var term = q.value.trim();
      clearTimeout(timer);
      if (term.length < 2) { hideSuggest(); return; }
      timer = setTimeout(function () {
        if (ctrl && ctrl.abort) ctrl.abort();
        ctrl = window.AbortController ? new AbortController() : null;
        var url = D.store + (D.store.indexOf('?') > -1 ? '&' : '?') + 'search=' + encodeURIComponent(term) + '&per_page=6';
        fetch(url, { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined })
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (list) { if (q.value.trim() === term) renderSuggest(term, Array.isArray(list) ? list : []); })
          .catch(function () {});
      }, 220);
    });
    q.addEventListener('keydown', function (e) {
      if (sg.hidden) return;
      var items = $$('.gt-sg-item, .gt-sg-all', sg);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, i) { it.classList.toggle('is-active', i === active); });
        if (items[active] && items[active].id) q.setAttribute('aria-activedescendant', items[active].id);
      } else if (e.key === 'Enter' && active > -1 && items[active]) {
        e.preventDefault();
        window.location.href = items[active].href;
      }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.gt-search')) hideSuggest(); });
  }

  /* ---------- Carruseles ---------- */
  $$('[data-rail]').forEach(function (rail) {
    var track = $('.gt-rail-track', rail), prev = $('[data-rail-prev]', rail), next = $('[data-rail-next]', rail);
    if (!track) return;
    var upd = function () {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };
    var go = function (dir) { track.scrollBy({ left: dir * track.clientWidth * 0.9, behavior: 'smooth' }); };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

  /* ---------- Filtros del listado ---------- */
  var filters = $('#gt-filters'), fscrim = $('.gt-filters-scrim'), fbtn = $('[data-open-filters]');
  function closeFilters() {
    if (!filters || !filters.classList.contains('is-open')) return false;
    filters.classList.remove('is-open');
    if (fscrim) fscrim.hidden = true;
    document.body.classList.remove('gt-lock');
    if (fbtn) { fbtn.setAttribute('aria-expanded', 'false'); fbtn.focus(); }
    return true;
  }
  if (filters) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-open-filters]')) {
        filters.classList.add('is-open');
        if (fscrim) fscrim.hidden = false;
        document.body.classList.add('gt-lock');
        fbtn.setAttribute('aria-expanded', 'true');
        var c = $('[data-close-filters]', filters); if (c) setTimeout(function () { c.focus(); }, 30);
      } else if (e.target.closest('[data-close-filters]')) {
        closeFilters();
      } else if (e.target.closest('[data-fmore]')) {
        e.target.closest('.gt-fopts').classList.add('show-all');
      }
    });
    var form = $('[data-filters]', filters);
    var submitClean = function () {
      // marca[]=a&marca[]=b  ->  marca=a,b (URLs cortas que se pueden compartir)
      var fd = new FormData(form), groups = {}, params = [];
      fd.forEach(function (v, k) {
        if (v === '') return;
        var key = k.replace(/\[\]$/, '');
        (groups[key] = groups[key] || []).push(v);
      });
      Object.keys(groups).forEach(function (k) { params.push(encodeURIComponent(k) + '=' + groups[k].map(encodeURIComponent).join(',')); });
      window.location.href = form.getAttribute('action') + (params.length ? '?' + params.join('&') : '');
    };
    if (form) {
      form.addEventListener('change', function (e) { if (e.target.type === 'checkbox') submitClean(); });
      form.addEventListener('submit', function (e) { e.preventDefault(); submitClean(); });
    }
  }

  /* ---------- Texto de categoría: «Leer más» ---------- */
  $$('[data-seo]').forEach(function (s) {
    var p = $('p', s);
    if (!p || ($$('p', s).length < 2 && p.scrollHeight <= p.clientHeight + 2)) s.classList.add('is-short');
    var b = $('[data-seo-more]', s);
    if (b) b.addEventListener('click', function () { s.classList.add('is-open'); });
  });

  /* ---------- Galería de la ficha ---------- */
  var gal = $('[data-gal]');
  var zoomEl = null;
  function closeZoom() { if (!zoomEl) return false; zoomEl.remove(); zoomEl = null; document.body.classList.remove('gt-lock'); return true; }
  if (gal) {
    var slides = $$('[data-slide]', gal), thumbs = $$('[data-thumb]', gal), cur = 0, idx = $('[data-gal-i]', gal);
    var show = function (i) {
      if (!slides.length) return;
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== cur; });
      thumbs.forEach(function (t, k) { if (k === cur) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      if (idx) idx.textContent = cur + 1;
      var img = $('img', slides[cur]); if (img && img.loading === 'lazy') img.loading = 'eager';
    };
    gal.addEventListener('click', function (e) {
      var t = e.target.closest('[data-thumb]');
      if (t) { show(+t.dataset.thumb); return; }
      if (e.target.closest('[data-gal-prev]')) { show(cur - 1); return; }
      if (e.target.closest('[data-gal-next]')) { show(cur + 1); return; }
      var st = e.target.closest('[data-slide]');
      if (st) {
        e.preventDefault();
        zoomEl = document.createElement('div');
        zoomEl.className = 'gt-zoom';
        zoomEl.setAttribute('role', 'dialog');
        zoomEl.setAttribute('aria-label', 'Foto ampliada');
        zoomEl.innerHTML = '<img src="' + esc(st.getAttribute('href')) + '" alt=""><button type="button" aria-label="Cerrar foto ampliada">✕</button>';
        zoomEl.addEventListener('click', closeZoom);
        document.body.appendChild(zoomEl);
        document.body.classList.add('gt-lock');
        $('button', zoomEl).focus();
      }
    });
    var track = $('[data-gal-track]', gal), dots = $$('.gt-gal-dots i', gal);
    if (track && dots.length) {
      track.addEventListener('scroll', function () {
        var i = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      }, { passive: true });
    }
  }

  /* ---------- Barra fija de compra (móvil) ---------- */
  var bb = $('[data-buybar]'), cf = $('#gt-cartform');
  if (bb && cf) {
    var target = $('.single_add_to_cart_button', cf) || cf;
    var updBar = function () {
      if (desk.matches) { bb.hidden = true; document.body.classList.remove('gt-has-buybar'); return; }
      var r = target.getBoundingClientRect();
      var show = r.bottom < 0 || r.top > window.innerHeight;
      // Al final de la página (pie) se oculta para no tapar los enlaces.
      var foot = $('.gt-foot');
      if (foot && foot.getBoundingClientRect().top < window.innerHeight - 40) show = false;
      bb.hidden = !show;
      document.body.classList.toggle('gt-has-buybar', show);
    };
    window.addEventListener('scroll', updBar, { passive: true });
    window.addEventListener('resize', updBar);
    updBar();
    var add = $('[data-buybar-add]', bb);
    if (add) add.addEventListener('click', function () {
      var btn = $('.single_add_to_cart_button', cf);
      var isVar = !!$('.variations_form', cf);
      if (btn && !isVar && !btn.classList.contains('disabled')) { btn.click(); return; }
      cf.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var sel = $('select', cf); if (sel) setTimeout(function () { sel.focus(); }, 400);
    });
  }

  /* ---------- Carrito: abrir el panel al agregar y animar el contador ---------- */
  function bump() {
    $$('.gt-cart-count').forEach(function (c) { c.classList.add('bump'); setTimeout(function () { c.classList.remove('bump'); }, 250); });
  }
  if (window.jQuery) {
    window.jQuery(document.body).on('added_to_cart', function () {
      setTimeout(bump, 60);
      if (!document.body.classList.contains('woocommerce-cart')) openLayer('gt-cart');
    });
    window.jQuery(document.body).on('wc_fragments_refreshed wc_fragments_loaded', function () { /* el contador llega en los fragmentos */ });
  }
})();
