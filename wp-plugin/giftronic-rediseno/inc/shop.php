<?php
/**
 * Listados: filtros por marca y especificaciones leídas del nombre, disponibilidad, ofertas y rango de precio.
 * Los filtros viajan por la URL (?marca=hp,lenovo&ram=16-gb&disp=1&oferta=1&min_price=…&max_price=…).
 */
if (!defined('ABSPATH')) exit;

/** Facetas según el tipo de listado. */
function gt_facets_for($kind) {
  $f = array('marca' => 'Marca');
  if ($kind === 'computer') $f += array('cpu' => 'Procesador', 'ram' => 'Memoria RAM', 'ssd' => 'Almacenamiento', 'scr' => 'Pantalla', 'gpu' => 'Tarjeta gráfica');
  elseif ($kind === 'tv') $f += array('scr' => 'Tamaño', 'res' => 'Resolución', 'panel' => 'Tecnología', 'os' => 'Sistema');
  elseif ($kind === 'monitor') $f += array('scr' => 'Tamaño', 'res' => 'Resolución', 'hz' => 'Frecuencia');
  elseif ($kind === 'printer') $f += array('ptype' => 'Tipo');
  elseif ($kind === 'tablet') $f += array('scr' => 'Pantalla', 'ram' => 'Memoria RAM', 'ssd' => 'Almacenamiento');
  return $f;
}

/** Tipo de listado según la categoría o los productos que contiene. */
function gt_listing_kind($rows) {
  $count = array();
  foreach ($rows as $r) {
    $k = $r['kind'];
    $g = gt_is_computer($k) ? 'computer' : (($k === 'tv' || $k === 'combo') ? 'tv' : $k);
    $count[$g] = isset($count[$g]) ? $count[$g] + 1 : 1;
  }
  if (!$count) return 'other';
  arsort($count);
  $top = key($count);
  return (current($count) >= max(3, count($rows) * 0.5)) ? $top : 'other';
}

/** Orden de los valores de cada faceta. */
function gt_facet_sort($key, $vals) {
  $num = function ($v) { return (float) preg_replace('/[^\d.]/', '', str_replace(',', '.', $v)); };
  if (in_array($key, array('ram', 'scr', 'hz'), true)) {
    uksort($vals, function ($a, $b) use ($num) { return $num($a) <=> $num($b); });
  } elseif ($key === 'ssd') {
    $bytes = function ($v) use ($num) { return stripos($v, 'TB') !== false ? $num($v) * 1024 : $num($v); };
    uksort($vals, function ($a, $b) use ($bytes) { return $bytes($a) <=> $bytes($b); });
  } else {
    arsort($vals);
    if (isset($vals['Otras marcas'])) { $o = $vals['Otras marcas']; unset($vals['Otras marcas']); $vals['Otras marcas'] = $o; }
  }
  return $vals;
}

function gt_facet_value($row, $key) {
  if ($key === 'marca') return $row['brand'] ? $row['brand'] : 'Otras marcas';
  if ($key === 'cpu') return isset($row['specs']['cpuFam']) ? $row['specs']['cpuFam'] : '';
  if ($key === 'gpu') return isset($row['specs']['gpu']) ? preg_replace('/\s\d+\sGB$/', '', $row['specs']['gpu']) : '';
  return isset($row['specs'][$key]) ? $row['specs'][$key] : '';
}

/** Selección actual leída de la URL: ['marca' => ['hp','lenovo'], …] (slugs). */
function gt_selected($keys) {
  $sel = array();
  foreach ($keys as $k) {
    if (empty($_GET[$k])) continue;
    $vals = array_filter(array_map('sanitize_title', explode(',', wp_unslash((string) $_GET[$k]))));
    if ($vals) $sel[$k] = array_values($vals);
  }
  return $sel;
}

/**
 * Productos del listado actual (categoría, etiqueta, búsqueda o tienda), sin filtros propios.
 * Devuelve filas con lo necesario para filtrar y contar.
 */
function gt_listing_rows() {
  static $rows = null;
  if ($rows !== null) return $rows;
  $args = array('post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => -1, 'fields' => 'ids', 'no_found_rows' => true, 'suppress_filters' => false);
  $tax = array();
  $vis = wc_get_product_visibility_term_ids();
  $hidden = array();
  if (!empty($vis['exclude-from-catalog'])) $hidden[] = $vis['exclude-from-catalog'];
  if ('yes' === get_option('woocommerce_hide_out_of_stock_items') && !empty($vis['outofstock'])) $hidden[] = $vis['outofstock'];
  if ($hidden) $tax[] = array('taxonomy' => 'product_visibility', 'field' => 'term_taxonomy_id', 'terms' => $hidden, 'operator' => 'NOT IN');
  if (is_product_taxonomy()) {
    $t = get_queried_object();
    if ($t && !empty($t->taxonomy)) $tax[] = array('taxonomy' => $t->taxonomy, 'field' => 'term_id', 'terms' => array($t->term_id), 'include_children' => true);
  }
  if ($tax) $args['tax_query'] = $tax;
  $s = get_search_query(false);
  if ($s !== '') $args['s'] = $s;
  // Las búsquedas no se guardan (serían una entrada por cada texto buscado).
  $ckey = $s === '' ? gt_cache_key('rows_' . md5(wp_json_encode($args))) : '';
  $cached = $ckey ? get_transient($ckey) : false;
  if (is_array($cached)) return $rows = $cached;
  $ids = get_posts($args);
  $rows = array();
  if (!$ids) { if ($ckey) set_transient($ckey, $rows, 30 * MINUTE_IN_SECONDS); return $rows; }
  update_meta_cache('post', $ids);
  update_object_term_cache($ids, 'product');
  $sale = array_flip(wc_get_product_ids_on_sale());
  foreach ($ids as $id) {
    $name = gt_clean(get_the_title($id));
    $terms = get_the_terms($id, 'product_cat');
    $cats = array();
    if (is_array($terms)) foreach ($terms as $t) $cats[] = $t->name;
    $kind = gt_kind_of($name, implode(', ', $cats));
    $brand = gt_brand_of($name);
    if (taxonomy_exists('product_brand')) { $b = get_the_terms($id, 'product_brand'); if (is_array($b) && $b) $brand = $b[0]->name; }
    $rows[$id] = array(
      'id' => $id, 'kind' => $kind, 'brand' => $brand, 'specs' => gt_specs_of($name),
      'price' => (float) get_post_meta($id, '_price', true),
      'stock' => get_post_meta($id, '_stock_status', true) !== 'outofstock',
      'sale' => isset($sale[$id]),
    );
  }
  if ($ckey) set_transient($ckey, $rows, 30 * MINUTE_IN_SECONDS);
  return $rows;
}

/** ¿La fila cumple los filtros? $skip permite contar una faceta sin aplicarse a sí misma. */
function gt_row_matches($row, $sel, $skip = '') {
  if (!empty($_GET['disp']) && !$row['stock']) return false;
  if (!empty($_GET['oferta']) && !$row['sale']) return false;
  $min = isset($_GET['min_price']) ? (float) $_GET['min_price'] : 0;
  $max = isset($_GET['max_price']) ? (float) $_GET['max_price'] : 0;
  if ($min && $row['price'] < $min) return false;
  if ($max && $row['price'] > $max) return false;
  foreach ($sel as $k => $vals) {
    if ($k === $skip) continue;
    $v = sanitize_title(gt_facet_value($row, $k));
    if (!in_array($v, $vals, true)) return false;
  }
  return true;
}

/** Datos para pintar los filtros del listado actual. */
function gt_filter_state() {
  static $st = null;
  if ($st !== null) return $st;
  $rows = gt_listing_rows();
  $kind = gt_listing_kind($rows);
  $facets = gt_facets_for($kind);
  $sel = gt_selected(array_keys($facets));
  $groups = array();
  foreach ($facets as $key => $label) {
    $vals = array(); $names = array();
    foreach ($rows as $r) {
      $v = gt_facet_value($r, $key);
      if ($v === '') continue;
      $slug = sanitize_title($v);
      $names[$slug] = $v;
      if (!isset($vals[$v])) $vals[$v] = 0;
      if (gt_row_matches($r, $sel, $key)) $vals[$v]++;
    }
    if (count($vals) < 2 && empty($sel[$key])) continue;
    $groups[$key] = array('label' => $label, 'vals' => gt_facet_sort($key, $vals));
  }
  $prices = array();
  foreach ($rows as $r) if ($r['price'] > 0) $prices[] = $r['price'];
  $st = array('rows' => $rows, 'kind' => $kind, 'groups' => $groups, 'sel' => $sel, 'prices' => $prices);
  return $st;
}

/** Aplica los filtros propios a la consulta principal del listado. */
function gt_apply_filters($q) {
  if (!$q->is_main_query()) return;
  $keys = array('marca', 'cpu', 'ram', 'ssd', 'scr', 'gpu', 'res', 'panel', 'os', 'hz', 'ptype');
  $sel = gt_selected($keys);
  if (!$sel && empty($_GET['disp']) && empty($_GET['oferta'])) return;
  $ids = array();
  foreach (gt_listing_rows() as $id => $r) if (gt_row_matches($r, $sel)) $ids[] = $id;
  $q->set('post__in', $ids ? $ids : array(0));
}

/** Rangos de precio sugeridos según los precios del listado. */
function gt_price_ranges($prices) {
  if (count($prices) < 4) return array();
  sort($prices);
  $steps = array(500000, 1000000, 1500000, 2000000, 3000000, 4000000, 6000000);
  $max = end($prices);
  $cuts = array();
  foreach ($steps as $s) if ($s < $max && $s > $prices[0]) $cuts[] = $s;
  if (count($cuts) > 4) $cuts = array($cuts[0], $cuts[(int) floor(count($cuts) / 3)], $cuts[(int) floor(2 * count($cuts) / 3)], end($cuts));
  $out = array(); $prev = 0;
  foreach ($cuts as $c) { $out[] = array($prev, $c); $prev = $c; }
  $out[] = array($prev, 0);
  return $out;
}

function gt_short_money($n) {
  if ($n >= 1000000) return '$ ' . rtrim(rtrim(number_format($n / 1000000, 1, ',', '.'), '0'), ',') . ' M';
  return '$ ' . number_format($n / 1000, 0, ',', '.') . ' mil';
}

/** URL del listado actual cambiando parámetros. */
function gt_url_with($changes) {
  $url = remove_query_arg(array('paged', 'product-page'));
  $url = preg_replace('#/page/\d+/?#', '/', $url);
  foreach ($changes as $k => $v) {
    $url = ($v === null || $v === '' || $v === array()) ? remove_query_arg($k, $url) : add_query_arg($k, is_array($v) ? implode(',', $v) : $v, $url);
  }
  return $url;
}

/** Formulario de filtros (barra lateral en escritorio, panel inferior en móvil). */
function gt_filters_html() {
  $st = gt_filter_state();
  $h = '<form class="gt-filters-form" method="get" action="' . esc_url(strtok(gt_url_with(array()), '?')) . '" data-filters>';
  foreach (array('s', 'post_type', 'orderby') as $keep) {
    if (isset($_GET[$keep]) && $_GET[$keep] !== '') $h .= '<input type="hidden" name="' . esc_attr($keep) . '" value="' . esc_attr(wp_unslash((string) $_GET[$keep])) . '">';
  }

  // Subcategorías
  if (is_product_category()) {
    $t = get_queried_object();
    $kids = get_terms(array('taxonomy' => 'product_cat', 'parent' => $t->term_id, 'hide_empty' => true));
    if ($kids && !is_wp_error($kids)) {
      $h .= '<details class="gt-fgroup" open><summary>Categoría' . gt_ic('down', 18, 1.8, 'gt-i gt-chev') . '</summary><div class="gt-fopts">';
      foreach ($kids as $k) $h .= '<a class="gt-fopt gt-fopt-link" href="' . esc_url(gt_term_link($k)) . '">' . esc_html($k->name) . '<span class="c">' . (int) $k->count . '</span></a>';
      $h .= '</div></details>';
    }
  }

  // Disponibilidad y ofertas
  $h .= '<details class="gt-fgroup" open><summary>Mostrar' . gt_ic('down', 18, 1.8, 'gt-i gt-chev') . '</summary><div class="gt-fopts">';
  $h .= '<label class="gt-fopt"><input class="gt-cb" type="checkbox" name="disp" value="1"' . checked(!empty($_GET['disp']), true, false) . '>Solo disponibles</label>';
  $h .= '<label class="gt-fopt"><input class="gt-cb" type="checkbox" name="oferta" value="1"' . checked(!empty($_GET['oferta']), true, false) . '>En oferta</label>';
  $h .= '</div></details>';

  // Precio
  $ranges = gt_price_ranges($st['prices']);
  if ($ranges) {
    $cur_min = isset($_GET['min_price']) ? (int) $_GET['min_price'] : 0;
    $cur_max = isset($_GET['max_price']) ? (int) $_GET['max_price'] : 0;
    $h .= '<details class="gt-fgroup" open><summary>Precio' . gt_ic('down', 18, 1.8, 'gt-i gt-chev') . '</summary><div class="gt-fopts">';
    foreach ($ranges as $r) {
      $label = !$r[0] ? 'Hasta ' . gt_short_money($r[1]) : (!$r[1] ? 'Más de ' . gt_short_money($r[0]) : gt_short_money($r[0]) . ' a ' . gt_short_money($r[1]));
      $on = ($cur_min === (int) $r[0] && $cur_max === (int) $r[1]);
      $href = $on ? gt_url_with(array('min_price' => null, 'max_price' => null)) : gt_url_with(array('min_price' => $r[0] ? $r[0] : null, 'max_price' => $r[1] ? $r[1] : null));
      $h .= '<a class="gt-fopt gt-fopt-link' . ($on ? ' is-on' : '') . '" href="' . esc_url($href) . '"' . ($on ? ' aria-current="true"' : '') . '><span class="gt-radio-ui" aria-hidden="true"></span>' . esc_html($label) . '</a>';
    }
    $h .= '<div class="gt-range-in"><label><span class="screen-reader-text">Precio mínimo</span><input class="gt-input" type="number" inputmode="numeric" min="0" step="10000" name="min_price" placeholder="Mínimo" value="' . ($cur_min ? esc_attr($cur_min) : '') . '"></label>'
      . '<span aria-hidden="true">–</span><label><span class="screen-reader-text">Precio máximo</span><input class="gt-input" type="number" inputmode="numeric" min="0" step="10000" name="max_price" placeholder="Máximo" value="' . ($cur_max ? esc_attr($cur_max) : '') . '"></label>'
      . '<button type="submit" class="gt-btn gt-btn-ghost gt-btn-sm" aria-label="Aplicar rango de precio">' . gt_ic('arrow', 16) . '</button></div>';
    $h .= '</div></details>';
  }

  // Facetas leídas del nombre
  foreach ($st['groups'] as $key => $g) {
    $sel = isset($st['sel'][$key]) ? $st['sel'][$key] : array();
    $h .= '<details class="gt-fgroup"' . (($sel || $key === 'marca' || count($st['groups']) <= 3) ? ' open' : '') . '><summary>' . esc_html($g['label']) . gt_ic('down', 18, 1.8, 'gt-i gt-chev') . '</summary><div class="gt-fopts">';
    $i = 0;
    foreach ($g['vals'] as $v => $n) {
      $slug = sanitize_title($v);
      $on = in_array($slug, $sel, true);
      $more = (++$i > 8 && !$on) ? ' gt-more' : '';
      $h .= '<label class="gt-fopt' . ($n ? '' : ' is-zero') . $more . '"><input class="gt-cb" type="checkbox" name="' . esc_attr($key) . '[]" value="' . esc_attr($slug) . '"' . checked($on, true, false) . ($n || $on ? '' : ' disabled') . '>' . esc_html($v) . '<span class="c">' . (int) $n . '</span></label>';
    }
    if ($i > 8) $h .= '<button type="button" class="gt-link gt-fmore" data-fmore>Ver más (' . ($i - 8) . ')</button>';
    $h .= '</div></details>';
  }
  $h .= '<noscript><button type="submit" class="gt-btn gt-btn-dark gt-btn-block">Aplicar filtros</button></noscript>';
  $h .= '</form>';
  return $h;
}

/** Chips de filtros activos con enlace para quitarlos. */
function gt_active_filters_html() {
  $st = gt_filter_state();
  $chips = array();
  $x = gt_ic('x', 14);
  if (!empty($_GET['disp'])) $chips[] = array('Solo disponibles', gt_url_with(array('disp' => null)));
  if (!empty($_GET['oferta'])) $chips[] = array('En oferta', gt_url_with(array('oferta' => null)));
  if (!empty($_GET['min_price']) || !empty($_GET['max_price'])) {
    $mn = (int) (isset($_GET['min_price']) ? $_GET['min_price'] : 0); $mx = (int) (isset($_GET['max_price']) ? $_GET['max_price'] : 0);
    $chips[] = array(!$mn ? 'Hasta ' . gt_short_money($mx) : (!$mx ? 'Más de ' . gt_short_money($mn) : gt_short_money($mn) . ' a ' . gt_short_money($mx)), gt_url_with(array('min_price' => null, 'max_price' => null)));
  }
  foreach ($st['sel'] as $k => $vals) {
    $names = array();
    if (isset($st['groups'][$k])) foreach (array_keys($st['groups'][$k]['vals']) as $v) $names[sanitize_title($v)] = $v;
    foreach ($vals as $v) {
      $rest = array_values(array_diff($vals, array($v)));
      $chips[] = array(isset($names[$v]) ? $names[$v] : $v, gt_url_with(array($k => $rest ? $rest : null)));
    }
  }
  if (!$chips) return '';
  $h = '<div class="gt-active-f">';
  foreach ($chips as $c) $h .= '<a href="' . esc_url($c[1]) . '" aria-label="Quitar filtro: ' . esc_attr($c[0]) . '">' . esc_html($c[0]) . $x . '</a>';
  $clear = remove_query_arg(array('disp', 'oferta', 'min_price', 'max_price', 'marca', 'cpu', 'ram', 'ssd', 'scr', 'gpu', 'res', 'panel', 'os', 'hz', 'ptype'), gt_url_with(array()));
  $h .= '<a class="clear" href="' . esc_url($clear) . '">Limpiar filtros</a></div>';
  return $h;
}

/** Los checkbox «marca[]» llegan como arreglo: se convierten a «marca=a,b» para URLs limpias. */
add_action('template_redirect', 'gt_normalize_filter_query', 1);
function gt_normalize_filter_query() {
  $keys = array('marca', 'cpu', 'ram', 'ssd', 'scr', 'gpu', 'res', 'panel', 'os', 'hz', 'ptype');
  $changed = false;
  foreach ($keys as $k) {
    if (isset($_GET[$k]) && is_array($_GET[$k])) {
      $_GET[$k] = implode(',', array_map('sanitize_title', wp_unslash($_GET[$k])));
      $changed = true;
    }
  }
  foreach (array('min_price', 'max_price') as $k) {
    if (isset($_GET[$k]) && $_GET[$k] === '') { unset($_GET[$k]); $changed = true; }
  }
  if ($changed && gt_on()) {
    $q = array();
    foreach ($_GET as $k => $v) if ($v !== '' && !is_array($v)) $q[$k] = wp_unslash($v);
    $base = strtok(wp_unslash((string) $_SERVER['REQUEST_URI']), '?');
    $base = preg_replace('#/page/\d+/?#', '/', $base);
    wp_safe_redirect(add_query_arg(array_map('rawurlencode', $q), $base));
    exit;
  }
}

/* La consulta principal corre antes del hook «wp»: estos dos se enganchan siempre y revisan gt_on() adentro. */
add_action('woocommerce_product_query', 'gt_maybe_apply_filters', 20);
function gt_maybe_apply_filters($q) {
  if (gt_on()) gt_apply_filters($q);
}
/* En los listados, los productos agotados van al final (sin cambiar el orden elegido dentro de cada grupo). */
add_filter('posts_clauses', 'gt_instock_first', 20, 2);
function gt_instock_first($c, $q) {
  if (!$q->is_main_query() || !$q->get('wc_query') || !gt_on()) return $c;
  global $wpdb;
  $c['join'] .= " LEFT JOIN {$wpdb->postmeta} gt_ss ON (gt_ss.post_id = {$wpdb->posts}.ID AND gt_ss.meta_key = '_stock_status')";
  $c['orderby'] = "(CASE WHEN gt_ss.meta_value = 'outofstock' THEN 1 ELSE 0 END) ASC" . (trim($c['orderby']) !== '' ? ', ' . $c['orderby'] : '');
  return $c;
}
add_filter('loop_shop_per_page', 'gt_maybe_per_page', 99);
function gt_maybe_per_page($n) {
  return gt_on() ? 24 : $n;
}
