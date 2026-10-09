<?php
/** Piezas compartidas: datos del producto, precios, insignias, tarjeta, carruseles, categorías. */
if (!defined('ABSPATH')) exit;

/** Datos derivados de un producto (marca, tipo, nombre corto, specs, chips). */
function gt_pdata($p) {
  static $cache = array();
  if (!$p) return array();
  $id = $p->get_id();
  if (isset($cache[$id])) return $cache[$id];
  $name = gt_clean($p->get_name());
  $terms = get_the_terms($id, 'product_cat');
  $cats = array();
  if (is_array($terms)) foreach ($terms as $t) $cats[] = $t->name;
  $kind = gt_kind_of($name, implode(', ', $cats));
  $specs = gt_specs_of($name);
  $brand = gt_brand_of($name);
  if (taxonomy_exists('product_brand')) {
    $b = get_the_terms($id, 'product_brand');
    if (is_array($b) && $b) $brand = $b[0]->name;
  }
  return $cache[$id] = array(
    'name'  => $name,
    'short' => $name, // nombre tal cual está en la tienda
    'kind'  => $kind,
    'specs' => $specs,
    'brand' => $brand,
    'chips' => gt_chips_of($kind, $specs, $name),
    'cat'   => $cats ? $cats[0] : '',
  );
}

/** Precio que se muestra y precio antes (para variables, el menor). */
function gt_prices($p) {
  if ($p->is_type('variable')) {
    $now = (float) $p->get_variation_price('min', true);
    $was = (float) $p->get_variation_regular_price('min', true);
    $from = $now !== (float) $p->get_variation_price('max', true);
  } else {
    $now = (float) wc_get_price_to_display($p);
    $reg = $p->get_regular_price();
    $was = $reg !== '' ? (float) wc_get_price_to_display($p, array('price' => $reg)) : $now;
    $from = false;
  }
  $off = ($was > $now && $was > 0) ? (int) round(($was - $now) / $was * 100) : 0;
  return array('now' => $now, 'was' => $off > 0 ? $was : 0, 'off' => $off, 'from' => $from);
}

function gt_money($n) {
  return wc_price($n, array('decimals' => 0));
}

/** Insignias: descuento > combo > gamer > últimas unidades (máximo 2). */
function gt_badges($p, $pr = null) {
  $d = gt_pdata($p);
  $pr = $pr ? $pr : gt_prices($p);
  $b = array();
  if ($pr['off'] >= 1) $b[] = '<span class="gt-badge gt-badge-off">-' . (int) $pr['off'] . '%</span>';
  if ($d['kind'] === 'combo' || preg_match('/\bcombo\b|\bkit\b/iu', $d['name'])) $b[] = '<span class="gt-badge gt-badge-combo">Combo</span>';
  if (in_array($d['kind'], array('laptop-gamer', 'pc-gamer'), true)) $b[] = '<span class="gt-badge gt-badge-gamer">Gamer</span>';
  $q = $p->managing_stock() ? (int) $p->get_stock_quantity() : null;
  if ($p->is_in_stock() && $q !== null && $q > 0 && $q <= 3) $b[] = '<span class="gt-badge gt-badge-last">Últimas unidades</span>';
  return implode('', array_slice($b, 0, 2));
}

/** Estado de inventario. */
function gt_stock_html($p, $long = false) {
  if (!$p->is_in_stock()) return '<span class="gt-stock out"><i class="dot"></i>Agotado</span>';
  if ($p->is_on_backorder()) return '<span class="gt-stock last"><i class="dot"></i>Bajo pedido</span>';
  $q = $p->managing_stock() ? (int) $p->get_stock_quantity() : null;
  if ($q !== null && $q > 0 && $q <= 3) return '<span class="gt-stock last"><i class="dot"></i>' . ($q === 1 ? 'Última unidad' : 'Últimas ' . $q . ' unidades') . '</span>';
  $extra = ($long && $q !== null && $q > 0) ? ' <span>· ' . $q . ' disponibles</span>' : '';
  return '<span class="gt-stock in"><i class="dot"></i>Disponible' . $extra . '</span>';
}

function gt_wa($text = '') {
  return 'https://wa.me/' . gt_wa_number() . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}

/** Ancho real con que se ve cada imagen (para que el navegador baje el archivo justo en srcset). */
function gt_sizes($where) {
  $m = array(
    'card' => '(min-width:1280px) 300px, (min-width:1024px) 24vw, (min-width:768px) 31vw, 46vw',
    'tile' => '(min-width:1024px) 150px, (min-width:768px) 22vw, 64px',
    'hero' => '(min-width:1024px) 470px, 80vw',
    'mega' => '250px',
    'gal'  => '(min-width:1280px) 640px, (min-width:1024px) 50vw, 100vw',
    'galm' => '230px',
  );
  return isset($m[$where]) ? $m[$where] : '';
}

/** Imagen principal (o un ícono si el producto no tiene foto). $high: solo para la imagen más importante de la página (LCP). */
function gt_img($p, $size = 'woocommerce_thumbnail', $class = 'gt-art', $eager = false, $img_id = 0, $sizes = '', $high = false) {
  $id = $img_id ? $img_id : $p->get_image_id();
  if (!$id && $p->get_parent_id()) {
    $parent = wc_get_product($p->get_parent_id());
    if ($parent) $id = $parent->get_image_id();
  }
  if ($id) {
    $attr = array('class' => $class, 'alt' => gt_pdata($p)['short'], 'decoding' => 'async');
    $attr['loading'] = $eager ? 'eager' : 'lazy';
    if ($high) $attr['fetchpriority'] = 'high';
    if ($sizes) $attr['sizes'] = $sizes;
    $html = wp_get_attachment_image($id, $size, false, $attr);
    if ($html) return $html;
  }
  return '<span class="' . esc_attr($class) . ' gt-noimg">' . gt_ic(gt_kind_icon(gt_pdata($p)['kind']), 56, 1.4) . '</span>';
}

/** Tarjeta de producto. */
function gt_card($p, $eager = false) {
  if (!$p) return '';
  $d = gt_pdata($p);
  $pr = gt_prices($p);
  $url = get_permalink($p->get_id());
  $out = !$p->is_in_stock();
  $h = '<article class="gt-card' . ($out ? ' is-out' : '') . '">';
  $h .= '<a class="gt-card-media" href="' . esc_url($url) . '" tabindex="-1" aria-hidden="true">';
  $h .= gt_img($p, 'woocommerce_thumbnail', 'gt-art', $eager, 0, gt_sizes('card'));
  $h .= '</a>';
  $badges = ($out ? '<span class="gt-badge gt-badge-out">Agotado</span>' : '') . gt_badges($p, $pr);
  if ($badges) $h .= '<div class="gt-card-badges">' . $badges . '</div>';
  $h .= '<div class="gt-card-body">';
  $h .= '<span class="gt-card-brand">' . esc_html($d['brand'] ? $d['brand'] : $d['cat']) . '</span>';
  $h .= '<h3 class="gt-card-title"><a href="' . esc_url($url) . '" title="' . esc_attr($d['name']) . '">' . esc_html($d['short']) . '</a></h3>';
  if ($d['chips']) {
    $h .= '<ul class="gt-chips">';
    foreach ($d['chips'] as $c) $h .= '<li>' . esc_html($c) . '</li>';
    $h .= '</ul>';
  }
  $h .= '<div class="gt-card-price">';
  if ($pr['was']) $h .= '<span class="gt-price-was"><s>' . gt_money($pr['was']) . '</s></span>';
  if ($pr['now'] > 0) $h .= '<span class="gt-price">' . ($pr['from'] ? '<small>Desde</small> ' : '') . gt_money($pr['now']) . '</span>';
  else $h .= '<span class="gt-price gt-price-ask">Consultar precio</span>';
  if (!$out && $pr['now'] >= 300000) $h .= '<span class="gt-fin">Paga a cuotas con <b>Addi</b> o <b>Sistecrédito</b></span>';
  $h .= '</div>';
  $h .= '<div class="gt-card-actions">' . gt_card_button($p, $d, $out) . '</div>';
  $h .= '</div></article>';
  return $h;
}

function gt_card_button($p, $d, $out) {
  $url = get_permalink($p->get_id());
  if ($out) return '<a class="gt-btn gt-btn-ghost gt-btn-block" href="' . esc_url($url) . '">Ver producto</a>';
  if ($p->is_type('simple') && $p->is_purchasable() && $p->is_in_stock()) {
    return sprintf(
      '<a href="%s" data-quantity="1" class="gt-btn gt-btn-dark gt-btn-block add_to_cart_button ajax_add_to_cart" data-product_id="%d" data-product_sku="%s" aria-label="%s" rel="nofollow">%sAgregar</a>',
      esc_url($p->add_to_cart_url()), $p->get_id(), esc_attr($p->get_sku()), esc_attr('Agregar ' . $d['short'] . ' al carrito'), gt_ic('cart', 18)
    );
  }
  return '<a class="gt-btn gt-btn-dark gt-btn-block" href="' . esc_url($url) . '">' . ($p->is_type('variable') ? 'Elegir versión' : 'Ver producto') . '</a>';
}

/** Encabezado de sección. */
function gt_sec_head($title, $sub = '', $link = '', $link_text = 'Ver todo', $tag = 'h2') {
  $h = '<div class="gt-sec-h"><div><' . $tag . '>' . esc_html($title) . '</' . $tag . '>';
  if ($sub) $h .= '<p>' . esc_html($sub) . '</p>';
  $h .= '</div>';
  if ($link) $h .= '<a class="gt-link" href="' . esc_url($link) . '">' . esc_html($link_text) . '<span class="screen-reader-text">: ' . esc_html($title) . '</span>' . gt_ic('right', 16) . '</a>';
  return $h . '</div>';
}

/** Carrusel horizontal de tarjetas. */
function gt_rail($products, $label) {
  $products = array_filter($products);
  if (!$products) return '';
  $h = '<div class="gt-rail" data-rail><button type="button" class="gt-rail-btn prev" data-rail-prev aria-label="Anteriores: ' . esc_attr($label) . '" disabled>' . gt_ic('left', 22) . '</button>';
  $h .= '<div class="gt-rail-track" role="list" aria-label="' . esc_attr($label) . '" tabindex="0">';
  // Perezosas: gt.js las pide en cuanto el carrusel se acerca a la pantalla (también las que quedan fuera de la fila).
  foreach ($products as $p) $h .= '<div role="listitem">' . gt_card($p) . '</div>';
  $h .= '</div><button type="button" class="gt-rail-btn next" data-rail-next aria-label="Siguientes: ' . esc_attr($label) . '">' . gt_ic('right', 22) . '</button></div>';
  return $h;
}

/**
 * Productos para portada y carruseles: visibles, primero los disponibles.
 * $args: cat (ids o slugs), ids, on_sale, orderby (popularity|date|discount), limit, exclude.
 */
function gt_products($args) {
  $a = wp_parse_args($args, array('cat' => array(), 'ids' => array(), 'on_sale' => false, 'orderby' => 'popularity', 'limit' => 12, 'exclude' => array(), 'instock' => true));
  // Un margen pequeño para reemplazar los agotados sin cargar decenas de productos por carrusel.
  $q = array('status' => 'publish', 'visibility' => 'catalog', 'limit' => $a['orderby'] === 'discount' ? 40 : $a['limit'] + 8, 'return' => 'objects');
  if ($a['cat']) {
    $q['category'] = array();
    foreach ((array) $a['cat'] as $c) {
      $t = is_numeric($c) ? get_term((int) $c, 'product_cat') : get_term_by('slug', $c, 'product_cat');
      if ($t && !is_wp_error($t)) $q['category'][] = $t->slug;
    }
    if (!$q['category']) return array();
  }
  if ($a['ids']) $q['include'] = array_map('intval', (array) $a['ids']);
  if ($a['on_sale']) {
    $sale = wc_get_product_ids_on_sale();
    if (!$sale) return array();
    $q['include'] = isset($q['include']) ? array_values(array_intersect($q['include'], $sale)) : $sale;
    if (!$q['include']) return array();
  }
  if ($a['exclude']) $q['exclude'] = array_map('intval', (array) $a['exclude']);
  if ($a['orderby'] === 'popularity') { $q['meta_key'] = 'total_sales'; $q['orderby'] = array('meta_value_num' => 'DESC', 'date' => 'DESC'); }
  else { $q['orderby'] = 'date'; $q['order'] = 'DESC'; }
  $list = wc_get_products($q);
  if ($a['orderby'] === 'discount') {
    usort($list, function ($x, $y) { return gt_prices($y)['off'] - gt_prices($x)['off']; });
  }
  // Disponibles primero, sin cambiar el orden dentro de cada grupo.
  $in = array(); $out = array();
  foreach ($list as $p) { if ($p->is_in_stock()) $in[] = $p; else $out[] = $p; }
  $list = $a['instock'] ? $in : array_merge($in, $out);
  return array_slice($list, 0, $a['limit']);
}

/** Árbol de categorías con productos (familias y subcategorías). */
function gt_cat_tree() {
  static $tree = null;
  if ($tree !== null) return $tree;
  $terms = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => false, 'orderby' => 'name'));
  if (is_wp_error($terms)) return $tree = array();
  $by = array(); $kids = array();
  foreach ($terms as $t) {
    // «Sin categorizar» no se muestra (ojo: en esta tienda la categoría por defecto es Portátiles, así que no se filtra por ID).
    if (preg_match('/^(uncategorized|sin-categorizar|sin-categoria)$/', $t->slug)) continue;
    $by[$t->term_id] = $t;
    $kids[$t->parent][] = $t->term_id;
  }
  $total = function ($id) use (&$total, $by, $kids) {
    $n = isset($by[$id]) ? (int) $by[$id]->count : 0;
    if (!empty($kids[$id])) foreach ($kids[$id] as $k) $n += $total($k);
    return $n;
  };
  $tree = array();
  foreach (isset($kids[0]) ? $kids[0] : array() as $id) {
    $n = $total($id);
    if ($n < 1) continue;
    $subs = array();
    $walk = function ($pid) use (&$walk, &$subs, $kids, $by, $total) {
      if (empty($kids[$pid])) return;
      foreach ($kids[$pid] as $k) {
        if ($total($k) > 0) $subs[] = array('term' => $by[$k], 'n' => $total($k));
        $walk($k);
      }
    };
    $walk($id);
    usort($subs, function ($x, $y) { return $y['n'] - $x['n']; });
    $tree[] = array('term' => $by[$id], 'n' => $n, 'subs' => $subs);
  }
  usort($tree, function ($x, $y) { return $y['n'] - $x['n']; });
  return $tree;
}

/** Ícono según el nombre de la categoría. */
function gt_cat_icon($name) {
  $n = strtolower(remove_accents($name));
  $map = array(
    'portatil' => 'laptop', 'computacion' => 'laptop', 'televis' => 'tv', 'tv' => 'tv', 'monitor' => 'monitor', 'impres' => 'printer', 'tablet' => 'smartphone',
    'consola' => 'gamepad', 'videojuego' => 'gamepad', 'gaming' => 'gamepad', 'audio' => 'volume', 'parlante' => 'volume', 'camara' => 'camera', 'webcam' => 'camera',
    'almacenamiento' => 'hdd', 'redes' => 'router', 'conectividad' => 'router', 'cable' => 'cable', 'cargador' => 'plug', 'mouse' => 'cpu', 'teclado' => 'cpu',
    'periferico' => 'cpu', 'escritorio' => 'monitor', 'all in one' => 'monitor', 'computador' => 'monitor', 'fuente' => 'bolt', 'regulador' => 'bolt',
    'video beam' => 'tv', 'celular' => 'smartphone', 'smartwatch' => 'clock', 'componente' => 'cpu', 'accesorio' => 'box',
  );
  foreach ($map as $k => $i) if (strpos($n, $k) !== false) return $i;
  return 'box';
}

/** Primera categoría que existe entre varios slugs o ids. */
function gt_term($keys) {
  foreach ((array) $keys as $k) {
    $t = is_numeric($k) ? get_term((int) $k, 'product_cat') : get_term_by('slug', $k, 'product_cat');
    if ($t && !is_wp_error($t)) return $t;
  }
  return null;
}

function gt_term_link($t) {
  if (!$t) return '';
  $l = get_term_link($t);
  return is_wp_error($l) ? '' : $l;
}

/** Imagen de una categoría: su miniatura o la del producto disponible más vendido. */
function gt_cat_image($t, $class = 'gt-art') {
  $thumb = (int) get_term_meta($t->term_id, 'thumbnail_id', true);
  if ($thumb) {
    $img = wp_get_attachment_image($thumb, 'woocommerce_thumbnail', false, array('class' => $class, 'alt' => '', 'loading' => 'lazy', 'sizes' => gt_sizes('tile')));
    if ($img) return $img;
  }
  $ps = gt_products(array('cat' => array($t->term_id), 'limit' => 1));
  if ($ps) return gt_img($ps[0], 'woocommerce_thumbnail', $class, false, 0, gt_sizes('tile'));
  return '<span class="' . esc_attr($class) . ' gt-noimg">' . gt_ic(gt_cat_icon($t->name), 40, 1.4) . '</span>';
}

function gt_shop_url() {
  $u = wc_get_page_permalink('shop');
  return $u ? $u : home_url('/');
}

function gt_offers_url() {
  return add_query_arg('oferta', '1', gt_shop_url());
}

function gt_breadcrumb_defaults($d) {
  $d['delimiter'] = '';
  $d['wrap_before'] = '<nav class="gt-crumbs" aria-label="Ruta de navegación"><ol>';
  $d['wrap_after'] = '</ol></nav>';
  $d['before'] = '<li>';
  $d['after'] = '</li>';
  $d['home'] = 'Inicio';
  return $d;
}

function gt_breadcrumb_trim($crumbs) {
  // En la ficha, el último paso usa el nombre corto.
  if (function_exists('is_product') && is_product() && $crumbs) {
    $p = wc_get_product(get_queried_object_id());
    if ($p) $crumbs[count($crumbs) - 1][0] = gt_pdata($p)['short'];
  }
  return $crumbs;
}

function gt_pagination_args($a) {
  $a['prev_text'] = gt_ic('left', 18) . '<span class="screen-reader-text">Anterior</span>';
  $a['next_text'] = gt_ic('right', 18) . '<span class="screen-reader-text">Siguiente</span>';
  $a['end_size'] = 1;
  $a['mid_size'] = 1;
  return $a;
}

function gt_related_args($a) {
  $a['posts_per_page'] = 8;
  $a['columns'] = 4;
  return $a;
}

function gt_loop_start($html) {
  return str_replace('class="products', 'class="products gt-grid', $html);
}
