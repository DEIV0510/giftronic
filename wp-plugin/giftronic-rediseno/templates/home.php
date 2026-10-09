<?php
/** Portada del rediseño: todo sale del catálogo real de WooCommerce. */
defined('ABSPATH') || exit;

get_header();

$hero = gt_hero_product();
$size = gt_catalog_size();
$credit = array_values(array_filter(gt_pay_methods(), function ($m) { return in_array($m, array('Addi', 'Sistecrédito', 'SU+ Pay'), true); }));
$instant = array_values(array_filter(gt_pay_methods(), function ($m) { return in_array($m, array('PSE', 'Tarjeta débito y crédito', 'Mercado Pago', 'Wompi'), true); }));
$t_laptops = gt_term(array(30, 'componentes-de-pc-portatiles'));
$t_tv = gt_term(array(86, 'tv'));
$t_pc = gt_term(array(35, 'pc-de-escritorio'));
$t_print = gt_term(array(32, 'impresion'));
$t_tabs = gt_term(array(38, 'tablets-y-accesorios'));
$t_game = gt_term(array(25, 'consolas-y-videojuegos'));
$tiles = array_filter(array(
  array($t_laptops, 'Portátiles'), array($t_tv, 'Televisores'), array(gt_term(array(56, 'all-in-one')), 'All in One'), array(gt_term(array(34, 'monitores-y-accesorios')), 'Monitores'),
  array($t_print, 'Impresoras'), array($t_tabs, 'Tablets'), array($t_game, 'Gaming'), array(gt_term(array(36, 'perifericos-de-pc')), 'Periféricos'),
), function ($x) { return $x[0]; });
?>
<div class="gt-page gt-homepage">

  <div class="gt-wrap gt-hero">
    <div class="gt-hero-card">
      <div class="gt-hero-copy">
        <span class="gt-eyebrow">Estamos a tu servicio</span>
        <h1><?php echo gt_hero_title(); // phpcs:ignore ?></h1>
        <p class="gt-hero-sub"><?php echo esc_html(gt_opt('hero_sub')); ?></p>
        <div class="gt-hero-cta">
          <a class="gt-btn gt-btn-primary gt-btn-lg" href="<?php echo esc_url(gt_offers_url()); ?>">Ver ofertas<?php echo gt_ic('arrow', 18); ?></a>
          <a class="gt-btn gt-btn-secondary gt-btn-lg" href="<?php echo esc_url(gt_shop_url()); ?>">Ver toda la tienda</a>
        </div>
        <ul class="gt-ticks">
          <li><?php echo gt_ic('check', 16); ?>Envío a todo el país</li>
          <?php if ($credit) : ?><li><?php echo gt_ic('check', 16); ?>Pago a cuotas</li><?php endif; ?>
          <li><?php echo gt_ic('check', 16); ?>Asesoría por WhatsApp</li>
        </ul>
      </div>
      <?php if ($hero) : $hp = gt_prices($hero); $hd = gt_pdata($hero); ?>
        <div class="gt-hero-stage">
          <?php echo gt_img($hero, 'woocommerce_single', 'gt-art', true); ?>
          <a class="gt-hero-tag" href="<?php echo esc_url(get_permalink($hero->get_id())); ?>">
            <span class="k">Destacado</span>
            <span class="n"><?php echo esc_html($hd['short']); ?></span>
            <span class="gt-price"><?php echo gt_money($hp['now']); ?></span>
            <?php if ($hp['was']) : ?><span class="f">Antes <s><?php echo gt_money($hp['was']); ?></s></span><span class="o"><span class="gt-badge gt-badge-off">-<?php echo (int) $hp['off']; ?>%</span></span><?php else : ?><span class="f">Ver producto</span><?php endif; ?>
          </a>
        </div>
      <?php endif; ?>
    </div>
    <ul class="gt-trust-list">
      <li><span class="gt-trust-ic"><?php echo gt_ic('truck'); ?></span><div><strong>Envío a toda Colombia</strong><span>El costo se calcula al pagar según tu ciudad</span></div></li>
      <?php if ($credit) : ?><li><span class="gt-trust-ic"><?php echo gt_ic('card'); ?></span><div><strong>Paga a cuotas</strong><span><?php echo esc_html(gt_join($credit)); ?></span></div></li><?php endif; ?>
      <?php if ($instant) : ?><li><span class="gt-trust-ic"><?php echo gt_ic('lock'); ?></span><div><strong>Pago seguro</strong><span><?php echo esc_html(gt_join($instant)); ?></span></div></li><?php endif; ?>
      <li><span class="gt-trust-ic"><?php echo gt_ic('chat'); ?></span><div><strong>Asesoría antes de comprar</strong><span>Te ayudamos a elegir por WhatsApp</span></div></li>
    </ul>
  </div>

  <?php $promos = gt_home_promos(); if ($promos) : ?>
  <section class="gt-promos" aria-label="Promociones"><?php echo $promos; // phpcs:ignore ?></section>
  <?php endif; ?>

  <?php if ($tiles) : ?>
  <section class="gt-wrap gt-sec" aria-label="Compra por categoría">
    <?php echo gt_sec_head('Compra por categoría', $size ? 'Más de ' . number_format($size, 0, ',', '.') . ' productos en la tienda.' : '', gt_shop_url(), 'Ver toda la tienda'); ?>
    <ul class="gt-tiles">
      <?php foreach ($tiles as $tl) : $n = gt_term_total($tl[0]); ?>
        <li class="gt-tile"><a href="<?php echo esc_url(gt_term_link($tl[0])); ?>"><?php echo gt_cat_image($tl[0], 'gt-art'); ?><span><?php echo esc_html($tl[1]); ?><small><?php echo (int) $n; ?> <?php echo $n === 1 ? 'producto' : 'productos'; ?></small></span></a></li>
      <?php endforeach; ?>
    </ul>
  </section>
  <?php endif; ?>

  <?php
  $rails = array(
    array('Ofertas destacadas', 'Los mayores descuentos con existencias.', gt_products(array('on_sale' => true, 'orderby' => 'discount', 'limit' => 12)), gt_offers_url()),
    array('Portátiles', 'Para estudiar, trabajar y jugar.', $t_laptops ? gt_products(array('cat' => array($t_laptops->term_id), 'limit' => 12)) : array(), gt_term_link($t_laptops)),
    array('Televisores y combos', 'Smart TV y combos con barra de sonido.', $t_tv ? gt_products(array('cat' => array($t_tv->term_id), 'limit' => 12)) : array(), gt_term_link($t_tv)),
    array('All in One y PC de escritorio', 'Equipos completos para la casa y la oficina.', $t_pc ? gt_products(array('cat' => array($t_pc->term_id), 'limit' => 12)) : array(), gt_term_link($t_pc)),
  );
  foreach ($rails as $i => $r) :
    if (!$r[2]) continue; ?>
    <section class="gt-wrap gt-sec" aria-label="<?php echo esc_attr($r[0]); ?>">
      <?php echo gt_sec_head($r[0], $r[1], $r[3], 'Ver todo'); ?>
      <?php echo gt_rail($r[2], $r[0]); ?>
    </section>
  <?php endforeach; ?>

  <?php if ($credit) : ?>
  <section class="gt-wrap" aria-labelledby="gt-h-fin">
    <div class="gt-finband">
      <div>
        <h2 id="gt-h-fin">Llévalo hoy, <em>págalo a cuotas</em></h2>
        <p>Al finalizar la compra eliges la financiera y haces la solicitud en línea. Cada entidad define la aprobación, el número de cuotas y sus condiciones.</p>
        <a class="gt-btn gt-btn-primary gt-btn-lg" href="<?php echo esc_url(gt_shop_url()); ?>">Elegir producto<?php echo gt_ic('arrow', 18); ?></a>
      </div>
      <ul class="gt-fin-list">
        <?php foreach ($credit as $c) : ?><li><?php echo esc_html($c); ?> <span>Crédito en línea</span></li><?php endforeach; ?>
        <?php if (in_array('Mercado Pago', gt_pay_methods(), true) || in_array('Tarjeta débito y crédito', gt_pay_methods(), true)) : ?><li>Tarjeta de crédito <span>Difiere con tu banco</span></li><?php endif; ?>
      </ul>
    </div>
  </section>
  <?php endif; ?>

  <?php
  $rails2 = array(
    array('Impresoras', 'Para la casa y la oficina.', $t_print ? gt_products(array('cat' => array($t_print->term_id), 'limit' => 12)) : array(), gt_term_link($t_print)),
    array('Tablets', 'Para estudiar, tomar notas y ver contenido.', $t_tabs ? gt_products(array('cat' => array($t_tabs->term_id), 'limit' => 12)) : array(), gt_term_link($t_tabs)),
    array('Zona gamer', 'Consolas, controles y accesorios.', $t_game ? gt_products(array('cat' => array($t_game->term_id), 'limit' => 12)) : array(), gt_term_link($t_game)),
  );
  foreach ($rails2 as $r) :
    if (!$r[2]) continue; ?>
    <section class="gt-wrap gt-sec" aria-label="<?php echo esc_attr($r[0]); ?>">
      <?php echo gt_sec_head($r[0], $r[1], $r[3], 'Ver todo'); ?>
      <?php echo gt_rail($r[2], $r[0]); ?>
    </section>
  <?php endforeach; ?>

  <?php $revs = gt_home_reviews(3); if ($revs) : ?>
  <section class="gt-wrap gt-sec" aria-label="Opiniones de clientes">
    <?php echo gt_sec_head('Lo que dicen nuestros clientes', 'Opiniones publicadas en las fichas de producto.'); ?>
    <ul class="gt-reviews-home">
      <?php foreach ($revs as $r) : ?>
        <li class="gt-quote">
          <span class="gt-stars" aria-label="5 de 5 estrellas"><?php for ($i = 0; $i < 5; $i++) echo gt_ic('star', 16, 0, 'gt-i on'); ?></span>
          <p>«<?php echo esc_html($r['text']); ?>»</p>
          <footer><span><?php echo esc_html($r['who']); ?><?php echo $r['verified'] ? ' · <b>Compra verificada</b>' : ''; ?></span><a href="<?php echo esc_url($r['url']); ?>"><?php echo esc_html($r['product']); ?></a></footer>
        </li>
      <?php endforeach; ?>
    </ul>
  </section>
  <?php endif; ?>

  <?php $brands = gt_home_brands(12); if (count($brands) >= 4) : ?>
  <section class="gt-wrap gt-sec" aria-label="Marcas">
    <?php echo gt_sec_head('Marcas', 'Busca directo por marca.'); ?>
    <ul class="gt-brands">
      <?php foreach ($brands as $b) : ?><li><a href="<?php echo esc_url(add_query_arg(array('s' => $b, 'post_type' => 'product'), home_url('/'))); ?>"><?php echo esc_html($b); ?></a></li><?php endforeach; ?>
    </ul>
  </section>
  <?php endif; ?>

</div>
<?php
get_footer();
