<?php
/** Ajustes → Rediseño Giftronic. */
if (!defined('ABSPATH')) exit;

function gt_defaults() {
  return array(
    'live'       => 0,
    'slim'       => 1,
    'home'       => 1,
    'wa'         => '573017913140',
    'email'      => 'info@giftronic04.com',
    'instagram'  => 'https://www.instagram.com/giftronic.04/',
    'facebook'   => 'https://www.facebook.com/102269164857514',
    'hero_id'    => 11208,
    'logo_id'    => 0,
    // Financiación: tasa máxima legal (usura, crédito de consumo) del mes y plazos de cada forma de pago a cuotas
    'fin_rate'   => 28.59,
    'fin_month'  => '2026-10',
    'fin_addi'   => '6,12,18,24',
    'fin_siste'  => '2,3,4,6',
    'fin_sumas'  => '3,6,12,24,36',
    'fin_tc'     => '1,3,6,12,24,36',
    // Precio según el medio de pago (inc/paymethods.php): apagado hasta que el dueño lo active
    'pm_mode'      => 'off',
    'pm_groups'    => gt_pm_default_groups(),
    'pm_map'       => gt_pm_default_map(),
    'pm_skip_sale' => 0,
    'pm_no_coupon' => 0,
    'pm_text'      => 'El descuento se aplica en el pago al elegir el medio.',
    'pm_until'     => '',
    'sliders'    => '7,2',
    'hero_title' => 'Tecnología a cuotas y con envío a toda Colombia',
    'hero_sub'   => 'Portátiles, televisores, impresoras y gaming de Samsung, Lenovo, HP, Acer y más marcas. Paga con PSE, tarjeta o a cuotas con Addi, Sistecrédito o SU+ Pay.',
    'topbar'     => "Envíos a toda Colombia\nPaga a cuotas con Addi, Sistecrédito o SU+ Pay\nAsesoría por WhatsApp antes de comprar",
  );
}

function gt_opts() {
  static $o = null;
  if ($o === null) $o = wp_parse_args((array) get_option('gt_opts', array()), gt_defaults());
  return $o;
}

function gt_opt($k, $def = null) {
  $o = gt_opts();
  return isset($o[$k]) ? $o[$k] : $def;
}

function gt_wa_number() {
  $n = preg_replace('/\D+/', '', (string) gt_opt('wa'));
  return $n ?: '573017913140';
}

add_action('admin_init', 'gt_register_settings');
function gt_register_settings() {
  register_setting('gt', 'gt_opts', array('type' => 'array', 'sanitize_callback' => 'gt_sanitize_opts', 'default' => gt_defaults()));
}

function gt_sanitize_opts($in) {
  $in = (array) $in;
  $d = gt_defaults();
  $prev = (array) get_option('gt_opts', array());
  return array(
    'live'       => empty($in['live']) ? 0 : 1,
    'slim'       => empty($in['slim']) ? 0 : 1,
    'home'       => empty($in['home']) ? 0 : 1,
    'wa'         => preg_replace('/\D+/', '', isset($in['wa']) ? $in['wa'] : $d['wa']),
    'email'      => sanitize_email(isset($in['email']) ? $in['email'] : $d['email']),
    'instagram'  => esc_url_raw(isset($in['instagram']) ? $in['instagram'] : ''),
    'facebook'   => esc_url_raw(isset($in['facebook']) ? $in['facebook'] : ''),
    'hero_id'    => absint(isset($in['hero_id']) ? $in['hero_id'] : 0),
    'logo_id'    => absint(isset($in['logo_id']) ? $in['logo_id'] : 0),
    'fin_rate'   => min(99, max(0.01, (float) str_replace(',', '.', isset($in['fin_rate']) ? (string) $in['fin_rate'] : (string) $d['fin_rate']))),
    'fin_month'  => (isset($in['fin_month']) && preg_match('/^[0-9]{4}-[0-9]{2}$/', (string) $in['fin_month'])) ? (string) $in['fin_month'] : $d['fin_month'],
    'fin_addi'   => gt_sanitize_plazos(isset($in['fin_addi']) ? $in['fin_addi'] : $d['fin_addi']),
    'fin_siste'  => gt_sanitize_plazos(isset($in['fin_siste']) ? $in['fin_siste'] : $d['fin_siste']),
    'fin_sumas'  => gt_sanitize_plazos(isset($in['fin_sumas']) ? $in['fin_sumas'] : $d['fin_sumas']),
    'fin_tc'     => gt_sanitize_plazos(isset($in['fin_tc']) ? $in['fin_tc'] : $d['fin_tc']),
    'pm_mode'      => (isset($in['pm_mode']) && in_array($in['pm_mode'], array('off', 'test', 'live'), true)) ? $in['pm_mode'] : 'off',
    'pm_groups'    => gt_pm_sanitize_groups(isset($in['pm_groups']) ? $in['pm_groups'] : $d['pm_groups'], isset($prev['pm_groups']) ? $prev['pm_groups'] : array()),
    'pm_map'       => gt_pm_keep_map(isset($in['pm_map']) ? $in['pm_map'] : (isset($prev['pm_map']) ? $prev['pm_map'] : $d['pm_map']), isset($prev['pm_map']) ? $prev['pm_map'] : $d['pm_map']),
    'pm_skip_sale' => empty($in['pm_skip_sale']) ? 0 : 1,
    'pm_no_coupon' => empty($in['pm_no_coupon']) ? 0 : 1,
    'pm_text'      => mb_substr(gt_pm_clean_text(isset($in['pm_text']) ? $in['pm_text'] : $d['pm_text']), 0, 140),
    'pm_until'     => gt_pm_sanitize_until(isset($in['pm_until']) ? $in['pm_until'] : ''),
    'sliders'    => implode(',', array_filter(array_map('absint', explode(',', isset($in['sliders']) ? (string) $in['sliders'] : '')))),
    'hero_title' => sanitize_text_field(isset($in['hero_title']) ? $in['hero_title'] : $d['hero_title']),
    'hero_sub'   => sanitize_text_field(isset($in['hero_sub']) ? $in['hero_sub'] : $d['hero_sub']),
    'topbar'     => sanitize_textarea_field(isset($in['topbar']) ? $in['topbar'] : $d['topbar']),
  );
}

function gt_sanitize_plazos($csv) {
  $out = array();
  foreach (explode(',', (string) $csv) as $n) { $n = (int) trim($n); if ($n >= 1 && $n <= 72) $out[$n] = $n; }
  ksort($out);
  return implode(',', $out);
}

/** Al publicar o volver a vista previa se vacía la caché de LiteSpeed para que todos vean el cambio. */
add_action('update_option_gt_opts', 'gt_on_opts_saved', 10, 2);
function gt_on_opts_saved($old, $new) {
  $was = is_array($old) && !empty($old['live']);
  $now = is_array($new) && !empty($new['live']);
  if ($was !== $now || (is_array($old) && is_array($new) && $old != $new)) {
    if (function_exists('gt_flush_index')) gt_flush_index();
    do_action('litespeed_purge_all');
  }
}

add_action('admin_notices', 'gt_fin_rate_notice');
function gt_fin_rate_notice() {
  if (!current_user_can('manage_options') || !gt_opt('live')) return;
  if ((string) gt_opt('fin_month') === wp_date('Y-m')) return;
  echo '<div class="notice notice-warning"><p><strong>Rediseño Giftronic:</strong> actualiza la tasa de usura de este mes para las cuotas aproximadas de las fichas (<a href="' . esc_url(admin_url('options-general.php?page=gt-rediseno')) . '">Ajustes → Rediseño Giftronic</a>). La publica la <a href="https://www.superfinanciera.gov.co/" target="_blank" rel="noopener">Superintendencia Financiera</a>.</p></div>';
}

add_action('admin_menu', 'gt_settings_menu');
function gt_settings_menu() {
  add_options_page('Rediseño Giftronic', 'Rediseño Giftronic', 'manage_options', 'gt-rediseno', 'gt_settings_page');
}

add_filter('plugin_action_links_giftronic-rediseno/giftronic-rediseno.php', 'gt_action_links');
function gt_action_links($links) {
  array_unshift($links, '<a href="' . esc_url(admin_url('options-general.php?page=gt-rediseno')) . '">Ajustes</a>');
  return $links;
}

function gt_settings_page() {
  if (!current_user_can('manage_options')) return;
  $o = gt_opts();
  $f = function ($k) { return 'gt_opts[' . $k . ']'; };
  ?>
  <div class="wrap">
    <h1>Rediseño Giftronic</h1>
    <p style="max-width:760px;font-size:14px">
      <?php if ($o['live']) : ?>
        <strong style="color:#0E7A3E">Publicado:</strong> todos los visitantes ven el rediseño.
      <?php else : ?>
        <strong style="color:#8A4B00">Vista previa:</strong> solo los administradores ven el rediseño; los clientes siguen viendo la tienda actual.
      <?php endif; ?>
      Desde la barra superior de la tienda puedes apagarlo solo para ti y comparar. Si desactivas el plugin, la tienda vuelve a verse exactamente como antes.
    </p>
    <form method="post" action="options.php">
      <?php settings_fields('gt'); ?>
      <table class="form-table" role="presentation">
        <tr><th scope="row">Publicar</th><td>
          <label><input type="checkbox" name="<?php echo esc_attr($f('live')); ?>" value="1" <?php checked($o['live'], 1); ?>> Mostrar el rediseño a todos los visitantes</label>
          <p class="description">Al guardar se vacía la caché de LiteSpeed.</p></td></tr>
        <tr><th scope="row">Optimizar carga</th><td>
          <label><input type="checkbox" name="<?php echo esc_attr($f('slim')); ?>" value="1" <?php checked($o['slim'], 1); ?>> No cargar lo que estas páginas no usan (SureCart en toda la tienda; Elementor, fuentes y galería de WooCommerce en portada, listados y fichas)</label>
          <p class="description">Si algún widget dejara de verse, desmarca esta casilla y avísanos.</p></td></tr>
        <tr><th scope="row">Portada</th><td>
          <label><input type="checkbox" name="<?php echo esc_attr($f('home')); ?>" value="1" <?php checked($o['home'], 1); ?>> Usar la portada del rediseño (si la desmarcas, se muestra la portada de Elementor con la cabecera y el pie nuevos)</label></td></tr>
        <tr><th scope="row"><label for="gt-hero">Producto destacado de la portada</label></th><td>
          <input id="gt-hero" type="number" min="0" name="<?php echo esc_attr($f('hero_id')); ?>" value="<?php echo esc_attr($o['hero_id']); ?>" class="small-text">
          <?php $hp = ($o['hero_id'] && function_exists('wc_get_product')) ? wc_get_product($o['hero_id']) : null; echo $hp ? ' <span>' . esc_html($hp->get_name()) . '</span>' : ' <span>Sin producto: se elige el más vendido en oferta.</span>'; ?>
          <p class="description">ID del producto (aparece al pasar el mouse en Productos → Todos los productos).</p></td></tr>
        <tr><th scope="row"><label for="gt-fr">Tasa para las cuotas aproximadas</label></th><td>
          <input id="gt-fr" type="text" inputmode="decimal" class="small-text" name="<?php echo esc_attr($f('fin_rate')); ?>" value="<?php echo esc_attr(str_replace('.', ',', (string) $o['fin_rate'])); ?>"> % E.A. — mes <input type="month" name="<?php echo esc_attr($f('fin_month')); ?>" value="<?php echo esc_attr($o['fin_month']); ?>">
          <p class="description">Tasa de usura (crédito de consumo) que certifica la Superintendencia Financiera cada mes; es el tope legal que pueden cobrar Addi, Sistecrédito, SU+ Pay y los bancos. Actualízala al comenzar cada mes. Octubre de 2026: 28,59 %.</p></td></tr>
        <tr><th scope="row">Plazos a cuotas</th><td>
          <p><label>Addi <input type="text" class="regular-text" name="<?php echo esc_attr($f('fin_addi')); ?>" value="<?php echo esc_attr($o['fin_addi']); ?>"></label></p>
          <p><label>Sistecrédito <input type="text" class="regular-text" name="<?php echo esc_attr($f('fin_siste')); ?>" value="<?php echo esc_attr($o['fin_siste']); ?>"></label></p>
          <p><label>SU+ Pay <input type="text" class="regular-text" name="<?php echo esc_attr($f('fin_sumas')); ?>" value="<?php echo esc_attr($o['fin_sumas']); ?>"></label></p>
          <p><label>Tarjeta de crédito <input type="text" class="regular-text" name="<?php echo esc_attr($f('fin_tc')); ?>" value="<?php echo esc_attr($o['fin_tc']); ?>"></label></p>
          <p class="description">Números de cuotas separados por coma. Solo se muestran las formas de pago activas en WooCommerce. Vacío = no mostrar esa opción.</p></td></tr>
      </table>
      <h2 id="gt-pm">Precio según el medio de pago</h2>
      <table class="form-table" role="presentation">
        <?php gt_pm_settings_rows($o, $f); ?>
      </table>
      <h2>Portada y contacto</h2>
      <table class="form-table" role="presentation">
        <tr><th scope="row"><label for="gt-lg">Logo (ID de imagen)</label></th><td>
          <input id="gt-lg" type="number" min="0" class="small-text" name="<?php echo esc_attr($f('logo_id')); ?>" value="<?php echo esc_attr($o['logo_id']); ?>">
          <p class="description">0 = el logo oscuro de la cabecera anterior (MOVIL-2). Para cambiarlo, escribe el ID de otra imagen de Medios con fondo negro.</p></td></tr>
        <tr><th scope="row"><label for="gt-sl">Banners de la portada</label></th><td>
          <input id="gt-sl" type="text" class="regular-text" name="<?php echo esc_attr($f('sliders')); ?>" value="<?php echo esc_attr($o['sliders']); ?>">
          <p class="description">ID de los sliders de Smart Slider que se muestran en la portada, separados por coma (los mismos de la portada anterior: 7,2). Déjalo vacío para no mostrarlos.</p></td></tr>
        <tr><th scope="row"><label for="gt-ht">Título de la portada</label></th><td>
          <input id="gt-ht" type="text" class="large-text" name="<?php echo esc_attr($f('hero_title')); ?>" value="<?php echo esc_attr($o['hero_title']); ?>"></td></tr>
        <tr><th scope="row"><label for="gt-hs">Texto de la portada</label></th><td>
          <input id="gt-hs" type="text" class="large-text" name="<?php echo esc_attr($f('hero_sub')); ?>" value="<?php echo esc_attr($o['hero_sub']); ?>"></td></tr>
        <tr><th scope="row"><label for="gt-tb">Barra de anuncios</label></th><td>
          <textarea id="gt-tb" rows="3" class="large-text" name="<?php echo esc_attr($f('topbar')); ?>"><?php echo esc_textarea($o['topbar']); ?></textarea>
          <p class="description">Un mensaje por línea (máximo 3).</p></td></tr>
        <tr><th scope="row"><label for="gt-wa">WhatsApp</label></th><td>
          <input id="gt-wa" type="text" name="<?php echo esc_attr($f('wa')); ?>" value="<?php echo esc_attr($o['wa']); ?>">
          <p class="description">Con indicativo, solo números. Ej.: 573017913140</p></td></tr>
        <tr><th scope="row"><label for="gt-em">Correo</label></th><td>
          <input id="gt-em" type="email" class="regular-text" name="<?php echo esc_attr($f('email')); ?>" value="<?php echo esc_attr($o['email']); ?>"></td></tr>
        <tr><th scope="row"><label for="gt-ig">Instagram</label></th><td>
          <input id="gt-ig" type="url" class="regular-text" name="<?php echo esc_attr($f('instagram')); ?>" value="<?php echo esc_attr($o['instagram']); ?>"></td></tr>
        <tr><th scope="row"><label for="gt-fb">Facebook</label></th><td>
          <input id="gt-fb" type="url" class="regular-text" name="<?php echo esc_attr($f('facebook')); ?>" value="<?php echo esc_attr($o['facebook']); ?>"></td></tr>
      </table>
      <?php submit_button('Guardar cambios'); ?>
    </form>
  </div>
  <?php
}
