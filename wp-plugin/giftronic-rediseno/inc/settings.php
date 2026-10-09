<?php
/** Ajustes → Rediseño Giftronic. */
if (!defined('ABSPATH')) exit;

function gt_defaults() {
  return array(
    'live'       => 0,
    'home'       => 1,
    'wa'         => '573017913140',
    'email'      => 'info@giftronic04.com',
    'instagram'  => 'https://www.instagram.com/giftronic.04/',
    'facebook'   => 'https://www.facebook.com/102269164857514',
    'hero_id'    => 11208,
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
  return array(
    'live'       => empty($in['live']) ? 0 : 1,
    'home'       => empty($in['home']) ? 0 : 1,
    'wa'         => preg_replace('/\D+/', '', isset($in['wa']) ? $in['wa'] : $d['wa']),
    'email'      => sanitize_email(isset($in['email']) ? $in['email'] : $d['email']),
    'instagram'  => esc_url_raw(isset($in['instagram']) ? $in['instagram'] : ''),
    'facebook'   => esc_url_raw(isset($in['facebook']) ? $in['facebook'] : ''),
    'hero_id'    => absint(isset($in['hero_id']) ? $in['hero_id'] : 0),
    'sliders'    => implode(',', array_filter(array_map('absint', explode(',', isset($in['sliders']) ? (string) $in['sliders'] : '')))),
    'hero_title' => sanitize_text_field(isset($in['hero_title']) ? $in['hero_title'] : $d['hero_title']),
    'hero_sub'   => sanitize_text_field(isset($in['hero_sub']) ? $in['hero_sub'] : $d['hero_sub']),
    'topbar'     => sanitize_textarea_field(isset($in['topbar']) ? $in['topbar'] : $d['topbar']),
  );
}

/** Al publicar o volver a vista previa se vacía la caché de LiteSpeed para que todos vean el cambio. */
add_action('update_option_gt_opts', 'gt_on_opts_saved', 10, 2);
function gt_on_opts_saved($old, $new) {
  $was = is_array($old) && !empty($old['live']);
  $now = is_array($new) && !empty($new['live']);
  if ($was !== $now || (is_array($old) && is_array($new) && $old != $new)) {
    do_action('litespeed_purge_all');
  }
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
        <tr><th scope="row">Portada</th><td>
          <label><input type="checkbox" name="<?php echo esc_attr($f('home')); ?>" value="1" <?php checked($o['home'], 1); ?>> Usar la portada del rediseño (si la desmarcas, se muestra la portada de Elementor con la cabecera y el pie nuevos)</label></td></tr>
        <tr><th scope="row"><label for="gt-hero">Producto destacado de la portada</label></th><td>
          <input id="gt-hero" type="number" min="0" name="<?php echo esc_attr($f('hero_id')); ?>" value="<?php echo esc_attr($o['hero_id']); ?>" class="small-text">
          <?php $hp = ($o['hero_id'] && function_exists('wc_get_product')) ? wc_get_product($o['hero_id']) : null; echo $hp ? ' <span>' . esc_html($hp->get_name()) . '</span>' : ' <span>Sin producto: se elige el más vendido en oferta.</span>'; ?>
          <p class="description">ID del producto (aparece al pasar el mouse en Productos → Todos los productos).</p></td></tr>
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
