<?php
/** Ficha de producto: galería, bloques de compra y secciones bajo el pliegue. */
if (!defined('ABSPATH')) exit;

/**
 * Quita del resumen de producto lo que el rediseño ya pinta (título, precio, valoración, extracto, meta,
 * botón de compra y los añadidos de Astra). Lo demás (Addi, SU+ Pay, Sistecrédito, datos estructurados…) se conserva.
 */
function gt_strip_summary_hooks() {
  global $wp_filter;
  $hook = 'woocommerce_single_product_summary';
  if (empty($wp_filter[$hook]) || !is_object($wp_filter[$hook])) return;
  foreach ($wp_filter[$hook]->callbacks as $prio => $cbs) {
    foreach ($cbs as $cb) {
      $fn = $cb['function'];
      if (is_string($fn)) $name = $fn;
      elseif (is_array($fn)) $name = (is_object($fn[0]) ? get_class($fn[0]) : (string) $fn[0]) . '::' . $fn[1];
      else $name = 'closure';
      if (preg_match('/^woocommerce_template_single_|^woocommerce_breadcrumb$|astra/i', $name)) remove_action($hook, $fn, $prio);
    }
  }
}

/** IDs de las imágenes del producto (principal + galería), sin repetidas. */
function gt_gallery_ids($p) {
  $ids = array();
  if ($p->get_image_id()) $ids[] = (int) $p->get_image_id();
  foreach ($p->get_gallery_image_ids() as $id) $ids[] = (int) $id;
  return array_values(array_unique(array_filter($ids)));
}

function gt_gallery_html($p) {
  $ids = gt_gallery_ids($p);
  $d = gt_pdata($p);
  $n = count($ids);
  $badges = gt_badges($p);
  if (!$n) {
    return '<div class="gt-gal"><div class="gt-gal-main"><div class="gt-gal-track"><div class="gt-gal-slide">' . gt_img($p, 'woocommerce_single', 'gt-art', true, 0, gt_sizes('gal'), true) . '</div></div></div></div>';
  }
  // Una sola galería para todas las pantallas: carrusel con scroll-snap (se desliza con el dedo en el celular;
  // flechas y miniaturas en escritorio). Así cada foto se descarga una vez y solo la primera va con prioridad alta.
  $h = '<div class="gt-gal' . ($n > 1 ? ' has-many' : '') . '" data-gal>';
  $h .= '<div class="gt-gal-main">';
  if ($badges) $h .= '<div class="gt-gal-kind">' . $badges . '</div>';
  $h .= '<div class="gt-gal-track" data-gal-track tabindex="0" role="group" aria-roledescription="carrusel" aria-label="Fotos del producto">';
  foreach ($ids as $i => $id) {
    $full = wp_get_attachment_image_url($id, 'full');
    $alt = $d['short'] . ($n > 1 ? ' — foto ' . ($i + 1) . ' de ' . $n : '');
    $h .= '<a class="gt-gal-slide" href="' . esc_url($full) . '" data-slide="' . $i . '" aria-label="Ampliar foto ' . ($i + 1) . '"' . ($i ? ' tabindex="-1"' : '') . '>'
      . wp_get_attachment_image($id, 'woocommerce_single', false, array('class' => 'gt-art', 'alt' => $alt, 'loading' => $i ? 'lazy' : 'eager', 'fetchpriority' => $i ? 'auto' : 'high', 'decoding' => 'async', 'sizes' => gt_sizes('gal')))
      . '</a>';
  }
  $h .= '</div>';
  if ($n > 1) {
    $h .= '<button type="button" class="gt-gal-arrow prev" data-gal-prev aria-label="Foto anterior">' . gt_ic('left', 22) . '</button>';
    $h .= '<button type="button" class="gt-gal-arrow next" data-gal-next aria-label="Foto siguiente">' . gt_ic('right', 22) . '</button>';
    $h .= '<span class="gt-gal-count" aria-live="polite"><span data-gal-i>1</span> / ' . $n . '</span>';
    $h .= '<div class="gt-gal-dots" aria-hidden="true">';
    for ($i = 0; $i < $n; $i++) $h .= '<i' . ($i ? '' : ' class="on"') . '></i>';
    $h .= '</div>';
  }
  $h .= '<span class="gt-gal-hint">' . gt_ic('zoom', 14) . 'Clic para ampliar</span>';
  $h .= '</div>';
  if ($n > 1) {
    $h .= '<div class="gt-thumbs" role="group" aria-label="Elegir foto">';
    foreach ($ids as $i => $id) {
      $h .= '<button type="button" class="gt-thumb" data-thumb="' . $i . '" aria-label="Ver foto ' . ($i + 1) . '"' . ($i ? '' : ' aria-current="true"') . '>'
        . wp_get_attachment_image($id, 'woocommerce_gallery_thumbnail', false, array('class' => 'gt-art', 'alt' => '', 'loading' => 'lazy', 'sizes' => '68px')) . '</button>';
    }
    $h .= '</div>';
  }
  $h .= '</div>';
  return $h;
}

/** Datos destacados (máx. 6) para la franja bajo la ficha. */
function gt_highlights($p) {
  $d = gt_pdata($p);
  $s = $d['specs'];
  $map = array(
    'cpu' => array('cpu', 'Procesador'), 'ram' => array('bolt', 'Memoria RAM'), 'ssd' => array('hdd', 'Almacenamiento'), 'gpu' => array('gpu', 'Gráficos'),
    'scr' => array('monitor', 'Pantalla'), 'res' => array('expand', 'Resolución'), 'panel' => array('sun', 'Panel'), 'os' => array('tv', 'Sistema'),
    'hz' => array('rotate', 'Frecuencia'), 'ms' => array('clock', 'Respuesta'), 'ptype' => array('printer', 'Impresión'),
  );
  $out = array();
  foreach ($map as $k => $m) {
    if (empty($s[$k])) continue;
    $v = $s[$k];
    if ($k === 'ssd' && !empty($s['ssdType'])) $v .= ' SSD';
    $out[] = array($m[0], $m[1], $v);
  }
  if (!empty($s['mf'])) $out[] = array('printer', 'Funciones', 'Imprime, copia y escanea');
  if (!empty($s['wifi'])) $out[] = array('wifi', 'Conectividad', 'Wi-Fi');
  return array_slice($out, 0, 6);
}

/** Bloques de confianza de la ficha (solo con datos reales de la tienda). */
function gt_trust_boxes() {
  $pay = gt_pay_methods();
  $instant = array_filter($pay, function ($m) { return in_array($m, array('PSE', 'Tarjeta débito y crédito', 'Mercado Pago', 'Wompi', 'Transferencia bancaria'), true); });
  $credit = array_filter($pay, function ($m) { return in_array($m, array('Addi', 'Sistecrédito', 'SU+ Pay'), true); });
  $b = array();
  $b[] = array('truck', 'Envío a toda Colombia', 'El costo y las opciones de entrega se calculan al finalizar la compra según tu ciudad.');
  if ($credit) $b[] = array('card', 'Paga a cuotas', 'Con ' . gt_join($credit) . '. Eliges la financiera al pagar.');
  if ($instant) $b[] = array('lock', 'Pago seguro', gt_join($instant) . '.');
  $b[] = array('shield', 'Garantía legal', 'Respaldada por el Estatuto del Consumidor (Ley 1480 de 2011).');
  return $b;
}

function gt_join($list) {
  $list = array_values($list);
  if (count($list) < 2) return implode('', $list);
  $last = array_pop($list);
  return implode(', ', $list) . ' y ' . $last;
}

function gt_related_products($p, $n = 8) {
  $ids = wc_get_related_products($p->get_id(), $n * 2);
  $out = array();
  foreach ($ids as $id) {
    $r = wc_get_product($id);
    if ($r && $r->is_visible()) $out[] = $r;
  }
  usort($out, function ($a, $b) { return (int) $b->is_in_stock() - (int) $a->is_in_stock(); });
  return array_slice($out, 0, $n);
}
