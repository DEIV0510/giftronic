<?php
/** Cabecera, menú de categorías, pie de página, barra inferior móvil y paneles (menú y carrito). */
if (!defined('ABSPATH')) exit;

function gt_is_checkout() {
  return function_exists('is_checkout') && is_checkout() && !is_wc_endpoint_url('order-received');
}

/**
 * Logo real de la tienda (el que está en Apariencia → Personalizar → Identidad del sitio).
 * La imagen trae mucho fondo negro arriba y abajo: el CSS la recorta a la franja del logo (6,7:1) y la funde con el negro de la cabecera.
 * Si no hay logo configurado, se usa el dibujo del prototipo.
 */
function gt_logo($href = '', $label = 'Giftronic04.com, ir al inicio', $where = 'hdr') {
  $href = $href ? $href : home_url('/');
  $img = '';
  $id = (int) gt_opt('logo_id');
  if (!$id) {
    // Logo oscuro que usaba la cabecera anterior (el «logo del sitio» configurado en WordPress es una versión con fondo blanco).
    $up = wp_get_upload_dir();
    $b = esc_url($up['baseurl'] . '/2021/08/MOVIL-2');
    $img = '<img class="gt-logo-img" src="' . $b . '-768x256.jpg" srcset="' . $b . '-300x100.jpg 300w, ' . $b . '-768x256.jpg 768w, ' . $b . '-1024x341.jpg 1024w, ' . $b . '-1536x512.jpg 1536w" sizes="(min-width:1024px) 300px, 210px" width="768" height="256" alt="Giftronic04.com — Estamos a tu servicio" decoding="async" loading="' . ($where === 'foot' ? 'lazy' : 'eager') . '">';
  }
  if (!$img && $id) {
    $img = wp_get_attachment_image($id, 'medium_large', false, array(
      'class'    => 'gt-logo-img',
      'alt'      => 'Giftronic04.com — Estamos a tu servicio',
      'loading'  => $where === 'foot' ? 'lazy' : 'eager',
      'decoding' => 'async',
      'sizes'    => '(min-width:1024px) 300px, 210px',
    ));
  }
  if (!$img) {
    $img = '<svg class="gt-logo-mark" viewBox="0 0 34 30" aria-hidden="true"><rect x="1" y="1" width="32" height="21" rx="4" fill="#FF6B00"/><rect x="4.5" y="4.5" width="25" height="14" rx="1.6" fill="#0B0B0F"/><path d="M7.5 15.5 13 10l3.5 3 5-5" stroke="#FF6B00" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 28.5h8M17 22.5v6" stroke="#FF6B00" stroke-width="3" stroke-linecap="round"/></svg>'
      . '<span class="gt-logo-word">GIFTRONIC<b>04</b><small>.COM</small></span>';
  }
  return '<a class="gt-logo" href="' . esc_url($href) . '" aria-label="' . esc_attr($label) . '">' . $img . '</a>';
}

function gt_cart_count() {
  return (function_exists('WC') && WC()->cart) ? (int) WC()->cart->get_cart_contents_count() : 0;
}

/** Enlaces rápidos de la barra de categorías (solo las que existen y tienen productos). */
function gt_quick_cats() {
  $want = array(array(30, 'Portátiles'), array(86, 'Televisores'), array(56, 'All in One'), array(34, 'Monitores'), array(32, 'Impresoras'), array(38, 'Tablets'), array(25, 'Gaming'));
  $out = array();
  foreach ($want as $w) {
    $t = get_term($w[0], 'product_cat');
    if ($t && !is_wp_error($t)) $out[] = array('t' => $t, 'label' => $w[1]);
  }
  return $out;
}

function gt_header() {
  if (gt_is_checkout()) { gt_header_min(); return; }
  $tb = array_slice(array_values(array_filter(array_map('trim', explode("\n", (string) gt_opt('topbar'))))), 0, 3);
  $tb_icons = array('truck', 'card', 'chat');
  $acct = wc_get_page_permalink('myaccount');
  $user = wp_get_current_user();
  $hi = is_user_logged_in() ? ('Hola, ' . ($user->first_name ? $user->first_name : $user->display_name)) : 'Ingresa';
  $n = gt_cart_count();
  ?>
  <a class="gt-skip" href="#gt-main">Saltar al contenido</a>
  <?php if ($tb) : ?>
  <div class="gt-topbar"><div class="gt-wrap"><ul class="gt-topbar-list" data-rotate>
    <?php foreach ($tb as $i => $msg) : ?>
      <li<?php echo $i === 0 ? ' class="is-on"' : ''; ?>><?php echo gt_ic($tb_icons[$i], 16); ?><span><?php echo esc_html($msg); ?></span></li>
    <?php endforeach; ?>
  </ul></div></div>
  <?php endif; ?>
  <header class="gt-hdr" id="gt-hdr">
    <div class="gt-wrap gt-hdr-in">
      <button type="button" class="gt-icon-btn gt-hdr-menu" data-open="gt-menu" aria-label="Abrir categorías"><?php echo gt_ic('menu', 24); ?></button>
      <?php echo gt_logo(); ?>
      <form class="gt-search" role="search" action="<?php echo esc_url(home_url('/')); ?>" method="get" autocomplete="off">
        <?php echo gt_ic('search', 20); ?>
        <label class="screen-reader-text" for="gt-q">Buscar productos</label>
        <input id="gt-q" name="s" type="search" value="<?php echo esc_attr(get_search_query()); ?>" placeholder="Busca portátiles, TVs, impresoras…" role="combobox" aria-expanded="false" aria-controls="gt-suggest" aria-autocomplete="list">
        <input type="hidden" name="post_type" value="product">
        <button class="gt-search-btn" type="submit" aria-label="Buscar"><?php echo gt_ic('search', 18); ?><span>Buscar</span></button>
        <div class="gt-suggest" id="gt-suggest" role="listbox" aria-label="Sugerencias de búsqueda" hidden></div>
      </form>
      <div class="gt-hdr-actions">
        <a class="gt-hdr-act gt-only-lg" href="<?php echo esc_url(gt_wa('Hola, quiero asesoría para comprar en Giftronic04.com')); ?>" target="_blank" rel="noopener"><?php echo gt_ic('chat', 22); ?><span class="t"><small aria-hidden="true">Asesoría</small>WhatsApp</span></a>
        <a class="gt-hdr-act gt-only-lg" href="<?php echo esc_url($acct); ?>"><?php echo gt_ic('user', 22); ?><span class="t"><small aria-hidden="true"><?php echo esc_html($hi); ?></small>Mi cuenta</span></a>
        <a class="gt-hdr-act" href="<?php echo esc_url(wc_get_cart_url()); ?>" data-open="gt-cart"><?php echo gt_ic('cart', 22); ?><span class="gt-count gt-cart-count" data-n="<?php echo (int) $n; ?>" aria-hidden="true"><?php echo (int) $n; ?></span><span class="t"><small aria-hidden="true">Tu compra</small>Carrito</span></a>
      </div>
    </div>
    <nav class="gt-catnav" aria-label="Categorías">
      <div class="gt-wrap gt-catnav-in">
        <button type="button" class="gt-catnav-all" aria-expanded="false" aria-controls="gt-mega" data-mega><?php echo gt_ic('menu', 18); ?>Todas las categorías<?php echo gt_ic('down', 16, 1.8, 'gt-i gt-chev'); ?></button>
        <?php foreach (gt_quick_cats() as $q) : ?>
          <a href="<?php echo esc_url(gt_term_link($q['t'])); ?>"><?php echo esc_html($q['label']); ?></a>
        <?php endforeach; ?>
        <a class="deal" href="<?php echo esc_url(gt_offers_url()); ?>"><?php echo gt_ic('tag', 16); ?>Ofertas</a>
      </div>
      <div class="gt-mega" id="gt-mega" hidden></div>
      <template id="gt-mega-tpl"><?php echo gt_mega_html(); ?></template>
    </nav>
  </header>
  <div id="gt-main" tabindex="-1"></div>
  <?php
}

/** Cabecera mínima del checkout: sin distracciones. */
function gt_header_min() {
  ?>
  <header class="gt-hdr-min">
    <div class="gt-wrap">
      <?php echo gt_logo(wc_get_cart_url(), 'Giftronic04.com, volver al carrito'); ?>
      <span class="gt-secure"><?php echo gt_ic('lock', 16); ?>Pago seguro</span>
      <a class="gt-icon-btn" href="<?php echo esc_url(gt_wa('Hola, necesito ayuda con mi pago en Giftronic04.com')); ?>" target="_blank" rel="noopener" aria-label="Ayuda por WhatsApp"><?php echo gt_ic('chat', 22); ?></a>
    </div>
  </header>
  <div id="gt-main" tabindex="-1"></div>
  <?php
}

/** Mega menú y menú móvil (se guardan en caché hasta que cambie un producto). */
function gt_nav_cache() {
  static $c = null;
  if ($c !== null) return $c;
  $key = 'gt_nav_' . GT_VER . '_' . get_option('gt_index_ver', 0);
  $c = get_transient($key);
  if (!is_array($c)) {
    $c = array('mega' => gt_build_mega(), 'menu' => gt_build_menu());
    set_transient($key, $c, 6 * HOUR_IN_SECONDS);
  }
  return $c;
}
function gt_mega_html() { $c = gt_nav_cache(); return $c['mega']; }
function gt_menu_html() { $c = gt_nav_cache(); return $c['menu']; }

function gt_build_mega() {
  $tree = array_slice(gt_cat_tree(), 0, 9);
  if (!$tree) return '';
  $h = '<div class="gt-wrap gt-mega-in"><ul class="gt-mega-fams" role="tablist" aria-orientation="vertical" aria-label="Familias">';
  foreach ($tree as $i => $f) {
    $h .= '<li role="presentation"><button type="button" class="gt-mega-fam" role="tab" id="gt-fam-' . $i . '" aria-selected="' . ($i === 0 ? 'true' : 'false') . '" aria-controls="gt-famp-' . $i . '" data-fam="' . $i . '">'
      . '<span class="gt-fam-ic">' . gt_ic(gt_cat_icon($f['term']->name), 20) . '</span>' . esc_html($f['term']->name) . gt_ic('right', 16, 1.8, 'gt-i gt-chev-r') . '</button></li>';
  }
  $h .= '</ul>';
  foreach ($tree as $i => $f) {
    $link = gt_term_link($f['term']);
    $h .= '<div class="gt-mega-panel" role="tabpanel" id="gt-famp-' . $i . '" aria-labelledby="gt-fam-' . $i . '"' . ($i === 0 ? '' : ' hidden') . '>';
    $h .= '<div class="gt-mega-subs"><h3>' . esc_html($f['term']->name) . '</h3>';
    if ($f['subs']) {
      $h .= '<ul>';
      foreach (array_slice($f['subs'], 0, 12) as $s) $h .= '<li><a href="' . esc_url(gt_term_link($s['term'])) . '">' . esc_html($s['term']->name) . ' <small>' . (int) $s['n'] . '</small></a></li>';
      $h .= '</ul>';
    }
    $h .= '<a class="gt-link" href="' . esc_url($link) . '">Ver todo en ' . esc_html($f['term']->name) . gt_ic('arrow', 16) . '</a></div>';
    $feat = gt_products(array('cat' => array($f['term']->term_id), 'on_sale' => true, 'orderby' => 'discount', 'limit' => 1));
    if (!$feat) $feat = gt_products(array('cat' => array($f['term']->term_id), 'limit' => 1));
    if ($feat) {
      $p = $feat[0];
      $pr = gt_prices($p);
      $h .= '<a class="gt-mega-feat" href="' . esc_url(get_permalink($p->get_id())) . '"><small>Destacado</small>' . gt_img($p, 'woocommerce_thumbnail', 'gt-art', false, 0, gt_sizes('mega'))
        . '<strong>' . esc_html(gt_pdata($p)['short']) . '</strong>'
        . ($pr['was'] ? '<span class="gt-price-was"><s>' . gt_money($pr['was']) . '</s> <b>-' . (int) $pr['off'] . '%</b></span>' : '')
        . '<span class="gt-price">' . gt_money($pr['now']) . '</span></a>';
    }
    $h .= '</div>';
  }
  return $h . '</div>';
}

function gt_build_menu() {
  $h = '';
  foreach (gt_cat_tree() as $i => $f) {
    $link = gt_term_link($f['term']);
    $h .= '<div class="gt-mfam"><button type="button" class="gt-mfam-h" aria-expanded="false" aria-controls="gt-mf-' . $i . '"><span class="gt-fam-ic">' . gt_ic(gt_cat_icon($f['term']->name), 20) . '</span>' . esc_html($f['term']->name) . gt_ic('down', 18, 1.8, 'gt-i gt-chev') . '</button>';
    $h .= '<ul id="gt-mf-' . $i . '" hidden><li><a href="' . esc_url($link) . '"><b>Ver todo</b></a></li>';
    foreach ($f['subs'] as $s) $h .= '<li><a href="' . esc_url(gt_term_link($s['term'])) . '">' . esc_html($s['term']->name) . '</a></li>';
    $h .= '</ul></div>';
  }
  return $h;
}

/** Medios de pago activos en la tienda (con nombres cortos). */
function gt_pay_methods() {
  static $memo = null;
  if ($memo !== null) return $memo;
  $cached = get_transient('gt_pay_' . GT_VER);
  if (is_array($cached)) return $memo = $cached;
  $labels = array(
    'woo-mercado-pago-basic' => 'Mercado Pago', 'woo-mercado-pago-custom' => 'Tarjeta débito y crédito', 'woo-mercado-pago-pse' => 'PSE',
    'openpay_pse' => 'PSE', 'bacs' => 'Transferencia bancaria', 'wompi' => 'Wompi', 'addi' => 'Addi', 'payvalida' => 'Payvalida',
    'sumas_pay' => 'SU+ Pay', 'wcsistecredito' => 'Sistecrédito', 'epayco' => 'ePayco', 'cod' => 'Contraentrega',
  );
  $out = array();
  if (function_exists('WC') && WC()->payment_gateways()) {
    foreach (WC()->payment_gateways()->payment_gateways() as $id => $g) {
      if (!isset($g->enabled) || $g->enabled !== 'yes') continue;
      $label = isset($labels[$id]) ? $labels[$id] : trim(wp_strip_all_tags((string) $g->get_title()));
      if ($label !== '') $out[$label] = true;
    }
  }
  $memo = array_keys($out);
  set_transient('gt_pay_' . GT_VER, $memo, 12 * HOUR_IN_SECONDS);
  return $memo;
}

/** Enlace a una página solo si está publicada. */
function gt_page_link($id, $label) {
  $id = (int) $id;
  if (!$id || get_post_status($id) !== 'publish') return '';
  return '<li><a href="' . esc_url(get_permalink($id)) . '">' . esc_html($label) . '</a></li>';
}

function gt_footer() {
  if (gt_is_checkout()) {
    echo '<footer class="gt-foot gt-foot-min"><div class="gt-wrap"><div class="gt-foot-legal"><span>© ' . esc_html(date_i18n('Y')) . ' Giftronic04.com · Precios en pesos colombianos (COP)</span>'
      . '<a class="gt-sic" href="https://www.sic.gov.co" target="_blank" rel="noopener">' . gt_ic('shield', 18) . 'Superintendencia de Industria y Comercio</a></div></div></footer>';
    return;
  }
  $wa = gt_wa_number();
  $wa_label = '+' . substr($wa, 0, 2) . ' ' . substr($wa, 2, 3) . ' ' . substr($wa, 5, 3) . ' ' . substr($wa, 8);
  $tree = array_slice(gt_cat_tree(), 0, 6);
  $policies = gt_page_link(get_option('wp_page_for_privacy_policy'), 'Privacidad y datos personales')
    . gt_page_link(wc_terms_and_conditions_page_id(), 'Términos y condiciones')
    . gt_page_link(get_option('woocommerce_refund_returns_page_id'), 'Devoluciones y reembolsos');
  $pay = gt_pay_methods();
  ?>
  <footer class="gt-foot">
    <div class="gt-wrap">
      <div class="gt-foot-grid">
        <div class="gt-foot-brand">
          <?php echo gt_logo('', 'Giftronic04.com, ir al inicio', 'foot'); ?>
          <p>Tienda de tecnología en Colombia: portátiles, televisores, impresoras, gaming y accesorios con envío a todo el país.</p>
        </div>
        <div><h2>Categorías</h2><ul>
          <?php foreach ($tree as $f) : ?><li><a href="<?php echo esc_url(gt_term_link($f['term'])); ?>"><?php echo esc_html($f['term']->name); ?></a></li><?php endforeach; ?>
          <li><a href="<?php echo esc_url(gt_offers_url()); ?>">Ofertas</a></li>
        </ul></div>
        <div><h2>Ayuda</h2><ul>
          <li><a href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>">Mi cuenta y pedidos</a></li>
          <li><a href="<?php echo esc_url(wc_get_cart_url()); ?>">Carrito</a></li>
          <?php echo gt_page_link(839, 'Contacto'); ?>
          <?php echo gt_page_link(1166, 'Nuestras tiendas'); ?>
          <?php echo $policies; ?>
        </ul></div>
        <div><h2>Contacto</h2><ul>
          <li><a href="<?php echo esc_url(gt_wa()); ?>" target="_blank" rel="noopener"><?php echo gt_ic('chat', 16); ?><?php echo esc_html($wa_label); ?></a></li>
          <?php if (gt_opt('email')) : ?><li><a href="mailto:<?php echo esc_attr(gt_opt('email')); ?>"><?php echo gt_ic('mail', 16); ?><?php echo esc_html(gt_opt('email')); ?></a></li><?php endif; ?>
          <?php if (gt_opt('instagram')) : ?><li><a href="<?php echo esc_url(gt_opt('instagram')); ?>" target="_blank" rel="noopener"><?php echo gt_ic('camera', 16); ?>Instagram</a></li><?php endif; ?>
          <?php if (gt_opt('facebook')) : ?><li><a href="<?php echo esc_url(gt_opt('facebook')); ?>" target="_blank" rel="noopener"><?php echo gt_ic('users', 16); ?>Facebook</a></li><?php endif; ?>
        </ul></div>
      </div>
      <?php if ($pay) : ?>
      <div class="gt-foot-pay"><span>Medios de pago</span><ul class="gt-pay dark"><?php foreach ($pay as $m) echo '<li>' . esc_html($m) . '</li>'; ?></ul></div>
      <?php endif; ?>
      <div class="gt-foot-legal">
        <span>© <?php echo esc_html(date_i18n('Y')); ?> Giftronic04.com · Precios en pesos colombianos (COP)</span>
        <a class="gt-sic" href="https://www.sic.gov.co" target="_blank" rel="noopener"><?php echo gt_ic('shield', 18); ?>Superintendencia de Industria y Comercio</a>
      </div>
    </div>
  </footer>
  <?php
}

/** Barra inferior móvil, WhatsApp flotante y paneles. Va en wp_footer. */
function gt_layers() {
  if (gt_is_checkout()) return;
  $n = gt_cart_count();
  $acct = wc_get_page_permalink('myaccount');
  ?>
  <nav class="gt-bnav" aria-label="Navegación principal">
    <a href="<?php echo esc_url(home_url('/')); ?>"<?php echo is_front_page() ? ' aria-current="page"' : ''; ?>><?php echo gt_ic('home', 22); ?>Inicio</a>
    <button type="button" data-open="gt-menu"><?php echo gt_ic('grid', 22); ?>Categorías</button>
    <button type="button" data-search><?php echo gt_ic('search', 22); ?>Buscar</button>
    <a href="<?php echo esc_url(wc_get_cart_url()); ?>" data-open="gt-cart"><?php echo gt_ic('cart', 22); ?><span class="gt-count gt-cart-count" data-n="<?php echo (int) $n; ?>" aria-hidden="true"><?php echo (int) $n; ?></span>Carrito</a>
    <a href="<?php echo esc_url($acct); ?>"<?php echo is_account_page() ? ' aria-current="page"' : ''; ?>><?php echo gt_ic('user', 22); ?>Cuenta</a>
  </nav>
  <a class="gt-wa-float" href="<?php echo esc_url(gt_wa('Hola, quiero asesoría para comprar en Giftronic04.com')); ?>" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp"><?php echo gt_ic('chat', 28); ?></a>

  <div class="gt-layer" id="gt-menu" hidden>
    <div class="gt-scrim" data-close></div>
    <div class="gt-sheet" role="dialog" aria-modal="true" aria-labelledby="gt-menu-t">
      <div class="gt-sheet-h"><h2 id="gt-menu-t">Categorías</h2><button type="button" class="gt-icon-btn" data-close aria-label="Cerrar menú"><?php echo gt_ic('x', 22); ?></button></div>
      <div class="gt-sheet-b">
        <div id="gt-mfams"></div><template id="gt-menu-tpl"><?php echo gt_menu_html(); ?></template>
        <div class="gt-m-quick">
          <a class="gt-btn gt-btn-ghost" href="<?php echo esc_url(gt_offers_url()); ?>"><?php echo gt_ic('tag', 18); ?>Ofertas</a>
          <a class="gt-btn gt-btn-ghost" href="<?php echo esc_url($acct); ?>"><?php echo gt_ic('user', 18); ?>Mi cuenta</a>
          <a class="gt-btn gt-btn-ghost" href="<?php echo esc_url(gt_wa('Hola, quiero asesoría para comprar en Giftronic04.com')); ?>" target="_blank" rel="noopener"><?php echo gt_ic('chat', 18); ?>Asesoría por WhatsApp</a>
        </div>
      </div>
    </div>
  </div>

  <div class="gt-layer right" id="gt-cart" hidden>
    <div class="gt-scrim" data-close></div>
    <div class="gt-sheet" role="dialog" aria-modal="true" aria-labelledby="gt-cart-t">
      <div class="gt-sheet-h"><h2 id="gt-cart-t">Tu carrito</h2><button type="button" class="gt-icon-btn" data-close aria-label="Cerrar carrito"><?php echo gt_ic('x', 22); ?></button></div>
      <div class="gt-sheet-b"><div class="widget_shopping_cart_content"><?php woocommerce_mini_cart(); ?></div></div>
    </div>
  </div>
  <div class="gt-toast-slot" aria-live="polite"></div>
  <?php
}
