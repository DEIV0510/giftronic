/* =====================================================================
   Componentes compartidos
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ACTIONS = {};   // clic en [data-act]
const CHANGES = {};   // change/input en [data-ch]
const chev = s => ic('down', s).replace('class="i"', 'class="i chev"');
const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
const pHref = p => `#/producto/${p.slug}`;

/* Recortes para la segunda imagen (detalle) de cada tipo de producto */
const CROPS = { combo:'190 180 170 170', tv:'170 70 190 190', soundbar:'200 150 180 180', 'soundbar-zoom':'0 0 400 400', laptop:'70 165 190 190', aio:'140 180 160 160', tablet:'215 150 170 170', printer:'245 150 110 110', laser:'195 125 125 125', monitor:'130 170 180 180', projector:'86 164 130 130', mouse:'140 80 140 140', mic:'135 50 130 130', phone:'130 40 150 150', gamepad:'200 150 150 150' };
const artOf = (p, label = '') => ART(p.art.k, p.art, label);
const art2Of = p => ART(p.art.k, p.art, '', CROPS[p.art.k] || '0 0 400 400');

/* Precio efectivo según variante */
function priceOf(p, v) {
  const x = v && p.variants ? p.variants.find(o => o.v === v) : null;
  return x ? { antes:x.antes, precio:x.precio, stock:x.stock } : { antes:p.antes, precio:p.precio, stock:stockOf(p) };
}
const minPrice = p => p.variants ? Math.min(...p.variants.map(v => v.precio)) : p.precio;

function starsHTML(n, size = 16, label = true) {
  const s = Array.from({ length:5 }, (_, i) => `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${i < Math.round(n) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${ICONS.star}</svg>`).join('');
  return `<span class="stars"${label ? ` role="img" aria-label="${String(n).replace('.', ',')} de 5 estrellas"` : ' aria-hidden="true"'}>${s}</span>`;
}

/* Badges: prioridad -XX % > Combo > Gamer > Últimas unidades, máximo 2 */
function badgesHTML(p) {
  const st = stockOf(p), out = st === 0, list = [];
  if (out) list.push('<span class="badge badge-out">Agotado</span>');
  else if (p.antes > p.precio) list.push(`<span class="badge badge-off">-${offPct(p.antes, p.precio)}&nbsp;%</span>`);
  if ((p.tags || []).includes('Combo')) list.push('<span class="badge badge-combo">Combo</span>');
  if ((p.tags || []).includes('Gamer')) list.push('<span class="badge badge-gamer">Gamer</span>');
  if (!out && st != null && st <= 3) list.push('<span class="badge badge-last">Últimas unidades</span>');
  return list.slice(0, 2).join('');
}
function stockHTML(n) {
  if (n === 0) return '<p class="stock out"><span class="dot" aria-hidden="true"></span>Agotado</p>';
  if (n != null && n <= 3) return `<p class="stock last"><span class="dot" aria-hidden="true"></span>Últimas ${n} unidades</p>`;
  if (n != null) return `<p class="stock in"><span class="dot" aria-hidden="true"></span>Disponible <span>· ${n} unidades</span></p>`;
  return '<p class="stock in"><span class="dot" aria-hidden="true"></span>Disponible</p>';
}

/* Tarjeta de producto. opts.compare = muestra "Comparar" */
function card(p, opts = {}) {
  const out = isOut(p), from = p.variants ? 'Desde ' : '';
  const pr = minPrice(p), fp = finPrice(pr);
  return `<article class="card${out ? ' is-out' : ''}" data-pid="${p.id}">
    <div class="card-media is-loading"><span class="sk"></span><span class="art-1">${artOf(p, p.name)}</span><span class="art-2" aria-hidden="true">${art2Of(p)}</span><div class="card-badges">${badgesHTML(p)}</div>${out ? '<span class="out-flag">Sin unidades</span>' : ''}</div>
    <div class="card-body">
      <p class="card-brand">${p.brand}</p>
      <h3 class="card-title"><a href="${pHref(p)}">${p.name}</a></h3>
      <ul class="chips" aria-label="Especificaciones clave">${p.chips.slice(0, 4).map(c => `<li>${c}</li>`).join('')}</ul>
      <div class="card-price">
        ${p.antes > pr ? `<p class="price-was"><s><span class="sr-only">Antes </span>${cop(p.antes)}</s></p>` : ''}
        <p class="price"><span class="sr-only">Precio de contado </span>${from}${cop(pr)}</p>
        ${out ? '<p class="fin">Agotado por ahora</p>' : `<p class="fin">o 12 cuotas de <b>${cop(cuota(fp, 12))}</b> con Addi</p>`}
      </div>
      ${out ? '' : `<p class="ship">${ic('truck', 15)}Llega en 24–48 h a ciudades principales</p>`}
      ${opts.compare ? `<label class="cmp-toggle"><input type="checkbox" class="cb" data-ch="compare" value="${p.id}"${S.compare.includes(p.id) ? ' checked' : ''}>Comparar</label>` : ''}
      <div class="card-actions">
        ${out ? `<button type="button" class="btn btn-ghost" data-act="notify" data-id="${p.id}">${ic('bell', 18)}Avísame</button>`
              : p.variants ? `<a class="btn btn-dark" href="${pHref(p)}">Elegir versión</a>`
              : `<button type="button" class="btn btn-dark" data-act="add" data-id="${p.id}">Agregar</button>`}
        <a class="sq" href="${waLink('Hola, quiero información sobre: ' + p.name)}" target="_blank" rel="noopener" aria-label="Preguntar por WhatsApp: ${esc(p.name)}">${ic('chat', 20)}</a>
      </div>
    </div>
  </article>`;
}
const cardsHTML = (list, opts) => list.map(p => card(p, opts)).join('');
function railHTML(ids, label) {
  const list = ids.map(id => byId[id]).filter(Boolean);
  return `<div class="rail"><button type="button" class="rail-btn prev" data-act="rail" data-dir="-1" aria-label="Ver anteriores de ${esc(label)}">${ic('left')}</button><div class="rail-track">${cardsHTML(list)}</div><button type="button" class="rail-btn next" data-act="rail" data-dir="1" aria-label="Ver siguientes de ${esc(label)}">${ic('right')}</button></div>`;
}
function crumbsHTML(items) {
  return `<nav aria-label="Ruta de navegación"><ol class="crumbs">${items.map(([t, h], i) => i === items.length - 1
    ? `<li aria-current="page">${t}</li>`
    : `<li><a href="${h}">${t}</a>${ic('right', 14)}</li>`).join('')}</ol></nav>`;
}
function stateHTML({ icon = 'info', title, text = '', actions = '', kind = '' }) {
  return `<div class="state ${kind}" role="${kind === 'error' ? 'alert' : 'status'}"><span class="ic">${ic(icon, 28, 1.6)}</span><strong>${title}</strong>${text ? `<p>${text}</p>` : ''}${actions ? `<div class="pills">${actions}</div>` : ''}</div>`;
}
function sectionHead(id, title, sub = '', link = '') {
  return `<div class="sec-h"><div><h2 id="${id}">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${link}</div>`;
}
const noteHTML = t => `<p class="note" role="note">${ic('info', 16)}<span>${t}</span></p>`;
function setLD(obj) {
  let s = document.getElementById('ld-json');
  if (!obj) { if (s) s.remove(); return; }
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-json'; document.head.appendChild(s); }
  s.textContent = JSON.stringify(obj);
}
/* Skeleton: se retira con un pequeño retraso para mostrar el estado "cargando" */
function settle(root) {
  $$('.card-media.is-loading:not(.keep)', root).forEach((m, i) => {
    const t = REDUCE ? 0 : 260 + Math.min(i, 6) * 60 + Math.random() * 200;
    setTimeout(() => m.classList.remove('is-loading'), t);
  });
}
