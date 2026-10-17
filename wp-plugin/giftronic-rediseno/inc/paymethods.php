<?php
/**
 * Precio según el medio de pago.
 *
 * En Ajustes → Rediseño Giftronic el dueño arma grupos de medios de pago (p. ej. «Transferencia», «Tarjeta o PSE»,
 * «Addi») y le da a cada grupo un % de descuento. La ficha muestra antes de pagar el precio con cada grupo, y el pago
 * cobra ese descuento de verdad: una línea de descuento (fee negativo) según la pasarela elegida.
 * Cada producto puede usar los porcentajes generales, no tener descuento o tener los suyos (pestaña General del producto).
 *
 * Siempre es un DESCUENTO sobre el precio del producto, nunca un recargo: la SIC acepta descuentos condicionados a la
 * forma de pago y el precio anunciado es el máximo que se puede cobrar.
 *
 * Es lógica de precios, no de diseño: el descuento en el pago funciona aunque alguien tenga el rediseño apagado.
 * Modos: «off» (como antes), «test» (solo administradores lo ven y lo reciben) y «live» (todos). Puede tener fecha de fin.
 */
if (!defined('ABSPATH')) exit;

/** Casillas fijas de grupos: los productos con descuentos propios se guardan por casilla, así no se desordenan. */
function gt_pm_slots() {
  return array('g1', 'g2', 'g3', 'g4', 'g5', 'g6');
}

/** Pasarelas de financiación: con ellas no se dice «un solo pago». */
function gt_pm_credit_gateways() {
  return array('addi', 'wcsistecredito', 'sumas_pay');
}

/**
 * Pasarelas cuyo cobro con el descuento no está verificado en su código. Revisado el 2026-10-17: Mercado Pago, Wompi, Addi
 * y Payvalida cobran el total del pedido; Sistecrédito, $order->get_total(); SU+ Pay, WC()->cart->total. Todas incluyen el fee.
 */
function gt_pm_unverified_gateways() {
  return array();
}

function gt_pm_mode() {
  $m = (string) gt_opt('pm_mode', 'off');
  return in_array($m, array('test', 'live'), true) ? $m : 'off';
}

/** Fecha de fin (AAAA-MM-DD) o '' si no tiene. */
function gt_pm_until() {
  $u = (string) gt_opt('pm_until', '');
  return preg_match('/^\d{4}-\d{2}-\d{2}$/', $u) ? $u : '';
}

function gt_pm_expired() {
  $u = gt_pm_until();
  return $u !== '' && wp_date('Y-m-d') > $u;
}

/** ¿Esta petición ve y recibe los precios por medio de pago? */
function gt_pm_on() {
  $m = gt_pm_mode();
  if ($m === 'off' || gt_pm_expired()) return false;
  if ($m === 'live') return true;
  return did_action('init') && current_user_can('manage_options');
}

/**
 * Descuento en pesos para un precio y un %. Cuenta con enteros (el % se guarda con 2 decimales → centésimas),
 * así da exactamente lo mismo aquí, en gt.js y en cualquier versión de PHP. Redondea al peso, la mitad hacia arriba.
 */
function gt_pm_cut($price, $pct) {
  $bp = (int) round((float) $pct * 100);
  $p = (int) round((float) $price);
  return ($bp > 0 && $p > 0) ? intdiv($p * $bp + 5000, 10000) : 0;
}

/** Porcentaje con coma y sin ceros de más: 5 / 7,5 */
function gt_pm_pct_label($pct) {
  return rtrim(rtrim(number_format((float) $pct, 2, ',', '.'), '0'), ',');
}

/** Aviso que acompaña los precios (el texto de los ajustes y, si hay, la fecha de fin). */
function gt_pm_terms() {
  $t = trim((string) gt_opt('pm_text'));
  $u = gt_pm_until();
  if ($u !== '') $t .= ($t !== '' ? ' ' : '') . 'Vigente hasta el ' . date_i18n('j \d\e F \d\e Y', strtotime($u . ' 12:00:00')) . '.';
  return $t;
}

/** Grupos con nombre según los ajustes (aunque sus medios estén inactivos): slot => [slot, name, note, pct]. */
function gt_pm_named_groups() {
  $groups = (array) gt_opt('pm_groups', array());
  $out = array();
  foreach (gt_pm_slots() as $s) {
    $g = isset($groups[$s]) ? (array) $groups[$s] : array();
    $name = isset($g['name']) ? trim((string) $g['name']) : '';
    if ($name === '') continue;
    $out[$s] = array(
      'slot' => $s,
      'name' => $name,
      'note' => isset($g['note']) ? trim((string) $g['note']) : '',
      'pct'  => isset($g['pct']) ? max(0, min(90, (float) $g['pct'])) : 0,
    );
  }
  return $out;
}

/** Pasarelas activas en este momento (sin caché): para el cobro, que no puede depender de una lista guardada. */
function gt_pay_gateways_live() {
  $out = array();
  if (function_exists('WC') && WC()->payment_gateways()) {
    foreach (WC()->payment_gateways()->payment_gateways() as $id => $g) {
      if (isset($g->enabled) && $g->enabled === 'yes') $out[$id] = $id;
    }
  }
  return $out;
}

/**
 * Grupos con nombre y al menos un medio de pago activo, en el orden de los ajustes:
 * slot => [slot, name, note, pct, gws => [id => nombre corto]]. $live = lista de pasarelas sin caché (para el pago).
 */
function gt_pm_groups($live = false) {
  static $memo = array();
  $k = $live ? 'live' : 'shown';
  if (isset($memo[$k])) return $memo[$k];
  $map = (array) gt_opt('pm_map', array());
  $shown = gt_pay_gateways();
  $active = $live ? gt_pay_gateways_live() : $shown;
  $out = array();
  foreach (gt_pm_named_groups() as $s => $g) {
    $gws = array();
    foreach ($map as $id => $slot) {
      if ($slot === $s && isset($active[$id])) $gws[$id] = isset($shown[$id]) ? $shown[$id] : $id;
    }
    if ($gws) $out[$s] = $g + array('gws' => $gws);
  }
  return $memo[$k] = $out;
}

/** Grupo de una pasarela ('' si no está en ninguno). */
function gt_pm_slot_of($gateway_id, $live = false) {
  foreach (gt_pm_groups($live) as $s => $g) {
    if (isset($g['gws'][$gateway_id])) return $s;
  }
  return '';
}

/** Grupo del primero de estos medios que esté en algún grupo (sirve para las pestañas de cuotas). */
function gt_pm_slot_of_any($gateway_ids) {
  foreach ((array) $gateway_ids as $id) {
    $s = gt_pm_slot_of($id);
    if ($s !== '') return $s;
  }
  return '';
}

/** % de cada grupo para un producto (el padre en las variaciones): generales, ninguno o propios. */
function gt_pm_pcts($product) {
  $out = array();
  if (!$product) return $out;
  $pid = $product->get_parent_id() ? $product->get_parent_id() : $product->get_id();
  $mode = (string) get_post_meta($pid, '_gt_pm_mode', true);
  $own = $mode === 'custom' ? (array) get_post_meta($pid, '_gt_pm_pct', true) : array();
  foreach (gt_pm_named_groups() as $s => $g) {
    if ($mode === 'none') { $out[$s] = 0; continue; }
    $out[$s] = ($mode === 'custom' && isset($own[$s]) && $own[$s] !== '') ? max(0, min(90, (float) $own[$s])) : $g['pct'];
  }
  return $out;
}

/** ¿Este producto (o variación del carrito) queda sin descuento por estar en oferta? */
function gt_pm_skips_sale($product) {
  return gt_opt('pm_skip_sale') && $product && $product->is_on_sale();
}

/**
 * Para mostrar: ¿está en oferta lo que se ve? En un producto variable manda la variación del precio «Desde»:
 * si alguna de las más baratas no está en oferta, el pago le da el descuento, así que la ficha también lo muestra.
 */
function gt_pm_display_on_sale($product) {
  if (!$product) return false;
  if (!$product->is_type('variable')) return $product->is_on_sale();
  $pr = $product->get_variation_prices(true);
  if (empty($pr['price'])) return false;
  $min = min(array_map('floatval', $pr['price']));
  foreach ($pr['price'] as $vid => $price) {
    if ((float) $price !== $min) continue;
    $reg = isset($pr['regular_price'][$vid]) ? (float) $pr['regular_price'][$vid] : (float) $price;
    if ($reg <= (float) $price) return false;
  }
  return true;
}

/**
 * Precio con cada grupo para un producto y el precio que se muestra:
 * slot => grupo + [eff (% aplicado), price, save]. Vacío si la función está apagada para esta petición.
 */
function gt_pm_rows($product, $price) {
  if (!gt_pm_on() || $price <= 0 || !$product) return array();
  $pcts = gt_pm_pcts($product);
  $skip = gt_opt('pm_skip_sale') && gt_pm_display_on_sale($product);
  $out = array();
  foreach (gt_pm_groups() as $s => $g) {
    $eff = $skip ? 0 : (isset($pcts[$s]) ? $pcts[$s] : 0);
    $cut = gt_pm_cut($price, $eff);
    $out[$s] = $g + array('eff' => $eff, 'price' => $price - $cut, 'save' => $cut);
  }
  return $out;
}

/** El grupo que más ahorra (o null si ninguno tiene descuento). */
function gt_pm_best($rows) {
  $best = null;
  foreach ($rows as $r) {
    if ($r['save'] > 0 && (!$best || $r['save'] > $best['save'])) $best = $r;
  }
  return $best;
}

/** ¿Algún grupo mostrado tiene % para este producto (sin mirar ofertas)? Entonces gt.js puede necesitar el recuadro. */
function gt_pm_any_pct($product) {
  $pcts = gt_pm_pcts($product);
  foreach (gt_pm_groups() as $s => $g) {
    if (!empty($pcts[$s])) return true;
  }
  return false;
}

/**
 * Datos para gt.js (variaciones): % de cada grupo en centésimas (sin mirar ofertas), su nombre,
 * y si los productos en oferta se quedan sin descuento (eso se decide con el precio de la variación elegida).
 */
function gt_pm_js_data($product) {
  $g = array();
  $pcts = gt_pm_pcts($product);
  foreach (gt_pm_groups() as $s => $grp) $g[] = array('s' => $s, 'bp' => (int) round((isset($pcts[$s]) ? $pcts[$s] : 0) * 100), 'name' => $grp['name']);
  return array('g' => $g, 'skipSale' => (bool) gt_opt('pm_skip_sale'));
}

/** JSON seguro dentro de un atributo o de un <script>: sin < > & ' " literales. */
function gt_pm_json($data) {
  return wp_json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
}

/** Línea de la tarjeta: «o $ X con Transferencia» («o desde» en productos con varios precios). Solo si algún medio tiene descuento. */
function gt_pm_card_line($product, $price, $from = false) {
  $best = gt_pm_best(gt_pm_rows($product, $price));
  if (!$best) return '';
  return '<span class="gt-fin gt-pm-line">o ' . ($from ? 'desde ' : '') . '<b>' . gt_money($best['price']) . '</b> con ' . esc_html($best['name']) . '</span>';
}

/**
 * Producto variable cuyo precio «Desde» no tiene descuento (está en oferta y las ofertas no llevan descuento por medio
 * de pago) pero alguna otra versión sí lo tiene: entonces no se puede decir «el mismo precio con todos los medios».
 */
function gt_pm_some_variation_saves($product) {
  if (!$product || !$product->is_type('variable') || !gt_pm_on() || !gt_pm_any_pct($product)) return false;
  if (!gt_opt('pm_skip_sale')) return false;
  $pr = $product->get_variation_prices(true);
  foreach ((array) (isset($pr['price']) ? $pr['price'] : array()) as $vid => $price) {
    $reg = isset($pr['regular_price'][$vid]) ? (float) $pr['regular_price'][$vid] : (float) $price;
    if ($reg <= (float) $price) return true;
  }
  return false;
}

/**
 * Recuadro de precio de la ficha: el mejor precio por medio de pago y cuánto se ahorra.
 * Se imprime (oculto) aunque al cargar no haya ahorro, para que gt.js lo muestre si una variación sí lo tiene.
 */
function gt_pm_pbox_line($product, $price, $from = false) {
  if (!gt_pm_on() || $price <= 0 || !gt_pm_any_pct($product)) return '';
  $best = gt_pm_best(gt_pm_rows($product, $price));
  return '<div class="gt-p-pm" data-pm-best' . ($best ? '' : ' hidden') . '>'
    . '<span class="v">' . ($from ? '<small data-pm-from>Desde </small>' : '') . '<b data-pm-best-price>' . ($best ? gt_money($best['price']) : '') . '</b> con <span data-pm-best-name>' . ($best ? esc_html($best['name']) : '') . '</span></span>'
    . '<span class="s">Ahorras <span data-pm-best-save>' . ($best ? gt_money($best['save']) : '') . '</span> · <a href="#gt-cuotas">Precio con cada medio de pago</a></span>'
    . '</div>';
}

/* ---------- Pago: descuento según la pasarela elegida ---------- */

/** Pasarela elegida en el pago (la sesión la guarda en cada actualización del resumen y al enviar el pedido). */
function gt_pm_chosen_gateway() {
  return (function_exists('WC') && WC()->session) ? (string) WC()->session->get('chosen_payment_method') : '';
}

/** Nombre de la línea de descuento (se usa también para reconocerla en el pedido). */
function gt_pm_fee_name($slot, $eff) {
  $g = gt_pm_named_groups();
  $name = isset($g[$slot]) ? $g[$slot]['name'] : '';
  return 'Descuento por pagar con ' . $name . ($eff ? ' (' . gt_pm_pct_label($eff) . ' %)' : '');
}

function gt_pm_is_fee_name($name) {
  return strpos((string) $name, 'Descuento por pagar con ') === 0;
}

/**
 * Descuento de una lista de líneas con un grupo: [pesos, % si todos llevan el mismo, si no null].
 * Cada línea: [producto, cantidad, total de la línea después de cupones]. Por unidad y con el mismo redondeo que la ficha.
 */
function gt_pm_lines_cut($lines, $slot) {
  $cut = 0;
  $pcts = array();
  foreach ($lines as $l) {
    list($p, $qty, $line) = $l;
    $qty = max(1, (int) $qty);
    $all = gt_pm_pcts($p); // las variaciones toman los % del producto padre
    $pct = (gt_pm_skips_sale($p) || !isset($all[$slot])) ? 0 : $all[$slot];
    $cut += gt_pm_cut((float) $line / $qty, $pct) * $qty;
    $pcts[(string) $pct] = true;
  }
  return array($cut, count($pcts) === 1 ? (float) key($pcts) : null);
}

/** Descuento del carrito con un grupo. */
function gt_pm_cart_cut($cart, $slot) {
  if (!$cart || $slot === '') return array(0, null);
  if (gt_opt('pm_no_coupon') && $cart->get_applied_coupons()) return array(0, null);
  $lines = array();
  foreach ($cart->get_cart() as $item) {
    if (empty($item['data']) || !is_a($item['data'], 'WC_Product')) continue;
    $qty = max(1, (int) $item['quantity']);
    $lines[] = array($item['data'], $qty, isset($item['line_total']) ? (float) $item['line_total'] : (float) $item['data']->get_price() * $qty);
  }
  return gt_pm_lines_cut($lines, $slot);
}

/** Descuento de un pedido ya creado con un grupo (para «Pagar pedido»). */
function gt_pm_order_cut($order, $slot) {
  if ($slot === '') return array(0, null);
  if (gt_opt('pm_no_coupon') && $order->get_coupon_codes()) return array(0, null);
  $lines = array();
  foreach ($order->get_items() as $item) {
    $p = $item->get_product();
    if (!$p) continue;
    $lines[] = array($p, $item->get_quantity(), (float) $item->get_total());
  }
  return gt_pm_lines_cut($lines, $slot);
}

/** Suma (en positivo) de las líneas de descuento por medio de pago de un pedido. */
function gt_pm_order_fee_total($order) {
  $t = 0;
  foreach ($order->get_fees() as $fee) {
    if ($fee->get_meta('_gt_pm_fee') || gt_pm_is_fee_name($fee->get_name())) $t += -(float) $fee->get_total();
  }
  return $t;
}

add_action('woocommerce_cart_calculate_fees', 'gt_pm_cart_fee', 20);
function gt_pm_cart_fee($cart) {
  if ((is_admin() && !wp_doing_ajax()) || !gt_pm_on() || !function_exists('is_checkout') || !is_checkout()) return;
  $slot = gt_pm_slot_of(gt_pm_chosen_gateway(), true);
  if ($slot === '') return;
  list($cut, $eff) = gt_pm_cart_cut($cart, $slot);
  if ($cut > 0) $cart->add_fee(gt_pm_fee_name($slot, $eff), -$cut, true);
}

/** La línea de descuento queda marcada en el pedido para reconocerla después. */
add_action('woocommerce_checkout_create_order_fee_item', 'gt_pm_mark_fee_item', 10, 4);
function gt_pm_mark_fee_item($item, $fee_key, $fee, $order) {
  if (isset($fee->name) && gt_pm_is_fee_name($fee->name)) $item->add_meta_data('_gt_pm_fee', 1, true);
}

/** Queda registrado en el pedido el grupo, la pasarela, el % y el descuento (también si fue 0). */
add_action('woocommerce_checkout_create_order', 'gt_pm_order_meta', 20, 2);
function gt_pm_order_meta($order, $data) {
  if (!gt_pm_on()) return;
  $gw = isset($data['payment_method']) ? (string) $data['payment_method'] : '';
  $slot = gt_pm_slot_of($gw, true);
  list($cut, $eff) = gt_pm_cart_cut(WC()->cart, $slot);
  $g = gt_pm_named_groups();
  $order->update_meta_data('_gt_pm', array('slot' => $slot, 'group' => isset($g[$slot]) ? $g[$slot]['name'] : '', 'gateway' => $gw, 'discount' => $cut, 'pct' => $eff));
}

/**
 * «Pagar pedido» (pedido pendiente o fallido): si el cliente elige un medio de otro grupo, se rehace la línea de descuento
 * con ese medio antes de cobrar. Si es del mismo grupo no se toca nada: se cobra el total que el cliente está viendo.
 */
add_action('woocommerce_before_pay_action', 'gt_pm_order_pay_recalc', 10, 1);
function gt_pm_order_pay_recalc($order) {
  if (!is_a($order, 'WC_Order')) return;
  // Solo pedidos que salieron del pago con esta función (los hechos a mano o por otro canal no se tocan).
  $meta = $order->get_meta('_gt_pm');
  if (!is_array($meta) || !array_key_exists('slot', $meta)) return;
  $on = gt_pm_on();
  // Con la función apagada o vencida solo se quita un descuento que ya no corresponde; nunca se agrega uno.
  if (!$on && gt_pm_order_fee_total($order) <= 0) return;
  // WooCommerce cancela el pago si faltan los términos: entonces no se toca el pedido.
  if (!empty($_POST['terms-field']) && empty($_POST['terms'])) return; // phpcs:ignore WordPress.Security.NonceVerification -- WooCommerce ya validó el nonce de «Pagar pedido»
  $gw = isset($_POST['payment_method']) ? wc_clean(wp_unslash($_POST['payment_method'])) : ''; // phpcs:ignore WordPress.Security.NonceVerification
  $avail = WC()->payment_gateways()->get_available_payment_gateways();
  if ($gw === '' || !isset($avail[$gw])) return;
  $old = (string) $meta['slot'];
  $new = gt_pm_slot_of($gw, true);
  if ($new === $old) return;
  foreach ($order->get_fees() as $id => $fee) {
    if ($fee->get_meta('_gt_pm_fee') || gt_pm_is_fee_name($fee->get_name())) $order->remove_item($id);
  }
  list($cut, $eff) = $on ? gt_pm_order_cut($order, $new) : array(0, null);
  if ($cut > 0) {
    $fee = new WC_Order_Item_Fee();
    $fee->set_name(gt_pm_fee_name($new, $eff));
    $fee->set_amount(-$cut);
    $fee->set_total(-$cut);
    $fee->set_tax_status('taxable');
    $fee->add_meta_data('_gt_pm_fee', 1, true);
    $order->add_item($fee);
  }
  $g = gt_pm_named_groups();
  $order->update_meta_data('_gt_pm', array('slot' => $new, 'group' => isset($g[$new]) ? $g[$new]['name'] : '', 'gateway' => $gw, 'discount' => $cut, 'pct' => $eff));
  $order->calculate_totals(wc_tax_enabled());
  $order->add_order_note('Precio según el medio de pago: el cliente cambió a «' . $gw . '» al pagar el pedido; descuento ' . ($cut > 0 ? 'de ' . gt_pm_plain_money($cut) : 'quitado' . ($on ? '' : ' (función apagada o vencida)')) . '.');
}

/** Pasarelas que cobran el total del CARRITO y no el del pedido: en «Pagar pedido» cobrarían otro monto. */
function gt_pm_cart_total_gateways() {
  return array('sumas_pay');
}

add_filter('woocommerce_available_payment_gateways', 'gt_pm_order_pay_gateways', 20);
function gt_pm_order_pay_gateways($gws) {
  if (is_admin() || !is_array($gws) || !gt_pm_on() || !function_exists('is_wc_endpoint_url') || !is_wc_endpoint_url('order-pay')) return $gws;
  foreach (gt_pm_cart_total_gateways() as $id) unset($gws[$id]);
  return $gws;
}

/** Texto plano de un precio (sin entidades HTML), para mostrarlo con textContent. */
function gt_pm_plain_money($n) {
  return html_entity_decode(wp_strip_all_tags(gt_money($n)), ENT_QUOTES, 'UTF-8');
}

/** En el pago: cuánto ahorra cada medio con este carrito (lo lee el script de abajo para marcar cada opción). */
add_action('woocommerce_review_order_before_submit', 'gt_pm_checkout_data');
function gt_pm_checkout_data() {
  if (!gt_pm_on() || !WC()->cart) return;
  $tags = array();
  foreach (gt_pm_groups(true) as $s => $g) {
    list($cut) = gt_pm_cart_cut(WC()->cart, $s);
    if ($cut <= 0) continue;
    foreach ($g['gws'] as $id => $label) $tags[$id] = 'Ahorras ' . gt_pm_plain_money($cut);
  }
  echo '<script type="application/json" id="gt-pm-data">' . gt_pm_json(array('chosen' => gt_pm_chosen_gateway(), 'tags' => $tags)) . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput
}

/** En «Pagar pedido»: el total con cada medio, porque elegir otro grupo cambia el descuento al pagar. */
add_action('woocommerce_pay_order_before_submit', 'gt_pm_order_pay_data');
function gt_pm_order_pay_data() {
  $order = wc_get_order(absint(get_query_var('order-pay')));
  if (!$order) return;
  $meta = $order->get_meta('_gt_pm');
  if (!is_array($meta) || !array_key_exists('slot', $meta)) return;
  $on = gt_pm_on();
  if (!$on && gt_pm_order_fee_total($order) <= 0) return;
  $old = (string) $meta['slot'];
  // Total sin el descuento actual (con su parte de impuesto, si la hay) y proporción de impuesto de los productos.
  $base = (float) $order->get_total();
  foreach ($order->get_fees() as $fee) {
    if ($fee->get_meta('_gt_pm_fee') || gt_pm_is_fee_name($fee->get_name())) $base -= (float) $fee->get_total() + (float) $fee->get_total_tax();
  }
  $net = 0; $tax = 0;
  foreach ($order->get_items() as $item) { $net += (float) $item->get_total(); $tax += (float) $item->get_total_tax(); }
  $ratio = $net > 0 ? ($net + $tax) / $net : 1;
  $tags = array();
  foreach (WC()->payment_gateways()->get_available_payment_gateways() as $id => $gw) {
    $slot = gt_pm_slot_of($id, true);
    if ($slot === $old) continue;
    list($cut) = $on ? gt_pm_order_cut($order, $slot) : array(0);
    $tags[$id] = 'Total con este medio: ' . gt_pm_plain_money(round($base - $cut * $ratio));
  }
  if ($tags) echo '<script type="application/json" id="gt-pm-data">' . gt_pm_json(array('chosen' => '', 'tags' => $tags, 'pay' => true)) . '</script>'; // phpcs:ignore WordPress.Security.EscapeOutput
}

/** ¿Esta página del pago necesita el script y el estilo de las etiquetas? («Pagar pedido» también con la función apagada.) */
function gt_pm_checkout_assets_needed() {
  if (!function_exists('is_checkout') || !is_checkout() || is_order_received_page()) return false;
  return gt_pm_on() || is_wc_endpoint_url('order-pay');
}

/**
 * El checkout clásico no recalcula al cambiar de medio de pago: se pide el recálculo cuando el cliente cambia de medio,
 * para que el descuento aparezca en el resumen antes de «Realizar el pedido». Solo con el cambio del cliente («change»):
 * los clics que WooCommerce hace solo tras cada recálculo no lo disparan, así no hay bucles.
 */
add_action('wp_enqueue_scripts', 'gt_pm_checkout_script', 100);
function gt_pm_checkout_script() {
  if (!gt_pm_checkout_assets_needed()) return;
  if (!wp_script_is('wc-checkout', 'enqueued') && !wp_script_is('wc-checkout', 'registered')) return;
  $js = <<<'JS'
(function ($) {
  if (!$) return;
  var last = null, synced = false;
  var checked = function () { return $('input[name="payment_method"]:checked').val() || ''; };
  var tag = function () {
    var el = document.getElementById('gt-pm-data');
    if (!el) return null;
    var d;
    try { d = JSON.parse(el.textContent); } catch (e) { return null; }
    $.each(d.tags || {}, function (id, txt) {
      var $label = $('li.payment_method_' + String(id).replace(/[^A-Za-z0-9_-]/g, '')).children('label').first();
      if ($label.length && !$label.find('.gt-pm-tag').length) $label.append(' ', $('<span class="gt-pm-tag"></span>').text(txt));
    });
    return d;
  };
  $(document.body).on('updated_checkout', function () {
    last = checked();
    var d = tag();
    // Primera carga (o tras un cambio del cliente): si el resumen se calculó con otro medio que el marcado, se recalcula una sola vez.
    if (d && !d.pay && !synced && last && d.chosen !== last) { synced = true; $(document.body).trigger('update_checkout'); }
  });
  $(document.body).on('change', 'input[name="payment_method"]', function () {
    var v = checked();
    if (v && v !== last) { last = v; synced = false; $(document.body).trigger('update_checkout'); }
  });
  $(function () { if ($('#gt-pm-data').length) tag(); });
})(window.jQuery);
JS;
  wp_add_inline_script('wc-checkout', $js);
}

add_action('wp_head', 'gt_pm_checkout_style', 30);
function gt_pm_checkout_style() {
  if (!gt_pm_checkout_assets_needed()) return;
  echo '<style id="gt-pm-css">.gt-pm-tag{display:inline-block;margin-left:6px;padding:2px 7px;background:#E8F6EE;color:#0E7A3E;font-size:12px;font-weight:700;line-height:1.4;vertical-align:middle;white-space:nowrap}</style>' . "\n";
}

/** En el carrito: cuánto se puede ahorrar según el medio de pago (se aplica en el pago). */
add_action('woocommerce_cart_totals_after_order_total', 'gt_pm_cart_hint');
function gt_pm_cart_hint() {
  if (!gt_pm_on() || !WC()->cart) return;
  $best = null;
  foreach (gt_pm_groups(true) as $s => $g) {
    list($cut) = gt_pm_cart_cut(WC()->cart, $s);
    if ($cut > 0 && (!$best || $cut > $best[0])) $best = array($cut, $g['name']);
  }
  if (!$best) return;
  echo '<tr class="gt-pm-cart"><th>Según el medio de pago</th><td data-title="Según el medio de pago">Ahorras hasta ' . gt_money($best[0]) . ' pagando con ' . esc_html($best[1]) . '. ' . esc_html(gt_pm_terms()) . '</td></tr>'; // phpcs:ignore WordPress.Security.EscapeOutput
}

/* ---------- Producto: usar los % generales, ninguno o propios ---------- */

add_action('woocommerce_product_options_general_product_data', 'gt_pm_product_fields');
function gt_pm_product_fields() {
  global $post;
  $groups = (array) gt_opt('pm_groups', array());
  $mode = (string) get_post_meta($post->ID, '_gt_pm_mode', true);
  $own = (array) get_post_meta($post->ID, '_gt_pm_pct', true);
  echo '<div class="options_group gt-pm-product">';
  woocommerce_wp_select(array(
    'id'          => '_gt_pm_mode',
    'label'       => 'Precio según medio de pago',
    'value'       => $mode,
    'options'     => array('' => 'Usar los descuentos generales', 'none' => 'Sin descuento por medio de pago', 'custom' => 'Descuentos propios de este producto'),
    'desc_tip'    => true,
    'description' => 'Los descuentos generales se definen en Ajustes → Rediseño Giftronic. «Propios»: deja vacío un medio para usar el general.',
  ));
  foreach (gt_pm_slots() as $s) {
    $name = isset($groups[$s]['name']) ? trim((string) $groups[$s]['name']) : '';
    if ($name === '') continue;
    $gen = isset($groups[$s]['pct']) ? (float) $groups[$s]['pct'] : 0;
    woocommerce_wp_text_input(array(
      'id'                => '_gt_pm_pct_' . $s,
      'name'              => '_gt_pm_pct[' . $s . ']',
      'label'             => 'Descuento ' . $name . ' (%)',
      'value'             => isset($own[$s]) ? str_replace('.', ',', (string) $own[$s]) : '',
      'placeholder'       => 'General: ' . gt_pm_pct_label($gen),
      'custom_attributes' => array('inputmode' => 'decimal'),
      'wrapper_class'     => 'gt-pm-own',
    ));
  }
  echo '</div>';
  // Los % propios solo se muestran con «Descuentos propios de este producto».
  echo '<script>jQuery(function($){var s=$("#_gt_pm_mode"),f=function(){$(".gt-pm-own").toggle(s.val()==="custom");};s.on("change",f);f();});</script>';
}

/** «5», «5,5», «5 %» o «5%» → 5.5; '' si no es un número. */
function gt_pm_parse_pct($v) {
  $v = trim(str_replace(array(',', '%', ' ', "\xC2\xA0"), array('.', '', '', ''), (string) $v));
  return ($v !== '' && is_numeric($v)) ? max(0, min(90, round((float) $v, 2))) : '';
}

add_action('woocommerce_admin_process_product_object', 'gt_pm_product_save');
function gt_pm_product_save($product) {
  // WooCommerce ya validó el nonce y el permiso de edición al guardar el producto.
  $mode = isset($_POST['_gt_pm_mode']) ? sanitize_key(wp_unslash($_POST['_gt_pm_mode'])) : ''; // phpcs:ignore WordPress.Security.NonceVerification
  if (!in_array($mode, array('', 'none', 'custom'), true)) $mode = '';
  $own = array();
  $raw = isset($_POST['_gt_pm_pct']) && is_array($_POST['_gt_pm_pct']) ? wp_unslash($_POST['_gt_pm_pct']) : array(); // phpcs:ignore WordPress.Security.NonceVerification,WordPress.Security.ValidatedSanitizedInput
  foreach (gt_pm_slots() as $s) {
    if (!isset($raw[$s])) continue;
    $v = gt_pm_parse_pct(sanitize_text_field((string) $raw[$s]));
    if ($v !== '') $own[$s] = $v;
  }
  if ($mode === '') $product->delete_meta_data('_gt_pm_mode'); else $product->update_meta_data('_gt_pm_mode', $mode);
  if ($own) $product->update_meta_data('_gt_pm_pct', $own); else $product->delete_meta_data('_gt_pm_pct');
}

/* ---------- Ajustes ---------- */

function gt_pm_default_groups() {
  return array(
    'g1' => array('name' => 'Transferencia', 'note' => 'Un solo pago', 'pct' => 0),
    'g2' => array('name' => 'Tarjeta o PSE', 'note' => 'Débito, crédito o PSE', 'pct' => 0),
    'g3' => array('name' => 'Addi', 'note' => 'A cuotas', 'pct' => 0),
    'g4' => array('name' => 'Sistecrédito', 'note' => 'A cuotas', 'pct' => 0),
    'g5' => array('name' => 'SU+ Pay', 'note' => 'A cuotas', 'pct' => 0),
    'g6' => array('name' => '', 'note' => '', 'pct' => 0),
  );
}

function gt_pm_default_map() {
  return array(
    'bacs' => 'g1',
    'woo-mercado-pago-basic' => 'g2', 'woo-mercado-pago-custom' => 'g2', 'woo-mercado-pago-pse' => 'g2', 'wompi' => 'g2', 'payvalida' => 'g2',
    'addi' => 'g3', 'wcsistecredito' => 'g4', 'sumas_pay' => 'g5',
  );
}

/** Texto saneado que conserva el «%» (sanitize_text_field borra «%» seguido de dos letras o cifras, como «5%de»). */
function gt_pm_clean_text($v) {
  $ph = "\u{E000}";
  $v = str_replace($ph, '', (string) $v);
  return str_replace($ph, '%', sanitize_text_field(str_replace('%', $ph, $v)));
}

/** Grupos saneados. Un % que no es número conserva el valor que ya estaba y avisa (no se apaga en silencio). */
function gt_pm_sanitize_groups($in, $prev = array()) {
  $in = (array) $in;
  $prev = (array) $prev;
  $out = array();
  foreach (gt_pm_slots() as $s) {
    $g = isset($in[$s]) ? (array) $in[$s] : array();
    $name = mb_substr(gt_pm_clean_text(wp_specialchars_decode(isset($g['name']) ? (string) $g['name'] : '', ENT_QUOTES)), 0, 40);
    $raw = isset($g['pct']) ? (string) $g['pct'] : '0';
    $pct = trim($raw) === '' ? 0 : gt_pm_parse_pct($raw);
    if ($pct === '') {
      $pct = isset($prev[$s]['pct']) ? (float) $prev[$s]['pct'] : 0;
      if (function_exists('add_settings_error')) add_settings_error('gt_opts', 'gt_pm_pct_' . $s, 'Descuento no válido en «' . ($name !== '' ? $name : $s) . '»: se dejó en ' . gt_pm_pct_label($pct) . ' %.');
    }
    $out[$s] = array(
      'name' => $name,
      'note' => mb_substr(gt_pm_clean_text(wp_specialchars_decode(isset($g['note']) ? (string) $g['note'] : '', ENT_QUOTES)), 0, 60),
      'pct'  => $pct,
    );
  }
  return $out;
}

function gt_pm_sanitize_map($in) {
  $out = array();
  foreach ((array) $in as $id => $slot) {
    $id = sanitize_key((string) $id);
    $slot = (string) $slot;
    if ($id !== '' && in_array($slot, gt_pm_slots(), true)) $out[$id] = $slot;
  }
  return $out;
}

/**
 * Mapa saneado que conserva el grupo de las pasarelas cuyo plugin está apagado al guardar (su fila no se dibuja,
 * así que no llega en el formulario): cuando vuelvan a estar activas siguen en su grupo.
 */
function gt_pm_keep_map($in, $prev) {
  $map = gt_pm_sanitize_map($in);
  $in = (array) $in;
  $reg = (function_exists('WC') && WC()->payment_gateways()) ? WC()->payment_gateways()->payment_gateways() : array();
  foreach (gt_pm_sanitize_map($prev) as $id => $slot) {
    if (!isset($map[$id]) && !isset($reg[$id]) && !array_key_exists($id, $in)) $map[$id] = $slot;
  }
  return $map;
}

function gt_pm_sanitize_until($v) {
  $v = (string) $v;
  return preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : '';
}

/** Filas de la página de ajustes (se imprimen dentro de la tabla de Ajustes → Rediseño Giftronic). */
function gt_pm_settings_rows($o, $f) {
  $mode = in_array($o['pm_mode'], array('test', 'live'), true) ? $o['pm_mode'] : 'off';
  $groups = gt_pm_sanitize_groups($o['pm_groups']);
  $map = (array) $o['pm_map'];
  $all = array();
  if (function_exists('WC') && WC()->payment_gateways()) {
    foreach (WC()->payment_gateways()->payment_gateways() as $id => $g) {
      if ((isset($g->enabled) && $g->enabled === 'yes') || isset($map[$id])) {
        $all[$id] = array('admin' => wp_strip_all_tags((string) $g->get_method_title()), 'title' => wp_strip_all_tags((string) $g->get_title()), 'on' => isset($g->enabled) && $g->enabled === 'yes');
      }
    }
  }
  ?>
  <tr><th scope="row">Estado</th><td>
    <fieldset>
      <label><input type="radio" name="<?php echo esc_attr($f('pm_mode')); ?>" value="off" <?php checked($mode, 'off'); ?>> Apagado: el mismo precio con todos los medios (como hasta ahora)</label><br>
      <label><input type="radio" name="<?php echo esc_attr($f('pm_mode')); ?>" value="test" <?php checked($mode, 'test'); ?>> Prueba: solo los administradores ven los precios y reciben el descuento en el pago</label><br>
      <label><input type="radio" name="<?php echo esc_attr($f('pm_mode')); ?>" value="live" <?php checked($mode, 'live'); ?>> Activo para todos los clientes</label>
    </fieldset>
    <p class="description">Siempre es un descuento sobre el precio del producto, nunca un recargo. Se cobra de verdad en el pago, en una línea «Descuento por pagar con…», según el medio que elija el cliente, y la ficha muestra el precio con cada medio antes de comprar. Al guardar se vacía la caché.</p>
  </td></tr>
  <tr><th scope="row">Grupos y descuentos</th><td>
    <table class="widefat striped" style="max-width:820px">
      <thead><tr><th style="width:34%">Nombre en la ficha</th><th>Texto corto</th><th style="width:130px">Descuento</th></tr></thead>
      <tbody>
      <?php foreach (gt_pm_slots() as $s) : $g = $groups[$s]; ?>
        <tr>
          <td><input type="text" class="widefat" maxlength="40" name="<?php echo esc_attr($f('pm_groups') . '[' . $s . '][name]'); ?>" value="<?php echo esc_attr($g['name']); ?>" placeholder="Vacío = grupo sin usar"></td>
          <td><input type="text" class="widefat" maxlength="60" name="<?php echo esc_attr($f('pm_groups') . '[' . $s . '][note]'); ?>" value="<?php echo esc_attr($g['note']); ?>"></td>
          <td><input type="text" inputmode="decimal" class="small-text" name="<?php echo esc_attr($f('pm_groups') . '[' . $s . '][pct]'); ?>" value="<?php echo esc_attr(gt_pm_pct_label($g['pct'])); ?>"> %</td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    <p class="description">El descuento se aplica sobre el precio del producto (el normal o el rebajado). 0 = sin descuento con ese grupo. Ejemplo con un producto de $ 1.000.000:
      <?php
      $ex = array();
      foreach (gt_pm_slots() as $s) {
        if ($groups[$s]['name'] === '') continue;
        $ex[] = esc_html($groups[$s]['name']) . ' ' . esc_html(gt_pm_plain_money(1000000 - gt_pm_cut(1000000, $groups[$s]['pct'])));
      }
      echo $ex ? implode(' · ', $ex) : 'sin grupos.'; // phpcs:ignore WordPress.Security.EscapeOutput
      ?>
    </p>
  </td></tr>
  <tr><th scope="row">Medios de pago de cada grupo</th><td>
    <table class="widefat striped" style="max-width:820px">
      <thead><tr><th>Medio de pago (en WooCommerce)</th><th>Cómo lo ve el cliente</th><th style="width:220px">Grupo</th></tr></thead>
      <tbody>
      <?php foreach ($all as $id => $g) : $cur = isset($map[$id]) ? $map[$id] : ''; ?>
        <tr>
          <td><?php echo esc_html($g['admin'] ? $g['admin'] : $id); ?><?php echo $g['on'] ? '' : ' <em>(inactivo)</em>'; ?></td>
          <td><?php echo esc_html($g['title']); ?></td>
          <td><select name="<?php echo esc_attr($f('pm_map') . '[' . $id . ']'); ?>">
            <option value="">Sin grupo (precio normal)</option>
            <?php foreach (gt_pm_slots() as $s) : if ($groups[$s]['name'] === '') continue; ?>
              <option value="<?php echo esc_attr($s); ?>" <?php selected($cur, $s); ?>><?php echo esc_html($groups[$s]['name']); ?></option>
            <?php endforeach; ?>
          </select></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    <p class="description">Si cambias el nombre de un grupo, guarda primero para verlo en esta lista. Mercado Pago (Checkout Pro) y Wompi dejan elegir varios medios dentro de su ventana: el descuento de su grupo vale para todo lo que se pague por ahí.</p>
  </td></tr>
  <tr><th scope="row">Reglas</th><td>
    <label><input type="checkbox" name="<?php echo esc_attr($f('pm_skip_sale')); ?>" value="1" <?php checked(!empty($o['pm_skip_sale'])); ?>> No dar este descuento a los productos que ya están en oferta</label><br>
    <label><input type="checkbox" name="<?php echo esc_attr($f('pm_no_coupon')); ?>" value="1" <?php checked(!empty($o['pm_no_coupon'])); ?>> No combinarlo con cupones (si el cliente usa un cupón, no hay descuento por medio de pago)</label>
    <p class="description">Cada producto puede usar los descuentos generales, no tener ninguno o tener los suyos: Productos → editar → Datos del producto → General.</p>
  </td></tr>
  <tr><th scope="row"><label for="gt-pmu">Vigente hasta</label></th><td>
    <input id="gt-pmu" type="date" name="<?php echo esc_attr($f('pm_until')); ?>" value="<?php echo esc_attr(isset($o['pm_until']) ? $o['pm_until'] : ''); ?>">
    <p class="description">Opcional. Si pones una fecha, la ficha lo dice («Vigente hasta…») y al terminar ese día los descuentos se apagan solos y se vacía la caché. Vacío = sin fecha de fin (hasta que lo apagues aquí).</p>
  </td></tr>
  <tr><th scope="row"><label for="gt-pmt">Aviso</label></th><td>
    <input id="gt-pmt" type="text" class="large-text" maxlength="140" name="<?php echo esc_attr($f('pm_text')); ?>" value="<?php echo esc_attr($o['pm_text']); ?>">
    <p class="description">Sale en la ficha y en el carrito, junto a los precios con descuento.</p>
  </td></tr>
  <?php
}

/* ---------- Fecha de fin: al terminar el día se vacían las cachés para que nadie vea un descuento vencido ---------- */

/** Momento exacto en que vence (medianoche al terminar el día de fin, hora de la tienda) o 0. */
function gt_pm_end_ts() {
  $u = gt_pm_until();
  if ($u === '') return 0;
  try {
    return (new DateTime($u . ' 00:00:00', wp_timezone()))->modify('+1 day')->getTimestamp();
  } catch (Exception $e) {
    return 0;
  }
}

add_action('update_option_gt_opts', 'gt_pm_schedule_expiry', 20, 0);
add_action('add_option_gt_opts', 'gt_pm_schedule_expiry', 20, 0);
function gt_pm_schedule_expiry() {
  wp_clear_scheduled_hook('gt_pm_expire');
  $o = (array) get_option('gt_opts', array());
  $u = isset($o['pm_until']) ? gt_pm_sanitize_until($o['pm_until']) : '';
  if ($u === '' || empty($o['pm_mode']) || $o['pm_mode'] === 'off') return;
  try {
    $ts = (new DateTime($u . ' 00:00:00', wp_timezone()))->modify('+1 day')->getTimestamp();
  } catch (Exception $e) {
    return;
  }
  if ($ts > time()) wp_schedule_single_event($ts, 'gt_pm_expire');
}

/** Si el evento de fin se perdió (WP-Cron), se vuelve a programar al entrar al admin. */
add_action('admin_init', 'gt_pm_ensure_expiry');
function gt_pm_ensure_expiry() {
  if (gt_pm_mode() === 'off' || gt_pm_until() === '' || gt_pm_expired()) return;
  $ts = gt_pm_end_ts();
  if ($ts > time() && !wp_next_scheduled('gt_pm_expire')) wp_schedule_single_event($ts, 'gt_pm_expire');
}

/**
 * WP-Cron depende de las visitas y LiteSpeed sirve páginas sin pasar por PHP: para que ninguna página guardada siga
 * anunciando el descuento después de la fecha de fin, las que se generan cerca del final caducan justo a medianoche.
 */
add_action('wp', 'gt_pm_cache_ttl', 6);
function gt_pm_cache_ttl() {
  if (is_admin() || gt_pm_mode() !== 'live' || gt_pm_until() === '' || gt_pm_expired()) return;
  $left = gt_pm_end_ts() - time();
  if ($left <= 0) return;
  if ($left < 60) do_action('litespeed_control_set_nocache', 'precio por medio de pago: vence en menos de un minuto');
  elseif ($left < WEEK_IN_SECONDS) do_action('litespeed_control_set_ttl', $left);
}

add_action('gt_pm_expire', 'gt_pm_on_expire');
function gt_pm_on_expire() {
  if (function_exists('gt_flush_index')) gt_flush_index();
  do_action('litespeed_purge_all');
}

/** Avisos en el admin: prueba activa, descuentos vencidos, Mercado Pago con descuento propio y medios sin verificar. */
add_action('admin_notices', 'gt_pm_admin_notices');
function gt_pm_admin_notices() {
  if (!current_user_can('manage_options')) return;
  $mode = gt_pm_mode();
  if ($mode === 'off') return;
  $link = '<a href="' . esc_url(admin_url('options-general.php?page=gt-rediseno#gt-pm')) . '">Ajustes → Rediseño Giftronic</a>';
  if (gt_pm_expired()) {
    echo '<div class="notice notice-warning"><p><strong>Precio según el medio de pago:</strong> venció el ' . esc_html(gt_pm_until()) . '; ya no se muestra ni se cobra (' . $link . ').</p></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
    return;
  }
  if ($mode === 'test') {
    echo '<div class="notice notice-info"><p><strong>Precio según el medio de pago:</strong> está en prueba; solo los administradores lo ven y lo reciben en el pago (' . $link . ').</p></div>'; // phpcs:ignore WordPress.Security.EscapeOutput
  }
  foreach (array('woo-mercado-pago-basic', 'woo-mercado-pago-custom', 'woo-mercado-pago-pse') as $id) {
    $s = get_option('woocommerce_' . $id . '_settings');
    if (is_array($s) && !empty($s['gateway_discount']) && (float) $s['gateway_discount'] > 0 && isset($s['gateway_discount_checkbox']) && $s['gateway_discount_checkbox'] === 'yes') {
      echo '<div class="notice notice-warning"><p><strong>Precio según el medio de pago:</strong> Mercado Pago también tiene activo su propio descuento; los dos se sumarían. Apágalo en WooCommerce → Ajustes → Pagos → Mercado Pago.</p></div>';
      break;
    }
  }
  $map = (array) gt_opt('pm_map', array());
  foreach (gt_pm_named_groups() as $s => $g) {
    if ($g['pct'] <= 0) continue;
    $bad = array_intersect(array_keys($map, $s, true), gt_pm_unverified_gateways());
    if ($bad) {
      echo '<div class="notice notice-warning"><p><strong>Precio según el medio de pago:</strong> el grupo «' . esc_html($g['name']) . '» tiene descuento e incluye ' . esc_html(implode(', ', $bad)) . '. No se pudo verificar que ese medio cobre el total con el descuento: haz una compra de prueba antes de activarlo para todos.</p></div>';
    }
  }
}
