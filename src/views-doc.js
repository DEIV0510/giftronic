/* =====================================================================
   Guía del sistema de diseño (#/design-system) y plan (#/plan)
   ===================================================================== */
function contrast(hex, bg = '#FFFFFF') {
  const L = h => { const c = h.replace('#', '').match(/../g).map(x => { const v = parseInt(x, 16) / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const a = L(hex), b = L(bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
function viewDesignSystem() {
  const colors = [['--color-ink','#0B0B0F','Header, footer, texto principal'],['--color-accent','#D24410','CTA, precios, badges'],['--color-accent-hover','#B3380B','Hover y activo'],['--color-brand','#FF6B00','Logo y decoración sobre negro'],['--color-surface','#FFFFFF','Tarjetas'],['--color-bg','#F6F7F9','Fondo general'],['--color-muted','#6B7280','Texto secundario sobre blanco'],['--color-border','#E5E7EB','Divisores'],['--color-success','#0E7A3E','Disponible, envío gratis'],['--color-warning','#8A4B00','Últimas unidades, ejemplos'],['--color-danger','#B42318','Errores'],['--color-star','#F2A20C','Estrellas']];
  const sample = byId[8], out = byId[14];
  const cardState = (p, cls, lbl) => `<div><p class="lbl">${lbl}</p>${card(p).replace('class="card', 'class="card ' + cls).replace(' is-loading', cls === 'is-skeleton' ? ' is-loading' : '')}</div>`;
  return {
    title: 'Sistema de diseño', mode: 'doc',
    html: `<div class="wrap docv">
      <header class="docv-h"><a class="link" href="#/" style="justify-self:start">${ic('left', 16)}Volver a la tienda</a><span class="eyebrow">${ic('grid', 15)}Guía del sistema de diseño</span><h1 tabindex="-1">Giftronic04 · Design system</h1>
        <p>Tokens en CSS custom properties sobre <code>:root</code> y los componentes con sus estados. Todo el prototipo usa estos valores.</p></header>

      <h2>Color</h2><p>El naranja del logo (#FF6B00) solo alcanza 2,9:1 sobre blanco, así que para texto y botones se usa una versión más profunda (#D24410, 4,6:1) que cumple AA. El naranja original queda para el logo y los detalles sobre fondos oscuros.</p>
      <ul class="swatches">${colors.map(([t, h, u]) => { const r = contrast(h); return `<li class="swatch"><i style="background:${h};${h === '#FFFFFF' ? 'border-bottom:1px solid var(--color-border)' : ''}"></i><div><strong>${u}</strong><code>${t} · ${h}</code><span class="ratio" style="color:${r >= 4.5 ? 'var(--color-success)' : r >= 3 ? 'var(--color-warning)' : 'var(--color-muted-strong)'}">${r.toFixed(1).replace('.', ',')}:1 sobre blanco${r >= 4.5 ? ' · AA' : r >= 3 ? ' · AA grande' : ''}</span></div></li>`; }).join('')}</ul>

      <h2>Tipografía</h2><p>Manrope de Google Fonts. Escala 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56. Precios en peso 800 con cifras tabulares.</p>
      ${[56, 40, 32, 24, 20, 18, 16, 14, 12].map(s => `<div class="type-row"><code>${s} px</code><span style="font-size:${s}px;font-weight:${s >= 20 ? 800 : s === 16 ? 500 : 600};letter-spacing:${s >= 32 ? '-.03em' : 0};line-height:1.2">${s >= 32 ? 'Tecnología original' : s >= 18 ? 'Portátil Aspire Go 15' : 'Llega en 24–48 h a ciudades principales'}</span></div>`).join('')}
      <div class="type-row"><code>Precio</code><span class="price" style="font-size:40px">${cop(1874900)}</span></div>

      <h2>Espaciado, esquinas y sombras</h2><p>Base de 4 px. Esquinas rectas (radio 0) en todos los componentes para una imagen más seria; solo los botones de opción y el punto de stock son circulares por convención. Tres niveles de sombra.</p>
      <div class="split" style="gap:24px"><div>${[4, 8, 12, 16, 24, 32, 48, 64, 96].map(s => `<div class="space-row"><i style="width:${s * 2}px"></i>${s} px</div>`).join('')}</div>
        <div class="ds-grid"><div class="ds-cell"><span style="display:block;width:84px;height:64px;background:#fff;border:1px solid var(--color-border-strong)"></span>Esquina recta · 0 px</div>
          ${[1, 2, 3].map(n => `<div class="ds-cell"><span style="display:block;width:84px;height:64px;background:#fff;box-shadow:var(--sh-${n})"></span>Sombra ${n}</div>`).join('')}</div></div>

      <h2>Botones</h2><p>Primario (una sola acción principal por vista), secundario, fantasma y oscuro. Todos miden al menos 44 px de alto.</p>
      ${[['btn-primary', 'Comprar ahora'], ['btn-secondary', 'Agregar al carrito'], ['btn-ghost', 'Asesoría'], ['btn-dark', 'Agregar']].map(([c, t]) => `<div class="ds-grid" style="margin-bottom:12px">${[['Normal', ''], ['Hover', ' is-hover'], ['Foco', ' is-focus'], ['Deshabilitado', '', 'disabled'], ['Cargando', ' is-loading']].map(([l, x, dis]) => `<div class="ds-cell">${l}<button type="button" class="btn ${c}${x}" ${dis ? 'disabled' : 'tabindex="-1"'}>${t}</button></div>`).join('')}</div>`).join('')}

      <h2>Badges</h2><p>Prioridad: descuento &gt; Combo &gt; Gamer &gt; Últimas unidades. Máximo dos por tarjeta. «Agotado» reemplaza al descuento.</p>
      <div class="ds-grid"><span class="badge badge-off">-53&nbsp;%</span><span class="badge badge-combo">Combo</span><span class="badge badge-gamer">Gamer</span><span class="badge badge-last">Últimas unidades</span><span class="badge badge-out">Agotado</span><span class="badge badge-ex">Ejemplo</span></div>
      <h3>Stock</h3><div class="ds-grid">${stockHTML(10)}${stockHTML(null)}${stockHTML(3)}${stockHTML(0)}</div>

      <h2>Formularios</h2><p>Etiqueta visible, ayuda persistente y error debajo del campo. Validación al salir del campo.</p>
      <div class="form-grid two" style="max-width:820px">
        <div class="field"><label for="ds1">Normal</label><input class="input" id="ds1" placeholder="nombre@correo.com"></div>
        <div class="field"><label for="ds2">Foco</label><input class="input is-focus" id="ds2" value="laura@correo" tabindex="-1"></div>
        <div class="field has-error"><label for="ds3">Error</label><input class="input" id="ds3" value="laura@correo" aria-invalid="true" aria-describedby="ds3e"><span class="err" id="ds3e">${ic('alert', 15)}<span>Escribe un correo válido, por ejemplo nombre@correo.com.</span></span></div>
        <div class="field is-valid"><label for="ds4">Correcto</label><input class="input" id="ds4" value="laura@correo.com"><span class="ok-msg">${ic('circlecheck', 15)}Correo válido</span></div>
        <div class="field"><label for="ds5">Deshabilitado</label><input class="input" id="ds5" value="No editable" disabled></div>
        <div class="field"><label for="ds6">Lista</label><select class="select" id="ds6"><option>Cédula de ciudadanía</option></select></div>
        <label class="check"><input type="checkbox" checked>Casilla marcada</label>
        <label class="check"><input class="radio" type="radio" checked name="dsr">Opción elegida</label>
      </div>
      <h3>Cantidad</h3><div class="qty" role="group" aria-label="Cantidad de ejemplo"><button type="button" disabled aria-label="Quitar uno">${ic('minus', 18)}</button><output>1</output><button type="button" aria-label="Agregar uno">${ic('plus', 18)}</button></div>

      <h2>Tarjeta de producto</h2><p>Estados: normal, hover (segunda imagen), agotado y cargando.</p>
      <div class="ds-cards">${cardState(sample, '', 'Normal')}${cardState(sample, 'is-hover', 'Hover')}${cardState(out, '', 'Agotado')}<div><p class="lbl">Cargando</p><article class="card is-skeleton" aria-busy="true" aria-label="Cargando producto"><div class="card-media is-loading keep"><span class="sk"></span></div><div class="card-body"><span class="sk-line" style="width:40%"></span><span class="sk-line" style="width:90%;height:16px"></span><span class="sk-line" style="width:70%"></span><span class="sk-line" style="width:55%;height:22px;margin-top:auto"></span><span class="sk-line" style="height:44px"></span></div></article></div></div>

      <h2>Estados de contenido</h2><p>Vacío, error y éxito comparten el mismo bloque.</p>
      <div class="split" style="gap:16px">${stateHTML({ icon:'cart', title:'Tu carrito está vacío', text:'Explora las ofertas o busca lo que necesitas.', actions:'<a class="btn btn-dark btn-sm" href="#/ofertas">Ver ofertas</a>' })}${stateHTML({ icon:'alert', kind:'error', title:'No pudimos cargar los productos', text:'Revisa tu conexión e inténtalo de nuevo.', actions:'<button type="button" class="btn btn-dark btn-sm" data-act="toast" data-msg="Reintentando…">Reintentar</button>' })}</div>
      <div style="margin-top:16px">${stateHTML({ icon:'circlecheck', kind:'success', title:'Recibimos tu mensaje', text:'Te respondemos en horario de atención.' })}</div>

      <h2>Iconografía</h2><p>Una sola familia de línea (estilo Lucide), SVG en línea con trazo de 1,8 px.</p>
      <div class="icons-grid">${Object.keys(ICONS).map(k => `<div>${ic(k, 22)}${k}</div>`).join('')}</div>

      <h2>Movimiento</h2><p>150–250 ms con ease-out (<code>cubic-bezier(.2,.7,.2,1)</code>). Con «reducir movimiento» activado, las animaciones se desactivan.</p>
    </div>`,
    after: root => settle(root)
  };
}

const PLAN = [
  ['Permalinks sin /index.php/', 'Ajustes › Enlaces permanentes › «Nombre de la entrada» y guardar para regenerar el <code>.htaccess</code>. Si sigue, pedir al hosting activar <code>mod_rewrite</code>. Redirección 301 de <code>/index.php/(.*)</code> a <code>/$1</code> con el plugin Redirection; reenviar sitemap y feed de Merchant Center.', 'a', 'b'],
  ['Quitar la meta de post en los productos', 'Elementor › Theme Builder: la plantilla de «Entrada individual» no debe aplicar a Productos. En Astra › Personalizar › Blog › Entrada individual, desactivar autor, fecha y comentarios.', 'a', 'b'],
  ['Arreglar el widget de Addi ($0)', 'Actualizar el plugin de Addi, revisar el <em>Ally slug</em> y el rango de montos en sus ajustes, y dejar que el plugin ubique el widget con su hook (no con un shortcode en Elementor sin contexto de producto). Probar en incógnito.', 'a', 'b'],
  ['Optimizar o quitar los videos del hero', 'Quitar los .mp4 y los dos sliders (Smart Slider 3 + MetaSlider). Un solo hero en Elementor con H1 e imagen WebP de menos de 150 KB. Si hay video, bajo el pliegue, con póster y <code>preload="none"</code>.', 'a', 'b'],
  ['Meta descriptions reales', 'Yoast o Rank Math: portada, categorías y productos. Portada: «Tecnología original con garantía: portátiles, TV, impresoras y más. Envío a toda Colombia y pago a cuotas con Addi y Sumas Pay.»', 'a', 'b'],
  ['Política de precios de referencia', 'Precio tachado solo si es real y verificable (Ley 1480, arts. 29–33). Quitar el precio «antes» donde no lo sea. Cambiar «¡Oferta!» por el % con el filtro <code>woocommerce_sale_flash</code> (Code Snippets). Ver la recomendación abajo.', 'a', 'm'],
  ['Precio diferenciado por medio de pago', 'Campo ACF «precio_financiado» por producto (o regla +X % global) mostrado con etiqueta dinámica de Elementor Pro. En el checkout, recargo o descuento por pasarela con «Payment Gateway Based Fees and Discounts» para que el total cambie al elegir el método.', 'a', 'm'],
  ['Productos variables en lugar de duplicados', 'Unificar HP 15-fc0354la (8/16/24 GB) en un producto variable: atributo global pa_ram, una variación por RAM con su precio, stock y SKU. Redirección 301 de las URL viejas a la nueva.', 'a', 'm'],
  ['Schema de producto', 'Rank Math o Yoast WooCommerce SEO generan Product, Offer, AggregateRating y BreadcrumbList. Validar con la Prueba de resultados enriquecidos de Google. Ejemplo JSON-LD abajo.', 'm', 'b'],
  ['Filtros por atributos', 'Atributos globales (pa_procesador, pa_ram, pa_almacenamiento, pa_pantalla, pa_uso) y el plugin Filter Everything o los bloques de filtros de WooCommerce. En móvil, panel inferior.', 'm', 'm'],
  ['Ficha de producto con el orden del prototipo', 'Plantilla única de Producto en Elementor Pro: galería, columna de compra, cajas de envío y garantía (plantilla global), calculadora de cuotas (HTML + JS), acordeón de ficha técnica y barra fija móvil (Sticky Add To Cart Bar).', 'a', 'a'],
  ['Checkout en 3 pasos', 'CheckoutWC o FunnelKit Checkout: pasos Datos › Envío › Pago, campos de tipo y número de documento para la factura electrónica, departamento › ciudad con «States, Cities and Places for WooCommerce».', 'a', 'a'],
  ['Mega-menú de 6 familias', 'Mega Menu de Astra Pro, o Max Mega Menu gratis. En móvil, menú lateral con acordeón.', 'm', 'm'],
  ['Imágenes sin CLS ni espacios en blanco', 'Fotos 1:1 en WebP, <code>loading="lazy"</code> con ancho y alto, fondo #F6F7F9 mientras cargan (CSS adicional). Conversión con LiteSpeed Cache o Converter for Media.', 'm', 'b'],
  ['Píxel de Meta duplicado', 'Facebook for WooCommerce y PixelYourSite pueden instalar el mismo píxel: dejarlo en uno solo y validar con Meta Pixel Helper.', 'm', 'b'],
  ['Páginas de confianza y legales', 'Envíos, garantía, devoluciones y retracto, términos y privacidad con la plantilla legal; enlace a la SIC y razón social/NIT en el footer.', 'm', 'b'],
  ['Reseñas verificadas', 'WooCommerce › Ajustes › Productos: solo compradores verificados. Solicitud automática a los 7 días con Customer Reviews for WooCommerce.', 'm', 'b'],
  ['Limpiar HTML roto en descripciones', 'Copia de seguridad y Better Search Replace sobre <code>wp_posts</code>: <code>href=»</code> por <code>href="</code> y <code>»&gt;</code> por <code>"&gt;</code>.', 'b', 'b']
];
const LV = { a:'Alto', m:'Medio', b:'Bajo' };
function viewPlan() {
  const ld = { '@context':'https://schema.org', '@type':'Product', name:byId[1].name, sku:'GT-0001', brand:{ '@type':'Brand', name:'Samsung' }, image:'https://giftronic04.com/wp-content/uploads/combo-samsung-qled-40.webp',
    offers:{ '@type':'Offer', priceCurrency:'COP', price:999999, availability:'https://schema.org/InStock', url:'https://giftronic04.com/producto/combo-samsung-qled-40/' }, aggregateRating:{ '@type':'AggregateRating', ratingValue:5, reviewCount:1 } };
  return {
    title: 'Plan de implementación', mode: 'doc',
    html: `<div class="wrap docv">
      <header class="docv-h"><a class="link" href="#/" style="justify-self:start">${ic('left', 16)}Volver a la tienda</a><span class="eyebrow">${ic('file', 15)}WooCommerce + Astra + Elementor</span><h1 tabindex="-1">Plan de implementación</h1>
        <p>Qué hacer en la tienda actual para llegar al prototipo, ordenado por impacto. Mide antes y después con PageSpeed Insights (móvil) y las conversiones de Analytics.</p></header>

      <h2>Mejoras</h2><p>Impacto sobre ventas y confianza; esfuerzo de implementación.</p>
      <div class="plan-wrap"><table class="plan-table"><thead><tr><th scope="col">Mejora</th><th scope="col">Cómo hacerlo en WooCommerce / Astra / Elementor</th><th scope="col">Impacto</th><th scope="col">Esfuerzo</th></tr></thead>
        <tbody>${PLAN.map(([m, c, i, e]) => `<tr><th scope="row">${m}</th><td>${c}</td><td><span class="lvl ${i}"><i></i>${LV[i]}</span></td><td><span class="lvl ${e}"><i></i>${LV[e]}</span></td></tr>`).join('')}</tbody></table></div>

      <h2>Precios de referencia</h2><p>Si todo está en oferta, nada destaca, y un «antes» de $ 3.999.999 junto a $ 1.874.900 hace dudar del descuento.</p>
      <ol class="decisions">
        <li><b>Solo precios reales y verificables como «antes».</b> La Ley 1480 de 2011 obliga a cumplir lo anunciado en promociones y prohíbe la publicidad engañosa; la SIC puede sancionar un descuento calculado sobre un precio que nunca se cobró.</li>
        <li><b>Regla interna con evidencia:</b> por ejemplo, el precio cobrado de verdad en los últimos 30 días o el precio de lista del fabricante, con capturas y facturas.</li>
        <li><b>Oferta solo donde la hay</b>, idealmente en menos de 1 de cada 5 productos y con fecha de fin visible.</li>
        <li><b>Nada de x.999.999 inventados.</b> Un «antes» de $ 2.199.900 que sí existió convence más.</li>
        <li><b>Precio final con IVA y diferencia por financiación visibles antes de pagar</b> (Ley 1480, art. 26).</li>
      </ol>

      <h2>Datos estructurados (ejemplo)</h2><p>La ficha del prototipo inyecta este bloque para Product, Offer, AggregateRating y BreadcrumbList.</p>
      <pre class="code">${esc(JSON.stringify(ld, null, 2))}</pre>

      <h2>Decisiones de diseño</h2><p>Supuestos y decisiones tomadas donde el brief dejaba margen.</p>
      <ol class="decisions">
        <li><b>Esquinas rectas y naranja accesible.</b> Todos los componentes van a 90° (radio 0) para una imagen más seria. Además, #FF6A00 da 2,9:1 sobre blanco y no cumple AA; los CTA, precios y badges usan #D24410 (4,6:1). El naranja del logo queda para el logo y fondos oscuros.</li>
        <li><b>La galería queda fija, no la columna de compra.</b> Con 12 bloques la columna es más alta que la pantalla; fijarla escondería el final. La galería (más corta) acompaña el scroll.</li>
        <li><b>Ficha móvil compacta.</b> Galería de 220 px y nombre, precios y stock en el primer pantallazo; el CTA vive en la barra fija inferior.</li>
        <li><b>Barra de navegación inferior en móvil.</b> Inicio, Categorías, Buscar, Carrito y Cuenta al alcance del pulgar. Se oculta en la ficha (la reemplaza la barra de compra) y en el checkout.</li>
        <li><b>Checkout sin distracciones.</b> Header mínimo sin menú ni footer; el total cambia al elegir contado o financiación y la diferencia se explica en texto.</li>
        <li><b>Datos de ejemplo marcados.</b> Envío gratis desde ${cop(FREE_SHIP)}, envío ${cop(SHIP_STD)}/${cop(SHIP_EXP)}, precio con financiación +7 %, stock de Ricoh (3), «Más vendidos», usos (Estudio/Oficina/Gamer/Diseño) y condiciones de financieras están en <code>data.js</code> como ejemplo.</li>
        <li><b>HP 15-fc0354la unificado con variantes.</b> Las tres versiones de RAM figuran agotadas en los datos; el selector igual muestra precio y stock por versión.</li>
        <li><b>Garantía y empaques.</b> El brief condiciona la garantía a los empaques originales; la ficha lo presenta como recomendación porque negar la garantía legal por falta de empaque puede chocar con la Ley 1480. Conviene validarlo con un asesor.</li>
        <li><b>Imágenes ilustradas.</b> Siluetas SVG por categoría, sin logos de marcas. La segunda imagen (hover) es un recorte de detalle.</li>
        <li><b>Un archivo, sin dependencias.</b> <code>index.html</code> se abre con doble clic; las piezas de <code>src/</code> se unen con <code>node build.mjs</code> solo para editar cómodo.</li>
      </ol>

      <h2>Criterios de aceptación</h2>
      <ul class="checklist">${['Ficha móvil: nombre, precio de contado, precio con financiación, stock y CTA sin scroll', 'Ningún «¡Oferta!» sin % de descuento calculado', 'Todos los precios con formato $ 1.234.567 (Intl.NumberFormat es-CO)', 'Chips de specs según el tipo de producto', 'Agotados atenuados, con badge y «Avísame»', 'Total del checkout según el método de pago', 'Sin scroll horizontal a 375 px', 'Foco visible y navegación con teclado', 'Un H1 por vista y ningún video en el primer pliegue'].map(t => `<li>${ic('check', 18)}<span>${t}</span></li>`).join('')}</ul>
    </div>`
  };
}
