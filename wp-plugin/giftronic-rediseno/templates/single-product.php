<?php
/** Ficha de producto del rediseño. */
defined('ABSPATH') || exit;

get_header('shop');

while (have_posts()) :
  the_post();
  global $product;
  if (!is_a($product, 'WC_Product')) $product = wc_get_product(get_the_ID());
  if (!$product) continue;
  if (post_password_required()) {
    echo '<div class="gt-page"><div class="gt-wrap">' . get_the_password_form() . '</div></div>'; // phpcs:ignore
    continue;
  }
  $post = get_post();
  $p = $product;
  $d = gt_pdata($p);
  $pr = gt_prices($p);
  $out = !$p->is_in_stock();
  $rating = (float) $p->get_average_rating();
  $rc = (int) $p->get_review_count();
  $sku = $p->get_sku();
  $hl = gt_highlights($p);
  $rows = gt_spec_rows($d['kind'], $d['specs'], $d['brand']);
  $short = apply_filters('woocommerce_short_description', $post->post_excerpt);
  $credit = array_values(array_filter(gt_pay_methods(), function ($m) { return in_array($m, array('Addi', 'Sistecrédito', 'SU+ Pay'), true); }));
  $wa_text = 'Hola, quiero comprar: ' . $d['name'] . ' (' . get_permalink() . ')';
  gt_strip_summary_hooks();
  ?>
  <div class="gt-page gt-pdp">
    <div class="gt-wrap">
      <?php do_action('woocommerce_before_single_product'); ?>

      <div id="product-<?php the_ID(); ?>" <?php wc_product_class('gt-pdp-top', $p); ?>>
        <?php echo gt_gallery_html($p); ?>

        <div class="gt-buy">
          <?php woocommerce_breadcrumb(); ?>
          <?php if ($d['brand']) : ?><span class="gt-pdp-brand"><?php echo esc_html($d['brand']); ?></span><?php endif; ?>
          <h1 class="gt-pdp-name product_title entry-title"><?php echo esc_html($d['short']); ?></h1>
          <div class="gt-pdp-meta">
            <?php if ($rc > 0) : ?>
              <a class="gt-rating" href="#gt-reviews"><span class="gt-stars" aria-hidden="true"><?php for ($i = 1; $i <= 5; $i++) echo gt_ic('star', 15, 0, $i <= round($rating) ? 'gt-i on' : 'gt-i'); ?></span><span class="screen-reader-text">Valorado con <?php echo esc_html(number_format_i18n($rating, 1)); ?> de 5.</span><span class="rc"><?php echo $rc === 1 ? '1 opinión' : (int) $rc . ' opiniones'; ?></span></a>
            <?php endif; ?>
            <?php if ($sku) : ?><span class="gt-sku">Ref. <?php echo esc_html($sku); ?></span><?php endif; ?>
          </div>
          <?php if ($d['chips']) : ?>
            <ul class="gt-chips gt-pdp-chips"><?php foreach ($d['chips'] as $c) echo '<li>' . esc_html($c) . '</li>'; ?></ul>
          <?php endif; ?>

          <div class="gt-pbox">
            <?php if ($pr['was']) : ?>
              <div class="gt-p-was"><span>Antes <s><?php echo gt_money($pr['was']); ?></s></span><span class="gt-p-save">Ahorras <?php echo gt_money($pr['was'] - $pr['now']); ?> (-<?php echo (int) $pr['off']; ?>%)</span></div>
            <?php endif; ?>
            <div class="gt-p-cash">
              <?php if ($pr['now'] > 0) : ?>
                <span class="gt-price"><?php echo $pr['from'] ? '<small>Desde</small> ' : ''; echo gt_money($pr['now']); ?></span>
              <?php else : ?>
                <span class="gt-price gt-price-ask">Consultar precio</span>
              <?php endif; ?>
            </div>
            <?php if ($credit && !$out && $pr['now'] > 0) : ?>
              <div class="gt-p-fin"><?php echo gt_ic('card', 18); ?><span>Paga a cuotas con <b><?php echo esc_html(gt_join($credit)); ?></b>. <a href="#gt-financia">Ver opciones</a></span></div>
            <?php endif; ?>
          </div>

          <div class="gt-stock-row"><?php echo gt_stock_html($p, true); ?></div>

          <div class="gt-cartform" id="gt-cartform"><?php woocommerce_template_single_add_to_cart(); ?></div>
          <a class="gt-btn gt-btn-ghost gt-btn-lg gt-btn-block gt-wa-btn" href="<?php echo esc_url(gt_wa($wa_text)); ?>" target="_blank" rel="noopener"><?php echo gt_ic('chat', 20); ?><?php echo $out ? 'Preguntar disponibilidad por WhatsApp' : 'Comprar o asesorarme por WhatsApp'; ?></a>

          <div class="gt-plugins" id="gt-financia">
            <?php do_action('woocommerce_single_product_summary'); ?>
            <div class="gt-pmeta"><?php do_action('woocommerce_product_meta_start'); do_action('woocommerce_product_meta_end'); ?></div>
          </div>

          <ul class="gt-iboxes">
            <?php foreach (gt_trust_boxes() as $b) : ?>
              <li class="gt-ibox"><span class="ic"><?php echo gt_ic($b[0], 20); ?></span><div><strong><?php echo esc_html($b[1]); ?></strong><p><?php echo esc_html($b[2]); ?></p></div></li>
            <?php endforeach; ?>
          </ul>
        </div>
      </div>

      <?php if (count($hl) >= 3) : ?>
        <section class="gt-psec" aria-labelledby="gt-hl-t">
          <div class="gt-psec-h"><div><h2 id="gt-hl-t">Lo más importante</h2></div></div>
          <ul class="gt-hl"><?php foreach ($hl as $h) : ?><li><?php echo gt_ic($h[0], 22); ?><span><?php echo esc_html($h[1]); ?></span><strong><?php echo esc_html($h[2]); ?></strong></li><?php endforeach; ?></ul>
        </section>
      <?php endif; ?>

      <?php if (trim(wp_strip_all_tags($short . $post->post_content, true)) !== '' || has_shortcode($short, 'video')) : ?>
        <section class="gt-psec" aria-labelledby="gt-desc-t">
          <div class="gt-psec-h"><div><h2 id="gt-desc-t">Descripción</h2></div></div>
          <div class="gt-prose gt-desc">
            <?php if (trim($short) !== '') echo '<div class="gt-short">' . $short . '</div>'; // phpcs:ignore ?>
            <?php the_content(); ?>
          </div>
        </section>
      <?php endif; ?>

      <?php if ($rows || $p->has_attributes() || $p->has_weight() || $p->has_dimensions()) : ?>
        <section class="gt-psec" aria-labelledby="gt-spec-t">
          <div class="gt-psec-h"><div><h2 id="gt-spec-t">Especificaciones</h2><p>Referencia completa: <?php echo esc_html($d['name']); ?></p></div></div>
          <div class="gt-spec-wrap">
            <?php if ($rows) : ?>
              <table class="gt-spec-table"><tbody>
                <?php foreach ($rows as $r) : ?><tr><th scope="row"><?php echo esc_html($r[0]); ?></th><td><?php echo esc_html($r[1]); ?></td></tr><?php endforeach; ?>
              </tbody></table>
            <?php endif; ?>
            <?php if ($p->has_attributes() || $p->has_weight() || $p->has_dimensions()) wc_display_product_attributes($p); ?>
          </div>
        </section>
      <?php endif; ?>

      <?php if (comments_open() || $rc > 0) : ?>
        <section class="gt-psec gt-reviews" id="gt-reviews" aria-labelledby="gt-rev-t">
          <div class="gt-psec-h"><div><h2 id="gt-rev-t">Opiniones de clientes</h2>
            <?php if ($rc > 0) : ?><p><?php echo esc_html(number_format_i18n($rating, 1)); ?> de 5 · <?php echo $rc === 1 ? '1 opinión' : (int) $rc . ' opiniones'; ?></p><?php endif; ?>
          </div></div>
          <?php comments_template(); ?>
        </section>
      <?php endif; ?>

      <?php $rel = gt_related_products($p); if ($rel) : ?>
        <section class="gt-psec" aria-labelledby="gt-rel-t">
          <?php echo gt_sec_head('También te puede interesar', '', '', '', 'h2'); ?>
          <?php echo gt_rail($rel, 'Productos relacionados'); ?>
        </section>
      <?php endif; ?>
    </div>
  </div>

  <div class="gt-buybar" data-buybar hidden>
    <div class="gt-bb-p">
      <?php if ($pr['now'] > 0) : ?><span class="gt-price"><?php echo gt_money($pr['now']); ?></span><?php endif; ?>
      <span><?php echo $out ? 'Agotado' : ($pr['off'] ? 'Ahorras ' . (int) $pr['off'] . '%' : 'Envío a toda Colombia'); ?></span>
    </div>
    <?php if ($out) : ?>
      <a class="gt-btn gt-btn-dark" href="<?php echo esc_url(gt_wa($wa_text)); ?>" target="_blank" rel="noopener"><?php echo gt_ic('chat', 18); ?>Preguntar</a>
    <?php else : ?>
      <button type="button" class="gt-btn gt-btn-primary" data-buybar-add><?php echo gt_ic('cart', 18); ?>Agregar al carrito</button>
    <?php endif; ?>
  </div>
  <?php
  do_action('woocommerce_after_single_product');
endwhile;

get_footer('shop');
