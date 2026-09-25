/* =====================================================================
   Categoría y búsqueda: filtros, rango de precio, orden, "Cargar más" y comparador
   ===================================================================== */
FACETS.catg = { t:'Categoría', get:p => [CATS[catOf(p)].name] };
const PAGE = 12;
const SORTS = [['rel','Relevancia'],['top','Más vendidos'],['asc','Menor precio'],['desc','Mayor precio'],['off','Mayor descuento']];
const POPULAR = ['portátil i5', 'combo tv', 'tinta continua', 'tablet', 'monitor gamer', 'barra de sonido'];
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function searchProducts(q) {
  const words = norm(q).split(/\s+/).filter(Boolean).map(w => w.replace(/portatil(es)?/, 'portatil').replace(/^tv$/, 'tv'));
  if (!words.length) return [];
  return products.filter(p => { const hay = norm([p.name, p.brand, p.type, p.model, p.chips.join(' '), CATS[catOf(p)].name, p.cat].join(' ')); return words.every(w => hay.includes(w)); });
}

/* Estado del listado (se reinicia al cambiar de categoría o de búsqueda) */
function listState(key, base, facets) {
  if (!S.list || S.list.key !== key) {
    const prices = base.map(minPrice), lo = Math.floor(Math.min(...prices, 0 || Infinity) / 100000) * 100000, hi = Math.ceil(Math.max(...prices, 0) / 100000) * 100000;
    S.list = { key, base, facets, sel:Object.fromEntries(facets.map(f => [f, new Set()])), lo:isFinite(lo) ? lo : 0, hi:hi || 0, min:isFinite(lo) ? lo : 0, max:hi || 0, sort:'rel', shown:PAGE };
  }
  return S.list;
}
function passes(p, L, skip) {
  const pr = minPrice(p);
  if (skip !== 'price' && (pr < L.min || pr > L.max)) return false;
  return L.facets.every(k => {
    if (k === skip) return true;
    const s = L.sel[k], F = FACETS[k];
    if (!s.size) return true;
    if (F.bool) return F.test(p);
    return F.get(p).some(v => s.has(v));
  });
}
function filtered(L) {
  const list = L.base.filter(p => passes(p, L));
  const by = { top:(a, b) => a.rank - b.rank, asc:(a, b) => minPrice(a) - minPrice(b), desc:(a, b) => minPrice(b) - minPrice(a), off:(a, b) => offPct(b.antes, b.precio) - offPct(a.antes, a.precio) }[L.sort];
  if (by) list.sort(by);
  if (L.sort === 'rel') list.sort((a, b) => (isOut(a) ? 1 : 0) - (isOut(b) ? 1 : 0));
  return list;
}
function optionsOf(L, k) {
  const F = FACETS[k], pool = L.base.filter(p => passes(p, L, k));
  if (F.bool) return [{ v:'1', l:F.bool, n:pool.filter(F.test).length }];
  const m = new Map();
  L.base.forEach(p => F.get(p).forEach(v => m.set(v, 0)));
  pool.forEach(p => F.get(p).forEach(v => m.set(v, (m.get(v) || 0) + 1)));
  const keys = F.order ? F.order.filter(v => m.has(v)) : [...m.keys()].sort((a, b) => a.localeCompare(b, 'es', { numeric:true }));
  return keys.map(v => ({ v, l:v, n:m.get(v) }));
}
function filtersHTML(L, px) {
  const range = L.hi > L.lo ? `<details class="fgroup" open><summary>Precio${chev(18)}</summary><div class="range">
      <div class="range-vals"><span id="${px}-pmin-v">${cop(L.min)}</span><span id="${px}-pmax-v">${cop(L.max)}</span></div>
      <div class="dual"><span class="track"></span><span class="fill" id="${px}-fill"></span>
        <input type="range" data-ch="pmin" min="${L.lo}" max="${L.hi}" step="50000" value="${L.min}" aria-label="Precio mínimo" aria-valuetext="${cop(L.min)}">
        <input type="range" data-ch="pmax" min="${L.lo}" max="${L.hi}" step="50000" value="${L.max}" aria-label="Precio máximo" aria-valuetext="${cop(L.max)}">
      </div></div></details>` : '';
  const groups = L.facets.map(k => {
    const opts = optionsOf(L, k);
    if (!opts.length || (opts.length === 1 && !FACETS[k].bool && L.facets.length > 2 && k !== 'brand')) return '';
    return `<details class="fgroup" open><summary>${FACETS[k].t}${chev(18)}</summary><div class="fopts">${opts.map((o, i) =>
      `<label class="fopt${o.n ? '' : ' is-zero'}" for="f-${px}-${k}-${i}"><input class="cb" type="checkbox" id="f-${px}-${k}-${i}" data-ch="facet" data-f="${k}" value="${esc(o.v)}"${L.sel[k].has(o.v) ? ' checked' : ''}><span>${o.l}</span><span class="c">${o.n}</span></label>`).join('')}</div></details>`;
  });
  return (groups.shift() || '') + range + groups.join('');
}
function resultsHTML(L) {
  const list = filtered(L), shown = list.slice(0, L.shown);
  const act = [];
  L.facets.forEach(k => L.sel[k].forEach(v => act.push([k, v, FACETS[k].bool || v])));
  if (L.min > L.lo || L.max < L.hi) act.push(['price', '', `${cop(L.min)} – ${cop(L.max)}`]);
  return {
    count: list.length, active: act.length,
    chips: act.map(([k, v, l]) => `<button type="button" data-act="unfilter" data-f="${k}" data-v="${esc(v)}" aria-label="Quitar filtro ${esc(l)}">${l}${ic('x', 14)}</button>`).join('') + (act.length ? '<button type="button" class="clear" data-act="clear-filters">Limpiar todo</button>' : ''),
    grid: shown.length ? cardsHTML(shown, { compare:true })
      : L.base.length ? stateHTML({ icon:'search', title:'No hay productos con esos filtros', text:'Quita alguno de los filtros para ver más opciones.', actions:'<button type="button" class="btn btn-dark" data-act="clear-filters">Limpiar filtros</button>' })
      : '',
    more: list.length > L.shown ? `<div class="more"><span>Mostrando ${shown.length} de ${list.length}</span><span class="bar"><i style="width:${shown.length / list.length * 100}%"></i></span><button type="button" class="btn btn-secondary" data-act="more">Cargar más</button></div>`
      : list.length > PAGE ? `<div class="more"><span>Viste los ${list.length} productos</span></div>` : ''
  };
}
function listingHTML(L, { title, crumbs, seo, emptyState, q }) {
  const r = resultsHTML(L);
  return `<div class="wrap">
    ${crumbsHTML(crumbs)}
    <header class="page-h">
      <h1 tabindex="-1">${title}</h1>
      ${seo ? `<div class="seo" id="seo"><p>${seo}</p><button type="button" class="link" data-act="seo" aria-expanded="false" aria-controls="seo">Leer más</button></div>` : ''}
    </header>
    ${L.base.length ? `<div class="cat-layout">
      <aside class="filters" id="filters-d" aria-label="Filtros">${filtersHTML(L, 'd')}</aside>
      <div>
        <div class="toolbar">
          <p class="count" id="count" aria-live="polite"><b>${r.count}</b> ${r.count === 1 ? 'resultado' : 'resultados'}</p>
          <button type="button" class="btn btn-ghost filter-btn" data-act="open" data-layer="filters">${ic('sliders', 18)}Filtrar<span id="fcount">${r.active ? ` (${r.active})` : ''}</span></button>
          <label class="sort"><span class="sort-l">Ordenar por</span><select class="select" data-ch="sort" aria-label="Ordenar por">${SORTS.map(([v, l]) => `<option value="${v}"${L.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <div class="active-f" id="active-f"${r.active ? '' : ' hidden'}>${r.chips}</div>
        <div class="grid" id="grid">${r.grid}</div>
        <div id="more">${r.more}</div>
      </div>
    </div>` : emptyState}
  </div>`;
}
function refreshListing() {
  const L = S.list, r = resultsHTML(L), grid = $('#grid');
  if (!grid) return;
  grid.innerHTML = r.grid;
  $('#more').innerHTML = r.more;
  $('#count').innerHTML = `<b>${r.count}</b> ${r.count === 1 ? 'resultado' : 'resultados'}`;
  const af = $('#active-f'); af.innerHTML = r.chips; af.hidden = !r.active;
  $('#fcount').textContent = r.active ? ` (${r.active})` : '';
  const ap = $('#flt-apply'); if (ap) ap.textContent = `Ver ${r.count} ${r.count === 1 ? 'producto' : 'productos'}`;
  // recalcula conteos y sincroniza ambos paneles sin perder el foco
  ['d', 'm'].forEach(px => {
    L.facets.forEach(k => optionsOf(L, k).forEach((o, i) => {
      const el = document.getElementById(`f-${px}-${k}-${i}`); if (!el) return;
      el.checked = L.sel[k].has(el.value);
      const lab = el.closest('.fopt'); lab.classList.toggle('is-zero', !o.n); $('.c', lab).textContent = o.n;
    }));
    $$(`[data-ch="pmin"],[data-ch="pmax"]`).forEach(inp => { inp.value = inp.dataset.ch === 'pmin' ? L.min : L.max; inp.setAttribute('aria-valuetext', cop(+inp.value)); });
    const a = document.getElementById(`${px}-pmin-v`); if (a) { a.textContent = cop(L.min); document.getElementById(`${px}-pmax-v`).textContent = cop(L.max); }
    const fill = document.getElementById(`${px}-fill`);
    if (fill && L.hi > L.lo) { fill.style.left = (L.min - L.lo) / (L.hi - L.lo) * 100 + '%'; fill.style.right = (L.hi - L.max) / (L.hi - L.lo) * 100 + '%'; }
  });
  $$('[data-ch="compare"]').forEach(c => { c.checked = S.compare.includes(+c.value); });
  $$('.card-media.is-loading', grid).forEach(m => m.classList.remove('is-loading'));
}
function afterListing(root) {
  settle(root);
  $('#filters-m').innerHTML = S.list.base.length ? filtersHTML(S.list, 'm') : '';
  refreshListing();
}

function viewCategory(slug) {
  const C = CATS[slug];
  if (!C) return viewNotFound();
  const base = products.filter(C.m), L = listState('cat:' + slug, base, C.f);
  const fam = famOf(slug);
  const crumbs = [['Inicio', '#/']];
  if (fam && fam.id !== slug) crumbs.push([fam.t, '#/categoria/' + fam.id]);
  crumbs.push([C.name, '']);
  return {
    title: C.name,
    wa: `Hola, busco ${C.name.toLowerCase()} y quiero asesoría.`,
    html: listingHTML(L, { title:C.name, crumbs, seo:C.seo,
      emptyState: `<div class="grid">${stateHTML({ icon:'box', title:`Pronto tendremos ${C.name.toLowerCase()}`, text:'Mientras tanto, escríbenos por WhatsApp y te ayudamos a conseguir lo que buscas.', actions:`<a class="btn btn-primary" href="${waLink('Hola, busco ' + C.name)}" target="_blank" rel="noopener">${ic('chat', 18)}Preguntar por WhatsApp</a><a class="btn btn-ghost" href="#/categoria/todo">Ver todo el catálogo</a>` })}</div>${noteHTML('<b>Nota del prototipo:</b> esta categoría no tiene productos en los datos de muestra; así se ve el estado vacío.')}` }),
    after: afterListing
  };
}

function viewSearch(q) {
  const term = (q.get('q') || '').trim();
  const base = searchProducts(term), L = listState('q:' + term, base, ['catg', 'brand', 'avail', 'deal']);
  const sugg = `<div class="sg-chips" style="justify-content:center">${POPULAR.map(t => `<a href="#/buscar?q=${encodeURIComponent(t)}">${ic('search', 14)}${t}</a>`).join('')}</div>`;
  return {
    title: term ? `Resultados para «${term}»` : 'Buscar',
    html: listingHTML(L, { title: term ? `Resultados para «${esc(term)}»` : 'Buscar productos', crumbs:[['Inicio', '#/'], ['Búsqueda', '']],
      emptyState: `<div class="grid">${stateHTML({ icon:'search', title: term ? `No encontramos «${esc(term)}»` : 'Escribe lo que buscas', text: term ? 'Revisa la ortografía o prueba con una palabra más general, como «portátil» o «televisor».' : 'Busca por producto, marca o referencia.' })}</div>
        <section class="sec" aria-labelledby="h-pop"><h2 id="h-pop" class="sg-h" style="text-align:center">Búsquedas populares</h2>${sugg}</section>
        <section class="sec" aria-labelledby="h-pc">${sectionHead('h-pc', 'Categorías populares')}<div class="pills">${['portatiles','combos-tv','televisores','impresion','tablets','gaming'].map(s => `<a class="pill" href="#/categoria/${s}">${CATS[s].name}</a>`).join('')}</div></section>` }),
    after: afterListing
  };
}

/* Comparador */
function compareBarHTML() {
  if (!S.compare.length) return '';
  return `<div class="thumbs-mini">${S.compare.map(id => `<span class="tm">${artOf(byId[id])}</span>`).join('')}</div><span class="lbl">${S.compare.length} de 3</span>
    <button type="button" class="btn btn-sm btn-ghost" data-act="compare-clear">Limpiar</button>
    <button type="button" class="btn btn-sm btn-primary" data-act="compare-open"${S.compare.length < 2 ? ' disabled aria-disabled="true" title="Elige al menos 2 productos"' : ''}>Comparar</button>`;
}
function compareTableHTML() {
  const list = S.compare.map(id => byId[id]);
  const rows = [
    ['Precio de contado', p => cop(minPrice(p)), 'min'],
    ['Con financiación', p => cop(finPrice(minPrice(p)))],
    ['12 cuotas con Addi', p => cop(cuota(finPrice(minPrice(p)), 12))],
    ['Disponibilidad', p => isOut(p) ? 'Agotado' : 'Disponible'],
    ['Procesador', p => (p.spec || []).find(s => s[0] === 'Procesador')?.[1] || '—'],
    ['Memoria RAM', p => (p.spec || []).find(s => s[0] === 'Memoria RAM')?.[1] || '—'],
    ['Almacenamiento', p => (p.spec || []).find(s => s[0] === 'Almacenamiento')?.[1] || '—'],
    ['Pantalla', p => (p.spec || []).find(s => s[0] === 'Pantalla')?.[1] || p.a?.size || '—'],
    ['Gráficos', p => (p.spec || []).find(s => s[0] === 'Gráficos')?.[1] || '—'],
    ['Destacado', p => p.chips.join(' · ')]
  ];
  const best = Math.min(...list.map(minPrice));
  return `<div class="cmp-table-wrap"><table class="cmp-table"><thead><tr><th scope="col"><span class="sr-only">Característica</span></th>${list.map(p => `<th scope="col">${artOf(p)}<a href="${pHref(p)}" data-act="close">${p.name}</a></th>`).join('')}</tr></thead>
    <tbody>${rows.map(([t, f, flag]) => `<tr><th scope="row">${t}</th>${list.map(p => `<td${flag && minPrice(p) === best ? ' class="best"' : ''}>${f(p)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
