/* =====================================================================
   Interacciones: acciones, cambios, formularios, checkout e inicio
   ===================================================================== */
function refreshBuy(focusSel) {
  const p = byId[S.pdp.id];
  $('#buy').innerHTML = buyHTML(p);
  updateBars();
  if (focusSel) { const el = $(focusSel, $('#buy')); if (el && !el.disabled) el.focus({ preventScroll:true }); }
}
function refreshCalc(focusSel) {
  const p = byId[S.pdp.id];
  $('#calc-slot').innerHTML = calcHTML(priceOf(p, S.pdp.v).precio, p.model);
  if (focusSel) { const el = $(focusSel); if (el) el.focus({ preventScroll:true }); }
}
const whyHTML = () => `<div class="why-list"><p>El <b>precio de contado</b> aplica cuando pagas con Wompi (tarjeta, PSE, Nequi o Bancolombia) o transferencia.</p>
  <p>Si financias con <b>Addi, Sumas Pay o Sistecrédito</b>, la financiera cobra una comisión a la tienda y el precio es un poco mayor. En este producto la diferencia es de <b>${cop(finPrice(priceOf(byId[S.pdp.id], S.pdp.v).precio) - priceOf(byId[S.pdp.id], S.pdp.v).precio)}</b>.</p>
  <p>Siempre ves los dos precios y el total antes de pagar.</p><a class="btn btn-secondary" href="#/cuotas">Cómo comprar a cuotas</a></div>`;

Object.assign(ACTIONS, {
  skip: (el, e) => { e.preventDefault(); main.focus(); },
  device: el => setDevice(el.dataset.d),
  open: (el, e) => { e.preventDefault(); openLayer(el.dataset.layer); },
  'open-cart': () => openLayer('cart'),
  close: () => closeAll(),
  mega: () => toggleMega(),
  'mega-fam': el => { const id = el.dataset.id; renderMega(id); const b = $(`.mega-fam[data-id="${id}"]`); if (b) b.focus(); },
  mfam: el => { const open = el.getAttribute('aria-expanded') !== 'true'; el.setAttribute('aria-expanded', String(open)); $('#' + el.getAttribute('aria-controls')).hidden = !open; },
  'search-toggle': () => { device.classList.toggle('show-search'); if (device.classList.contains('show-search')) q.focus(); },
  add: el => { const media = el.closest('.card') ? $('.card-media', el.closest('.card')) : el.closest('.upsell'); cartAdd(+el.dataset.id, null, 1, media); },
  notify: el => { S.focusNotify = true; navTo(pHref(byId[+el.dataset.id])); },
  rail: el => { const t = $('.rail-track', el.parentElement); t.scrollBy({ left:+el.dataset.dir * t.clientWidth * .9, behavior:REDUCE ? 'auto' : 'smooth' }); },
  unfilter: el => { const L = S.list, k = el.dataset.f; if (k === 'price') { L.min = L.lo; L.max = L.hi; } else L.sel[k].delete(el.dataset.v); L.shown = PAGE; refreshListing(); const c = $('#active-f button'); if (c) c.focus(); },
  'clear-filters': () => { const L = S.list; if (!L) return; Object.values(L.sel).forEach(s => s.clear()); L.min = L.lo; L.max = L.hi; L.shown = PAGE; refreshListing(); },
  more: () => { const before = $$('#grid .card').length; S.list.shown += PAGE; refreshListing(); const nx = $$('#grid .card')[before]; if (nx) $('a', nx).focus(); },
  seo: el => { const s = $('#seo'), open = !s.classList.contains('is-open'); s.classList.toggle('is-open', open); el.textContent = open ? 'Leer menos' : 'Leer más'; el.setAttribute('aria-expanded', String(open)); },
  'compare-clear': () => { S.compare = []; $$('[data-ch="compare"]').forEach(c => { c.checked = false; }); updateBars(); },
  'compare-open': () => openLayer('modal', { title:'Comparar productos', html:compareTableHTML() }),
  slide: el => setSlide(byId[S.pdp.id], S.pdp.slide + +el.dataset.d),
  'slide-to': el => setSlide(byId[S.pdp.id], +el.dataset.i),
  qty: el => { const p = byId[S.pdp.id], st = priceOf(p, S.pdp.v).stock, max = st == null ? 10 : Math.min(10, st); S.pdp.qty = Math.max(1, Math.min(max, S.pdp.qty + +el.dataset.d)); refreshBuy(`[data-act="qty"][data-d="${el.dataset.d}"]`); },
  'buy-now': () => { if (cartAdd(S.pdp.id, S.pdp.v, S.pdp.qty, null, true)) navTo('#/checkout'); },
  'add-pdp': () => cartAdd(S.pdp.id, S.pdp.v, S.pdp.qty, isMobile() ? $('.gal-m-track') : $('#gal-main')),
  'why-price': () => openLayer('modal', { title:'¿Por qué cambia el precio?', sm:true, html:whyHTML() }),
  fin: el => { S.pdp.fin = el.dataset.id; const f = FIN.find(x => x.id === S.pdp.fin); if (!f.n.includes(S.pdp.n)) S.pdp.n = f.n.includes(12) ? 12 : f.n[f.n.length - 1]; refreshCalc('#tab-' + f.id); },
  video: () => { $('#video-slot').innerHTML = `<div class="video" role="region" aria-label="Video del producto"><div class="video-msg">${ic('play', 28)}<strong>Aquí se carga el video del fabricante</strong><p>Archivo liviano o YouTube con póster: se carga solo al pulsar reproducir y nunca dentro de la zona de compra.</p></div></div>`; },
  scrollto: (el, e) => { e.preventDefault(); const t = document.getElementById(el.dataset.target); if (!t) return; t.scrollIntoView({ behavior:REDUCE ? 'auto' : 'smooth', block:'start' }); if (t.matches('input,select,textarea')) setTimeout(() => t.focus({ preventScroll:true }), REDUCE ? 0 : 450); },
  toast: el => toast(el.dataset.msg),
  cqty: el => { const k = el.dataset.key, l = S.cart.get(k), p = byId[l.id], st = priceOf(p, l.v).stock, max = st == null ? 10 : Math.min(10, st); l.qty = Math.max(1, Math.min(max, l.qty + +el.dataset.d)); updateCartCount(); refreshCartViews(`[data-act="cqty"][data-key="${k}"][data-d="${el.dataset.d}"]`); },
  crm: el => { const k = el.dataset.key, l = S.cart.get(k); S.removed = { k, l }; S.cart.delete(k); updateCartCount(); refreshCartViews(); toast(`Eliminaste «${byId[l.id].name}»`, { action:{ act:'undo-rm', label:'Deshacer' }, ms:6000 }); },
  'undo-rm': () => { if (!S.removed) return; S.cart.set(S.removed.k, S.removed.l); S.removed = null; updateCartCount(true); refreshCartViews(); $('#toast-slot').innerHTML = ''; },
  'add-bundle': () => {
    const ids = $$('[data-ch="bundle"]:checked').map(c => +c.value);
    ids.forEach(id => cartAdd(id, id === S.pdp.id ? S.pdp.v : null, id === S.pdp.id ? S.pdp.qty : 1, null, true));
    flyToCart(isMobile() ? $('.gal-m-track') : $('#gal-main'));
    toast(`Agregaste ${ids.length} productos al carrito`, { action:{ act:'open-cart', label:'Ver carrito' } });
  },
  'co-back': () => { S.co.step--; renderCheckout(); },
  'focus-field': (el, e) => { e.preventDefault(); const f = $('#co-' + el.dataset.f); if (f) f.focus(); }
});

Object.assign(CHANGES, {
  route: el => { if (el.value) navTo(el.value); },
  facet: el => { const s = S.list.sel[el.dataset.f]; el.checked ? s.add(el.value) : s.delete(el.value); S.list.shown = PAGE; refreshListing(); },
  pmin: el => { const L = S.list; L.min = Math.min(+el.value, L.max - 50000); L.shown = PAGE; refreshListing(); },
  pmax: el => { const L = S.list; L.max = Math.max(+el.value, L.min + 50000); L.shown = PAGE; refreshListing(); },
  sort: el => { S.list.sort = el.value; S.list.shown = PAGE; refreshListing(); },
  compare: el => {
    const id = +el.value;
    if (el.checked) { if (S.compare.length >= 3) { el.checked = false; toast('Puedes comparar hasta 3 productos a la vez.', { error:true }); return; } S.compare.push(id); }
    else S.compare = S.compare.filter(x => x !== id);
    updateBars();
  },
  variant: el => { S.pdp.v = el.value; S.pdp.qty = 1; refreshBuy(`[data-ch="variant"][value="${el.value}"]`); refreshCalc(); },
  city: el => { S.pdp.city = el.value; $('#eta').innerHTML = etaHTML(byId[S.pdp.id], el.value); },
  cuotas: el => { S.pdp.n = +el.value; refreshCalc(`[data-ch="cuotas"][value="${el.value}"]`); },
  bundle: () => { const main_ = priceOf(byId[S.pdp.id], S.pdp.v).precio; $('#bundle-total').textContent = cop($$('[data-ch="bundle"]:checked').reduce((s, c) => s + (+c.value === S.pdp.id ? main_ : byId[+c.value].precio), 0)); },
  co: (el, e) => {
    const c = coState(), d = c.d, name = el.name;
    d[name] = el.type === 'checkbox' ? el.checked : name === 'n' ? +el.value : el.value;
    if (e.type === 'change') {
      if (name === 'dept') { d.city = ''; d.ship = 'std'; return rerenderCo('#co-dept'); }
      if (name === 'city') { if (!MAIN_CITIES.includes(d.city)) d.ship = 'std'; if (d.city) validateField('city'); return rerenderCo('#co-city'); }
      if (name === 'pay') { const f = FIN.find(x => x.id === d.pay); if (f && !f.n.includes(d.n)) d.n = f.n.includes(12) ? 12 : f.n[f.n.length - 1]; return rerenderCo(`[name="pay"][value="${d.pay}"]`); }
      if (name === 'ship' || name === 'n') return rerenderCo(name === 'n' ? '[name="n"]:not([disabled])' : `[name="ship"][value="${d.ship}"]`);
      if (name === 'doctype' && d.doc) validateField('doc');
      if (name === 'terms' || name === 'data') validateField(name);
    }
    if (['via', 'n1', 'n2', 'n3'].includes(name)) { const pv = $('#addr-preview b'); if (pv) pv.textContent = `${d.via} ${d.n1 || '__'} # ${d.n2 || '__'} - ${d.n3 || '__'}`; }
    if (e.type === 'input' && c.errs && c.errs[name]) validateField(name);
    updateSummary();
  }
});

/* ---------- Checkout ---------- */
function validateField(name) {
  const c = coState(), d = c.d, r = RULES[name](d[name], d), msg = r === true ? '' : r;
  c.errs = c.errs || {};
  if (msg) c.errs[name] = msg; else delete c.errs[name];
  const f = $(`[data-field="${name}"]`), input = $('#co-' + name), err = $('#err-' + name);
  if (f) { f.classList.toggle('has-error', !!msg); f.classList.toggle('is-valid', !msg && d[name] !== '' && d[name] !== false); }
  if (input) input.setAttribute('aria-invalid', String(!!msg));
  if (err) { err.hidden = !msg; $('span', err).textContent = msg; }
  const box = $('#co-errors'); if (box && box.innerHTML && !STEP_FIELDS[c.step].some(n => c.errs[n])) box.innerHTML = '';
  return !msg;
}
function renderCheckout(focusSel) {
  const box = $('#co'); if (!box) return;
  box.innerHTML = coBodyHTML();
  if (focusSel) { const el = $(focusSel, box); if (el) el.focus({ preventScroll:true }); }
  else { viewport.scrollTop = 0; $('h1', box).focus({ preventScroll:true }); }
  Object.keys((coState().errs) || {}).forEach(n => { if (STEP_FIELDS[coState().step].includes(n)) validateField(n); });
}
function rerenderCo(focusSel) { const top = viewport.scrollTop; renderCheckout(focusSel); viewport.scrollTop = top; }
function updateSummary() {
  const t = coTotals(), s = $('#co-sum'), m = $('.summary-m .panel'), ms = $('.summary-m summary .num'), btn = $('#co-next');
  if (s) s.innerHTML = summaryHTML();
  if (m) m.innerHTML = summaryHTML();
  if (ms) ms.textContent = cop(t.total);
  if (btn && coState().step === 3) btn.textContent = `Pagar ${cop(t.total)}`;
}
function coSubmit(e) {
  e.preventDefault();
  const c = coState(), bad = STEP_FIELDS[c.step].filter(n => !validateField(n)), box = $('#co-errors');
  if (bad.length) {
    box.innerHTML = `<div class="error-summary" role="alert"><b>Revisa ${bad.length === 1 ? 'este campo' : `estos ${bad.length} campos`}:</b><ul>${bad.map(n => `<li><a href="#/checkout" data-act="focus-field" data-f="${n}">${LABELS[n]}: ${c.errs[n]}</a></li>`).join('')}</ul></div>`;
    const first = $('#co-' + bad[0]); if (first) first.focus();
    return;
  }
  box.innerHTML = '';
  if (c.step < 3) { c.step++; renderCheckout(); return; }
  const btn = $('#co-next'); btn.classList.add('is-loading'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    const t = coTotals(), m = PAY.find(x => x.id === c.d.pay);
    S.order = { no:'GT-' + (10483 + Math.floor(Math.random() * 900)), lines:t.lines.map(l => ({ p:l.p, v:l.v, qty:l.qty, precio:m.financed ? l.fin : l.precio })), total:t.total, pay:m.name, financed:m.financed, city:c.d.city, eta:etaRange(c.d.city, c.d.ship === 'exp').text, email:c.d.email };
    S.cart.clear(); updateCartCount(); c.step = 1; c.errs = {};
    navTo('#/pedido-confirmado');
  }, REDUCE ? 300 : 1400);
}

/* ---------- Formularios simples ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function setErr(input, msg) {
  const f = input.closest('.field'), err = document.getElementById(input.id + '-err');
  if (f) f.classList.toggle('has-error', !!msg);
  input.setAttribute('aria-invalid', String(!!msg));
  if (err) { err.hidden = !msg; err.innerHTML = msg ? `${ic('alert', 15)}<span>${msg}</span>` : ''; }
  return !msg;
}
const FORMS = {
  search: f => { const t = f.q.value.trim(); hideSuggest(); device.classList.remove('show-search'); navTo('#/buscar?q=' + encodeURIComponent(t)); },
  search404: f => { navTo('#/buscar?q=' + encodeURIComponent(f.q.value.trim())); },
  newsletter: f => {
    const out = $('[aria-live]', f), mail = f.email.value.trim();
    if (!EMAIL.test(mail)) { out.innerHTML = `<span class="err">${ic('alert', 15)}Escribe un correo válido, por ejemplo nombre@correo.com.</span>`; f.email.focus(); return; }
    if (!f.auth.checked) { out.innerHTML = `<span class="err">${ic('alert', 15)}Marca la autorización de datos para suscribirte.</span>`; f.auth.focus(); return; }
    out.innerHTML = `<span class="ok-msg">${ic('circlecheck', 15)}Listo. Te enviamos un correo para confirmar la suscripción.</span>`; f.reset();
  },
  notify: f => {
    const i = f.contact, v = i.value.replace(/\s/g, '');
    if (!EMAIL.test(v) && !/^3\d{9}$/.test(v)) { $('#notify-msg').innerHTML = `<span class="err">${ic('alert', 15)}Escribe un correo o un celular de 10 dígitos.</span>`; i.setAttribute('aria-invalid', 'true'); i.focus(); return; }
    f.innerHTML = `<div style="display:flex;gap:10px;align-items:flex-start">${ic('circlecheck', 22)}<div><strong>Te avisaremos apenas llegue</strong><p>Enviaremos el aviso a ${esc(i.value.trim())}.</p></div></div>`; f.style.borderColor = 'var(--color-success)';
  },
  track: f => {
    const okNo = setErr(f.no, /^GT-?\d{5}$/i.test(f.no.value.trim()) ? '' : 'El número de pedido tiene la forma GT-12345.');
    const okMail = setErr(f.email, EMAIL.test(f.email.value.trim()) ? '' : 'Escribe el correo con el que compraste.');
    if (!okNo) return f.no.focus(); if (!okMail) return f.email.focus();
    const btn = $('button[type="submit"]', f); btn.classList.add('is-loading'); btn.disabled = true;
    setTimeout(() => { btn.classList.remove('is-loading'); btn.disabled = false;
      const no = f.no.value.trim().toUpperCase().replace(/^GT-?/, 'GT-');
      $('#track-out').innerHTML = no === 'GT-00000' ? `<div style="margin-top:16px">${stateHTML({ icon:'alert', kind:'error', title:'No encontramos ese pedido', text:'Revisa el número y el correo, o escríbenos por WhatsApp.' })}</div>` : trackResultHTML(no);
    }, REDUCE ? 100 : 900);
  },
  contact: f => {
    const ok = [setErr(f.name, f.name.value.trim().length > 1 ? '' : 'Escribe tu nombre.'), setErr(f.email, EMAIL.test(f.email.value.trim()) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com.'), setErr(f.msg, f.msg.value.trim().length > 9 ? '' : 'Cuéntanos en qué te ayudamos (mínimo 10 caracteres).')];
    const auth = f.auth.checked, ae = $('#cf-auth-err'); ae.hidden = auth; ae.innerHTML = auth ? '' : `${ic('alert', 15)}<span>Necesitamos tu autorización para responderte.</span>`;
    const firstBad = [f.name, f.email, f.msg][ok.indexOf(false)];
    if (firstBad) return firstBad.focus(); if (!auth) return f.auth.focus();
    const btn = $('button[type="submit"]', f); btn.classList.add('is-loading'); btn.disabled = true;
    setTimeout(() => { f.innerHTML = stateHTML({ icon:'circlecheck', kind:'success', title:'Recibimos tu mensaje', text:`Te respondemos a ${esc(f.email.value)} en horario de atención. Si es urgente, escríbenos por WhatsApp.` }); }, REDUCE ? 100 : 900);
  },
  profile: f => { if (!setErr(f.email, !f.email.value || EMAIL.test(f.email.value.trim()) ? '' : 'Escribe un correo válido.')) return f.email.focus(); toast('Guardamos tus datos.'); }
};

/* ---------- Eventos globales ---------- */
document.addEventListener('click', e => {
  if (!$('#mega').hidden && !e.target.closest('#mega, #mega-btn')) toggleMega(false);
  if (!sug.hidden && !e.target.closest('#search')) hideSuggest();
  const el = e.target.closest('[data-act]');
  if (el && ACTIONS[el.dataset.act] && !el.disabled) ACTIONS[el.dataset.act](el, e);
  const a = e.target.closest('a[href^="#/"]');
  if (a && !e.defaultPrevented && !a.target && !e.ctrlKey && !e.metaKey && !e.shiftKey) { e.preventDefault(); navTo(a.getAttribute('href')); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-ch]'); if (el && CHANGES[el.dataset.ch]) CHANGES[el.dataset.ch](el, e); });
document.addEventListener('input', e => { const el = e.target; if (el.dataset && ['pmin', 'pmax', 'co'].includes(el.dataset.ch) && el.type !== 'radio' && el.type !== 'checkbox' && el.tagName !== 'SELECT') CHANGES[el.dataset.ch](el, e); });
document.addEventListener('focusout', e => { const el = e.target; if (el.dataset && el.dataset.ch === 'co' && RULES[el.name] && !['terms', 'data', 'dept', 'city'].includes(el.name) && String(el.value).trim()) validateField(el.name); });
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'co-form') return coSubmit(e);
  if (f.dataset.form && FORMS[f.dataset.form]) { e.preventDefault(); FORMS[f.dataset.form](f); }
});
document.addEventListener('pointerover', e => { const b = e.target.closest('.mega-fam'); if (b && b.getAttribute('aria-selected') !== 'true' && e.pointerType === 'mouse') renderMega(b.dataset.id); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!sug.hidden) return hideSuggest();
    if (!$('#mega').hidden) { toggleMega(false); return $('#mega-btn').focus(); }
    return closeAll();
  }
  const tab = e.target.closest && e.target.closest('.tab, .mega-fam');
  if (tab && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    const list = $$(tab.classList.contains('tab') ? '.tab' : '.mega-fam'), i = list.indexOf(tab), dir = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1;
    const nx = list[(i + dir + list.length) % list.length]; e.preventDefault(); ACTIONS[nx.dataset.act](nx, e);
  }
  if (e.key === 'Tab') {   // foco atrapado dentro de la capa abierta
    const l = openLayerEl(); if (!l) return;
    const f = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea', $('.sheet', l)).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
document.addEventListener('scroll', e => { const t = e.target; if (t.classList && t.classList.contains('rail-track')) updateRails(t.closest('.rail').parentElement); }, true);
let rafS;
viewport.addEventListener('scroll', () => { cancelAnimationFrame(rafS); rafS = requestAnimationFrame(() => { const c = viewport.scrollTop > 80; if (c !== device.classList.contains('is-compact')) { device.classList.toggle('is-compact', c); if (!c) device.classList.remove('show-search'); } }); }, { passive:true });
window.addEventListener('popstate', () => { S.hash = location.hash || '#/'; render(); });
window.addEventListener('hashchange', () => { if (location.hash && location.hash !== S.hash) { S.hash = location.hash; render(); } });
if ('ResizeObserver' in window) { let w = 0; new ResizeObserver(() => { if (device.clientWidth !== w) { w = device.clientWidth; updateBars(); updateRails(); } }).observe(device); }
setInterval(() => $$('[data-countdown]').forEach(el => { el.textContent = countdownText(); }), 30000);
if (!REDUCE) setInterval(() => {
  if (device.clientWidth >= 768 || stage.hidden) return;
  const li = $$('#topbar li'), i = li.findIndex(l => l.classList.contains('is-on'));
  li[i].classList.remove('is-on'); li[(i + 1) % li.length].classList.add('is-on');
}, 3200);

/* ---------- Inicio ---------- */
$('#tb-ship').textContent = `Envío gratis a toda Colombia desde ${cop(FREE_SHIP)}`;
$('#foot-nl').innerHTML = newsletterForm('nl-foot');
$('#mfams').innerHTML = FAMILIES.map(f => `<div class="mfam"><button type="button" class="mfam-h" data-act="mfam" aria-expanded="false" aria-controls="mf-${f.id}"><span class="fam-ic">${ic(f.i, 20)}</span>${f.t}${chev(18)}</button><ul id="mf-${f.id}" hidden>${f.subs.map(([s, t]) => `<li><a href="#/categoria/${s}">${t}</a></li>`).join('')}<li><a href="#/categoria/${f.id}"><b>Ver todo en ${f.t}</b></a></li></ul></div>`).join('');
hydrate();
let savedDevice = 'desktop';
try { savedDevice = localStorage.getItem('gt-device') || 'desktop'; } catch (e) { /* sin almacenamiento */ }
setDevice(innerWidth < 720 ? 'desktop' : savedDevice);
updateCartCount();
render();
