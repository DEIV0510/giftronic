/* =====================================================================
   Carrito, checkout y confirmación
   ===================================================================== */
const cartKey = (id, v) => `${id}|${v || ''}`;
function cartLines() {
  return [...S.cart.values()].map(l => { const p = byId[l.id], pr = priceOf(p, l.v); return { ...l, key:cartKey(l.id, l.v), p, precio:pr.precio, fin:finPrice(pr.precio), stock:pr.stock }; });
}
function cartTotals() {
  const lines = cartLines(), count = lines.reduce((s, l) => s + l.qty, 0);
  const sub = lines.reduce((s, l) => s + l.precio * l.qty, 0), fin = lines.reduce((s, l) => s + l.fin * l.qty, 0);
  return { lines, count, sub, fin, free:sub >= FREE_SHIP, missing:Math.max(0, FREE_SHIP - sub) };
}
function shipProgressHTML(t) {
  return t.free ? `<div class="ship-progress done">${ic('truck', 16)} <span>Tu envío es <b style="color:inherit">gratis</b></span><span class="bar"><i style="width:100%"></i></span></div>`
    : `<div class="ship-progress"><span>Te faltan <b>${cop(t.missing)}</b> para el envío gratis</span><span class="bar" role="progressbar" aria-label="Progreso hacia el envío gratis" aria-valuemin="0" aria-valuemax="${FREE_SHIP}" aria-valuenow="${t.sub}"><i style="width:${Math.min(100, t.sub / FREE_SHIP * 100)}%"></i></span></div>`;
}
function cartLineHTML(l) {
  const max = l.stock == null ? 10 : Math.min(10, l.stock);
  return `<div class="cline"><a class="c-art" href="${pHref(l.p)}" data-act="close" aria-hidden="true" tabindex="-1">${artOf(l.p)}</a><div>
    <strong><a href="${pHref(l.p)}" data-act="close" style="text-decoration:none">${l.p.name}</a></strong>
    <small>${l.p.brand}${l.v ? ' · ' + l.v : ''} · ${cop(l.precio)} c/u</small>
    <div class="cline-bottom">
      <div class="qty" role="group" aria-label="Cantidad de ${esc(l.p.name)}"><button type="button" data-act="cqty" data-key="${l.key}" data-d="-1" aria-label="Quitar uno"${l.qty <= 1 ? ' disabled' : ''}>${ic('minus', 16)}</button><output>${l.qty}</output><button type="button" data-act="cqty" data-key="${l.key}" data-d="1" aria-label="Agregar uno"${l.qty >= max ? ' disabled' : ''}>${ic('plus', 16)}</button></div>
      <span class="price">${cop(l.precio * l.qty)}</span>
    </div>
    <button type="button" class="rm" data-act="crm" data-key="${l.key}">${ic('trash', 15)}Eliminar</button>
  </div></div>`;
}
function upsellOf(t) {
  const inCart = new Set(t.lines.map(l => l.id));
  const ids = t.lines.flatMap(l => l.p.acc || []).concat([24, 6]);
  return ids.map(id => byId[id]).find(p => p && !inCart.has(p.id) && !isOut(p));
}
function cartDrawerHTML() {
  const t = cartTotals();
  if (!t.count) return { body:stateHTML({ icon:'cart', title:'Tu carrito está vacío', text:'Agrega productos desde el catálogo. Aquí verás el total y el envío.', actions:'<a class="btn btn-dark" href="#/ofertas" data-act="close">Ver ofertas</a>' }), foot:'' };
  const u = upsellOf(t);
  return {
    body: shipProgressHTML(t) + t.lines.map(cartLineHTML).join('') +
      (u ? `<div class="upsell">${artOf(u)}<div><small>Complementa tu compra</small><strong>${u.name}</strong><span class="price" style="font-size:14px">${cop(u.precio)}</span></div><button type="button" class="btn btn-sm btn-ghost" data-act="add" data-id="${u.id}" aria-label="Agregar ${esc(u.name)}">${ic('plus', 16)}Agregar</button></div>` : ''),
    foot: `<div class="totals"><div><span>Subtotal (${t.count} producto${t.count > 1 ? 's' : ''})</span><b class="num">${cop(t.sub)}</b></div><div><span>Envío</span>${t.free ? '<span class="free">Gratis</span>' : '<span class="muted">Se calcula al pagar</span>'}</div><div class="muted"><span>Con financiación (ejemplo)</span><span class="num">${cop(t.fin)}</span></div></div>
      <a class="btn btn-primary btn-lg btn-block" href="#/checkout" data-act="close">Ir a pagar</a><a class="btn btn-ghost btn-block" href="#/carrito" data-act="close">Ver carrito</a>`
  };
}

function viewCart() {
  const t = cartTotals();
  return {
    title: 'Carrito',
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Carrito', '']])}
      <header class="page-h"><h1 tabindex="-1">Tu carrito</h1></header>
      ${t.count ? `<div class="cart-page">
        <div class="panel">${shipProgressHTML(t)}${t.lines.map(cartLineHTML).join('')}</div>
        <aside class="panel sticky-side" aria-labelledby="h-sum"><h2 id="h-sum">Resumen</h2>
          <div class="totals"><div><span>Subtotal</span><b class="num">${cop(t.sub)}</b></div><div><span>Envío</span>${t.free ? '<span class="free">Gratis</span>' : `<span class="num">${cop(SHIP_STD)}</span>`}</div>
          <div class="grand"><span>Total de contado</span><span class="num">${cop(t.sub + (t.free ? 0 : SHIP_STD))}</span></div>
          <div class="muted"><span>Con Addi / Sumas / Sistecrédito</span><span class="num">${cop(t.fin + (t.free ? 0 : SHIP_STD))}</span></div>
          <div class="muted"><span>12 cuotas aprox. con Addi</span><span class="num">${cop(cuota(t.fin, 12))}/mes</span></div></div>
          <a class="btn btn-primary btn-lg btn-block" href="#/checkout" style="margin-top:14px">Ir a pagar</a>
          <a class="btn btn-ghost btn-block" href="#/" style="margin-top:8px">Seguir comprando</a>
          <p class="hint" style="margin-top:12px">Precios en pesos colombianos con IVA incluido.</p>
        </aside></div>`
      : `<div class="grid">${stateHTML({ icon:'cart', title:'Tu carrito está vacío', text:'Explora las ofertas o busca lo que necesitas.', actions:'<a class="btn btn-primary" href="#/ofertas">Ver ofertas</a><a class="btn btn-ghost" href="#/categoria/todo">Ver catálogo</a>' })}</div>`}
    </div>`,
    after: () => {}
  };
}

/* ---------- Checkout ---------- */
const VIAS = ['Calle','Carrera','Avenida','Avenida Calle','Avenida Carrera','Diagonal','Transversal','Circular','Kilómetro'];
const PAY = [
  { id:'wompi', name:'Wompi', sub:'Tarjeta débito o crédito, PSE, Nequi o Bancolombia', financed:false },
  { id:'addi', name:'Addi', sub:'Hasta 24 cuotas · solicitud en línea', financed:true },
  { id:'sumas', name:'Sumas Pay', sub:'Hasta 36 cuotas · solicitud en línea', financed:true },
  { id:'siste', name:'Sistecrédito', sub:'Hasta 6 cuotas · solicitud en línea', financed:true }
];
const RULES = {
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  name: v => /\S+\s+\S+/.test(v.trim()) || 'Escribe tu nombre y apellido.',
  doc: (v, d) => { const x = v.replace(/[\s.]/g, ''); if (d.doctype === 'NIT') return /^\d{9}(-?\d)?$/.test(x) || 'El NIT tiene 9 dígitos y, si quieres, el dígito de verificación (ej. 900123456-7).'; if (d.doctype === 'CE') return /^\d{6,7}$/.test(x) || 'La cédula de extranjería tiene 6 o 7 dígitos.'; return /^\d{6,10}$/.test(x) || 'La cédula tiene entre 6 y 10 dígitos, sin puntos.'; },
  phone: v => /^(3\d{9}|60\d{8})$/.test(v.replace(/\s/g, '')) || 'Escribe un celular de 10 dígitos que empiece por 3.',
  dept: v => !!v || 'Elige el departamento.',
  city: v => !!v || 'Elige la ciudad.',
  n1: v => !!v.trim() || 'Escribe el número de la vía (ej. 45A).',
  n2: v => !!v.trim() || 'Escribe el número después del #.',
  n3: v => !!v.trim() || 'Escribe la placa (ej. 12).',
  barrio: v => !!v.trim() || 'Escribe el barrio.',
  terms: v => v === true || 'Debes aceptar los términos para continuar.',
  data: v => v === true || 'Necesitamos tu autorización para procesar el pedido (Ley 1581).'
};
const STEP_FIELDS = { 1:['email','name','doc','phone'], 2:['dept','city','n1','n2','n3','barrio'], 3:['terms','data'] };
const LABELS = { email:'Correo', name:'Nombre y apellido', doc:'Documento', phone:'Celular', dept:'Departamento', city:'Ciudad', n1:'Número de vía', n2:'Número', n3:'Placa', barrio:'Barrio', terms:'Términos', data:'Autorización de datos' };
function coState() {
  if (!S.co) S.co = { step:1, d:{ email:'', name:'', doctype:'CC', doc:'', phone:'', dept:'', city:'', via:'Calle', n1:'', n2:'', n3:'', barrio:'', notes:'', ship:'std', pay:'wompi', n:12, terms:false, data:false } };
  return S.co;
}
function shipCost(t, d) { return d.ship === 'exp' ? SHIP_EXP : t.free ? 0 : SHIP_STD; }
function coTotals() {
  const t = cartTotals(), d = coState().d, fin = PAY.find(x => x.id === d.pay).financed, ship = shipCost(t, d);
  const base = fin ? t.fin : t.sub;
  return { ...t, fin_:fin, ship, base, total:base + ship, diff:t.fin - t.sub };
}
function fieldHTML(name, label, input, hint = '') {
  const e = coState().errs && coState().errs[name];
  return `<div class="field${e ? ' has-error' : ''}" data-field="${name}"><label for="co-${name}">${label}${RULES[name] ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>${input}${hint ? `<span class="hint" id="hint-${name}">${hint}</span>` : ''}<span class="err" id="err-${name}"${e ? '' : ' hidden'}>${ic('alert', 15)}<span>${e || ''}</span></span></div>`;
}
const inp = (name, attrs = '') => `<input class="input" id="co-${name}" name="${name}" data-ch="co" value="${esc(coState().d[name])}" aria-describedby="err-${name}" ${attrs}>`;
function coStepHTML() {
  const c = coState(), d = c.d, t = cartTotals();
  if (c.step === 1) return `<div class="co-card"><h2>Tus datos</h2><p class="hint">Los usamos para la factura electrónica y para avisarte del envío.</p><div class="form-grid two">
    ${fieldHTML('email', 'Correo electrónico', inp('email', 'type="email" autocomplete="email" inputmode="email"'))}
    ${fieldHTML('name', 'Nombre y apellido', inp('name', 'autocomplete="name"'))}
    <div class="field"><label for="co-doctype">Tipo de documento</label><select class="select" id="co-doctype" name="doctype" data-ch="co">${[['CC','Cédula de ciudadanía'],['CE','Cédula de extranjería'],['NIT','NIT (empresa)']].map(([v, l]) => `<option value="${v}"${d.doctype === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
    ${fieldHTML('doc', 'Número de documento', inp('doc', 'inputmode="numeric" autocomplete="off"'), 'Sin puntos. Aparecerá en tu factura electrónica.')}
    ${fieldHTML('phone', 'Celular', inp('phone', 'type="tel" inputmode="tel" autocomplete="tel-national"'), 'Te escribimos por WhatsApp con la guía de envío.')}
  </div></div>`;
  if (c.step === 2) {
    const cities = d.dept ? DEPTS[d.dept] : [], main = MAIN_CITIES.includes(d.city);
    const e1 = d.city ? etaRange(d.city) : null, e2 = d.city ? etaRange(d.city, true) : null;
    return `<div class="co-card"><h2>Envío</h2><div class="form-grid two">
      ${fieldHTML('dept', 'Departamento', `<select class="select" id="co-dept" name="dept" data-ch="co" autocomplete="address-level1" aria-describedby="err-dept"><option value="">Elige…</option>${Object.keys(DEPTS).sort((a, b) => a.localeCompare(b, 'es')).map(x => `<option${x === d.dept ? ' selected' : ''}>${x}</option>`).join('')}</select>`)}
      ${fieldHTML('city', 'Ciudad o municipio', `<select class="select" id="co-city" name="city" data-ch="co" autocomplete="address-level2" aria-describedby="err-city"${d.dept ? '' : ' disabled'}><option value="">${d.dept ? 'Elige…' : 'Primero elige el departamento'}</option>${cities.map(x => `<option${x === d.city ? ' selected' : ''}>${x}</option>`).join('')}</select>`)}
      <div class="field span-2"><span class="lbl" id="lbl-addr">Dirección <span class="req" aria-hidden="true">*</span></span>
        <div class="addr-row" role="group" aria-labelledby="lbl-addr">
          <select class="select" id="co-via" name="via" data-ch="co" aria-label="Tipo de vía">${VIAS.map(v => `<option${v === d.via ? ' selected' : ''}>${v}</option>`).join('')}</select>
          <input class="input" id="co-n1" name="n1" data-ch="co" value="${esc(d.n1)}" aria-label="Número de vía" placeholder="45A" aria-describedby="err-n1">
          <span class="sym" aria-hidden="true">#</span>
          <input class="input" id="co-n2" name="n2" data-ch="co" value="${esc(d.n2)}" aria-label="Número" placeholder="12" aria-describedby="err-n2">
          <span class="sym" aria-hidden="true">-</span>
          <input class="input" id="co-n3" name="n3" data-ch="co" value="${esc(d.n3)}" aria-label="Placa" placeholder="34" aria-describedby="err-n3">
        </div>
        ${['n1', 'n2', 'n3'].map(n => `<span class="err" id="err-${n}"${c.errs && c.errs[n] ? '' : ' hidden'}>${ic('alert', 15)}<span>${(c.errs && c.errs[n]) || ''}</span></span>`).join('')}
        <p class="addr-preview" id="addr-preview">Así la verá la transportadora: <b>${esc(`${d.via} ${d.n1 || '__'} # ${d.n2 || '__'} - ${d.n3 || '__'}`)}</b></p>
      </div>
      ${fieldHTML('barrio', 'Barrio', inp('barrio', 'autocomplete="address-line2"'))}
      <div class="field"><label for="co-notes">Indicaciones (opcional)</label><input class="input" id="co-notes" name="notes" data-ch="co" value="${esc(d.notes)}" placeholder="Torre, apartamento, portería…"></div>
    </div>
    <fieldset class="opt-cards" style="border:0;padding:0;margin:0"><legend class="lbl" style="font-weight:800;margin-bottom:8px">Opciones de envío</legend>
      <label class="opt-card"><input class="radio" type="radio" name="ship" data-ch="co" value="std"${d.ship === 'std' ? ' checked' : ''}><span><strong>Estándar</strong><small>${e1 ? `Llega ${e1.text} · ${e1.days}` : 'Elige la ciudad para ver la fecha'}</small></span><span class="amt">${t.free ? 'Gratis' : cop(SHIP_STD)}</span></label>
      <label class="opt-card"><input class="radio" type="radio" name="ship" data-ch="co" value="exp"${d.ship === 'exp' ? ' checked' : ''}${main ? '' : ' disabled'}><span><strong>Express 24 h</strong><small>${main ? `Llega ${e2.text}` : 'Solo en Bogotá, Medellín, Cali y Barranquilla'}</small></span><span class="amt">${cop(SHIP_EXP)}</span></label>
    </fieldset></div>`;
  }
  const tt = coTotals();
  return `<div class="co-card"><h2>Pago</h2>
    <fieldset class="opt-cards" style="border:0;padding:0;margin:0"><legend class="sr-only">Método de pago</legend>
      ${PAY.map(m => { const base = m.financed ? tt.fin : tt.sub; return `<label class="opt-card"><input class="radio" type="radio" name="pay" data-ch="co" value="${m.id}"${d.pay === m.id ? ' checked' : ''}><span><strong>${m.name}</strong><small>${m.sub}</small></span><span class="amt">${cop(base + tt.ship)}<small>${m.financed ? 'con financiación' : 'de contado'}</small></span>
        ${m.financed ? `<span class="extra"><span class="field" style="gap:4px"><span class="lbl" aria-hidden="true">Número de cuotas</span><select class="select" name="n" data-ch="co" aria-label="Número de cuotas con ${m.name}">${FIN.find(f => f.id === m.id).n.map(n => `<option value="${n}"${d.n === n ? ' selected' : ''}>${n} cuotas · aprox. ${cop(cuota(base + tt.ship, n))}/mes</option>`).join('')}</select></span></span>` : ''}</label>`; }).join('')}
    </fieldset>
    ${tt.fin_ ? `<p class="diff">${ic('info', 16)}<span>Con financiación el total es ${cop(tt.total)}: ${cop(tt.diff)} más que de contado con Wompi (${cop(tt.sub + tt.ship)}). Valor aproximado, sujeto a aprobación de la financiera.</span></p>` : ''}
    ${fieldHTML('terms', '', `<label class="check" style="font-weight:500"><input type="checkbox" id="co-terms" name="terms" data-ch="co"${d.terms ? ' checked' : ''} aria-describedby="err-terms">Acepto los <a href="#/legal/terminos">términos y condiciones</a>, la <a href="#/legal/envios">política de envíos</a> y el <a href="#/legal/devoluciones">derecho de retracto</a>.</label>`).replace('<label for="co-terms"> <span class="req" aria-hidden="true">*</span></label>', '')}
    ${fieldHTML('data', '', `<label class="check" style="font-weight:500"><input type="checkbox" id="co-data" name="data" data-ch="co"${d.data ? ' checked' : ''} aria-describedby="err-data">Autorizo el tratamiento de mis datos personales según la <a href="#/legal/privacidad">política de privacidad</a> (Ley 1581 de 2012).</label>`).replace('<label for="co-data"> <span class="req" aria-hidden="true">*</span></label>', '')}
  </div>`;
}
function summaryHTML() {
  const t = coTotals(), d = coState().d;
  return `${t.lines.map(l => `<div class="sum-line">${artOf(l.p)}<span><strong>${l.p.name}</strong><small>${l.v ? l.v + ' · ' : ''}Cantidad: ${l.qty}</small></span><span class="num">${cop((t.fin_ ? l.fin : l.precio) * l.qty)}</span></div>`).join('')}
    <div class="totals" style="margin-top:10px"><div><span>Subtotal ${t.fin_ ? 'con financiación' : 'de contado'}</span><span class="num">${cop(t.base)}</span></div>
    <div><span>Envío${d.ship === 'exp' ? ' express' : ''}</span>${t.ship ? `<span class="num">${cop(t.ship)}</span>` : '<span class="free">Gratis</span>'}</div>
    <div class="grand"><span>Total</span><span class="num" id="co-total">${cop(t.total)}</span></div>
    ${t.fin_ ? `<div class="muted"><span>${d.n} cuotas aprox.</span><span class="num">${cop(cuota(t.total, d.n))}/mes</span></div>` : ''}
    <div class="muted"><span>IVA incluido</span><span></span></div></div>`;
}
function coBodyHTML() {
  const c = coState(), t = coTotals();
  const names = ['Datos', 'Envío', 'Pago'];
  return `<div>
      <h1 tabindex="-1">Finaliza tu compra</h1>
      <ol class="stepper" aria-label="Pasos del pago" style="margin:14px 0 18px">${names.map((n, i) => `<li class="${i + 1 < c.step ? 'done' : ''}"${i + 1 === c.step ? ' aria-current="step"' : ''}><span>${n}</span></li>`).join('')}</ol>
      <details class="summary-m" style="margin-bottom:14px"><summary><span>Ver resumen · <span class="num">${cop(t.total)}</span></span>${chev(18)}</summary><div class="panel">${summaryHTML()}</div></details>
      <div id="co-errors" tabindex="-1"></div>
      <form id="co-form" novalidate>${coStepHTML()}
        <div class="co-nav" style="margin-top:16px">${c.step > 1 ? `<button type="button" class="btn btn-ghost" data-act="co-back">${ic('left', 18)}Volver</button>` : '<a class="btn btn-ghost" href="#/carrito">' + ic('left', 18) + 'Volver al carrito</a>'}
        <button type="submit" class="btn btn-primary btn-lg" id="co-next">${c.step < 3 ? 'Continuar' : `Pagar ${cop(t.total)}`}</button></div>
      </form>
    </div>
    <aside class="co-side"><div class="panel sticky-side" aria-labelledby="h-cosum"><h2 id="h-cosum">Resumen del pedido</h2><div id="co-sum">${summaryHTML()}</div></div></aside>`;
}
function viewCheckout() {
  const t = cartTotals();
  coState();
  return {
    title: 'Pago', mode: 'checkout',
    html: `<div class="wrap">${t.count ? `<div class="co" id="co">${coBodyHTML()}</div>`
      : `<div style="padding-block:48px"><h1 class="sr-only" tabindex="-1">Pago</h1>${stateHTML({ icon:'cart', title:'No hay productos para pagar', text:'Agrega productos al carrito y vuelve aquí para finalizar tu compra.', actions:'<a class="btn btn-primary" href="#/">Ir a la tienda</a>' })}</div>`}</div>`,
    after: () => {}
  };
}

/* ---------- Confirmación ---------- */
function viewConfirm() {
  const o = S.order || { no:'GT-10482', example:true, lines:[{ p:byId[1], v:null, qty:1, precio:byId[1].precio }], total:byId[1].precio, pay:'Wompi', city:'Bogotá', eta:etaRange('Bogotá').text, email:'tucorreo@ejemplo.com' };
  return {
    title: 'Pedido confirmado',
    html: `<div class="wrap">
      <header class="confirm-h"><span class="ok">${ic('check', 30, 2.4)}</span><h1 tabindex="-1">¡Gracias! Recibimos tu pedido</h1>
        <p>Pedido <span class="order-no">${o.no}</span> · te enviamos el resumen a <b>${esc(o.email)}</b>.</p>
        ${o.example ? noteHTML('<b>Nota del prototipo:</b> este es un pedido de ejemplo. Completa el checkout para ver el tuyo.') : ''}</header>
      <div class="two-col">
        <div class="panel"><h2>Próximos pasos</h2>
          <ol class="timeline">
            <li class="done"><span class="dot">${ic('check', 16, 2.4)}</span><span><strong>Pago confirmado</strong><small>${o.pay}${o.financed ? ' aprobó tu crédito' : ''} · hoy</small></span></li>
            <li class="now"><span class="dot">${ic('box', 16)}</span><span><strong>Preparando tu pedido</strong><small>Revisamos y empacamos los productos</small></span></li>
            <li><span class="dot">${ic('truck', 16)}</span><span><strong>Enviado</strong><small>Te escribimos por WhatsApp con la guía</small></span></li>
            <li><span class="dot">${ic('home', 16)}</span><span><strong>Entregado</strong><small>Llega ${o.eta} a ${esc(o.city)}</small></span></li>
          </ol>
          <div class="pills" style="margin-top:8px"><a class="btn btn-primary" href="#/rastreo?pedido=${o.no}">Rastrear pedido</a><a class="btn btn-ghost wa-btn" href="${waLink('Hola, tengo una pregunta sobre mi pedido ' + o.no)}" target="_blank" rel="noopener">${ic('chat', 18)}Escribir por WhatsApp</a></div>
        </div>
        <aside class="panel" aria-labelledby="h-os"><h2 id="h-os">Resumen</h2>
          ${o.lines.map(l => `<div class="sum-line">${artOf(l.p)}<span><strong>${l.p.name}</strong><small>${l.v ? l.v + ' · ' : ''}Cantidad: ${l.qty}</small></span><span class="num">${cop(l.precio * l.qty)}</span></div>`).join('')}
          <div class="totals" style="margin-top:10px"><div class="grand"><span>Total pagado</span><span class="num">${cop(o.total)}</span></div><div class="muted"><span>Medio de pago</span><span>${o.pay}</span></div></div>
        </aside>
      </div>
    </div>`,
    after: () => {}
  };
}
