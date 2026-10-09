// Genera wp-plugin/giftronic-rediseno/inc/icons.php a partir de los íconos del prototipo (src/art.js).
//   node tools/gen-wp-icons.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const src = readFileSync(root + 'src/art.js', 'utf8');
const start = src.indexOf('const ICONS = {');
const block = src.slice(start + 15, src.indexOf('\n};', start));
const rows = [...block.matchAll(/^\s*([a-z0-9]+):'(.*)',?\s*$/gm)].map(m => [m[1], m[2]]);
if (rows.length < 40) throw new Error('No se leyeron los íconos: ' + rows.length);
const php = `<?php
/** Íconos (estilo Lucide, rejilla de 24 px). Generado por tools/gen-wp-icons.mjs: no editar a mano. */
if (!defined('ABSPATH')) exit;

function gt_icons() {
  static $i = null;
  if ($i === null) $i = array(
${rows.map(([k, v]) => `    '${k}' => '${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`).join('\n')}
  );
  return $i;
}

/** SVG del ícono. */
function gt_ic($name, $size = 20, $sw = 1.8, $class = 'gt-i') {
  $i = gt_icons();
  $d = isset($i[$name]) ? $i[$name] : '';
  return '<svg class="' . esc_attr($class) . '" width="' . (int) $size . '" height="' . (int) $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' . esc_attr($sw) . '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . $d . '</svg>';
}
`;
mkdirSync(root + 'wp-plugin/giftronic-rediseno/inc', { recursive: true });
writeFileSync(root + 'wp-plugin/giftronic-rediseno/inc/icons.php', php);
console.log('icons.php:', rows.length, 'íconos');
