/* =====================================================================
   Núcleo: estado, enrutador, barras fijas, header, capas, toast y carrito
   ===================================================================== */
const S = { hash:location.hash || '#/', cart:new Map(), compare:[], list:null, pdp:null, co:null, order:null, removed:null, route:'', navigated:false, focusNotify:false };
const stage = $('#stage'), device = $('#device'), viewport = $('#viewport'), main = $('#main');
const q = $('#q'), sug = $('#suggest');

function hydrate(root = document) {
  $$('i[data-i]', root).forEach(el => {
    const t = document.createElement('template');
    t.innerHTML = ic(el.dataset.i, +(el.dataset.s || 20));
    const svg = t.content.firstElementChild;
    el.classList.forEach(c => svg.classList.add(c));
    el.replaceWith(svg);
  });
}
const isMobile = () => device.clientWidth < 1024;
/* Navegación: la ruta vive en memoria (S.hash) y se refleja en la URL si el entorno lo permite */
function navTo(h, replace) {
  S.hash = h;
  try { history[replace ? 'replaceState' : 'pushState'](null, '', h); } catch (e) { /* entorno sin historial */ }
  render();
}

/* ---------- Enrutador #/... ---------- */
const ROUTES = {
  '': () => viewHome(),
  categoria: (qs, a) => viewCategory(a[0] || 'todo'),
  buscar: qs => viewSearch(qs),
  producto: (qs, a) => viewProduct(a[0]),
  carrito: () => viewCart(),
  checkout: () => viewCheckout(),
  'pedido-confirmado': () => viewConfirm(),
  cuenta: qs => viewAccount(qs),
  rastreo: qs => viewTrack(qs),
  ofertas: qs => viewOfertas(qs),
  cuotas: () => viewCuotas(),
  nosotros: () => viewAbout(),
  legal: (qs, a) => viewLegal(a[0] || 'envios'),
  contacto: () => viewContact(),
  '404': () => viewNotFound(),
  'design-system': () => viewDesignSystem(),
  plan: () => viewPlan()
};
function parseHash() {
  let h = (S.hash || '#/').replace(/^#/, '');
  if (!h.startsWith('/')) h = '/' + h;
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { key:parts[0] || '', args:parts.slice(1), qs:new URLSearchParams(qs || ''), full:'#' + h };
}
function render() {
  const r = parseHash();
  const v = (ROUTES[r.key] || viewNotFound)(r.qs, r.args);
  S.route = ROUTES[r.key] ? r.key : '404';
  closeAll(true); toggleMega(false); hideSuggest();
  const mode = v.mode || 'store';
  device.dataset.mode = mode;
  $$('[data-chrome]').forEach(el => { el.hidden = el.dataset.chrome === 'store' ? !(mode === 'store' || mode === 'pdp') : el.dataset.chrome !== mode; });
  main.innerHTML = v.html;
  hydrate(main);
  document.title = `${v.title} · Giftronic04`;
  if (S.route !== 'producto') setLD(null);
  if (v.after) v.after(main);
  const wa = $('#wa-float');
  wa.hidden = mode === 'checkout' || mode === 'doc' || (mode === 'pdp' && isMobile());
  wa.href = waLink(v.wa || 'Hola, quiero asesoría de Giftronic04');
  device.classList.remove('is-compact', 'show-search');
  viewport.scrollTop = 0;
  updateBars(); updateRails();
  const sel = $('#proto-route'), opt = [...sel.options].find(o => o.value === r.full);
  sel.value = opt ? opt.value : '';
  $$('.proto-quick a').forEach(a => a.getAttribute('href') === r.full ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  if (S.focusNotify && $('#notify-mail')) { S.focusNotify = false; $('#notify-mail').focus(); }
  else if (S.navigated) { const h1 = $('h1', main); if (h1) h1.focus({ preventScroll:true }); }
  S.navigated = true;
}
/* Re-render de la vista actual conservando scroll y foco (carrito, cuenta) */
function refreshView(focusSel) {
  const top = viewport.scrollTop;
  const r = parseHash(), v = (ROUTES[r.key] || viewNotFound)(r.qs, r.args);
  main.innerHTML = v.html; hydrate(main); if (v.after) v.after(main);
  viewport.scrollTop = top; updateBars();
  if (focusSel) { const el = $(focusSel, main); if (el && !el.disabled) el.focus({ preventScroll:true }); }
}

/* ---------- Barras fijas: navegación inferior, compra, comparador ---------- */
function updateBars() {
  const mode = device.dataset.mode, mob = isMobile();
  const bb = $('#buybar'), bn = $('#bnav'), cb = $('#cmpbar');
  const showBuy = mode === 'pdp' && mob && S.pdp;
  bb.hidden = !showBuy;
  if (showBuy) bb.innerHTML = buybarHTML(byId[S.pdp.id]);
  bn.hidden = !(mob && mode === 'store');
  const showCmp = S.compare.length > 0 && ['categoria', 'buscar'].includes(S.route);
  cb.hidden = !showCmp;
  if (showCmp) cb.innerHTML = compareBarHTML();
  device.classList.toggle('has-cmp', showCmp);
  const h = showBuy ? bb.offsetHeight : !bn.hidden ? bn.offsetHeight : 0;
  device.style.setProperty('--bar-h', h + 'px');
  $('#wa-float').hidden = mode === 'checkout' || mode === 'doc' || (mode === 'pdp' && mob);
  const nav = { '':'home', categoria:'cats', buscar:'search', cuenta:'account', carrito:'cart' }[S.route];
  $$('#bnav [data-nav]').forEach(a => a.dataset.nav === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
}
function updateRails(root = main) {
  $$('.rail', root).forEach(r => {
    const t = $('.rail-track', r), pv = $('.prev', r), nx = $('.next', r);
    if (!t || !pv) return;
    pv.disabled = t.scrollLeft < 4;
    nx.disabled = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
  });
}

/* ---------- Escritorio / móvil ---------- */
function setDevice(d) {
  stage.classList.toggle('is-phone', d === 'phone');
  $$('[data-act="device"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.d === d)));
  try { localStorage.setItem('gt-device', d); } catch (e) { /* sin almacenamiento */ }
  requestAnimationFrame(() => { updateBars(); updateRails(); });
}

/* ---------- Mega-menú ---------- */
function megaHTML(fid) {
  const f = FAMILIES.find(x => x.id === fid), feat = f.feat ? byId[f.feat] : null;
  return `<ul class="mega-fams" role="tablist" aria-orientation="vertical" aria-label="Familias">${FAMILIES.map(x => `<li role="presentation"><button type="button" class="mega-fam" role="tab" aria-selected="${x.id === fid}" aria-controls="mega-panel" data-act="mega-fam" data-id="${x.id}"><span class="fam-ic">${ic(x.i, 20)}</span>${x.t}${ic('right', 16).replace('class="i"', 'class="i chev-r"')}</button></li>`).join('')}</ul>
    <div class="mega-subs" id="mega-panel" role="tabpanel"><h3>${f.t}</h3><ul>${f.subs.map(([s, t]) => `<li><a href="#/categoria/${s}">${t}</a></li>`).join('')}</ul><a class="link" href="#/categoria/${f.id}">Ver todo en ${f.t}${ic('right', 16)}</a></div>
    ${feat ? `<a class="mega-feat" href="${pHref(feat)}">${artOf(feat)}<small>Destacado</small><strong>${feat.name}</strong><span class="price">${cop(minPrice(feat))}</span></a>`
      : `<div class="mega-feat"><span style="display:grid;place-items:center;aspect-ratio:4/3;background:#fff;border-radius:12px;color:var(--color-accent)">${ic(f.i, 64, 1.2)}</span><small>${f.t}</small><strong>Redes, cables, cámaras y memorias</strong></div>`}`;
}
function renderMega(fid) { $('#mega-in').innerHTML = megaHTML(fid); }
function toggleMega(open) {
  const m = $('#mega'), b = $('#mega-btn');
  if (open === undefined) open = m.hidden;
  if (open && !$('#mega-in').innerHTML) renderMega(FAMILIES[0].id);
  m.hidden = !open; b.setAttribute('aria-expanded', String(open));
}

/* ---------- Capas: menú, carrito, filtros, modal ---------- */
let lastFocus = null;
function openLayer(name, opts = {}) {
  const l = $('#layer-' + name); if (!l) return;
  closeAll(true); toggleMega(false); hideSuggest();
  lastFocus = document.activeElement;
  if (name === 'cart') renderCartDrawer();
  if (name === 'modal') { $('#modal-t').textContent = opts.title || ''; $('#modal-b').innerHTML = opts.html || ''; $('.sheet', l).classList.toggle('sm', !!opts.sm); }
  l.hidden = false;
  const f = $('.sheet-h .icon-btn', l); if (f) f.focus();
}
function closeAll(silent) {
  let was = false;
  $$('.layer').forEach(l => { if (!l.hidden) { l.hidden = true; was = true; } });
  if (was && !silent && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll:true });
}
const openLayerEl = () => $$('.layer').find(l => !l.hidden);

/* ---------- Toast ---------- */
let toastT;
function toast(msg, opts = {}) {
  const slot = $('#toast-slot');
  slot.innerHTML = `<div class="toast${opts.error ? ' error' : ''}">${ic(opts.error ? 'alert' : 'check', 18)}<span>${msg}</span>${opts.action ? `<button type="button" data-act="${opts.action.act}">${opts.action.label}</button>` : ''}</div>`;
  clearTimeout(toastT); toastT = setTimeout(() => { slot.innerHTML = ''; }, opts.ms || 4200);
}

/* ---------- Carrito en memoria ---------- */
function updateCartCount(bump) {
  const n = cartTotals().count;
  $$('[data-cart-count]').forEach(b => { b.textContent = n; if (bump) { b.classList.add('bump'); setTimeout(() => b.classList.remove('bump'), 220); } });
  $('#cart-btn').setAttribute('aria-label', `Carrito, ${n} producto${n === 1 ? '' : 's'}`);
}
function renderCartDrawer() {
  const c = cartDrawerHTML(), n = cartTotals().count;
  $('#cart-body').innerHTML = c.body; $('#cart-foot').innerHTML = c.foot; $('#cart-foot').hidden = !c.foot;
  $('#cart-t').textContent = `Tu carrito${n ? ` (${n})` : ''}`;
}
function refreshCartViews(focusSel) {
  if (!$('#layer-cart').hidden) { renderCartDrawer(); if (focusSel) { const el = $(focusSel, $('#layer-cart')); (el && !el.disabled ? el : $('#layer-cart .sheet-h .icon-btn')).focus(); } }
  if (S.route === 'carrito') refreshView(focusSel);
}
function cartAdd(id, v = null, qty = 1, fromEl = null, silent = false) {
  const p = byId[id], st = priceOf(p, v).stock;
  if (st === 0) return false;
  const k = cartKey(id, v), cur = S.cart.get(k), max = st == null ? 10 : Math.min(10, st);
  S.cart.set(k, { id, v, qty:Math.min(max, (cur ? cur.qty : 0) + qty) });
  if (fromEl) flyToCart(fromEl);
  updateCartCount(true);
  if (!silent) toast(`Agregaste «${p.name}${v ? ' · ' + v : ''}» al carrito`, { action:{ act:'open-cart', label:'Ver carrito' } });
  refreshCartViews();
  return true;
}
/* Animación: la imagen vuela hasta el ícono del carrito */
function flyToCart(fromEl) {
  if (REDUCE || !fromEl) return;
  const bn = $('#bnav [data-nav="cart"]'), target = !$('#bnav').hidden ? bn : $('#cart-btn');
  const d = device.getBoundingClientRect(), a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  if (!a.width || !b.width) return;
  const f = document.createElement('div');
  f.className = 'fly';
  const art = $('.art', fromEl); f.innerHTML = art ? art.outerHTML : '';
  f.style.left = (a.left - d.left + a.width / 2 - 36) + 'px';
  f.style.top = (a.top - d.top + a.height / 2 - 36) + 'px';
  device.appendChild(f);
  const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
  const anim = f.animate([
    { transform:'translate(0,0) scale(1)', opacity:1 },
    { transform:`translate(${dx * .55}px, ${dy * .55 - 70}px) scale(.7)`, opacity:1, offset:.6 },
    { transform:`translate(${dx}px, ${dy}px) scale(.2)`, opacity:.3 }
  ], { duration:650, easing:'cubic-bezier(.2,.7,.2,1)' });
  anim.onfinish = () => f.remove();
}

/* ---------- Buscador con autocompletado ---------- */
function hideSuggest() { sug.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); }
function suggestHTML(term) {
  let i = 0; const id = () => `sg-${i++}`;
  if (!term) return `<p class="sg-h">Búsquedas populares</p><div class="sg-chips">${POPULAR.map(t => `<a id="${id()}" class="sg-opt" role="option" href="#/buscar?q=${encodeURIComponent(t)}">${ic('search', 14)}${t}</a>`).join('')}</div>
    <p class="sg-h">Categorías</p><div class="sg-chips">${['portatiles', 'combos-tv', 'impresion', 'tablets', 'gaming'].map(s => `<a id="${id()}" class="sg-opt" role="option" href="#/categoria/${s}">${CATS[s].name}</a>`).join('')}</div>`;
  const hits = searchProducts(term), cats = Object.entries(CATS).filter(([s, c]) => s !== 'todo' && norm(c.name).includes(norm(term)) && products.some(c.m)).slice(0, 3);
  if (!hits.length && !cats.length) return `<p class="sg-h">Sin coincidencias</p><p style="padding:4px 8px 10px;font-size:14px;color:var(--color-muted-strong)">No encontramos «${esc(term)}». Prueba con otra palabra.</p><div class="sg-chips">${POPULAR.slice(0, 4).map(t => `<a id="${id()}" class="sg-opt" role="option" href="#/buscar?q=${encodeURIComponent(t)}">${t}</a>`).join('')}</div>`;
  return (hits.length ? `<p class="sg-h">Productos</p>${hits.slice(0, 5).map(p => `<a id="${id()}" class="sg-item sg-opt" role="option" href="${pHref(p)}"><span class="sg-art">${artOf(p)}</span><span class="sg-name">${p.name}<small>${p.brand}${isOut(p) ? ' · Agotado' : ''}</small></span><span class="sg-price">${cop(minPrice(p))}</span></a>`).join('')}` : '')
    + (cats.length ? `<p class="sg-h">Categorías</p><div class="sg-chips">${cats.map(([s, c]) => `<a id="${id()}" class="sg-opt" role="option" href="#/categoria/${s}">${c.name}</a>`).join('')}</div>` : '')
    + `<a class="sg-all sg-opt" id="${id()}" role="option" href="#/buscar?q=${encodeURIComponent(term)}">Ver los ${hits.length} resultados${ic('arrow', 16)}</a>`;
}
function showSuggest() { sug.innerHTML = suggestHTML(q.value.trim()); sug.hidden = false; q.setAttribute('aria-expanded', 'true'); }
q.addEventListener('focus', showSuggest);
q.addEventListener('input', showSuggest);
q.addEventListener('keydown', e => {
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key) || sug.hidden) return;
  const opts = $$('.sg-opt', sug); if (!opts.length) return;
  let i = opts.findIndex(o => o.classList.contains('is-active'));
  if (e.key === 'Enter') { if (i >= 0) { e.preventDefault(); navTo(opts[i].getAttribute('href')); hideSuggest(); } return; }
  e.preventDefault();
  i = e.key === 'ArrowDown' ? (i + 1) % opts.length : (i - 1 + opts.length) % opts.length;
  opts.forEach(o => o.classList.remove('is-active')); opts[i].classList.add('is-active');
  opts[i].scrollIntoView({ block:'nearest' });
  q.setAttribute('aria-activedescendant', opts[i].id);
});
