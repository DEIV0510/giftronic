<?php
/**
 * Plugin Name:       Giftronic Rediseño
 * Description:       Rediseño de la tienda: cabecera, portada, categorías con filtros, ficha de producto, carrito y pie. Arranca en vista previa (solo administradores); se publica para todos en Ajustes → Rediseño Giftronic. Al desactivarlo la tienda vuelve a verse como antes.
 * Version:           1.0.0
 * Author:            Giftronic04
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Text Domain:       giftronic-rediseno
 */

if (!defined('ABSPATH')) exit;

define('GT_VER', '1.0.0');
define('GT_DIR', plugin_dir_path(__FILE__));
define('GT_URL', plugin_dir_url(__FILE__));

require_once GT_DIR . 'inc/icons.php';
require_once GT_DIR . 'inc/settings.php';
require_once GT_DIR . 'inc/specs.php';
require_once GT_DIR . 'inc/helpers.php';
require_once GT_DIR . 'inc/chrome.php';
require_once GT_DIR . 'inc/shop.php';
require_once GT_DIR . 'inc/product.php';
require_once GT_DIR . 'inc/home.php';

/**
 * ¿Se muestra el rediseño en esta petición?
 * - Vista previa (por defecto): solo administradores.
 * - Publicado: todos los visitantes.
 * Un administrador puede apagarlo para sí mismo desde la barra de admin y comparar con la tienda actual.
 * Se llama desde el hook «wp» o después, cuando WordPress ya sabe quién es el usuario.
 */
function gt_on() {
  static $on = null;
  if ($on !== null) return $on;
  if (is_admin() && !wp_doing_ajax()) return $on = false;
  if (!class_exists('WooCommerce') || !function_exists('WC')) return $on = false;
  if (gt_user_off()) return $on = false;
  if (gt_opt('live')) return $on = true;
  return $on = current_user_can('manage_options');
}

function gt_user_off() {
  return is_user_logged_in() && get_user_meta(get_current_user_id(), 'gt_off', true) === '1';
}

/** Arranque: todo lo visible se engancha solo si gt_on(). */
add_action('wp', 'gt_boot', 5);
function gt_boot() {
  if (!gt_on()) return;

  // En vista previa, que la caché nunca guarde estas páginas.
  if (!gt_opt('live')) do_action('litespeed_control_set_nocache', 'giftronic rediseño en vista previa');

  // Cabecera y pie propios en lugar de los de Header Footer Elementor y Astra.
  add_filter('hfe_header_enabled', '__return_false', 99);
  add_filter('hfe_footer_enabled', '__return_false', 99);
  add_filter('hfe_before_footer_enabled', '__return_false', 99);
  add_action('template_redirect', 'gt_swap_chrome', 99);

  add_filter('body_class', 'gt_body_class');
  add_action('wp_enqueue_scripts', 'gt_assets', 99);
  add_filter('template_include', 'gt_templates', 99);
  add_filter('wc_get_template_part', 'gt_card_template', 99, 3);
  add_filter('woocommerce_price_format', 'gt_price_format', 99, 2);
  add_filter('woocommerce_add_to_cart_fragments', 'gt_fragments');
  add_filter('woocommerce_sale_flash', '__return_empty_string', 99);
  add_filter('woocommerce_show_page_title', '__return_false', 99);
  add_filter('woocommerce_product_loop_start', 'gt_loop_start', 99);
  add_filter('woocommerce_breadcrumb_defaults', 'gt_breadcrumb_defaults', 99);
  add_filter('woocommerce_get_breadcrumb', 'gt_breadcrumb_trim', 99);
  add_filter('woocommerce_pagination_args', 'gt_pagination_args', 99);
  add_filter('woocommerce_output_related_products_args', 'gt_related_args', 99);
}

/** Cambia la cabecera y el pie de Astra por los del rediseño. */
function gt_swap_chrome() {
  remove_all_actions('astra_header');
  remove_all_actions('astra_footer');
  remove_all_actions('astra_masthead_content');
  add_action('astra_header', 'gt_header');
  add_action('astra_footer', 'gt_footer');
  add_action('wp_footer', 'gt_layers', 5);
  // Astra pinta el título de la página y su propio botón de subir: los quitamos en las vistas del rediseño.
  add_filter('astra_the_title_enabled', 'gt_hide_astra_title', 99);
}

function gt_hide_astra_title($on) {
  return (gt_is_shop_view() || is_front_page() || function_exists('is_product') && is_product()) ? false : $on;
}

function gt_body_class($c) {
  $c[] = 'gt';
  if (!gt_opt('live')) $c[] = 'gt-preview';
  if (is_front_page()) $c[] = 'gt-home';
  if (gt_is_shop_view() || is_front_page() || (function_exists('is_product') && is_product())) $c[] = 'gt-full';
  if (function_exists('is_checkout') && is_checkout() && !is_order_received_page()) $c[] = 'gt-checkout';
  if (function_exists('is_product') && is_product()) $c[] = 'gt-pdp-page';
  return $c;
}

/** ¿Estamos en la tienda, una categoría, una etiqueta o una búsqueda de productos? */
function gt_is_shop_view() {
  if (!function_exists('is_shop')) return false;
  return is_shop() || is_product_taxonomy() || (is_search() && get_query_var('post_type') === 'product');
}

/** Plantillas propias para portada, listados y ficha. */
function gt_templates($template) {
  if (is_front_page() && gt_opt('home', 1)) return GT_DIR . 'templates/home.php';
  if (gt_is_shop_view()) return GT_DIR . 'templates/archive-product.php';
  if (function_exists('is_product') && is_product()) return GT_DIR . 'templates/single-product.php';
  return $template;
}

/** Tarjeta de producto propia en todos los listados de WooCommerce. */
function gt_card_template($template, $slug, $name) {
  if ($slug === 'content' && $name === 'product') return GT_DIR . 'templates/content-product.php';
  return $template;
}

/** Precio como «$ 1.234.567». */
function gt_price_format($format, $pos) {
  if ($pos === 'left' || $pos === 'left_space') return '%1$s&nbsp;%2$s';
  return $format;
}

function gt_assets() {
  wp_enqueue_style('gt-font', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap', array(), null);
  wp_enqueue_style('gt', GT_URL . 'assets/gt.css', array(), GT_VER . '.' . filemtime(GT_DIR . 'assets/gt.css'));
  wp_enqueue_script('wc-cart-fragments');
  wp_enqueue_script('wc-add-to-cart');
  wp_enqueue_script('gt', GT_URL . 'assets/gt.js', array('jquery'), GT_VER . '.' . filemtime(GT_DIR . 'assets/gt.js'), true);
  wp_localize_script('gt', 'gtData', array(
    'store'    => esc_url_raw(rest_url('wc/store/v1/products')),
    'search'   => esc_url_raw(add_query_arg(array('post_type' => 'product'), home_url('/'))),
    'cartUrl'  => esc_url_raw(wc_get_cart_url()),
    'coUrl'    => esc_url_raw(wc_get_checkout_url()),
    'wa'       => gt_wa_number(),
  ));
}

function gt_fragments($f) {
  $n = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
  $f['span.gt-cart-count'] = '<span class="gt-count gt-cart-count" data-n="' . (int) $n . '">' . (int) $n . '</span>';
  return $f;
}

/** Barra de administración: estado del rediseño y botón para comparar con la tienda actual. */
add_action('admin_bar_menu', 'gt_admin_bar', 90);
function gt_admin_bar($bar) {
  if (is_admin() || !current_user_can('manage_options')) return;
  $off = gt_user_off();
  $live = gt_opt('live');
  $title = $off ? 'Rediseño: apagado para ti' : ($live ? 'Rediseño: publicado' : 'Rediseño: vista previa');
  $bar->add_node(array('id' => 'gt', 'title' => esc_html($title), 'href' => admin_url('options-general.php?page=gt-rediseno')));
  $bar->add_node(array(
    'parent' => 'gt', 'id' => 'gt-toggle',
    'title'  => $off ? 'Ver el rediseño' : 'Ver la tienda actual (sin rediseño)',
    'href'   => wp_nonce_url(add_query_arg('gt_toggle', '1'), 'gt_toggle'),
  ));
  $bar->add_node(array('parent' => 'gt', 'id' => 'gt-settings', 'title' => 'Ajustes del rediseño', 'href' => admin_url('options-general.php?page=gt-rediseno')));
}

add_action('init', 'gt_handle_toggle');
function gt_handle_toggle() {
  if (empty($_GET['gt_toggle']) || !current_user_can('manage_options')) return;
  check_admin_referer('gt_toggle');
  $uid = get_current_user_id();
  if (get_user_meta($uid, 'gt_off', true) === '1') delete_user_meta($uid, 'gt_off');
  else update_user_meta($uid, 'gt_off', '1');
  wp_safe_redirect(remove_query_arg(array('gt_toggle', '_wpnonce')));
  exit;
}

/** Al guardar o borrar un producto, se recalculan los filtros. */
add_action('save_post_product', 'gt_flush_index');
add_action('woocommerce_product_set_stock_status', 'gt_flush_index');
add_action('delete_post', 'gt_flush_index');
function gt_flush_index() { update_option('gt_index_ver', time(), false); }
