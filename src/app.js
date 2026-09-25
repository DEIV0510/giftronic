(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const stage = $('#stage'), device = $('#device'), viewport = $('#viewport');
  const chev = s => ic('down', s).replace('class="i"', 'class="i chev"');

  /* ---------- Íconos y estrellas ---------- */
  function hydrate(root = document) {
    $$('i[data-i]', root).forEach(el => {
      const t = document.createElement('template');
      t.innerHTML = ic(el.dataset.i, +(el.dataset.s || 20));
      const svg = t.content.firstElementChild;
      el.classList.forEach(c => svg.classList.add(c));
      el.replaceWith(svg);
    });
    $$('[data-stars]', root).forEach(el => {
      const n = +el.dataset.stars;
      el.innerHTML = Array.from({ length: 5 }, (_, i) => `<svg class="i" width="16" height="16" viewBox="0 0 24 24" fill="${i < n ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${ICONS.star}</svg>`).join('');
      if (el.hasAttribute('aria-label')) el.setAttribute('role', 'img');
    });
  }

  /* ---------- Tarjeta de producto ---------- */
  function card(p) {
    const pct = off(p), fp = finPrice(p);
    const badges = [];
    if (p.out) badges.push('<span class="badge badge-out">Agotado</span>');
    else if (pct > 0) badges.push(`<span class="badge badge-off">-${pct}&nbsp;%</span>`);
    (p.tags || []).forEach(t => badges.push(`<span class="badge ${t === 'Combo' ? 'badge-dark' : t === 'Últimas unidades' ? 'badge-warn' : 'badge-soft'}">${t}</span>`));
    const wa = `https://wa.me/${WA}?text=${encodeURIComponent('Hola, quiero información sobre: ' + p.full)}`;
    return `<article class="card${p.out ? ' is-out' : ''}">
      <div class="card-media is-loading"><span class="sk"></span>${ART(p.art.k, p.art, p.full)}<div class="card-badges">${badges.join('')}</div>${p.out ? '<span class="out-flag">Sin unidades</span>' : ''}</div>
      <div class="card-body">
        <p class="card-brand">${p.brand}</p>
        <h3 class="card-title"><a href="#producto" data-go="producto">${p.name}</a></h3>
        <ul class="chips" aria-label="Especificaciones clave">${p.chips.map(c => `<li>${c}</li>`).join('')}</ul>
        <div class="card-price">
          <p class="was"><s><span class="sr-only">Antes </span>${cop(p.antes)}</s></p>
          <p class="now"><span class="sr-only">Ahora </span>${cop(p.ahora)}</p>
          ${p.out ? '<p class="fin">Agotado por ahora</p>' : `<p class="fin">o desde <b>${cop(cuota(fp, 24))}</b>/mes con Addi</p>`}
        </div>
        <div class="card-actions">
          ${p.out ? `<button type="button" class="btn btn-ghost" data-notify="${p.id}">${ic('bell', 18)}Avísame</button>` : `<button type="button" class="btn btn-dark" data-add="${p.id}">Agregar</button>`}
          <a class="sq" href="${wa}" target="_blank" rel="noopener" aria-label="Preguntar por WhatsApp: ${esc(p.name)}">${ic('chat', 20)}</a>
        </div>
      </div>
    </article>`;
  }

  function renderStatic() {
    $$('[data-cards]').forEach(el => { el.innerHTML = el.dataset.cards.split(',').map(id => card(byId[id])).join(''); });
    $('#tiles').innerHTML = TILES.map(([t, k, o]) => `<li class="tile"><a href="#categoria" data-cat="${t}">${ART(k, o)}<span>${t}</span></a></li>`).join('');
    $$('[data-art]').forEach(el => { el.innerHTML = ART(el.dataset.art, { h: +el.dataset.h || 225 }, el.dataset.label || ''); });
    $('#mega-grid').innerHTML = FAM.map(f => `<div class="fam"><p class="fam-h"><span class="fam-ic">${ic(f.i, 20)}</span>${f.t}</p><ul>${f.l.map(x => `<li><a href="#categoria" data-cat="${x}">${x}</a></li>`).join('')}</ul></div>`).join('');
    $('#mfams').innerHTML = FAM.map((f, i) => `<div class="mfam"><button type="button" class="fam-h" aria-expanded="${i === 0}" aria-controls="mf${i}"><span class="fam-ic">${ic(f.i, 20)}</span>${f.t}${chev(18)}</button><ul id="mf${i}"${i === 0 ? '' : ' hidden'}>${f.l.map(x => `<li><a href="#categoria" data-cat="${x}" data-close>${x}</a></li>`).join('')}</ul></div>`).join('');
  }

  /* Placeholder skeleton: se ve la primera vez que se abre cada vista */
  const shown = new Set();
  function settle(root) {
    $$('.card-media.is-loading', root).forEach((m, i) => {
      const t = reduce ? 0 : 280 + Math.min(i, 6) * 70 + Math.random() * 220;
      setTimeout(() => m.classList.remove('is-loading'), t);
    });
  }

  /* ---------- Navegación ---------- */
  const VIEWS = ['inicio', 'categoria', 'producto', 'plan'];
  function go(view) {
    if (!VIEWS.includes(view)) return;
    const plan = view === 'plan';
    stage.hidden = plan;
    $('#v-plan').hidden = !plan;
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });
    $$('.proto-views a').forEach(a => a.dataset.go === view ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    toggleMega(false); closeLayers(true); hideSuggest();
    viewport.scrollTop = 0; $('#v-plan').scrollTop = 0;
    if (!plan && !shown.has(view)) { shown.add(view); settle($('#v-' + view)); }
    requestAnimationFrame(updateRails);
  }
  function navigate(view) {
    if (location.hash !== '#' + view) { try { history.pushState(null, '', '#' + view); } catch (e) { /* sandbox */ } }
    go(view);
  }
  window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'inicio'));

  /* ---------- Escritorio / móvil ---------- */
  function setDevice(d) {
    stage.classList.toggle('is-phone', d === 'phone');
    $$('[data-device]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.device === d)));
    try { localStorage.setItem('gt-device', d); } catch (e) { /* sin almacenamiento */ }
    viewport.scrollTop = 0;
  }

  /* ---------- Barra superior rotativa (solo angosto) ---------- */
  if (!reduce) setInterval(() => {
    if (device.clientWidth >= 760 || stage.hidden) return;
    const li = $$('#topbar li'), i = li.findIndex(l => l.classList.contains('is-on'));
    li[i].classList.remove('is-on'); li[(i + 1) % li.length].classList.add('is-on');
  }, 3200);

  /* ---------- Mega-menú ---------- */
  const megaBtn = $('#mega-btn'), mega = $('#mega');
  function toggleMega(open = mega.hidden) { mega.hidden = !open; megaBtn.setAttribute('aria-expanded', String(open)); }
  megaBtn.addEventListener('click', () => toggleMega());

  /* ---------- Capas (menú, carrito, filtros) ---------- */
  let lastFocus = null;
  function openLayer(name) {
    const l = $('#layer-' + name); if (!l) return;
    toggleMega(false); closeLayers(true);
    lastFocus = document.activeElement;
    if (name === 'cart') renderCart();
    l.hidden = false;
    const f = $('.sheet-h .icon-btn', l); f && f.focus();
  }
  function closeLayers(silent) {
    let was = false;
    $$('.layer').forEach(l => { if (!l.hidden) { l.hidden = true; was = true; } });
    if (was && !silent && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const slot = $('#toast-slot');
    slot.innerHTML = `<div class="toast">${ic('check', 18)}<span>${msg}</span></div>`;
    clearTimeout(toastT); toastT = setTimeout(() => { slot.innerHTML = ''; }, 3800);
  }

  /* ---------- Carrito ---------- */
  const cart = new Map();
  function addToCart(id, silent) {
    cart.set(id, (cart.get(id) || 0) + 1);
    const n = [...cart.values()].reduce((a, b) => a + b, 0), c = $('#cart-count');
    c.textContent = n; c.classList.add('bump'); setTimeout(() => c.classList.remove('bump'), 220);
    $('#cart-btn').setAttribute('aria-label', `Carrito, ${n} producto${n === 1 ? '' : 's'}`);
    if (!silent) toast(`Agregaste «${byId[id].name}» al carrito`);
  }
  function renderCart() {
    const body = $('#cart-body'), foot = $('#cart-foot');
    if (!cart.size) {
      body.innerHTML = `<div class="cart-empty">${ic('cart', 40, 1.4)}<strong>Tu carrito está vacío</strong><p>Agrega productos desde el catálogo.</p></div>`;
      foot.innerHTML = '<button type="button" class="btn btn-dark btn-block" data-close>Seguir comprando</button>';
      return;
    }
    let sub = 0, fin = 0;
    body.innerHTML = [...cart].map(([id, q]) => {
      const p = byId[id]; sub += p.ahora * q; fin += finPrice(p) * q;
      return `<div class="citem"><div class="c-art">${ART(p.art.k, p.art)}</div><div><strong>${p.name}</strong><small>${p.brand} · Cantidad: ${q}</small><br><button type="button" class="rm" data-rm="${id}">Quitar</button></div><div class="c-p">${cop(p.ahora * q)}</div></div>`;
    }).join('');
    foot.innerHTML = `<div class="totals"><div><span>Subtotal de contado</span><b class="num">${cop(sub)}</b></div><div><span>Envío</span><span class="free">Gratis</span></div><div class="grand"><span>Total</span><span class="num">${cop(sub)}</span></div><div class="fin-t"><span>Con financiación (ejemplo)</span><span class="num">desde ${cop(cuota(fin, 24))}/mes</span></div></div><button type="button" class="btn btn-primary btn-lg btn-block" data-toast="Aquí sigue el checkout de WooCommerce con Wompi, PSE, Nequi, Addi y Sumas Pay.">Ir a pagar</button>`;
  }

  /* ---------- Buscador con sugerencias ---------- */
  const q = $('#q'), sug = $('#suggest');
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function hideSuggest() { sug.hidden = true; }
  q.addEventListener('input', () => {
    const v = norm(q.value.trim());
    if (!v) return hideSuggest();
    const words = v.split(/\s+/);
    const hits = P.filter(p => words.every(w => norm(p.full + ' ' + p.brand).includes(w))).slice(0, 6);
    sug.innerHTML = hits.length
      ? hits.map(p => `<a href="#producto" data-go="producto" role="option"><span class="s-art">${ART(p.art.k, p.art)}</span><span class="s-name">${p.name}<small>${p.brand}${p.out ? ' · Agotado' : ''}</small></span><span class="s-price">${cop(p.ahora)}</span></a>`).join('')
      : `<p class="s-empty">No encontramos «${esc(q.value.trim())}». Prueba con otra palabra o escríbenos por WhatsApp.</p>`;
    sug.hidden = false;
  });
  $('#search').addEventListener('submit', e => {
    e.preventDefault(); hideSuggest();
    navigate('categoria');
    if (q.value.trim()) toast('Los resultados de búsqueda usan la misma plantilla de la categoría.');
  });

  /* ---------- Carruseles ---------- */
  function updateRails() {
    $$('.rail').forEach(r => {
      const t = $('.rail-track', r), pv = $('.prev', r), nx = $('.next', r);
      if (!t || !pv) return;
      pv.disabled = t.scrollLeft < 4;
      nx.disabled = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
    });
  }
  function bindRails() {
    $$('.rail').forEach(r => {
      const t = $('.rail-track', r);
      $('.prev', r).addEventListener('click', () => t.scrollBy({ left: -t.clientWidth * .9, behavior: reduce ? 'auto' : 'smooth' }));
      $('.next', r).addEventListener('click', () => t.scrollBy({ left: t.clientWidth * .9, behavior: reduce ? 'auto' : 'smooth' }));
      let raf; t.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateRails); }, { passive: true });
    });
    if ('ResizeObserver' in window) new ResizeObserver(updateRails).observe(device);
  }

  /* ---------- Categoría: filtros y orden ---------- */
  const LAPTOPS = ['acergo', 'dell3530', 'hp15', 'hp14', 'nitrolite', 'nitrov15'].map(id => byId[id]);
  const GROUPS = [
    { k: 'brand', t: 'Marca', get: p => [p.brand] },
    { k: 'price', t: 'Precio', opts: [['lt', 'Hasta $ 1.500.000', p => p.ahora < 1500000], ['mid', '$ 1.500.000 a $ 2.500.000', p => p.ahora >= 1500000 && p.ahora <= 2500000], ['gt', 'Más de $ 2.500.000', p => p.ahora > 2500000]] },
    { k: 'cpu', t: 'Procesador', get: p => [p.f.cpu] },
    { k: 'ram', t: 'Memoria RAM', get: p => [p.f.ram], order: ['8 GB', '16 GB'] },
    { k: 'ssd', t: 'Almacenamiento', get: p => p.f.ssd ? [p.f.ssd] : [], order: ['512 GB', '1 TB'] },
    { k: 'scr', t: 'Pantalla', get: p => [p.f.scr], order: ['14"', '15.6"', '16"'] },
    { k: 'use', t: 'Uso', get: p => p.f.use, order: ['Estudio', 'Trabajo', 'Gamer'] },
    { k: 'avail', t: 'Disponibilidad', opts: [['in', 'Solo disponibles', p => !p.out]] }
  ];
  const F = Object.fromEntries(GROUPS.map(g => [g.k, new Set()]));
  let sortBy = 'top';
  const optionsOf = g => {
    if (g.opts) return g.opts.map(([v, l, fn]) => ({ v, l, n: LAPTOPS.filter(fn).length }));
    const m = new Map();
    LAPTOPS.forEach(p => g.get(p).forEach(v => m.set(v, (m.get(v) || 0) + 1)));
    const keys = g.order ? g.order.filter(v => m.has(v)) : [...m.keys()].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
    return keys.map(v => ({ v, l: v, n: m.get(v) }));
  };
  const labelOf = (k, v) => { const g = GROUPS.find(x => x.k === k); return g.opts ? g.opts.find(o => o[0] === v)[1] : v; };
  const match = p => GROUPS.every(g => {
    const s = F[g.k]; if (!s.size) return true;
    if (g.opts) return [...s].some(v => g.opts.find(o => o[0] === v)[2](p));
    return g.get(p).some(v => s.has(v));
  });
  function filterHTML(px) {
    return GROUPS.map(g => `<details class="fgroup" open><summary>${g.t}${chev(18)}</summary><div class="fopts">${optionsOf(g).map((o, i) =>
      `<label class="fopt" for="f-${px}-${g.k}-${i}"><input type="checkbox" id="f-${px}-${g.k}-${i}" data-f="${g.k}" value="${esc(o.v)}"><span>${o.l}</span><span class="c">${o.n}</span></label>`).join('')}</div></details>`).join('');
  }
  function syncInputs() {
    $$('[data-f]').forEach(i => { i.checked = F[i.dataset.f].has(i.value); });
    $$('.usechip').forEach(b => b.setAttribute('aria-pressed', String(F.use.has(b.dataset.use))));
  }
  function renderGrid() {
    const sorters = { asc: (a, b) => a.ahora - b.ahora, desc: (a, b) => b.ahora - a.ahora, off: (a, b) => off(b) - off(a) };
    let list = LAPTOPS.filter(match);
    if (sorters[sortBy]) list.sort(sorters[sortBy]);
    list.sort((a, b) => (a.out ? 1 : 0) - (b.out ? 1 : 0));
    const grid = $('#cat-grid');
    grid.innerHTML = list.length ? list.map(card).join('')
      : `<div class="empty">${ic('search', 32, 1.5)}<strong>No hay portátiles con esos filtros</strong><p>Quita alguno de los filtros para ver más opciones.</p><button type="button" class="btn btn-dark" data-clear>Limpiar filtros</button></div>`;
    if (shown.has('categoria')) $$('.is-loading', grid).forEach(m => m.classList.remove('is-loading'));
    $('#count').innerHTML = `<b>${list.length}</b> ${list.length === 1 ? 'portátil' : 'portátiles'}`;
    const active = GROUPS.flatMap(g => [...F[g.k]].map(v => [g.k, v]));
    const af = $('#active-f');
    af.hidden = !active.length;
    af.innerHTML = active.map(([k, v]) => `<button type="button" data-unf="${k}" data-v="${esc(v)}" aria-label="Quitar filtro ${esc(labelOf(k, v))}">${labelOf(k, v)}${ic('x', 14)}</button>`).join('') + (active.length ? '<button type="button" class="clear" data-clear>Limpiar todo</button>' : '');
    $('#fcount').textContent = active.length ? ` (${active.length})` : '';
    $('#flt-apply').textContent = `Ver ${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;
  }
  function clearFilters() { Object.values(F).forEach(s => s.clear()); syncInputs(); renderGrid(); }

  /* ---------- Producto: galería ---------- */
  const SLIDES = [
    { kind: 'Foto principal', html: () => ART('combo', { h: 235 }, 'Combo Samsung 40" QLED con barra de sonido HW-B400F, vista frontal') },
    { kind: 'Televisor', html: () => ART('tv', { h: 235 }, 'Televisor Samsung 40" QLED de frente') },
    { kind: 'Barra de sonido', html: () => ART('soundbar', {}, 'Barra de sonido HW-B400F de frente') },
    { kind: 'Detalle', html: () => ART('soundbar-zoom', {}, 'Detalle de la rejilla y el indicador de la barra') },
    { kind: 'Infografía', html: () => infoArt({ icon: 'sun', title: 'Color QLED con Quantum Dot', lines: ['40" Full HD 1920 × 1080', 'HDR', 'Tizen · One UI'] }) },
    { kind: 'Infografía', html: () => infoArt({ icon: 'volume', title: 'Sonido Dolby 2.0 con woofer integrado', lines: ['OTS Lite en el televisor', 'Modo noche y mejora de voz'] }) },
    { kind: 'Infografía', html: () => infoArt({ icon: 'cable', title: 'Conecta todo con un solo cable', lines: ['HDMI ARC · Entrada óptica', 'Bluetooth 4.2 · USB'] }) },
    { kind: 'Infografía', html: () => infoArt({ icon: 'ruler', title: 'Barra de 641 × 66,5 × 107 mm', lines: ['Peso 2,1 kg', 'Color Titan Black'] }) }
  ];
  let gi = 0;
  const gMain = $('#gal-main'), gStage = $('#gal-stage');
  function setSlide(i) {
    gi = (i + SLIDES.length) % SLIDES.length;
    const s = SLIDES[gi];
    gStage.innerHTML = s.html();
    $('#gal-kind').innerHTML = `<span class="badge ${s.kind === 'Infografía' ? 'badge-dark' : 'badge-soft'}">${s.kind}</span>`;
    $('#gal-count').textContent = `${gi + 1} / ${SLIDES.length}`;
    $$('.thumb').forEach((t, k) => t.setAttribute('aria-current', String(k === gi)));
    gMain.classList.toggle('zoomable', s.kind !== 'Infografía');
    gMain.classList.remove('is-zoom');
  }
  function bindGallery() {
    $('#thumbs').innerHTML = SLIDES.map((s, i) => `<button type="button" class="thumb" data-slide="${i}" aria-label="Imagen ${i + 1} de ${SLIDES.length}: ${s.kind}">${s.html()}</button>`).join('');
    $$('.thumb .info-art').forEach(el => el.removeAttribute('role'));
    $('#gal-prev').addEventListener('click', () => setSlide(gi - 1));
    $('#gal-next').addEventListener('click', () => setSlide(gi + 1));
    gMain.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') setSlide(gi - 1); if (e.key === 'ArrowRight') setSlide(gi + 1); });
    gMain.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !gMain.classList.contains('zoomable') || e.target.closest('button')) { gMain.classList.remove('is-zoom'); return; }
      const r = gMain.getBoundingClientRect(), a = $('.art', gStage);
      if (a) a.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
      gMain.classList.add('is-zoom');
    });
    gMain.addEventListener('pointerleave', () => gMain.classList.remove('is-zoom'));
    let x0 = null;
    gMain.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    gMain.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) setSlide(gi + (dx < 0 ? 1 : -1)); x0 = null; });
    setSlide(0);
  }

  /* ---------- Producto: calculadora de cuotas ---------- */
  const FINP = finPrice(byId.sam40);
  let calcN = 12;
  const curFin = () => FIN[$('input[name="fin"]:checked').value];
  function renderCalc() {
    const f = curFin();
    if (!f.n.includes(calcN)) calcN = f.n.includes(12) ? 12 : f.n[f.n.length - 1];
    $('#n-opts').innerHTML = f.n.map(n => `<label class="opt"><input type="radio" name="n" value="${n}"${n === calcN ? ' checked' : ''}><span>${n}<span class="sr-only"> cuotas</span></span></label>`).join('');
    renderCalcOut();
  }
  function renderCalcOut() {
    const f = curFin(), m = cuota(FINP, calcN);
    $('#calc-l').textContent = `Con ${f.name} pagarías aprox.`;
    $('#calc-v').innerHTML = `${cop(m)} <small>/mes</small>`;
    $('#calc-tt').textContent = `${calcN} cuotas · total aprox. ${cop(m * calcN)}`;
  }

  /* ---------- Eventos globales ---------- */
  document.addEventListener('click', e => {
    if (!mega.hidden && !e.target.closest('#mega, #mega-btn')) toggleMega(false);
    if (!sug.hidden && !e.target.closest('#search')) hideSuggest();
    const el = e.target.closest('a, button, [data-close]');
    if (!el) return;
    const d = el.dataset;
    if ('open' in d) { e.preventDefault(); openLayer(d.open); return; }
    if ('device' in d) { setDevice(d.device); return; }
    if ('slide' in d) { setSlide(+d.slide); return; }
    if ('add' in d) { addToCart(d.add); return; }
    if ('buy' in d) { addToCart(d.buy, true); openLayer('cart'); return; }
    if ('rm' in d) { cart.delete(d.rm); const n = [...cart.values()].reduce((a, b) => a + b, 0); $('#cart-count').textContent = n; $('#cart-btn').setAttribute('aria-label', `Carrito, ${n} producto${n === 1 ? '' : 's'}`); renderCart(); return; }
    if ('notify' in d) { toast('Te avisaremos por WhatsApp cuando vuelva a llegar.'); return; }
    if ('clear' in d) { clearFilters(); return; }
    if ('unf' in d) { F[d.unf].delete(d.v); syncInputs(); renderGrid(); return; }
    if ('skip' in d) { e.preventDefault(); $('#main').focus(); return; }
    if ('scroll' in d) { e.preventDefault(); const t = document.getElementById(d.scroll); t && t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return; }
    if (el.classList.contains('fam-h') && el.closest('.mfam')) { const open = el.getAttribute('aria-expanded') !== 'true'; el.setAttribute('aria-expanded', String(open)); $('#' + el.getAttribute('aria-controls')).hidden = !open; return; }
    if ('close' in d) closeLayers();
    if ('toast' in d) { e.preventDefault(); toast(d.toast); return; }
    if ('cat' in d) {
      e.preventDefault(); navigate('categoria');
      if (d.cat !== 'Portátiles') toast(`Vista de ejemplo: la plantilla de categoría está armada con Portátiles; «${d.cat}» usaría la misma.`);
      return;
    }
    if ('go' in d) { e.preventDefault(); if (el.closest('#suggest')) { q.value = ''; hideSuggest(); } navigate(d.go); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.matches('[data-f]')) { const s = F[el.dataset.f]; el.checked ? s.add(el.value) : s.delete(el.value); syncInputs(); renderGrid(); }
    else if (el.id === 'sort') { sortBy = el.value; renderGrid(); }
    else if (el.name === 'fin') renderCalc();
    else if (el.name === 'n') { calcN = +el.value; renderCalcOut(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!sug.hidden) { hideSuggest(); return; }
    if (!mega.hidden) { toggleMega(false); megaBtn.focus(); return; }
    closeLayers();
  });
  $$('.usechip').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.use; F.use.has(v) ? F.use.delete(v) : F.use.add(v); syncInputs(); renderGrid();
  }));
  $('#video-btn').addEventListener('click', () => {
    $('#video-slot').innerHTML = `<div class="video" role="region" aria-label="Video del producto"><div class="video-msg">${ic('play', 28)}<strong>Aquí se carga el video del fabricante</strong><p>En la tienda real: archivo liviano o YouTube, con póster, sin reproducción automática y lejos del botón de compra.</p></div></div>`;
  });

  /* ---------- Inicio ---------- */
  hydrate();
  renderStatic();
  $('#filters-d').innerHTML = filterHTML('d');
  $('#filters-m').innerHTML = filterHTML('m');
  renderGrid();
  bindRails();
  bindGallery();
  renderCalc();
  hydrate();
  let saved = 'desktop';
  try { saved = localStorage.getItem('gt-device') || 'desktop'; } catch (e) { /* sin almacenamiento */ }
  setDevice(innerWidth < 720 ? 'desktop' : saved);
  go(VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'inicio');
})();
