<?php
/**
 * Marca, tipo, especificaciones y nombre corto leídos del nombre del producto.
 * Los nombres de la tienda vienen como «Nombre | spec | spec | color». Es la misma lógica del prototipo (tools/parse.mjs).
 */
if (!defined('ABSPATH')) exit;

function gt_brands() {
  return array('Samsung','Hisense','LG','iFFALCON','TCL','Kalley','Challenger','Xiaomi','Lenovo','HP','Acer','ASUS','Dell','Apple','MSI','Huawei','Honor','Brother','Epson','Ricoh','Canon','Caixun','AOC','VTA','VSG','HyperX','Logitech','Redragon','Genius','JBL','Sony','Microsoft','Nintendo','Kingston','Western Digital','Seagate','SanDisk','TP-Link','Mercusys','Tenda','Motorola','Janus','Gigabyte','Corsair','Razer','Trust','Xtech','Klip Xtreme','Philips','BenQ','ViewSonic','Forza','Unitec','Adata','Crucial','Hikvision','Ezviz','Imou','Amazon','Google','Nokia','Oppo','Realme','Vivo','Infinix','Tecno','ZTE','Alcatel','Panasonic','Sharp','Toshiba','Skyworth','Olimpo','Primus','Cooler Master','Thermaltake','Havit','Energy Sistem','Maxell','Anker','Baseus','Ugreen','Pantum','Compumax','XKIM','Sennheiser','CDP');
}

function gt_clean($s) {
  $s = str_replace(array('®', '™'), '', (string) $s);
  $s = html_entity_decode($s, ENT_QUOTES, 'UTF-8');
  return trim(preg_replace('/\s+/u', ' ', $s));
}

function gt_brand_of($name) {
  static $re = null;
  if ($re === null) $re = '/\b(' . implode('|', array_map(function ($b) { return preg_quote($b, '/'); }, gt_brands())) . ')\b/iu';
  if (preg_match($re, $name, $m)) {
    foreach (gt_brands() as $b) if (strtolower($b) === strtolower($m[1])) return $b;
  }
  $alias = array(
    '/gygabyte/i' => 'Gigabyte', '/\bipad\b|\bmacbook\b|\biphone\b/i' => 'Apple', '/\bomen\b|\bvictus\b/i' => 'HP',
    '/\blegion\b|thinkcentre|thinkvision|thinkpad|ideapad|ideacentre/i' => 'Lenovo', '/\bps[45]\b|playstation/i' => 'Sony',
    '/\brog\b|\btuf\b|vivobook|zenbook/i' => 'ASUS',
  );
  foreach ($alias as $r => $b) if (preg_match($r, $name)) return $b;
  return '';
}

/** Tipo de producto a partir del nombre y de las categorías de WooCommerce. */
function gt_kind_of($name, $cats = '') {
  $c = strtolower(remove_accents((string) $cats));
  $n = $name;
  $gamer = '/gamer|gaming|nitro|\brog\b|\btuf\b|omen|victus|legion|\bloq\b|predator|rtx|gtx|odyssey|esports|strix/i';
  $is_tv = preg_match('/^(televisor|tv\b|smart tv)/iu', $n) || (preg_match('/(^|,)\s*tv\s*(,|$)/', $c) && !preg_match('/^barra/i', $n));
  if ($is_tv && preg_match('/(con|\+)\s*barra|combo/iu', $n)) return 'combo';
  if ($is_tv) return 'tv';
  if (preg_match('/tablet|ipad|\btab\b|galaxy tab/iu', $n)) return 'tablet';
  if (preg_match('/smartwatch|reloj inteligente|smart band|\bwatch\b/iu', $n)) return 'watch';
  if (preg_match('/celular|smartphone|iphone|galaxy [asmz]\d/iu', $n)) return 'phone';
  if (preg_match('/gamepad|joystick|volante|control (?:inal|al[áa]m|gamer|gaming|pc|vsg|acer)/iu', $n)) return 'gamer-acc';
  if (preg_match('/barra de sonido|soundbar|parlante|altavoz|speaker|aud[íi]fono|diadema|headset|auricular|earbuds|torre de sonido/iu', $n)) return 'audio';
  if (preg_match('/port[áa]til|laptop|notebook|macbook|chromebook|expertbook|vivobook|zenbook|thinkpad|ideapad|strix scar|zephyrus/iu', $n) && !preg_match('/\bbase\b|malet[íi]n|morral|bolso|cargador|soporte/iu', $n)) return preg_match($gamer, $n) ? 'laptop-gamer' : 'laptop';
  if (preg_match('/all in one|\baio\b|todo en uno/iu', $n) || (strpos($c, 'all in one') !== false && !preg_match('/monitor|mouse|teclado|cargador|bolso/iu', $n))) return 'aio';
  if (preg_match('/pc de escritorio|computador de escritorio|desktop|thinkcentre|torre gamer/iu', $n) || strpos($c, 'pc de escritorio') !== false) return preg_match($gamer, $n) ? 'pc-gamer' : 'pc';
  if (preg_match('/monitor/iu', $n)) return 'monitor';
  if (preg_match('/impresora|multifuncional|ecotank|esc[áa]ner|plotter/iu', $n) || strpos($c, 'impresi') !== false) return 'printer';
  if (preg_match('/consola|playstation|\bps[45]\b|xbox|nintendo|switch|videojuego|\bjuego\b/iu', $n) || strpos($c, 'consolas') !== false) return 'console';
  if (preg_match('/video ?beam|proyector|pantalla de proyecci|tel[óo]n/iu', $n) || strpos($c, 'video beams') !== false) return 'projector';
  if (preg_match('/webcam|c[áa]mara/iu', $n) || strpos($c, 'camaras') !== false) return 'camera';
  if (preg_match('/microsd|tarjeta de memoria|memoria sd|disco|\bssd\b|memoria usb|pendrive|almacenamiento/iu', $n) || strpos($c, 'almacenamiento') !== false) return 'storage';
  if (preg_match('/router|repetidor|access point|mesh|adaptador (usb )?wi|switch de red|tarjeta de red/iu', $n) || strpos($c, 'redes') !== false) return 'network';
  if (preg_match('/cable|\bhub\b|adaptador|convertidor|cargador/iu', $n)) return 'cable';
  if (preg_match('/mouse|teclado|mousepad|micr[óo]fono/iu', $n) || strpos($c, 'mouses') !== false || strpos($c, 'perifericos') !== false) return preg_match($gamer, $n) ? 'gamer-acc' : 'peripheral';
  return 'other';
}

function gt_is_computer($kind) {
  return in_array($kind, array('laptop', 'laptop-gamer', 'aio', 'pc', 'pc-gamer'), true);
}

/** Ícono para cada tipo de producto. */
function gt_kind_icon($kind) {
  $m = array('tv' => 'tv', 'combo' => 'tv', 'tablet' => 'smartphone', 'phone' => 'smartphone', 'watch' => 'clock', 'gamer-acc' => 'gamepad', 'audio' => 'volume',
    'laptop' => 'laptop', 'laptop-gamer' => 'laptop', 'aio' => 'monitor', 'pc' => 'cpu', 'pc-gamer' => 'cpu', 'monitor' => 'monitor', 'printer' => 'printer',
    'console' => 'gamepad', 'projector' => 'tv', 'camera' => 'camera', 'storage' => 'hdd', 'network' => 'router', 'cable' => 'cable', 'peripheral' => 'cpu');
  return isset($m[$kind]) ? $m[$kind] : 'box';
}

/** Especificaciones a partir del nombre. */
function gt_specs_of($name) {
  $n = str_replace('SDD', 'SSD', gt_clean($name));
  $o = array();
  if (preg_match('/(\d{2}(?:[.,]\d)?)\s?(?:"|”|″|′|\'\'|pulgadas|pulg\b)/iu', $n, $m)) $o['scr'] = str_replace(',', '.', $m[1]) . '"';
  if (preg_match('/Ultra\s*(\d)[-\s]?(\d{3}[A-Z]{0,2})/i', $n, $m)) { $o['cpu'] = 'Core Ultra ' . $m[1] . ' ' . strtoupper($m[2]); $o['cpuFam'] = 'Intel Core Ultra ' . $m[1]; }
  elseif (preg_match('/\bi([3579])[-\s]?(\d{4,5}[A-Z]{0,2})/i', $n, $m)) { $o['cpu'] = 'Core i' . $m[1] . '-' . strtoupper($m[2]); $o['cpuFam'] = 'Intel Core i' . $m[1]; }
  elseif (preg_match('/Core\s*(\d)[-\s]?(N?\d{3}[A-Z]{0,2})/i', $n, $m)) { $o['cpu'] = 'Core ' . $m[1] . ' ' . strtoupper($m[2]); $o['cpuFam'] = 'Intel Core ' . $m[1]; }
  elseif (preg_match('/(?:Ryzen|\bR)[-\s]?([3579])[-\s]?(\d{4}[A-Z]{0,2})/i', $n, $m)) { $o['cpu'] = 'Ryzen ' . $m[1] . ' ' . strtoupper($m[2]); $o['cpuFam'] = 'AMD Ryzen ' . $m[1]; }
  elseif (preg_match('/Athlon\s*(?:Silver|Gold)?\s*(\d{4}[A-Z]{0,2})/i', $n, $m)) { $o['cpu'] = 'Athlon ' . strtoupper($m[1]); $o['cpuFam'] = 'AMD Athlon'; }
  elseif (preg_match('/\b(Celeron|Pentium)\b\s*(N?\d{3,4})?/i', $n, $m)) { $f = ucfirst(strtolower($m[1])); $o['cpu'] = $f . (!empty($m[2]) ? ' ' . strtoupper($m[2]) : ''); $o['cpuFam'] = 'Intel ' . $f; }
  elseif (preg_match('/\bN(100|150|200|305|355)\b/', $n, $m)) { $o['cpu'] = 'Intel N' . $m[1]; $o['cpuFam'] = 'Intel N'; }
  elseif (preg_match('/\bChip M([1-4])\b|\bM([1-4])\s(?:Pro|Max)\b/i', $n, $m)) { $o['cpu'] = 'Apple M' . (!empty($m[1]) ? $m[1] : $m[2]); $o['cpuFam'] = 'Apple M'; }

  $gbs = array();
  if (preg_match_all('/(\d{1,4})\s?GB/i', $n, $all)) $gbs = array_map('intval', $all[1]);
  if (preg_match('/(?:RAM\s*(\d{1,2})\s?GB)|(?:(\d{1,2})\s?GB\s*(?:de\s*)?(?:RAM|DDR\d|LPDDR\d))/i', $n, $m)) $o['ram'] = (!empty($m[1]) ? $m[1] : $m[2]) . ' GB';
  elseif (count($gbs) >= 2 && min($gbs) <= 32) $o['ram'] = min($gbs) . ' GB';
  if (preg_match('/(\d)\s?TB/i', $n, $m)) $o['ssd'] = $m[1] . ' TB';
  elseif (preg_match_all('/(\d{3,4})\s?GB/i', $n, $all)) {
    foreach ($all[1] as $v) if ((int) $v >= 64) { $o['ssd'] = $v . ' GB'; break; }
  }
  if (!empty($o['ssd']) && preg_match('/SSD/i', $n)) $o['ssdType'] = 'SSD';
  if (preg_match('/\b(RTX|GTX|RX)\s?(\d{4})\s?(Ti)?(?:[^|+]*?(\d{1,2})\s?GB)?/i', $n, $m)) {
    $o['gpu'] = strtoupper($m[1]) . ' ' . $m[2] . (!empty($m[3]) ? ' Ti' : '') . (!empty($m[4]) && (int) $m[4] <= 24 ? ' ' . $m[4] . ' GB' : '');
  }
  if (preg_match('/\b(8K|4K|UHD|QHD|WQHD|WUXGA|FHD\+?|Full HD|HD)\b/i', $n, $m)) {
    $r = strtoupper($m[1]);
    $o['res'] = preg_match('/4K|UHD/', $r) ? '4K UHD' : (($r === 'FULL HD' || strpos($r, 'FHD') === 0) ? 'Full HD' : $r);
  }
  if (preg_match('/\b(Neo QLED|QLED|OLED|QNED|NanoCell|Crystal UHD|Mini LED|IPS|VA)\b/i', $n, $m)) {
    $p = $m[1];
    if (strtolower($p) === 'qled') $p = 'QLED'; elseif (strtolower($p) === 'oled') $p = 'OLED'; elseif (strtolower($p) === 'ips') $p = 'IPS';
    $o['panel'] = $p;
  }
  if (preg_match('/(Google TV|Android TV|Tizen|web ?OS|VIDAA|Roku|Fire TV|Windows 11)/i', $n, $m)) {
    $os = $m[1];
    $os = preg_replace(array('/vidaa/i', '/tizen/i', '/web ?os/i', '/google tv/i'), array('VIDAA', 'Tizen', 'webOS', 'Google TV'), $os);
    $o['os'] = $os;
  }
  if (preg_match('/(\d{2,3})\s?Hz/i', $n, $m)) $o['hz'] = $m[1] . ' Hz';
  if (preg_match('/(\d+(?:[.,]\d+)?)\s?ms\b/i', $n, $m)) $o['ms'] = str_replace(',', '.', $m[1]) . ' ms';
  if (preg_match('/tinta continua|ecotank|ink ?tank|smart ?tank|tanque/iu', $n)) $o['ptype'] = 'Tinta continua';
  elseif (preg_match('/l[áa]ser/iu', $n)) $o['ptype'] = 'Láser';
  if (preg_match('/multifunci|print,? scan|copia|\bdcp\b|\bmfc\b|\bmf\b/iu', $n)) $o['mf'] = true;
  if (preg_match('/wi-?fi|inal[áa]mbric/iu', $n)) $o['wifi'] = true;
  if (preg_match('/\b(4G|LTE|5G)\b/', $n)) $o['lte'] = true;
  return $o;
}

/** Nombre corto: primer tramo antes de «|», «:» o « – »; en computadores, además, antes del primer token de specs. */
function gt_short_name($name, $kind = '') {
  $s = gt_clean($name);
  $parts = explode('|', $s);
  $s = trim($parts[0]);
  $parts = preg_split('/\s[–—-]\s|:\s/u', $s);
  $s = trim($parts[0]);
  if (gt_is_computer($kind)) {
    $cut = '/\s(?:\d{2}(?:[.,]\d)?\s?(?:"|”|″|′|\'\'|pulgadas)|FHD\b|Intel\b|AMD\b|Ryzen\b|R\d-|i[3579]-|Core\s(?:i|Ultra|\d)|Ultra\s\d|RAM\b|\d+\s?GB\b).*/iu';
    $t = preg_replace($cut, '', $s);
    if (count(explode(' ', $t)) < 3) $t = preg_replace($cut, '', preg_replace('/\s\d{2}(?:[.,]\d)?\s?(?:"|”|″|′|\'\'|pulgadas)/iu', '', $s));
    $s = $t;
  }
  $upper_ok = '/^(HP|LG|AOC|MSI|TCL|VTA|VSG|JBL|AIO|AMD|SSD|HDD|RAM|RTX|GTX|TV|HD|FHD|UHD|QHD|WUXGA|QLED|OLED|IPS|VA|USB|HDMI|LED|LTE|4G|5G|PC|NFC|DDR\d|LPDDR\d|WQHD|OS|ROG|TUF|II|III|IV|3K|2K|4K|8K|SIM|CPU|GPU|UPS|SD|DPI|RGB|CDP|XKIM|MF|PS4|PS5|AVR|VIDAA|LCD|DLP|ANSI|WIFI|AI)$/i';
  $words = explode(' ', $s);
  foreach ($words as &$w) {
    if (preg_match('/^[A-ZÁÉÍÓÚÑ]{3,}$/u', $w) && !preg_match($upper_ok, $w)) $w = mb_substr($w, 0, 1) . mb_strtolower(mb_substr($w, 1));
  }
  unset($w);
  $s = implode(' ', $words);
  $s = preg_replace(array('/^Portatil\b/i', '/^Aio\b/'), array('Portátil', 'AIO'), $s);
  foreach (gt_brands() as $b) $s = preg_replace('/\b' . preg_quote($b, '/') . '\b/iu', $b, $s);
  if (mb_strlen($s) > 70) {
    $s = preg_replace('/\s\S*$/u', '', mb_substr($s, 0, 68));
    $s = preg_replace('/(\s(?:y|e|o|con|de|del|para|en|sin|\+))+$/iu', '', $s);
  }
  return trim(preg_replace('/[\s.,;:(]+$/u', '', $s));
}

/** Chips (máx. 4) según el tipo de producto. */
function gt_chips_of($kind, $s, $name) {
  $n = gt_clean($name);
  $segs = array();
  foreach (array_slice(explode('|', $n), 1) as $x) {
    $x = trim($x);
    if ($x !== '' && mb_strlen($x) <= 24 && !preg_match('/^(color|silver|green|grey|gray|negro|black|blanco|white|plata|gris|azul|blue|rojo|fresh blue)\b/iu', $x)) $segs[] = $x;
  }
  $g = function ($k) use ($s) { return isset($s[$k]) ? $s[$k] : null; };
  if (gt_is_computer($kind)) $list = array($g('cpu'), $g('ram'), $g('gpu'), $g('ssd') ? $g('ssd') . ($g('ssdType') ? ' SSD' : '') : null, $g('scr'));
  elseif ($kind === 'tv' || $kind === 'combo') $list = array($g('scr'), $g('res'), $g('panel'), $g('os'), $kind === 'combo' ? 'Barra de sonido' : null);
  elseif ($kind === 'monitor') $list = array($g('scr'), $g('res'), $g('hz'), $g('ms') ? $g('ms') : $g('panel'));
  elseif ($kind === 'printer') $list = array($g('ptype'), $g('mf') ? 'Multifuncional' : null, $g('wifi') ? 'Wi-Fi' : null);
  elseif ($kind === 'tablet') $list = array($g('scr'), $g('ram'), $g('ssd'), $g('lte') ? '4G LTE' : null);
  else {
    $list = array();
    if (preg_match('/(\d{2,4})\s?W\b/i', $n, $m)) $list[] = $m[1] . ' W';
    if (preg_match('/(\d[.,]\d)\s?Ch/i', $n, $m)) $list[] = str_replace(',', '.', $m[1]) . ' Ch';
    if (preg_match('/(\d{3,5})\s?DPI/i', $n, $m)) $list[] = $m[1] . ' DPI';
    if (preg_match('/bluetooth/i', $n)) $list[] = 'Bluetooth';
    if (preg_match('/inal[áa]mbric/iu', $n)) $list[] = 'Inalámbrico'; elseif (preg_match('/al[áa]mbric/iu', $n)) $list[] = 'Alámbrico';
    if (preg_match('/dolby/i', $n)) $list[] = 'Dolby';
    if (preg_match('/\bRGB\b/i', $n)) $list[] = 'RGB';
    if (preg_match('/(\d{3,4})\s?VA\b/i', $n, $m)) $list[] = $m[1] . ' VA';
    if ($kind === 'storage' && preg_match('/(\d{2,4})\s?GB/i', $n, $m)) $list[] = $m[1] . ' GB';
    if (preg_match('/\bPS4\b/', $n)) $list[] = 'PS4';
    if (preg_match('/\bPS5\b/', $n)) $list[] = 'PS5';
    if ($g('scr') && $kind === 'projector') $list[] = $g('scr');
    if ($g('res') && ($kind === 'projector' || $kind === 'camera')) $list[] = $g('res');
    $list = array_merge($list, $segs);
  }
  return array_slice(array_values(array_unique(array_filter($list))), 0, 4);
}

/** Filas de especificaciones para la tabla de la ficha. */
function gt_spec_rows($kind, $s, $brand) {
  $labels = array(
    'cpu' => 'Procesador', 'ram' => 'Memoria RAM', 'ssd' => 'Almacenamiento', 'gpu' => 'Tarjeta gráfica', 'scr' => 'Pantalla',
    'res' => 'Resolución', 'panel' => 'Panel', 'hz' => 'Frecuencia', 'ms' => 'Tiempo de respuesta', 'os' => 'Sistema operativo', 'ptype' => 'Tipo de impresión',
  );
  $rows = array();
  if ($brand) $rows[] = array('Marca', $brand);
  foreach ($labels as $k => $l) {
    if (empty($s[$k])) continue;
    $v = $s[$k];
    if ($k === 'ssd' && !empty($s['ssdType'])) $v .= ' SSD';
    $rows[] = array($l, $v);
  }
  if (!empty($s['mf'])) $rows[] = array('Funciones', 'Imprime, copia y escanea');
  if (!empty($s['wifi'])) $rows[] = array('Conectividad', 'Wi-Fi');
  if (!empty($s['lte'])) $rows[] = array('Red móvil', '4G LTE');
  return $rows;
}
