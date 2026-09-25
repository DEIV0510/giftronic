/* =====================================================================
   Portada y Ofertas
   ===================================================================== */
function endOfMonth() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59); }
function countdownText() {
  const ms = Math.max(0, endOfMonth() - new Date());
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
  return `${d} d ${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min`;
}
const countdownHTML = () => `<span class="countdown">${ic('clock', 16)}Terminan en <b data-countdown>${countdownText()}</b></span>`;
const dealList = () => products.filter(p => !isOut(p) && p.antes > p.precio).sort((a, b) => offPct(b.antes, b.precio) - offPct(a.antes, a.precio));

function viewHome() {
  const star = byId[1], fp = finPrice(star.precio);
  const tiles = [['portatiles','Portátiles','laptop',{h:205}],['combos-tv','Combos TV + barra','combo',{h:245}],['televisores','Televisores','tv',{h:230}],['all-in-one','All in One','aio',{h:172}],['tablets','Tablets','tablet',{h:28,folio:true}],['impresion','Impresoras','printer',{}],['monitores','Monitores','monitor',{h:285}],['gaming','Gaming','gamepad',{h:12}]];
  const count = slug => products.filter(CATS[slug].m).length;
  const brands = [...new Set(products.map(p => p.brand))];
  return {
    title: 'Tecnología original a cuotas',
    html: `
    <div class="wrap hero">
      <div class="hero-card">
        <div class="hero-copy">
          <span class="eyebrow">${ic('badge', 15)}Estamos a tu servicio</span>
          <h1 tabindex="-1">Tecnología original con garantía, <em>a cuotas</em> y con envío a toda Colombia</h1>
          <p class="hero-sub">Portátiles, televisores, impresoras y más de 300 productos de Samsung, Lenovo, HP, Acer y otras marcas. Paga de contado o hasta en 36 cuotas.</p>
          <div class="hero-cta">
            <a class="btn btn-primary btn-lg" href="#/ofertas">Ver ofertas${ic('arrow', 18)}</a>
            <a class="btn btn-secondary btn-lg" href="#/cuotas">Compra a cuotas</a>
          </div>
          <ul class="ticks"><li>${ic('check', 16)}Garantía de marca</li><li>${ic('check', 16)}Factura electrónica</li><li>${ic('check', 16)}Envío a todo el país</li></ul>
        </div>
        <div class="hero-stage">
          ${ART('combo', { h:235 }, 'Combo televisor Samsung de 40 pulgadas QLED con barra de sonido')}
          <a class="hero-tag" href="${pHref(star)}">
            <span class="k">Combo estrella</span>
            <span class="n">Samsung TV 40" QLED + barra de sonido HW-B400F</span>
            <span class="price">${cop(star.precio)}</span>
            <span class="f">o 12 cuotas de <b>${cop(cuota(fp, 12))}</b> con Addi</span>
            <span class="o"><span class="badge badge-off">-${offPct(star.antes, star.precio)}&nbsp;%</span></span>
          </a>
        </div>
      </div>
      <ul class="trust-list">
        <li><span class="trust-ic">${ic('badge')}</span><div><strong>Productos 100 % originales</strong><span>Nuevos y con factura</span></div></li>
        <li><span class="trust-ic">${ic('shield')}</span><div><strong>Garantía directa con la marca</strong><span>1 año en la mayoría de productos</span></div></li>
        <li><span class="trust-ic">${ic('truck')}</span><div><strong>Envío a todo el país</strong><span>Gratis desde ${cop(FREE_SHIP)}</span></div></li>
        <li><span class="trust-ic">${ic('lock')}</span><div><strong>Pago seguro con Wompi</strong><span>Tarjeta, PSE, Nequi y Bancolombia</span></div></li>
      </ul>
    </div>

    <section class="wrap sec" aria-labelledby="h-cats">
      ${sectionHead('h-cats', 'Compra por categoría', 'Encuentra rápido lo que buscas.', '<a class="link" href="#/categoria/todo">Ver todo el catálogo' + ic('right', 16) + '</a>')}
      <ul class="tiles">${tiles.map(([s, t, k, o]) => `<li class="tile"><a href="#/categoria/${s}">${ART(k, o)}<span>${t}<small>${count(s)} productos</small></span></a></li>`).join('')}</ul>
    </section>

    <section class="wrap sec" aria-labelledby="h-deals">
      ${sectionHead('h-deals', 'Ofertas destacadas', `Ofertas de ${MONTHS[new Date().getMonth()]}. ${countdownHTML()}`, '<a class="link" href="#/ofertas">Ver todas' + ic('right', 16) + '</a>')}
      ${railHTML(dealList().slice(0, 8).map(p => p.id), 'Ofertas destacadas')}
    </section>

    <section class="wrap sec" aria-labelledby="h-combos">
      ${sectionHead('h-combos', 'Combos TV + sonido', 'Imagen y sonido listos para instalar. ¿Ya tienes TV? Suma solo la barra.', '<a class="link" href="#/categoria/combos-tv">Ver todo' + ic('right', 16) + '</a>')}
      ${railHTML([1, 2, 3, 4, 5, 6, 7], 'Combos TV + sonido')}
    </section>

    <section class="wrap sec" aria-labelledby="h-study">
      ${sectionHead('h-study', 'Portátiles para estudiar y trabajar', 'Con disco SSD para clases, oficina y teletrabajo. También en All in One.', '<a class="link" href="#/categoria/portatiles">Ver todo' + ic('right', 16) + '</a>')}
      ${railHTML([8, 9, 10, 11, 12, 15, 16], 'Portátiles para estudiar y trabajar')}
    </section>

    <section class="wrap sec" aria-labelledby="h-gamer">
      ${sectionHead('h-gamer', 'Zona Gamer', 'RTX 3050 para jugar, más monitor, mouse y micrófono para completar el setup.', '<a class="link" href="#/categoria/gaming">Ver todo' + ic('right', 16) + '</a>')}
      ${railHTML([13, 14, 22, 24, 25], 'Zona Gamer')}
    </section>

    <section class="wrap sec">
      <div class="split">
        <div role="region" aria-labelledby="h-print">
          ${sectionHead('h-print', 'Imprime y ahorra con tinta continua', 'Menor costo por página para casa y oficina.', '<a class="link" href="#/categoria/tinta-continua">Ver todo' + ic('right', 16) + '</a>')}
          <div class="duo">${cardsHTML([byId[19], byId[21]])}</div>
        </div>
        <div role="region" aria-labelledby="h-tabs">
          ${sectionHead('h-tabs', 'Tablets', 'Para estudiar, tomar notas y ver contenido.', '<a class="link" href="#/categoria/tablets">Ver todo' + ic('right', 16) + '</a>')}
          <div class="duo">${cardsHTML([byId[18], byId[17]])}</div>
        </div>
      </div>
    </section>

    <section class="wrap" aria-labelledby="h-fin">
      <div class="finband dark">
        <div>
          <h2 id="h-fin">Llévalo hoy, <em>págalo a cuotas</em></h2>
          <p>Financia tu compra con Addi, Sumas Pay o Sistecrédito. Haces la solicitud en línea al pagar y ves el valor de cada cuota antes de confirmar.</p>
          <a class="btn btn-primary btn-lg" href="#/cuotas">Cómo comprar a cuotas${ic('arrow', 18)}</a>
        </div>
        <ul class="fin-list">${FIN.filter(f => f.financed).map(f => `<li>${f.name} <span>hasta ${f.max} cuotas</span></li>`).join('')}</ul>
      </div>
    </section>

    <section class="wrap sec" aria-labelledby="h-brands">
      ${sectionHead('h-brands', 'Marcas', 'Compra directo por marca.')}
      <ul class="brands">${brands.map(b => `<li><a href="#/buscar?q=${encodeURIComponent(b)}">${b}</a></li>`).join('')}</ul>
    </section>

    <section class="wrap sec" aria-labelledby="h-rev">
      ${sectionHead('h-rev', 'Lo que dicen nuestros clientes')}
      <ul class="reviews-home">
        ${[['Llegó en dos días a Medellín, bien empacado y con factura. El asesor por WhatsApp me ayudó a elegir el portátil.', 'Portátil Aspire Go 15'], ['Pagué a cuotas con Addi en pocos minutos. El combo se ve y se escucha muy bien.', 'Combo TV 40" QLED'], ['Buena atención y precio claro desde el principio. La impresora gasta muy poca tinta.', 'Multifuncional DCP-T430W']]
          .map(([t, prod]) => `<li class="quote">${starsHTML(5)}<p>«${t}»</p><footer><span>Sobre: ${prod}</span><span class="badge badge-ex">Ejemplo</span></footer></li>`).join('')}
      </ul>
    </section>

    <section class="wrap" aria-labelledby="h-nl">
      <div class="newsletter">
        <div><h2 id="h-nl">Recibe las ofertas antes que nadie</h2><p>Un correo a la semana con descuentos reales y lanzamientos. Te das de baja cuando quieras.</p></div>
        ${newsletterForm('nl-home')}
      </div>
    </section>`,
    after: root => settle(root)
  };
}

/* Formulario de newsletter reutilizable (portada y footer) */
function newsletterForm(id) {
  return `<form class="nl-form" data-form="newsletter" novalidate>
    <div class="field"><label class="sr-only" for="${id}-mail">Correo electrónico</label>
      <div class="nl-row"><input class="input" id="${id}-mail" name="email" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" aria-describedby="${id}-msg"><button class="btn btn-primary" type="submit">Suscribirme</button></div>
    </div>
    <label class="check"><input type="checkbox" name="auth">Autorizo el tratamiento de mis datos según la <a href="#/legal/privacidad">política de privacidad</a> (Ley 1581 de 2012).</label>
    <div id="${id}-msg" aria-live="polite"></div>
  </form>`;
}

function viewOfertas(q) {
  const tab = q.get('ver') || 'todos';
  const groups = { todos:() => true, combos:p => p.cat === 'combos-tv', computo:p => ['portatiles','portatiles-gamer','all-in-one'].includes(p.cat), tv:p => ['televisores','audio','proyectores'].includes(p.cat), impresion:p => p.cat === 'impresion', gamer:p => (p.tags || []).includes('Gamer') };
  const labels = { todos:'Todas', combos:'Combos', computo:'Computadores', tv:'TV y audio', impresion:'Impresión', gamer:'Gamer' };
  const list = dealList().filter(groups[tab] || groups.todos);
  return {
    title: 'Ofertas y combos',
    html: `<div class="wrap">
      ${crumbsHTML([['Inicio', '#/'], ['Ofertas', '']])}
      <header class="page-h">
        <h1 tabindex="-1">Ofertas y combos</h1>
        <p>Descuentos de ${MONTHS[new Date().getMonth()]} sobre el precio de referencia de cada producto, con envío a toda Colombia y pago a cuotas.</p>
        <div>${countdownHTML()}</div>
        ${noteHTML('<b>Nota del prototipo:</b> publica aquí solo productos con precio de referencia real y verificable (ver el plan de implementación). Los agotados no aparecen.')}
      </header>
      <div class="pills" role="group" aria-label="Filtrar ofertas">${Object.keys(labels).map(k => `<a class="pill" href="#/ofertas?ver=${k}"${k === tab ? ' aria-current="page"' : ''}>${labels[k]}</a>`).join('')}</div>
      <p class="toolbar" style="margin-top:16px"><span class="count"><b>${list.length}</b> ${list.length === 1 ? 'oferta' : 'ofertas'}</span></p>
      <div class="grid no-side">${list.length ? cardsHTML(list) : stateHTML({ icon:'tag', title:'No hay ofertas en este grupo', text:'Mira las demás ofertas o el catálogo completo.', actions:'<a class="btn btn-dark" href="#/ofertas">Ver todas</a>' })}</div>
    </div>`,
    after: root => settle(root)
  };
}
