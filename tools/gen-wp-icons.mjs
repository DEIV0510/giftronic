// Genera wp-plugin/giftronic-rediseno/inc/icons.php a partir de los íconos del prototipo (src/art.js).
//   node tools/gen-wp-icons.mjs
// Los íconos se usan como sprite: <use href="#gt-i-nombre"> en cada lugar y los <symbol> una sola vez por página.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const src = readFileSync(root + 'src/art.js', 'utf8');
const start = src.indexOf('const ICONS = {');
const block = src.slice(start + 15, src.indexOf('\n};', start));
const rows = [...block.matchAll(/^\s*([a-z0-9]+):'(.*)',?\s*$/gm)].map(m => [m[1], m[2]]);
if (rows.length < 40) throw new Error('No se leyeron los íconos: ' + rows.length);

const D = '$'; // para escribir variables de PHP sin pelear con las plantillas de JS
const php = `<?php
/** Íconos (estilo Lucide, rejilla de 24 px). Generado por tools/gen-wp-icons.mjs: no editar a mano. */
if (!defined('ABSPATH')) exit;

function gt_icons() {
  static ${D}i = null;
  if (${D}i === null) ${D}i = array(
${rows.map(([k, v]) => `    '${k}' => '${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`).join('\n')}
  );
  return ${D}i;
}

/**
 * SVG del ícono: una referencia al sprite que se imprime una sola vez al abrir el <body> (gt_icon_sprite).
 * Relleno, color y trazo vienen del CSS (.gt-i); solo se escribe el grosor cuando no es el normal (1,8).
 */
function gt_ic(${D}name, ${D}size = 20, ${D}sw = 1.8, ${D}class = 'gt-i') {
  ${D}i = gt_icons();
  if (!isset(${D}i[${D}name])) return '';
  ${D}style = ((float) ${D}sw !== 1.8) ? ' style="stroke-width:' . esc_attr(${D}sw) . '"' : '';
  return '<svg class="' . esc_attr(${D}class) . '" width="' . (int) ${D}size . '" height="' . (int) ${D}size . '"' . ${D}style . ' aria-hidden="true"><use href="#gt-i-' . esc_attr(${D}name) . '"/></svg>';
}

/** Sprite con todos los íconos (se imprime una vez por página). */
function gt_icon_sprite() {
  ${D}out = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>';
  foreach (gt_icons() as ${D}k => ${D}d) ${D}out .= '<symbol id="gt-i-' . ${D}k . '" viewBox="0 0 24 24">' . ${D}d . '</symbol>';
  return ${D}out . '</defs></svg>';
}
`;
mkdirSync(root + 'wp-plugin/giftronic-rediseno/inc', { recursive: true });
writeFileSync(root + 'wp-plugin/giftronic-rediseno/inc/icons.php', php);
console.log('icons.php:', rows.length, 'íconos');
