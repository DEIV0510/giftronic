/* =====================================================================
   Página de producto: contenido bajo el pliegue y ensamblado de la vista
   ===================================================================== */
/* Fichas de los productos que no traen tabla propia (solo con datos del nombre o de la ficha del brief) */
(() => {
  const barra = byId[1].specGroups[1];
  byId[6].specGroups = [barra];
  byId[3].specGroups = [['Televisor U8500H', [['Tamaño','43"'],['Tecnología','Crystal UHD'],['Resolución','4K UHD'],['Sistema operativo','Tizen']]], barra];
  byId[2].specGroups = [['Televisor 40A4NV', [['Tamaño','40"'],['Resolución','Full HD'],['Sistema operativo','VIDAA']]], ['Barra de sonido', [['Tipo','Barra compacta']]]];
  byId[4].spec = [['Tamaño','43"'],['Tecnología','Crystal UHD'],['Resolución','4K UHD'],['Sistema operativo','Tizen']];
  byId[5].spec = [['Tamaño','40"'],['Resolución','Full HD'],['Sistema operativo','VIDAA']];
  byId[7].spec = [['Potencia','120 W'],['Audio','Dolby Audio'],['Conectividad','Bluetooth']];
  byId[3].box = byId[1].box.map(b => b[0] === 'tv' ? ['tv','Televisor 43" 4K','U8500H'] : b);
  byId[2].box = [['tv','Televisor 40"','40A4NV'],['speaker','Barra de sonido','Compacta'],['remote','Control remoto','Televisor'],['stand','Base del televisor','Soportes y tornillos'],['plug','Cables de alimentación','TV y barra'],['file','Manuales y garantía','Documentos de la marca']];
})();
const specGroupsOf = p => p.specGroups || [['Especificaciones', [['Marca', p.brand], ['Modelo', p.model], ...(p.spec || [])]]];
const BOX_BY_CAT = {
  portatiles:[['laptop','Portátil'],['plug','Cargador'],['file','Manuales y garantía']],
  'portatiles-gamer':[['laptop','Portátil gamer'],['plug','Cargador'],['file','Manuales y garantía']],
  'all-in-one':[['monitor','Computador All in One'],['plug','Cable de alimentación'],['file','Manuales y garantía']],
  televisores:[['tv','Televisor'],['remote','Control remoto'],['stand','Base del televisor'],['file','Manuales y garantía']],
  audio:[['speaker','Barra de sonido'],['plug','Cable de alimentación'],['file','Manuales y garantía']],
  tablets:[['smartphone','Tablet'],['plug','Cargador'],['file','Manuales y garantía']],
  impresion:[['printer','Impresora'],['plug','Cable de alimentación'],['file','Manuales y garantía']],
  monitores:[['monitor','Monitor'],['stand','Base'],['plug','Cable de alimentación'],['file','Manuales y garantía']],
  proyectores:[['monitor','Proyector'],['plug','Cable de alimentación'],['file','Manuales y garantía']],
  perifericos:[['box','Producto'],['file','Manuales y garantía']]
};
function boxOf(p) {
  if (p.box) return p.box;
  const b = (BOX_BY_CAT[p.cat] || BOX_BY_CAT.perifericos).map(([i, t]) => [i, t, '']);
  if (p.id === 18) b.splice(1, 0, ['file','Lápiz y folio','Incluidos']);
  if (p.id === 17) b.splice(1, 0, ['box','Kit PRO','Incluido']);
  return b;
}
function highlightsOf(p) {
  if (p.highlights) return p.highlights;
  const rows = specGroupsOf(p).flatMap(g => g[1]).filter(([k]) => !['Marca','Modelo'].includes(k));
  const h = rows.slice(0, 4).map(([k, v]) => [SPEC_IC[k] || 'badge', k, v]);
  [['shield','Garantía','1 año con la marca'],['receipt','Factura','Electrónica'],['truck','Envío','A toda Colombia']].forEach(x => { if (h.length < 6) h.push(x); });
  return h;
}
function benefitsOf(p) {
  if (p.benefits) return p.benefits.map(([k, t, d]) => [ART(k, k === 'tv' || k === 'combo' ? p.art : {}, ''), t, d]);
  const get = k => (p.spec || []).find(s => s[0] === k)?.[1];
  const main = artOf(p), det = art2Of(p), b = [];
  if (get('Procesador')) b.push([main, 'Rendimiento para el día a día', `Procesador ${get('Procesador')} para clases, oficina y varias tareas a la vez.`]);
  if (/SSD/.test(get('Almacenamiento') || '')) b.push([det, 'Enciende y abre programas rápido', `Disco ${get('Almacenamiento')}: mucho más ágil que un disco mecánico.`]);
  if (get('Gráficos')) b.push([det, 'Gráficos dedicados', `${get('Gráficos')} para jugar y editar con más fluidez.`]);
  if (!b.length) p.chips.slice(0, 2).forEach((c, i) => b.push([i ? det : main, c, p.type + '.']));
  b.push([infoArt({ icon:'shield', title:'Garantía', lines:[] }), 'Compra con respaldo', '1 año de garantía directa con la marca y factura electrónica a tu nombre.']);
  return b.slice(0, 4);
}
const PDP_FAQ = [
  ['¿Cuánto tarda el envío?', `A Bogotá, Medellín, Cali y Barranquilla llega en 1 a 2 días hábiles; al resto del país, en 2 a 5 días hábiles. El envío es gratis desde ${cop(FREE_SHIP)} y te enviamos la guía para que sigas tu pedido.`],
  ['¿La garantía es directamente con la marca?', 'Sí. Tienes 1 año de garantía con la marca. Si necesitas usarla, escríbenos por WhatsApp y te guiamos con el centro de servicio autorizado.'],
  ['¿Me entregan factura electrónica?', 'Sí, toda compra lleva factura electrónica a nombre de una persona (CC o CE) o de una empresa (NIT).'],
  ['¿Cómo pago a cuotas?', 'Elige Addi, Sumas Pay o Sistecrédito al pagar, completa la solicitud en línea y, si te aprueban, pagas en cuotas mensuales. Antes de confirmar ves el total y el valor de cada cuota.'],
  ['¿Puedo retractarme de la compra?', 'Sí. Por ser una compra a distancia tienes 5 días hábiles desde la entrega para retractarte (Ley 1480 de 2011, art. 47). El producto debe volver en las mismas condiciones en que lo recibiste.']
];

function calcHTML(base, label) {
  const f = FIN.find(x => x.id === S.pdp.fin), total = f.financed ? finPrice(base) : base, m = cuota(total, S.pdp.n);
  return `<div class="calc" id="calc">
    <div>
      <div class="tabs" role="tablist" aria-label="Financiera">${FIN.map(x => `<button type="button" role="tab" class="tab" id="tab-${x.id}" aria-selected="${x.id === f.id}" aria-controls="calc-panel" tabindex="${x.id === f.id ? 0 : -1}" data-act="fin" data-id="${x.id}">${x.name}<small>hasta ${x.max} cuotas</small></button>`).join('')}</div>
      <div id="calc-panel" role="tabpanel" aria-labelledby="tab-${f.id}">
        <fieldset class="n-opts"><legend class="step">Número de cuotas</legend>${f.n.map(n => `<label class="n-opt"><input type="radio" name="cuotas" data-ch="cuotas" value="${n}"${n === S.pdp.n ? ' checked' : ''}><span>${n}<span class="sr-only"> cuotas</span></span></label>`).join('')}</fieldset>
      </div>
    </div>
    <div>
      <div class="calc-out" aria-live="polite"><span class="l">${label} · con ${f.name} pagarías aprox.</span><span class="v">${cop(m)} <small>/mes</small></span><span class="t">${S.pdp.n} ${S.pdp.n === 1 ? 'cuota' : 'cuotas'} · total aprox. ${cop(m * S.pdp.n)} · base ${cop(total)}</span></div>
      <p class="calc-note">${ic('info', 16)}<span>${f.financed ? 'Valor aproximado sujeto a aprobación de la financiera, calculado sobre el precio con financiación.' : 'Calculado sobre el precio de contado. Tu banco define la tasa de interés de la tarjeta.'}</span></p>
    </div>
  </div>`;
}

function bundleHTML(p) {
  const acc = (p.acc || []).map(id => byId[id]).filter(a => a && !isOut(a));
  if (!acc.length) return `<ul class="suggest-cats">${[['stand','Soportes de pared','Para televisores de 32" a 55"','soporte'],['cable','Cables HDMI','Para consola, PC o decodificador','hdmi'],['bolt','Reguladores de voltaje','Protege tu TV y tu barra','regulador']].map(([i, t, d, q]) => `<li><a href="#/buscar?q=${q}"><span class="ic">${ic(i, 24)}</span><span><strong>${t}</strong><span>${d}</span></span></a></li>`).join('')}</ul>`;
  const all = [p, ...acc], main = priceOf(p, S.pdp.v).precio;
  return `<div class="bundle"><ul class="bundle-items">${all.map((x, i) => `<li><label><input type="checkbox" class="cb" data-ch="bundle" value="${x.id}" ${i === 0 ? 'checked disabled' : 'checked'}><span>${artOf(x)}</span><span><strong>${i === 0 ? 'Este producto' : x.name}</strong><small>${i === 0 ? p.name : x.brand}</small></span><span class="price">${cop(i === 0 ? main : x.precio)}</span></label></li>`).join('')}</ul>
    <div class="bundle-total"><span>Total de los productos elegidos</span><span class="price" id="bundle-total">${cop(all.reduce((s, x, i) => s + (i === 0 ? main : x.precio), 0))}</span><button type="button" class="btn btn-primary btn-block" data-act="add-bundle"${isOut(p) ? ' disabled' : ''}>Agregar al carrito</button></div></div>`;
}

function viewProduct(slug) {
  const p = bySlug[slug];
  if (!p) return viewNotFound();
  if (!S.pdp || S.pdp.id !== p.id) S.pdp = { id:p.id, v:p.variants ? p.variants[0].v : null, qty:1, fin:'addi', n:12, city:'Bogotá', slide:0 };
  const pr = priceOf(p, S.pdp.v), cat = CATS[catOf(p)];
  const similar = products.filter(x => x.id !== p.id && catOf(x) === catOf(p)).concat(products.filter(x => x.id !== p.id && catOf(x) !== catOf(p) && CATS[famOf(catOf(p))?.id || 'todo']?.m(x))).slice(0, 8);
  const groups = specGroupsOf(p);
  return {
    title: p.name,
    wa: `Hola, quiero asesoría sobre ${p.name}`,
    mode: 'pdp',
    html: `<div class="wrap pdp">
      <div class="pdp-top">
        ${galleryHTML(p)}
        <div class="buy" id="buy">${buyHTML(p)}</div>
      </div>

      <section class="psec" aria-labelledby="h-calc">
        <div class="psec-h"><div><h2 id="h-calc">Calcula tus cuotas</h2><p>Elige la financiera y el número de cuotas.</p></div></div>
        <div id="calc-slot">${calcHTML(pr.precio, p.model)}</div>
      </section>

      <section class="psec" aria-labelledby="h-hl">
        <div class="psec-h"><div><h2 id="h-hl">Lo más importante</h2></div></div>
        <ul class="hl">${highlightsOf(p).map(([i, k, v]) => `<li>${ic(i, 22)}<span>${k}</span><strong>${v}</strong></li>`).join('')}</ul>
      </section>

      <section class="psec" aria-labelledby="h-box">
        <div class="psec-h"><div><h2 id="h-box">¿Qué incluye la caja?</h2><p>Contenido de referencia: confírmalo con el empaque del fabricante.</p></div></div>
        <ul class="inbox">${boxOf(p).map(([i, t, s]) => `<li><span class="ic">${ic(i, 26)}</span><span>${t}${s ? `<small>${s}</small>` : ''}</span></li>`).join('')}</ul>
      </section>

      <section class="psec" aria-labelledby="h-desc">
        <div class="psec-h"><div><h2 id="h-desc">Descripción</h2></div></div>
        <ul class="benefits">${benefitsOf(p).map(([img, t, d]) => `<li class="benefit"><span class="b-img" aria-hidden="true">${img}</span><div><strong>${t}</strong><p>${d}</p></div></li>`).join('')}</ul>
      </section>

      <section class="psec" aria-labelledby="h-spec">
        <div class="psec-h"><div><h2 id="h-spec">Ficha técnica</h2>${groups.length > 1 ? '<p>Dividida por producto del combo.</p>' : ''}</div></div>
        <div class="acc">${groups.map(([t, rows], i) => `<details${i === 0 ? ' open' : ''}><summary>${ic(/^Barra/.test(t) ? 'speaker' : /^Televisor/.test(t) ? 'tv' : 'file')}<span>${t}</span>${chev(18)}</summary><table class="spec-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table></details>`).join('')}</div>
      </section>

      <section class="psec" aria-labelledby="h-video">
        <div class="psec-h"><div><h2 id="h-video">Míralo en video</h2><p>El video carga solo cuando lo reproduces, para que la página abra rápido.</p></div></div>
        <div id="video-slot"><button type="button" class="video" data-act="video" aria-label="Reproducir video de ${esc(p.name)}"><span class="play">${ic('play', 30)}</span><span class="cap">${p.name}<span>Video del fabricante</span></span></button></div>
      </section>

      <section class="psec" aria-labelledby="h-faq">
        <div class="psec-h"><div><h2 id="h-faq">Preguntas frecuentes</h2></div></div>
        <div class="faq">${PDP_FAQ.map(([q, a]) => `<details><summary>${q}${chev(18)}</summary><div>${a}</div></details>`).join('')}</div>
      </section>

      <section class="psec" id="resenas" aria-labelledby="h-rev">
        <div class="psec-h"><div><h2 id="h-rev">Reseñas</h2></div><button type="button" class="btn btn-ghost" data-act="toast" data-msg="Aquí se abre el formulario de reseñas, solo para compradores verificados.">Escribir una reseña</button></div>
        ${p.reviews ? `<div class="reviews"><div class="rv-sum"><div class="rv-big"><strong>${p.rating},0</strong><div>${starsHTML(p.rating)}<small>${p.reviews} reseña${p.reviews > 1 ? 's' : ''}</small></div></div>
          <ul class="bars" aria-label="Distribución de calificaciones">${[5, 4, 3, 2, 1].map(n => `<li>${n} ★<span class="bar"><i style="width:${n === p.rating ? 100 : 0}%"></i></span>${n === p.rating ? p.reviews : 0}</li>`).join('')}</ul></div>
          <article class="rv"><div class="rv-top"><b>Cliente de Giftronic04</b><span class="verified">${ic('badge', 15)}Compra verificada</span></div>${starsHTML(5)}<p class="ph">Aquí se muestra el texto de la reseña real publicada en la tienda.</p></article></div>`
          : stateHTML({ icon:'star', title:'Aún no hay reseñas', text:'Si ya lo compraste, cuéntale a otros clientes cómo te fue.' })}
      </section>

${(p.acc || []).length || ['combos-tv', 'televisores'].includes(p.cat) ? `<section class="psec" aria-labelledby="h-comp">
        <div class="psec-h"><div><h2 id="h-comp">Completa tu compra</h2><p>${(p.acc || []).length ? 'Accesorios compatibles, con el total combinado.' : 'Accesorios que suelen llevarse con un televisor.'}</p></div></div>
        ${bundleHTML(p)}
      </section>` : ''}

      ${similar.length ? `<section class="psec" aria-labelledby="h-sim"><div class="psec-h"><div><h2 id="h-sim">Productos similares</h2></div><a class="link" href="#/categoria/${catOf(p)}">Ver ${cat.name.toLowerCase()}${ic('right', 16)}</a></div>${railHTML(similar.map(x => x.id), 'Productos similares')}</section>` : ''}
    </div>`,
    after: root => {
      settle(root);
      setLD({ '@context':'https://schema.org', '@graph':[
        { '@type':'Product', name:p.name, sku:skuOf(p, S.pdp.v), brand:{ '@type':'Brand', name:p.brand }, description:p.type, image:'https://giftronic04.com/wp-content/uploads/' + p.slug + '.webp',
          offers:{ '@type':'Offer', priceCurrency:'COP', price:pr.precio, availability:pr.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url:'https://giftronic04.com/producto/' + p.slug + '/', seller:{ '@type':'Organization', name:'Giftronic04.com' } },
          ...(p.reviews ? { aggregateRating:{ '@type':'AggregateRating', ratingValue:p.rating, reviewCount:p.reviews } } : {}) },
        { '@type':'BreadcrumbList', itemListElement:[['Inicio', ''], [cat.name, 'categoria/' + catOf(p) + '/'], [p.name, 'producto/' + p.slug + '/']].map(([n, u], i) => ({ '@type':'ListItem', position:i + 1, name:n, item:'https://giftronic04.com/' + u })) }
      ] });
      bindGallery(p);
    }
  };
}

/* Galería: flechas, miniaturas, zoom con mouse, teclado y carrusel táctil */
function setSlide(p, i) {
  const sl = slidesFor(p);
  S.pdp.slide = (i + sl.length) % sl.length;
  const s = sl[S.pdp.slide], main = $('#gal-main');
  if (!main) return;
  $('#gal-stage').innerHTML = slideHTML(s, p.name);
  $('#gal-kind').innerHTML = `<span class="badge ${s.info ? 'badge-combo' : 'badge-gamer'}">${s.kind}</span>`;
  $('#gal-count').textContent = `${S.pdp.slide + 1} / ${sl.length}`;
  $$('.thumb').forEach((t, k) => t.setAttribute('aria-current', String(k === S.pdp.slide)));
  main.classList.toggle('zoomable', !s.info); main.classList.remove('is-zoom');
}
function bindGallery(p) {
  const main = $('#gal-main'), track = $('#gal-m-track');
  if (main) {
    main.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') setSlide(p, S.pdp.slide - 1); if (e.key === 'ArrowRight') setSlide(p, S.pdp.slide + 1); });
    main.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !main.classList.contains('zoomable') || e.target.closest('button')) { main.classList.remove('is-zoom'); return; }
      const r = main.getBoundingClientRect(), a = $('.art', $('#gal-stage'));
      if (a) a.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
      main.classList.add('is-zoom');
    });
    main.addEventListener('pointerleave', () => main.classList.remove('is-zoom'));
  }
  if (track) {
    const sl = slidesFor(p);
    track.addEventListener('scroll', () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      $$('.gal-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
      const k = $('#gal-m-kind'); if (k && sl[i]) k.textContent = sl[i].kind;
    }, { passive:true });
  }
}
