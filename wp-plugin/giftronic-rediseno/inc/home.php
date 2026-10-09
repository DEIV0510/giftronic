<?php
/** Datos de la portada: producto destacado, opiniones reales y marcas del catálogo. */
if (!defined('ABSPATH')) exit;

function gt_hero_product() {
  $id = (int) gt_opt('hero_id');
  if ($id) {
    $p = wc_get_product($id);
    if ($p && $p->get_status() === 'publish' && $p->is_visible() && $p->is_in_stock()) return $p;
  }
  $ps = gt_products(array('on_sale' => true, 'orderby' => 'popularity', 'limit' => 1));
  if (!$ps) $ps = gt_products(array('limit' => 1));
  return $ps ? $ps[0] : null;
}

/** Banners de Smart Slider que ya tenía la portada anterior. */
function gt_home_promos() {
  if (!shortcode_exists('smartslider3')) return '';
  $out = '';
  foreach (array_filter(array_map('absint', explode(',', (string) gt_opt('sliders')))) as $id) {
    $out .= '<div class="gt-promo">' . do_shortcode('[smartslider3 slider="' . $id . '"]') . '</div>';
  }
  return $out;
}

/** Título con «a cuotas» resaltado. */
function gt_hero_title() {
  $t = esc_html(gt_opt('hero_title'));
  return preg_replace('/(a cuotas)/iu', '<em>$1</em>', $t, 1);
}

/** Opiniones reales de 5 estrellas con texto suficiente. */
function gt_home_reviews($n = 3) {
  $list = get_comments(array(
    'post_type' => 'product', 'status' => 'approve', 'type__in' => array('review', 'comment'), 'number' => 40,
    'meta_query' => array(array('key' => 'rating', 'value' => 5, 'compare' => '=', 'type' => 'NUMERIC')),
  ));
  $out = array(); $seen = array();
  foreach ($list as $c) {
    $text = trim(wp_strip_all_tags($c->comment_content));
    if (mb_strlen($text) < 30 || isset($seen[$c->comment_post_ID])) continue;
    $p = wc_get_product($c->comment_post_ID);
    if (!$p) continue;
    $seen[$c->comment_post_ID] = true;
    $name = trim($c->comment_author);
    $parts = preg_split('/\s+/', $name);
    $out[] = array(
      'text' => mb_strlen($text) > 220 ? rtrim(mb_substr($text, 0, 210)) . '…' : $text,
      'who' => $parts ? $parts[0] : 'Cliente',
      'verified' => (bool) get_comment_meta($c->comment_ID, 'verified', true),
      'product' => gt_pdata($p)['short'],
      'url' => get_permalink($p->get_id()),
      'date' => get_comment_date('F Y', $c),
    );
    if (count($out) >= $n) break;
  }
  return $out;
}

/** Marcas con más productos disponibles (leídas del nombre o de la taxonomía de marcas). */
function gt_home_brands($n = 12) {
  $key = 'gt_brands_' . GT_VER . '_' . get_option('gt_index_ver', 0);
  $brands = get_transient($key);
  if (!is_array($brands)) {
    $ids = get_posts(array('post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => -1, 'fields' => 'ids', 'no_found_rows' => true));
    $count = array();
    foreach ($ids as $id) {
      if (get_post_meta($id, '_stock_status', true) === 'outofstock') continue;
      $b = gt_brand_of(gt_clean(get_the_title($id)));
      if ($b) $count[$b] = isset($count[$b]) ? $count[$b] + 1 : 1;
    }
    arsort($count);
    $brands = array_keys($count);
    set_transient($key, $brands, 12 * HOUR_IN_SECONDS);
  }
  return array_slice($brands, 0, $n);
}

/** Cantidad de productos publicados, redondeada hacia abajo (para el texto de la portada). */
function gt_catalog_size() {
  $c = wp_count_posts('product');
  $n = isset($c->publish) ? (int) $c->publish : 0;
  return $n >= 100 ? floor($n / 100) * 100 : $n;
}

/** Total de productos de una categoría y sus subcategorías. */
function gt_term_total($t) {
  $n = (int) $t->count;
  $kids = get_term_children($t->term_id, 'product_cat');
  if (!is_wp_error($kids)) foreach ($kids as $k) { $kt = get_term($k, 'product_cat'); if ($kt && !is_wp_error($kt)) $n += (int) $kt->count; }
  return $n;
}
