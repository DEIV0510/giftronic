/* =====================================================================
   Cuenta, rastreo, cuotas, nosotros, legales, contacto y 404
   ===================================================================== */
function viewAccount(q) {
  const tab = q.get('tab') || 'pedidos';
  const d = (S.co && S.co.d) || {};
  const orders = [...(S.order ? [{ no:S.order.no, date:'Hoy', status:['go', 'Preparando'], items:S.order.lines.map(l => l.p), total:S.order.total }] : []),
    { no:'GT-10311', date:'12 de agosto', status:['ok', 'Entregado'], items:[byId[8], byId[24]], total:byId[8].precio + byId[24].precio, ex:true },
    { no:'GT-10127', date:'3 de julio', status:['ok', 'Entregado'], items:[byId[19]], total:byId[19].precio, ex:true }];
  const tabs = [['pedidos', 'Mis pedidos', 'box'], ['direcciones', 'Direcciones', 'pin'], ['datos', 'Mis datos', 'user']];
  let body = '';
  if (tab === 'pedidos') body = `<ul class="orders">${orders.map(o => `<li class="order"><div class="order-top"><span><b class="order-no">${o.no}</b> · ${o.date}</span><span class="status ${o.status[0]}">${o.status[1]}</span></div>
      <div class="order-items">${o.items.map(p => artOf(p, p.name)).join('')}</div>
      <div class="order-top"><span>Total <b class="num">${cop(o.total)}</b>${o.ex ? ' <span class="badge badge-ex">Ejemplo</span>' : ''}</span><span class="pills"><a class="btn btn-sm btn-ghost" href="#/rastreo?pedido=${o.no}">Rastrear</a>${o.status[0] === 'ok' ? `<a class="btn btn-sm btn-ghost" href="${pHref(o.items[0])}">Volver a comprar</a>` : ''}</span></div></li>`).join('')}</ul>`;
  if (tab === 'direcciones') body = `<div class="addr-cards"><div class="addr-card"><b>Casa</b><span>${d.via ? esc(`${d.via} ${d.n1} # ${d.n2} - ${d.n3}`) : 'Carrera 15 # 93 - 47'}</span><span>${esc(d.barrio || 'Chicó Norte')} · ${esc(d.city || 'Bogotá')}</span><span class="badge badge-ex" style="justify-self:start">${d.via ? 'Del checkout' : 'Ejemplo'}</span><div class="pills" style="margin-top:6px"><button type="button" class="btn btn-sm btn-ghost" data-act="toast" data-msg="Aquí se edita la dirección.">Editar</button></div></div>
      <button type="button" class="addr-card add" data-act="toast" data-msg="Aquí se abre el formulario de nueva dirección.">${ic('plus', 22)}Agregar dirección</button></div>`;
  if (tab === 'datos') body = `<form class="panel" data-form="profile" novalidate style="max-width:640px"><div class="form-grid two">
      <div class="field"><label for="pf-name">Nombre y apellido</label><input class="input" id="pf-name" name="name" autocomplete="name" value="${esc(d.name || '')}"></div>
      <div class="field"><label for="pf-mail">Correo</label><input class="input" id="pf-mail" name="email" type="email" autocomplete="email" value="${esc(d.email || '')}" aria-describedby="pf-mail-err"><span class="err" id="pf-mail-err" hidden></span></div>
      <div class="field"><label for="pf-doc">Documento</label><input class="input" id="pf-doc" name="doc" inputmode="numeric" value="${esc(d.doc || '')}"></div>
      <div class="field"><label for="pf-tel">Celular</label><input class="input" id="pf-tel" name="phone" type="tel" autocomplete="tel-national" value="${esc(d.phone || '')}"></div>
      <label class="check span-2"><input type="checkbox" name="news" checked>Quiero recibir ofertas por correo y WhatsApp.</label>
    </div><div class="pills" style="margin-top:16px"><button class="btn btn-primary" type="submit">Guardar cambios</button><span id="pf-msg" aria-live="polite"></span></div></form>`;
  return {
    title: 'Mi cuenta',
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Mi cuenta', '']])}
      <header class="page-h"><h1 tabindex="-1">Hola${d.name ? ', ' + esc(d.name.split(' ')[0]) : ''}</h1><p>Revisa tus pedidos, direcciones y datos de facturación.</p></header>
      <nav class="acct-tabs" aria-label="Secciones de la cuenta">${tabs.map(([k, l, i]) => `<a href="#/cuenta?tab=${k}"${k === tab ? ' aria-current="page"' : ''}>${ic(i, 18)}${l}</a>`).join('')}</nav>
      <div>${body}</div>
      <div class="logout"><button type="button" class="btn btn-link" style="color:var(--color-danger)" data-act="toast" data-msg="Cerraste sesión (demo).">Cerrar sesión</button></div>
    </div>`
  };
}

function trackResultHTML(no) {
  const e = etaRange('Bogotá');
  return `<div class="panel" style="margin-top:16px"><div class="order-top"><h2 style="margin:0">Pedido <span class="order-no">${esc(no)}</span></h2><span class="status go">En camino</span></div>
    <p class="hint" style="margin:6px 0 16px">Transportadora: por confirmar · Llega ${e.text}.</p>
    <ol class="timeline">
      <li class="done"><span class="dot">${ic('check', 16, 2.4)}</span><span><strong>Pago confirmado</strong><small>Hace 2 días</small></span></li>
      <li class="done"><span class="dot">${ic('check', 16, 2.4)}</span><span><strong>Pedido preparado</strong><small>Ayer</small></span></li>
      <li class="now"><span class="dot">${ic('truck', 16)}</span><span><strong>Enviado</strong><small>En tránsito hacia tu ciudad</small></span></li>
      <li><span class="dot">${ic('home', 16)}</span><span><strong>Entregado</strong><small>Llega ${e.text}</small></span></li>
    </ol>${noteHTML('<b>Nota del prototipo:</b> estado de ejemplo. En la tienda se conecta con la guía de la transportadora.')}</div>`;
}
function viewTrack(q) {
  const no = q.get('pedido') || '';
  return {
    title: 'Rastrear pedido',
    html: `<div class="wrap" style="max-width:760px">
      ${crumbsHTML([['Inicio', '#/'], ['Rastrear pedido', '']])}
      <header class="page-h"><h1 tabindex="-1">Rastrea tu pedido</h1><p>Escribe el número de pedido que te llegó por correo y el correo con el que compraste.</p></header>
      <form class="panel" data-form="track" novalidate><div class="form-grid two">
        <div class="field"><label for="tr-no">Número de pedido <span class="req" aria-hidden="true">*</span></label><input class="input" id="tr-no" name="no" value="${esc(no)}" placeholder="GT-10482" autocomplete="off" aria-describedby="tr-no-err"><span class="err" id="tr-no-err" hidden></span></div>
        <div class="field"><label for="tr-mail">Correo <span class="req" aria-hidden="true">*</span></label><input class="input" id="tr-mail" name="email" type="email" autocomplete="email" value="${esc((S.co && S.co.d.email) || '')}" aria-describedby="tr-mail-err"><span class="err" id="tr-mail-err" hidden></span></div>
      </div><button class="btn btn-primary btn-lg" type="submit" style="margin-top:16px">Rastrear</button></form>
      <div id="track-out" aria-live="polite">${no && S.order && S.order.no === no ? trackResultHTML(no) : ''}</div>
    </div>`
  };
}

function viewCuotas() {
  const ex = byId[8], fp = finPrice(ex.precio);
  return {
    title: 'Compra a cuotas',
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Compra a cuotas', '']])}
      <header class="page-h"><h1 tabindex="-1">Llévalo hoy y págalo a cuotas</h1><p>Financia tu compra con Addi, Sumas Pay o Sistecrédito, o paga con tu tarjeta de crédito. La solicitud se hace en línea al momento de pagar.</p></header>
      <section aria-labelledby="h-how"><h2 id="h-how" class="sr-only">Cómo funciona</h2>
        <ol class="steps3"><li><strong>Elige tu producto</strong><p>En cada ficha ves el precio de contado, el precio con financiación y el valor aproximado de la cuota.</p></li>
          <li><strong>Escoge la financiera al pagar</strong><p>Completa la solicitud en línea con tu cédula. La financiera te responde en minutos.</p></li>
          <li><strong>Recibe y paga mes a mes</strong><p>Despachamos cuando la financiera aprueba. Pagas las cuotas directamente a ella.</p></li></ol>
      </section>
      <section class="sec" aria-labelledby="h-cmp">${sectionHead('h-cmp', 'Compara las opciones')}
        <div class="fin-table-wrap"><table class="fin-table"><thead><tr><th scope="col">Financiera</th><th scope="col">Cuotas máximas</th><th scope="col">Cuota inicial</th><th scope="col">Requisitos</th><th scope="col">Aprobación</th></tr></thead>
          <tbody>${FIN.map(f => `<tr><th scope="row">${f.name}</th><td>Hasta ${f.max}</td><td>${f.init}</td><td>${f.req}</td><td>${f.time}</td></tr>`).join('')}</tbody></table></div>
        <div style="margin-top:12px">${noteHTML('<b>Por confirmar:</b> requisitos, cuota inicial y cuotas máximas de cada financiera antes de publicar.')}</div>
      </section>
      <section class="sec" aria-labelledby="h-ex">${sectionHead('h-ex', '¿Por qué cambia el precio?')}
        <div class="panel" style="display:grid;gap:10px;max-width:760px"><p>El <b>precio de contado</b> aplica cuando pagas con Wompi (tarjeta, PSE, Nequi o Bancolombia) o transferencia. Al financiar, la financiera cobra una comisión a la tienda, por eso el <b>precio con financiación</b> es un poco mayor. Siempre ves los dos antes de pagar.</p>
          <p>Ejemplo con el ${ex.name}: de contado <b class="num">${cop(ex.precio)}</b>, con financiación <b class="num">${cop(fp)}</b>, o 12 cuotas de aprox. <b class="num">${cop(cuota(fp, 12))}</b>.</p></div>
      </section>
      <section class="sec" aria-labelledby="h-fq">${sectionHead('h-fq', 'Preguntas frecuentes')}
        <div class="faq">${[['¿Necesito tarjeta de crédito?', 'No. Addi, Sumas Pay y Sistecrédito aprueban con tu cédula y tu información de contacto; no necesitas tarjeta.'], ['¿Cuándo despachan si pago a cuotas?', 'Apenas la financiera aprueba el crédito, igual que un pago de contado.'], ['¿Puedo pagar antes de tiempo?', 'Depende de cada financiera. Consulta sus condiciones al hacer la solicitud.'], ['¿Qué pasa si no me aprueban?', 'Puedes intentar con otra financiera o pagar de contado con Wompi. Tu pedido queda guardado.']].map(([q, a]) => `<details><summary>${q}${chev(18)}</summary><div>${a}</div></details>`).join('')}</div>
      </section>
    </div>`
  };
}

function viewAbout() {
  return {
    title: 'Quiénes somos',
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Quiénes somos', '']])}
      <header class="page-h"><h1 tabindex="-1">Estamos a tu servicio</h1><p>Giftronic04 es una tienda colombiana de tecnología original: portátiles, televisores, impresoras, gaming y más, con garantía de marca y asesoría por WhatsApp.</p>
        ${noteHTML('<b>Por completar:</b> historia de la tienda (año de fundación, fundadores, ciudad) con datos reales.')}</header>
      <section aria-labelledby="h-val">${sectionHead('h-val', 'Lo que nos importa')}
        <ul class="values">${[['badge', 'Solo productos originales', 'Nuevos, sellados y con factura electrónica.'], ['shield', 'Garantía que se cumple', 'Te acompañamos con la marca si algo falla.'], ['chat', 'Asesoría honesta', 'Te recomendamos lo que necesitas, no lo más caro.'], ['truck', 'Envíos a todo el país', 'Con guía y seguimiento hasta tu puerta.']].map(([i, t, d]) => `<li><span class="ic">${ic(i)}</span><strong>${t}</strong><p>${d}</p></li>`).join('')}</ul>
      </section>
      <section class="sec two-col" aria-labelledby="h-loc">
        <div class="panel"><h2 id="h-loc">Ubicación y horarios</h2><dl class="dl"><dt>Tienda física</dt><dd>Dirección por confirmar</dd><dt>Horario</dt><dd>Por confirmar</dd><dt>WhatsApp</dt><dd>+57 301 791 3140</dd><dt>Correo</dt><dd>info@giftronic04.com</dd></dl></div>
        <div class="panel"><h2>Datos legales</h2><dl class="dl"><dt>Razón social</dt><dd>[Por confirmar]</dd><dt>NIT</dt><dd>[Por confirmar]</dd><dt>Sitio</dt><dd>giftronic04.com</dd></dl></div>
      </section>
    </div>`
  };
}

const LEGAL = {
  envios:['Envíos y entregas', [
    ['cobertura', 'Cobertura', ['Enviamos a toda Colombia con transportadoras aliadas. Te enviamos el número de guía por correo y WhatsApp.']],
    ['tiempos', 'Tiempos de entrega', ['Bogotá, Medellín, Cali y Barranquilla: 1 a 2 días hábiles. Otras ciudades y municipios: 2 a 5 días hábiles. Los tiempos cuentan desde la confirmación del pago.']],
    ['costos', 'Costos', [`El envío estándar es gratis en compras desde ${cop(FREE_SHIP)}. Por debajo de ese valor cuesta ${cop(SHIP_STD)}. El envío express en ciudades principales cuesta ${cop(SHIP_EXP)}.`]],
    ['recepcion', 'Al recibir', ['Revisa el empaque delante del transportador. Si ves golpes o el sello abierto, déjalo por escrito en la guía y escríbenos ese mismo día.']]]],
  garantia:['Garantía', [
    ['legal', 'Garantía legal', ['Todos los productos tienen la garantía legal de la Ley 1480 de 2011. El término es el que indica el fabricante; en la mayoría de productos es de 1 año directo con la marca. Si no se indica, es de 1 año para productos nuevos.']],
    ['como', 'Cómo hacerla efectiva', ['Escríbenos por WhatsApp o correo con tu número de pedido y una descripción de la falla. Te indicamos el centro de servicio autorizado o recogemos el producto.', 'Conserva la factura y, si puedes, los empaques originales: facilitan el envío al centro de servicio.']],
    ['exclusiones', 'Qué no cubre', ['Daños por mal uso, golpes, humedad, variaciones de voltaje o reparaciones hechas por terceros no autorizados.']]]],
  devoluciones:['Devoluciones y retracto', [
    ['retracto', 'Derecho de retracto (5 días hábiles)', ['Por ser una compra a distancia, puedes retractarte dentro de los 5 días hábiles siguientes a la entrega (Ley 1480 de 2011, art. 47). El producto debe devolverse en las mismas condiciones en que lo recibiste. Los costos de transporte de la devolución corren por tu cuenta.', 'Te devolvemos el dinero en un plazo máximo de 30 días calendario desde que ejerces el derecho.']],
    ['reversion', 'Reversión del pago', ['Si pagaste con tarjeta u otro medio electrónico y hubo fraude, una operación no solicitada, el producto no llegó o no corresponde a lo pedido, puedes pedir la reversión del pago dentro de los 5 días hábiles siguientes (Ley 1480, art. 51).']],
    ['cambios', 'Cambios', ['Si el producto llega con defecto de fábrica, lo gestionamos como garantía. Para otros cambios escríbenos por WhatsApp.']]]],
  terminos:['Términos y condiciones', [
    ['precios', 'Precios', ['Todos los precios están en pesos colombianos e incluyen IVA. El precio de contado aplica a pagos con Wompi (tarjeta, PSE, Nequi o Bancolombia) y transferencia; el precio con financiación aplica a Addi, Sumas Pay y Sistecrédito. Ambos se muestran antes de pagar.']],
    ['promociones', 'Promociones', ['Las promociones indican su vigencia y el precio de referencia es un precio real al que se vendió el producto.']],
    ['disponibilidad', 'Disponibilidad', ['Si un producto se agota después de tu compra, te avisamos y te devolvemos el dinero o te ofrecemos una alternativa.']],
    ['factura', 'Facturación electrónica', ['Toda compra genera factura electrónica a nombre de la persona o empresa que indiques en el checkout.']]]],
  privacidad:['Política de privacidad', [
    ['responsable', 'Responsable', ['[Razón social por confirmar], NIT [por confirmar], correo info@giftronic04.com.']],
    ['finalidades', 'Para qué usamos tus datos', ['Procesar y enviar tus pedidos, emitir la factura electrónica, atender garantías y, si lo autorizas, enviarte ofertas.']],
    ['derechos', 'Tus derechos', ['Puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar la autorización, escribiendo a info@giftronic04.com (Ley 1581 de 2012 y Decreto 1377 de 2013).']]]]
};
function viewLegal(page) {
  const L = LEGAL[page];
  if (!L) return viewNotFound();
  return {
    title: L[0],
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Políticas', '#/legal/envios'], [L[0], '']])}
      <div class="legal" style="margin-top:12px">
        <nav class="legal-nav" aria-label="Políticas"><ul>${Object.entries(LEGAL).map(([k, v]) => `<li><a href="#/legal/${k}"${k === page ? ' aria-current="page"' : ''}>${v[0]}</a></li>`).join('')}</ul>
          <ul class="toc" aria-label="En esta página">${L[1].map(([id, t]) => `<li><a href="#/legal/${page}" data-act="scrollto" data-target="lg-${id}">${t}</a></li>`).join('')}</ul></nav>
        <article class="prose"><h1 tabindex="-1">${L[0]}</h1><p class="upd">Borrador de referencia · revísalo con un asesor legal antes de publicarlo.</p>
          ${L[1].map(([id, t, ps]) => `<h2 id="lg-${id}">${t}</h2>${ps.map(x => `<p>${x}</p>`).join('')}`).join('')}</article>
      </div>
    </div>`
  };
}

function viewContact() {
  return {
    title: 'Contacto',
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Contacto', '']])}
      <header class="page-h"><h1 tabindex="-1">Hablemos</h1><p>Te respondemos por el canal que prefieras. Por WhatsApp es más rápido.</p></header>
      <div class="contact-grid">
        <div style="display:grid;gap:16px;align-content:start">
          <ul class="ccards">
            <li><a href="${waLink('Hola, quiero asesoría')}" target="_blank" rel="noopener"><span class="ic">${ic('chat', 22)}</span><span><strong>WhatsApp</strong><span>+57 301 791 3140</span></span></a></li>
            <li><a href="mailto:info@giftronic04.com"><span class="ic">${ic('mail', 22)}</span><span><strong>Correo</strong><span>info@giftronic04.com</span></span></a></li>
            <li><div><span class="ic">${ic('clock', 22)}</span><span><strong>Horario de atención</strong><span>Por confirmar</span></span></div></li>
          </ul>
          <div class="map" role="img" aria-label="Mapa de ubicación (pendiente)"><span class="pin">${ic('pin', 34)}Dirección por confirmar</span></div>
        </div>
        <form class="panel" data-form="contact" novalidate aria-labelledby="h-cf"><h2 id="h-cf">Escríbenos</h2>
          <div class="form-grid two" id="cf-fields">
            <div class="field"><label for="cf-name">Nombre <span class="req" aria-hidden="true">*</span></label><input class="input" id="cf-name" name="name" autocomplete="name" aria-describedby="cf-name-err"><span class="err" id="cf-name-err" hidden></span></div>
            <div class="field"><label for="cf-mail">Correo <span class="req" aria-hidden="true">*</span></label><input class="input" id="cf-mail" name="email" type="email" autocomplete="email" aria-describedby="cf-mail-err"><span class="err" id="cf-mail-err" hidden></span></div>
            <div class="field"><label for="cf-tel">Celular</label><input class="input" id="cf-tel" name="phone" type="tel" autocomplete="tel-national"></div>
            <div class="field"><label for="cf-sub">Asunto</label><select class="select" id="cf-sub" name="subject"><option>Asesoría de compra</option><option>Estado de mi pedido</option><option>Garantía</option><option>Otro</option></select></div>
            <div class="field span-2"><label for="cf-msg">Mensaje <span class="req" aria-hidden="true">*</span></label><textarea class="textarea" id="cf-msg" name="msg" aria-describedby="cf-msg-err"></textarea><span class="err" id="cf-msg-err" hidden></span></div>
            <label class="check span-2"><input type="checkbox" name="auth" aria-describedby="cf-auth-err">Autorizo el tratamiento de mis datos según la <a href="#/legal/privacidad">política de privacidad</a>.</label><span class="err span-2" id="cf-auth-err" hidden></span>
          </div>
          <button class="btn btn-primary btn-lg" type="submit" style="margin-top:16px">Enviar mensaje</button>
          <div id="cf-out" aria-live="polite"></div>
        </form>
      </div>
      <section aria-labelledby="h-gfaq">${sectionHead('h-gfaq', 'Preguntas frecuentes')}<div class="faq">${PDP_FAQ.map(([q, a]) => `<details><summary>${q}${chev(18)}</summary><div>${a}</div></details>`).join('')}</div></section>
    </div>`
  };
}

function viewNotFound() {
  return {
    title: 'Página no encontrada',
    html: `<div class="wrap nf">
      <p class="code" aria-hidden="true">4<b>0</b>4</p>
      <h1 tabindex="-1">No encontramos esta página</h1>
      <p>Puede que el enlace esté roto o que el producto ya no esté disponible. Busca lo que necesitas o mira las categorías más visitadas.</p>
      <form class="search" role="search" data-form="search404"><label class="sr-only" for="q404">Buscar productos</label>${ic('search', 20)}<input id="q404" type="search" name="q" placeholder="Busca portátiles, TVs, impresoras…"><button class="search-btn" type="submit">${ic('search', 18)}<span>Buscar</span></button></form>
      <div class="pills" style="justify-content:center">${['portatiles', 'combos-tv', 'televisores', 'impresion', 'tablets', 'gaming'].map(s => `<a class="pill" href="#/categoria/${s}">${CATS[s].name}</a>`).join('')}</div>
      <a class="btn btn-dark" href="#/">Ir al inicio</a>
    </div>`
  };
}
