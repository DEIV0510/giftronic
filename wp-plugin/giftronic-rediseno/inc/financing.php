<?php
/**
 * Precio según el medio de pago y cuotas aproximadas.
 *
 * Datos reales de la tienda (revisados en el checkout el 2026-10-10): el precio es el MISMO con todos los medios
 * de pago; no hay recargos ni descuentos por método. Lo que cambia al pagar a cuotas son los intereses que cobra
 * la financiera o el banco, que por ley no pueden superar la tasa de usura del mes (crédito de consumo).
 *
 * Por eso cada cuota se muestra con dos referencias:
 *  - con la tasa máxima legal vigente (tope: la cuota real no debería ser mayor), y
 *  - sin intereses (algunas financieras lo dan según el perfil del cliente).
 * Fórmula: cuota fija (sistema francés) con la tasa mensual equivalente a la efectiva anual: i = (1 + EA)^(1/12) − 1.
 * No incluye seguros, fianzas ni comisiones de la financiera.
 */
if (!defined('ABSPATH')) exit;

/** Tasa efectiva anual de referencia (%), la de usura del mes configurada en Ajustes. */
function gt_fin_rate() {
  $r = (float) str_replace(',', '.', (string) gt_opt('fin_rate', 28.59));
  return ($r > 0 && $r < 100) ? $r : 28.59;
}

/** «octubre de 2026» para el mes de la tasa configurada. */
function gt_fin_month_label() {
  $m = (string) gt_opt('fin_month', '2026-10');
  if (!preg_match('/^\d{4}-\d{2}$/', $m)) return '';
  return date_i18n('F \d\e Y', strtotime($m . '-01 12:00:00'));
}

/** Plazos de una lista «6,12,18,24» (1 a 72, sin repetidos, en orden). */
function gt_fin_plazos($csv) {
  $out = array();
  foreach (explode(',', (string) $csv) as $n) {
    $n = (int) trim($n);
    if ($n >= 1 && $n <= 72) $out[$n] = $n;
  }
  ksort($out);
  return array_values($out);
}

/**
 * Formas de pago a cuotas activas en la tienda (solo las que están habilitadas en WooCommerce).
 * Cada una: id, nombre, plazos, cuotas por defecto, nota y enlace propio si lo hay.
 */
function gt_fin_options() {
  static $memo = null;
  if ($memo !== null) return $memo;
  $pay = gt_pay_methods();
  $has = function ($labels) use ($pay) { foreach ((array) $labels as $l) if (in_array($l, $pay, true)) return true; return false; };
  $defs = array(
    'addi'  => array('Addi', 'fin_addi', 'Addi', 'Aprobación en línea con tu cédula. Addi define la tasa según tu perfil (puede ser 0 %).', ''),
    'siste' => array('Sistecrédito', 'fin_siste', 'Sistecrédito', 'Necesitas cupo aprobado en Sistecrédito. La tasa la define Sistecrédito.', ''),
    'sumas' => array('SU+ Pay', 'fin_sumas', 'SU+ Pay', 'Crédito SU+ Pay (Sumas). La tasa la define SU+ Pay al aprobar el crédito.', 'https://solicitud.mundosumas.com/'),
    'tc'    => array('Tarjeta de crédito', 'fin_tc', array('Tarjeta débito y crédito', 'Mercado Pago', 'Wompi'), 'Eliges las cuotas al pagar. El interés lo cobra tu banco según tu tarjeta.', ''),
  );
  $memo = array();
  foreach ($defs as $id => $d) {
    if (!$has($d[2])) continue;
    $plazos = gt_fin_plazos(gt_opt($d[1]));
    if (!$plazos) continue;
    $def = in_array(12, $plazos, true) ? 12 : $plazos[(int) floor((count($plazos) - 1) / 2)];
    $memo[$id] = array('id' => $id, 'name' => $d[0], 'plazos' => $plazos, 'def' => $def, 'note' => $d[3], 'link' => $d[4]);
  }
  return $memo;
}

/** Cuota fija mensual. $ea en porcentaje efectivo anual; con 1 cuota o tasa 0 no hay intereses. */
function gt_cuota($price, $n, $ea) {
  $n = max(1, (int) $n);
  if ($n === 1 || $ea <= 0) return $price / $n;
  $i = pow(1 + $ea / 100, 1 / 12) - 1;
  return $price * $i / (1 - pow(1 + $i, -$n));
}

/** Cuota para mostrar: con 1 cuota el precio exacto; con más, redondeada hacia arriba a la centena. */
function gt_cuota_r($price, $n, $ea) {
  return (int) $n <= 1 ? (int) round($price) : gt_round100(gt_cuota($price, $n, $ea));
}

/** Redondeo hacia arriba a la centena (como se suelen mostrar las cuotas). */
function gt_round100($x) {
  return (int) (ceil($x / 100) * 100);
}

/** Tasa con coma decimal: 28,59 */
function gt_pct($r) {
  return rtrim(rtrim(number_format($r, 2, ',', '.'), '0'), ',');
}

/** Línea corta para las tarjetas: «o 12 cuotas de aprox. $ X con Addi» (con la tasa máxima, en el título). */
function gt_fin_card_line($price) {
  $opts = gt_fin_options();
  if ($price < 300000 || !$opts) return '';
  $o = isset($opts['addi']) ? $opts['addi'] : reset($opts);
  $n = in_array(12, $o['plazos'], true) ? 12 : max($o['plazos']);
  $ea = gt_fin_rate();
  $c = gt_cuota_r($price, $n, $ea);
  $title = 'Cuota aproximada con la tasa máxima legal (' . gt_pct($ea) . ' % E.A.). ' . $o['name'] . ' define la tasa final al aprobar el crédito.';
  return '<span class="gt-fin" title="' . esc_attr($title) . '">o ' . (int) $n . ' cuotas de aprox. <b>' . gt_money($c) . '</b> con ' . esc_html($o['name']) . '</span>';
}

/** Línea del recuadro de precio: la cuota más común y el enlace a la sección completa. */
function gt_fin_pbox_line($price) {
  $opts = gt_fin_options();
  if (!$opts || $price <= 0) return '';
  $o = isset($opts['addi']) ? $opts['addi'] : reset($opts);
  $n = $o['def'];
  $c = gt_cuota_r($price, $n, gt_fin_rate());
  return '<div class="gt-p-fin">' . gt_ic('card', 18) . '<span>A cuotas: <b data-pm-n="' . (int) $n . '">' . (int) $n . ' × aprox. ' . gt_money($c) . '</b> con ' . esc_html($o['name']) . '. <a href="#gt-cuotas">Precio por medio de pago y cuotas</a></span></div>';
}

/** Bloque «Precio según el medio de pago» de la ficha. */
function gt_fin_methods_html($price) {
  $pay = gt_pay_methods();
  $cash = array_values(array_filter($pay, function ($m) { return in_array($m, array('PSE', 'Transferencia bancaria', 'Tarjeta débito y crédito', 'Mercado Pago', 'Wompi', 'Payvalida'), true); }));
  $opts = gt_fin_options();
  $ea = gt_fin_rate();
  $rows = '';
  if ($cash) {
    $rows .= '<li><span class="m"><b>De contado</b><small>' . esc_html(gt_join(array_map(function ($m) { return $m === 'Tarjeta débito y crédito' ? 'tarjeta débito' : ($m === 'Transferencia bancaria' ? 'transferencia' : $m); }, $cash))) . '</small></span><span class="v"><span data-pm-price>' . gt_money($price) . '</span><small>un solo pago</small></span></li>';
  }
  foreach ($opts as $o) {
    $max = max($o['plazos']); $min = min($o['plazos']);
    $c = gt_cuota_r($price, $o['def'], $ea);
    $range = $min === $max ? $max . ' cuotas' : 'de ' . $min . ' a ' . $max . ' cuotas';
    $rows .= '<li><span class="m"><b>' . esc_html($o['name']) . '</b><small>' . esc_html($range) . '</small></span><span class="v"><span data-pm-price>' . gt_money($price) . '</span>'
      . '<small data-pm-n="' . (int) $o['def'] . '">' . (int) $o['def'] . ' × aprox. ' . gt_money($c) . '</small></span></li>';
  }
  if (!$rows) return '';
  return '<div class="gt-pm"><p class="gt-pm-h">Con cada medio de pago</p><ul class="gt-pm-list">' . $rows . '</ul>'
    . '<p class="gt-pm-note">Mismo precio con todos los medios de pago. A cuotas, la financiera o tu banco suman sus intereses: las cuotas aproximadas usan la tasa máxima legal (' . gt_pct($ea) . ' % E.A.).</p></div>';
}

/** Calculadora de cuotas (sección de la ficha). Funciona sin JavaScript para la opción por defecto. */
function gt_fin_calc_html($p, $price) {
  $opts = gt_fin_options();
  if (!$opts || $price <= 0) return '';
  $ea = gt_fin_rate();
  $first = reset($opts);
  $month = gt_fin_month_label();
  $h = '<section class="gt-psec" id="gt-cuotas" aria-labelledby="gt-cuotas-t" data-fin data-price="' . esc_attr($price) . '" data-ea="' . esc_attr($ea) . '">';
  $h .= '<div class="gt-psec-h"><div><h2 id="gt-cuotas-t">Precio según el medio de pago</h2><p>El precio es el mismo con todos los medios de pago. Si pagas a cuotas, calcula aquí el valor aproximado de cada una.</p></div></div>';
  $h .= '<div class="gt-fin-grid">' . gt_fin_methods_html($price) . '<div class="gt-calc"><div>';
  $h .= '<div class="gt-tabs" role="tablist" aria-label="Forma de pago a cuotas">';
  foreach ($opts as $o) {
    $sel = $o['id'] === $first['id'];
    $h .= '<button type="button" role="tab" class="gt-tab" id="gt-fin-tab-' . esc_attr($o['id']) . '" aria-selected="' . ($sel ? 'true' : 'false') . '" aria-controls="gt-fin-p-' . esc_attr($o['id']) . '" tabindex="' . ($sel ? '0' : '-1') . '" data-fin-tab="' . esc_attr($o['id']) . '">'
      . esc_html($o['name']) . '<small>' . (min($o['plazos']) === max($o['plazos']) ? max($o['plazos']) . ' cuotas' : 'hasta ' . max($o['plazos']) . ' cuotas') . '</small></button>';
  }
  $h .= '</div>';
  foreach ($opts as $o) {
    $sel = $o['id'] === $first['id'];
    $h .= '<div class="gt-fin-panel" role="tabpanel" id="gt-fin-p-' . esc_attr($o['id']) . '" aria-labelledby="gt-fin-tab-' . esc_attr($o['id']) . '"' . ($sel ? '' : ' hidden') . '>';
    $h .= '<fieldset class="gt-n-opts"><legend class="gt-step">Número de cuotas</legend>';
    foreach ($o['plazos'] as $n) {
      $h .= '<label class="gt-n-opt"><input type="radio" name="gt-n-' . esc_attr($o['id']) . '" value="' . (int) $n . '" data-fin-n' . ($n === $o['def'] ? ' checked' : '') . '><span>' . (int) $n . '<span class="screen-reader-text"> cuotas</span></span></label>';
    }
    $h .= '</fieldset>';
    $h .= '<p class="gt-calc-note">' . gt_ic('info', 16) . '<span>' . esc_html($o['note']) . ($o['link'] ? ' <a href="' . esc_url($o['link']) . '" target="_blank" rel="noopener">Solicitar crédito</a>' : '') . '</span></p>';
    $h .= '</div>';
  }
  $c = gt_cuota_r($price, $first['def'], $ea);
  $c0 = gt_cuota_r($price, $first['def'], 0);
  $h .= '</div><div>';
  $h .= '<div class="gt-calc-out" aria-live="polite">';
  $h .= '<span class="l">Con <b data-fin-name>' . esc_html($first['name']) . '</b> en <b data-fin-ncount>' . (int) $first['def'] . '</b> <span data-fin-word>' . ((int) $first['def'] === 1 ? 'cuota' : 'cuotas') . '</span> pagarías aprox.</span>';
  $h .= '<span class="v"><span data-fin-cuota>' . gt_money($c) . '</span> <small data-fin-per>' . ((int) $first['def'] === 1 ? 'un solo pago' : '/mes') . '</small></span>';
  $one = (int) $first['def'] === 1 ? ' hidden' : ''; // con un solo pago no hay intereses que calcular
  $h .= '<span class="t"' . $one . '>Total aprox. <b data-fin-total>' . gt_money($c * $first['def']) . '</b> · con la tasa máxima legal de ' . gt_pct($ea) . ' % E.A.' . ($month ? ' (' . esc_html($month) . ')' : '') . '</span>';
  $h .= '<span class="z"' . $one . '>Si te aprueban sin intereses: <b data-fin-cuota0>' . gt_money($c0) . '</b>/mes</span>';
  $h .= '</div>';
  $h .= '<p class="gt-calc-note">' . gt_ic('info', 16) . '<span>Precio de la tienda: ' . gt_money($price) . ', igual con todos los medios de pago. La cuota real depende de la aprobación y la tasa que te asigne la financiera o tu banco; no incluye seguros, fianzas ni comisiones.</span></p>';
  $h .= '</div></div></div></section>';
  return $h;
}
