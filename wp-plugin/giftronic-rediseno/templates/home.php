<?php
/** Portada del rediseño: todo sale del catálogo real de WooCommerce. */
defined('ABSPATH') || exit;

get_header();
?>
<div class="gt-page gt-homepage">
  <?php gt_cached_html('home_top', 30 * MINUTE_IN_SECONDS, 'gt_home_top'); ?>

  <?php $promos = gt_home_promos(); if ($promos) : ?>
  <section class="gt-promos" aria-label="Promociones"><?php echo $promos; // phpcs:ignore ?></section>
  <?php endif; ?>

  <?php gt_cached_html('home_body', 30 * MINUTE_IN_SECONDS, 'gt_home_body'); ?>
</div>
<?php
get_footer();
