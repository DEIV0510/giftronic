<?php
/** Tarjeta de producto en los listados de WooCommerce (reemplaza content-product.php mientras el rediseño está activo). */
defined('ABSPATH') || exit;

global $product;
if (empty($product) || !$product->is_visible()) return;
?>
<li <?php wc_product_class('gt-li', $product); ?>><?php echo gt_card($product, (int) wc_get_loop_prop('loop') <= 4); // phpcs:ignore WordPress.Security.EscapeOutput ?></li>
