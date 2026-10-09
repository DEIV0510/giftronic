<?php
/** Tienda, categorías, etiquetas y búsqueda de productos. */
defined('ABSPATH') || exit;

get_header('shop');

global $wp_query;
wc_setup_loop();
$st = gt_filter_state();
$term = is_product_taxonomy() ? get_queried_object() : null;
$q = get_search_query(false);
$offers = !empty($_GET['oferta']) && !$term && $q === '';
if ($q !== '') $title = 'Resultados para «' . $q . '»';
elseif ($term) $title = $term->name;
elseif ($offers) $title = 'Ofertas';
else $title = 'Tienda';
$total = (int) $wp_query->found_posts;
$n_active = count($st['sel']) + (!empty($_GET['disp']) ? 1 : 0) + (!empty($_GET['oferta']) ? 1 : 0) + ((!empty($_GET['min_price']) || !empty($_GET['max_price'])) ? 1 : 0);
$kids = array();
if ($term && $term->taxonomy === 'product_cat') {
  $kids = get_terms(array('taxonomy' => 'product_cat', 'parent' => $term->term_id, 'hide_empty' => true));
  if (is_wp_error($kids)) $kids = array();
}
?>
<div class="gt-page gt-listing">
  <div class="gt-wrap">
    <?php woocommerce_breadcrumb(); ?>
    <header class="gt-page-h">
      <h1><?php echo esc_html($title); ?></h1>
      <?php if ($term && trim($term->description) !== '') : ?>
        <div class="gt-seo" data-seo><?php echo wp_kses_post(wpautop($term->description)); ?><button type="button" class="gt-link" data-seo-more>Leer más</button></div>
      <?php elseif ($offers) : ?>
        <p>Productos con precio rebajado. Los precios y existencias se actualizan con el inventario de la tienda.</p>
      <?php endif; ?>
    </header>

    <?php if ($kids) : ?>
      <nav class="gt-pills" aria-label="Subcategorías">
        <?php foreach ($kids as $k) : ?>
          <a class="gt-pill" href="<?php echo esc_url(gt_term_link($k)); ?>"><?php echo esc_html($k->name); ?> <small><?php echo (int) $k->count; ?></small></a>
        <?php endforeach; ?>
      </nav>
    <?php endif; ?>

    <div class="gt-cat-layout">
      <aside class="gt-filters" id="gt-filters" aria-labelledby="gt-filters-t">
        <div class="gt-filters-h"><h2 id="gt-filters-t">Filtrar</h2><button type="button" class="gt-icon-btn" data-close-filters aria-label="Cerrar filtros"><?php echo gt_ic('x', 22); ?></button></div>
        <div class="gt-filters-b"><?php echo gt_filters_html(); ?></div>
        <div class="gt-filters-f"><button type="button" class="gt-btn gt-btn-primary gt-btn-lg gt-btn-block" data-close-filters>Ver <?php echo (int) $total; ?> productos</button></div>
      </aside>

      <div class="gt-results">
        <div class="gt-toolbar">
          <p class="gt-count-txt"><b><?php echo (int) $total; ?></b> <?php echo $total === 1 ? 'producto' : 'productos'; ?></p>
          <button type="button" class="gt-btn gt-btn-ghost gt-filter-btn" data-open-filters aria-controls="gt-filters" aria-expanded="false"><?php echo gt_ic('sliders', 18); ?>Filtrar<?php echo $n_active ? ' <span class="gt-nf">' . (int) $n_active . '</span>' : ''; ?></button>
          <div class="gt-sort"><span class="gt-sort-l">Ordenar por</span><?php woocommerce_catalog_ordering(); ?></div>
        </div>
        <?php echo gt_active_filters_html(); ?>
        <?php woocommerce_output_all_notices(); ?>

        <?php if (have_posts()) : ?>
          <h2 class="screen-reader-text">Productos</h2>
          <?php
          woocommerce_product_loop_start();
          while (have_posts()) {
            the_post();
            wc_get_template_part('content', 'product');
          }
          woocommerce_product_loop_end();
          ?>
          <div class="gt-pager"><?php woocommerce_pagination(); ?></div>
        <?php else : ?>
          <div class="gt-state">
            <span class="ic"><?php echo gt_ic('search', 28); ?></span>
            <strong><?php echo $n_active ? 'Ningún producto cumple esos filtros' : ($q !== '' ? 'No encontramos «' . esc_html($q) . '»' : 'Aún no hay productos aquí'); ?></strong>
            <p><?php echo $n_active ? 'Quita algún filtro o amplía el rango de precio.' : 'Prueba con otra palabra, por ejemplo la marca o el tipo de producto. También te ayudamos por WhatsApp.'; ?></p>
            <div class="gt-state-cta">
              <?php if ($n_active) : ?><a class="gt-btn gt-btn-dark" href="<?php echo esc_url(remove_query_arg(array('disp', 'oferta', 'min_price', 'max_price', 'marca', 'cpu', 'ram', 'ssd', 'scr', 'gpu', 'res', 'panel', 'os', 'hz', 'ptype', 'paged'))); ?>">Limpiar filtros</a><?php endif; ?>
              <a class="gt-btn gt-btn-ghost" href="<?php echo esc_url(gt_wa('Hola, estoy buscando ' . ($q !== '' ? $q : 'un producto') . ' en Giftronic04.com')); ?>" target="_blank" rel="noopener"><?php echo gt_ic('chat', 18); ?>Preguntar por WhatsApp</a>
            </div>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>
<div class="gt-scrim gt-filters-scrim" data-close-filters hidden></div>
<?php
get_footer('shop');
