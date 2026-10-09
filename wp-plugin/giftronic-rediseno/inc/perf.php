<?php
/**
 * Rendimiento: menos CSS/JS que estas vistas no usan, fuente propia precargada y cachés ligeras.
 * Todo se apaga desmarcando «Optimizar carga» en Ajustes → Rediseño Giftronic.
 */
if (!defined('ABSPATH')) exit;

/** ¿La página la pinta por completo el rediseño (sin contenido de Elementor)? */
function gt_is_own_view() {
  return (is_front_page() && gt_opt('home', 1)) || gt_is_shop_view() || (function_exists('is_product') && is_product());
}

function gt_is_woo_page() {
  return function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page());
}

/**
 * Quita lo que no se usa:
 * - SureCart: la tienda vende con WooCommerce, pero SureCart carga ~55 hojas de estilo, 4 módulos JS y 233 KB de traducciones en cada página.
 * - Dos «hojas de estilo» que en realidad son los dominios de Google Fonts (se descargan como CSS sin servir para nada).
 * - En portada, listados y ficha: Elementor y Header Footer Elementor (ya no pintan nada ahí), Font Awesome, las fuentes de Elementor
 *   y de Red Hat Display, el CSS de FiboSearch y del editor de MetaSlider, la galería de WooCommerce (zoom, flexslider, photoswipe)
 *   y, fuera de la ficha, el reproductor de video y los estilos de bloques.
 * Las páginas hechas con Elementor (Contacto, Tiendas…) no se tocan.
 */
function gt_trim_assets() {
  if (!gt_on() || !gt_opt('slim', 1) || is_admin()) return;
  $own = gt_is_own_view();
  $woo = gt_is_woo_page();
  if (!$own && !$woo) return;
  $pdp = function_exists('is_product') && is_product();

  $css = array('/^surecart/', '/^google-fonts-(preconnect|gstatic)$/');
  $js = array('/^surecart/');
  if ($own) {
    $css = array_merge($css, array('/^elementor/', '/^hfe-/', '/^e-animation/', '/^e-apple-webkit/', '/^widget-(?!addi)/', '/^swiper/', '/^font-awesome/', '/^dgwt-wcas/', '/^metaslider-blocks-editor/', '/^google-fonts$/', '/^photoswipe/', '/^wc-photoswipe/'));
    $js = array_merge($js, array('/^elementor/', '/^hfe-/', '/^dgwt-wcas/', '/^swiper/', '/^(wc-)?zoom$/', '/^(wc-)?flexslider$/', '/^(wc-)?photoswipe/'));
    if (!$pdp) {
      $css = array_merge($css, array('/^(wp-)?mediaelement$/', '/^wp-block-library/', '/^global-styles$/', '/^classic-theme-styles$/'));
      $js = array_merge($js, array('/^(wp-)?mediaelement/'));
    }
  }
  $styles = wp_styles();
  foreach ((array) $styles->queue as $h) {
    foreach ($css as $re) if (preg_match($re, $h)) { wp_dequeue_style($h); break; }
  }
  $scripts = wp_scripts();
  foreach ((array) $scripts->queue as $h) {
    foreach ($js as $re) if (preg_match($re, $h)) { wp_dequeue_script($h); break; }
  }
  // CSS de Sistecrédito que no existe en el servidor (404 en cada página).
  wp_dequeue_style('wc-sistecredito-blocks');
  // Widget de financiación del Banco de Bogotá: ~2,3 MB de JS. Fuera de la ficha no tiene dónde mostrarse;
  // en la ficha gt.js lo carga después del evento load, cuando su componente se acerca a la pantalla.
  if ($own && wp_script_is('bdb-ec4-script', 'enqueued')) {
    $reg = wp_scripts()->registered['bdb-ec4-script'] ?? null;
    if ($pdp && $reg && $reg->src) $GLOBALS['gt_bdb_src'] = $reg->src;
    wp_dequeue_script('bdb-ec4-script');
  }
  if (function_exists('wp_dequeue_script_module')) {
    foreach (array('@surecart/cart', '@surecart/checkout', '@surecart/line-item-details', '@surecart/line-item-note') as $m) wp_dequeue_script_module($m);
  }
}
// Al final de la cola, justo antes de imprimir el <head> y antes de imprimir lo que se encola tarde (en el pie).
add_action('wp_enqueue_scripts', 'gt_trim_assets', 9999);
add_action('wp_head', 'gt_trim_assets', 7);
add_action('wp_footer', 'gt_trim_assets', 1);

/** Sprite de íconos: una vez por página, al abrir el <body> (o al final si el tema no llama a wp_body_open). */
add_action('wp_body_open', 'gt_print_sprite', 1);
add_action('wp_footer', 'gt_print_sprite', 1);
function gt_print_sprite() {
  static $done = false;
  if ($done || !gt_on()) return;
  $done = true;
  echo gt_icon_sprite(); // phpcs:ignore WordPress.Security.EscapeOutput -- SVG fijo del plugin
}

/** Dirección del widget del Banco de Bogotá para cargarlo tarde (ver gt.js). */
add_action('wp_footer', 'gt_bdb_late', 30);
function gt_bdb_late() {
  if (empty($GLOBALS['gt_bdb_src'])) return;
  echo '<script id="gt-bdb" type="application/json">' . wp_json_encode(array('src' => $GLOBALS['gt_bdb_src'])) . '</script>' . PHP_EOL;
}

/** Precarga de la fuente propia (Manrope, servida desde el plugin). */
add_action('wp_head', 'gt_preload_font', 2);
function gt_preload_font() {
  if (!gt_on()) return;
  echo '<link rel="preload" href="' . esc_url(GT_URL . 'assets/fonts/manrope-latin.woff2') . '" as="font" type="font/woff2" crossorigin>' . "\n";
}

/* ---------- Cachés ligeras (se invalidan cuando cambia un producto, su inventario o una categoría) ---------- */

function gt_cache_key($name) {
  return 'gt_' . $name . '_' . GT_VER . '_' . get_option('gt_index_ver', 0);
}

/** Guarda en caché el HTML que imprime $fn durante $ttl segundos. */
function gt_cached_html($name, $ttl, $fn) {
  $key = gt_cache_key($name);
  $html = get_transient($key);
  if (!is_string($html)) {
    ob_start();
    call_user_func($fn);
    $html = ob_get_clean();
    set_transient($key, $html, $ttl);
  }
  echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- HTML generado por el plugin
}

foreach (array('woocommerce_product_set_stock', 'woocommerce_variation_set_stock', 'woocommerce_product_set_stock_status', 'woocommerce_variation_set_stock_status', 'edited_product_cat', 'created_product_cat', 'delete_product_cat') as $gt_hook) {
  add_action($gt_hook, 'gt_flush_index');
}
unset($gt_hook);

/** Los medios de pago se recalculan si cambia la configuración de alguna pasarela. */
add_action('updated_option', 'gt_maybe_flush_pay', 10, 1);
function gt_maybe_flush_pay($name) {
  if (preg_match('/^woocommerce_.+_settings$|^woocommerce_gateway_order$/', (string) $name)) delete_transient('gt_pay_' . GT_VER);
}
