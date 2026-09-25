/* =====================================================================
   Página de producto: galería + columna de compra
   ===================================================================== */
const skuOf = (p, v) => `GT-${String(p.id).padStart(4, '0')}${v ? '-' + v.replace(/\s/g, '') : ''}`;
const SPEC_IC = { 'Procesador':'cpu', 'Memoria RAM':'grid', 'Almacenamiento':'hdd', 'Pantalla':'monitor', 'Gráficos':'gpu', 'Tipo':'printer', 'Funciones':'file', 'Conectividad':'wifi', 'Resolución':'scan', 'Brillo':'sun', 'Sistema':'cpu', 'Frecuencia':'bolt', 'Tiempo de respuesta':'clock', 'Sensor':'zoom', 'Iluminación':'sun', 'Conexión':'cable', 'Incluye':'box' };

function slidesFor(p) {
  if (p.gallery) return p.gallery;
  return [
    { kind:'Foto principal', art:[p.art.k, p.art] },
    { kind:'Detalle', art:[p.art.k, p.art], vb:CROPS[p.art.k] },
    { kind:'Infografía', info:{ icon:SPEC_IC[(p.spec || [[]])[0][0]] || 'badge', title:p.model, lines:p.chips.slice(0, 3) } },
    { kind:'Infografía', info:{ icon:'shield', title:'Garantía directa con la marca', lines:['1 año · Factura electrónica', 'Producto nuevo y sellado'] } }
  ];
}
const slideHTML = (s, label = '') => s.info ? infoArt(s.info) : ART(s.art[0], s.art[1], label, s.vb);

function galleryHTML(p) {
  const sl = slidesFor(p);
  return `<div class="gal">
    <div class="gal-d">
      <div class="gal-main zoomable" id="gal-main" tabindex="0" role="group" aria-roledescription="carrusel" aria-label="Galería de ${esc(p.name)}. Usa las flechas del teclado para cambiar de imagen.">
        <div class="gal-stage" id="gal-stage">${slideHTML(sl[0], p.name)}</div>
        <span class="gal-kind" id="gal-kind"><span class="badge badge-gamer">${sl[0].kind}</span></span>
        <button type="button" class="gal-arrow prev" data-act="slide" data-d="-1" aria-label="Imagen anterior">${ic('left')}</button>
        <button type="button" class="gal-arrow next" data-act="slide" data-d="1" aria-label="Imagen siguiente">${ic('right')}</button>
        <span class="gal-count" id="gal-count">1 / ${sl.length}</span>
        <span class="gal-hint">${ic('zoom', 14)}Pasa el mouse para ampliar</span>
      </div>
      <div class="thumbs" role="group" aria-label="Miniaturas">${sl.map((s, i) => `<button type="button" class="thumb" data-act="slide-to" data-i="${i}" aria-label="Imagen ${i + 1} de ${sl.length}: ${s.kind}" aria-current="${i === 0}">${s.info ? infoArt(s.info).replace('role="img"', 'aria-hidden="true"') : ART(s.art[0], s.art[1], '', s.vb)}</button>`).join('')}</div>
    </div>
    <div class="gal-m" role="group" aria-roledescription="carrusel" aria-label="Galería de ${esc(p.name)}">
      <div class="gal-m-track" id="gal-m-track" tabindex="0" aria-label="Desliza para ver más imágenes">${sl.map((s, i) => `<div aria-label="Imagen ${i + 1} de ${sl.length}">${slideHTML(s, i === 0 ? p.name : '')}</div>`).join('')}</div>
      <span class="gal-kind"><span class="badge badge-gamer" id="gal-m-kind">${sl[0].kind}</span></span>
      <div class="gal-dots" aria-hidden="true">${sl.map((_, i) => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('')}</div>
    </div>
  </div>`;
}

function etaHTML(p, city) {
  const e = etaRange(city), pr = priceOf(p, S.pdp.v).precio, free = pr >= FREE_SHIP;
  return `<span class="eta">Recíbelo ${e.text}</span>
    <ul><li>${free ? '<b style="color:var(--color-success)">Envío gratis</b>' : `Envío ${cop(SHIP_STD)}`} · ${e.days} a ${esc(city)}</li>
    ${e.main ? `<li>Express en 24 h: ${cop(SHIP_EXP)}</li>` : ''}
    <li>Retiro en tienda: consulta disponibilidad por WhatsApp</li></ul>`;
}

function buyHTML(p) {
  const v = S.pdp.v, pr = priceOf(p, v), fp = finPrice(pr.precio), out = pr.stock === 0;
  const fam = famOf(catOf(p)), cat = CATS[catOf(p)];
  const qtyMax = pr.stock == null ? 10 : Math.min(10, pr.stock);
  return `
    ${crumbsHTML([['Inicio', '#/'], ...(fam ? [[fam.t, '#/categoria/' + fam.id]] : []), [cat.name, '#/categoria/' + catOf(p)], [p.model, '']])}
    <p class="pdp-brand">${p.brand}</p>
    <h1 class="pdp-name" tabindex="-1">${p.model}</h1>
    <p class="pdp-meta"><span>${p.type}</span><span class="sku">SKU ${skuOf(p, v)}</span></p>
    ${p.reviews ? `<button type="button" class="rating link" data-act="scrollto" data-target="resenas" style="color:inherit">${starsHTML(p.rating)}<b>${String(p.rating).replace('.', ',')},0</b><span class="rc">${p.reviews} reseña${p.reviews > 1 ? 's' : ''}</span></button>`
      : `<button type="button" class="rating link" data-act="scrollto" data-target="resenas" style="color:inherit">${starsHTML(0, 16, false)}<span class="rc">Sin reseñas aún</span></button>`}
    <div class="pbox">
      ${pr.antes > pr.precio ? `<p class="p-was"><span class="badge badge-off">-${offPct(pr.antes, pr.precio)}&nbsp;%</span><s><span class="sr-only">Antes </span>${cop(pr.antes)}</s><span class="p-save">Ahorras ${cop(pr.antes - pr.precio)}</span></p>` : ''}
      <p class="p-cash"><span class="price">${cop(pr.precio)}</span><span class="l">Pagando con Wompi, PSE, Nequi o transferencia</span></p>
      <p class="p-fin"><span>Con Addi / Sumas / Sistecrédito:</span> <b>${cop(fp)}</b> <button type="button" class="link why" data-act="why-price">¿Por qué cambia el precio?</button></p>
    </div>
    ${p.variants ? `<fieldset class="variants"><legend>Memoria RAM</legend><div class="var-opts">${p.variants.map(o => `<label class="var-opt${o.stock === 0 ? ' is-out' : ''}"><input type="radio" name="variant" data-ch="variant" value="${o.v}"${o.v === v ? ' checked' : ''}><span>${o.v}<small>${cop(o.precio)}</small><em>${o.stock === 0 ? 'Agotado' : 'Disponible'}</em></span></label>`).join('')}</div></fieldset>` : ''}
    ${stockHTML(pr.stock)}
    ${out ? `<form class="ibox" data-form="notify" novalidate style="grid-template-columns:1fr">
        <div><strong>${ic('bell', 18)} Avísame cuando llegue</strong><p>Te escribimos apenas vuelva a estar disponible${p.variants ? ` la versión de ${v}` : ''}.</p></div>
        <div class="field"><label for="notify-mail">Correo o celular</label><input class="input" id="notify-mail" name="contact" autocomplete="email" placeholder="tucorreo@ejemplo.com o 300 000 0000" aria-describedby="notify-msg"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Avísame cuando llegue</button>
        <div id="notify-msg" aria-live="polite"></div>
      </form>` : `<div class="buy-actions">
        <div class="buy-row"><div class="qty" role="group" aria-label="Cantidad"><button type="button" data-act="qty" data-d="-1" aria-label="Quitar uno"${S.pdp.qty <= 1 ? ' disabled' : ''}>${ic('minus', 18)}</button><output aria-live="polite" id="qty-out">${S.pdp.qty}</output><button type="button" data-act="qty" data-d="1" aria-label="Agregar uno"${S.pdp.qty >= qtyMax ? ' disabled' : ''}>${ic('plus', 18)}</button></div>
        <button type="button" class="btn btn-primary btn-lg" data-act="buy-now">Comprar ahora</button></div>
        <button type="button" class="btn btn-secondary btn-lg btn-block" data-act="add-pdp">Agregar al carrito</button>
      </div>`}
    <a class="btn btn-ghost btn-block wa-btn" href="${waLink('Hola, quiero asesoría sobre ' + p.name + (v ? ' (' + v + ')' : ''))}" target="_blank" rel="noopener">${ic('chat', 18)}Asesoría por WhatsApp</a>
    <div class="ibox"><span class="ic">${ic('truck')}</span><div><strong>Envío a toda Colombia</strong>
      <label class="city">Enviar a <select class="select" data-ch="city" aria-label="Ciudad de entrega">${ALL_CITIES.slice().sort((a, b) => a.localeCompare(b, 'es')).map(c => `<option${c === S.pdp.city ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
      <div id="eta" aria-live="polite">${etaHTML(p, S.pdp.city)}</div></div></div>
    <div class="ibox"><span class="ic">${ic('shield')}</span><div><strong>1 año de garantía directa con la marca</strong><p>Factura electrónica · Producto nuevo y sellado.${p.warrantyNote ? ' Conserva los empaques originales: facilitan el trámite de garantía.' : ''}</p></div></div>
    <p class="pdp-meta" style="margin:0">${ic('store', 16)}&nbsp;Vendido y despachado por <b>&nbsp;Giftronic04.com</b></p>
    <div class="payrow"><span>Medios de pago</span><ul class="pay"><li>Wompi</li><li>PSE</li><li>Nequi</li><li>Bancolombia</li><li>Visa</li><li>Mastercard</li><li>Addi</li><li>Sumas Pay</li><li>Sistecrédito</li></ul></div>`;
}

function buybarHTML(p) {
  const pr = priceOf(p, S.pdp.v), out = pr.stock === 0;
  return `<div class="bb-p"><span class="price">${cop(pr.precio)}</span><span>${out ? 'Agotado' : `Con Addi: ${cop(finPrice(pr.precio))} · ${pr.stock != null && pr.stock <= 3 ? 'Últimas ' + pr.stock : 'Disponible'}`}</span></div>
    ${out ? '<button type="button" class="btn btn-secondary" data-act="scrollto" data-target="notify-mail">Avísame</button>' : '<button type="button" class="btn btn-primary" data-act="buy-now">Comprar</button>'}`;
}
