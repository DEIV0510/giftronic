// Arma el plugin de WordPress del rediseño.
//   node tools/build-wp.mjs          -> CSS con prefijo .gt + ZIP en dist/giftronic-rediseno.zip
// Los estilos se escriben sin prefijo en wp-plugin/css/*.css; aquí cada selector queda bajo body.gt para
// ganarle a Astra y a WooCommerce sin !important y sin tocar nada cuando el rediseño está apagado.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cssDir = root + 'wp-plugin/css/';
const plugin = root + 'wp-plugin/giftronic-rediseno/';

function splitTop(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim()).filter(Boolean);
}
function prefixSel(sel) {
  return splitTop(sel).map(s => {
    if (/^(html|:root)\b/.test(s)) return s;
    // html body.gt suma especificidad suficiente para ganarle al modo oscuro de Astra (.astra-dark-mode-enable .woocommerce-js label)
    if (/^body\b/.test(s)) return s.replace(/^body/, 'html body.gt');
    return 'html body.gt ' + s;
  }).join(',');
}
// Recorre el CSS respetando llaves: prefija reglas, entra en @media/@supports, deja @keyframes/@font-face intactos.
function prefixCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0, out = '';
  function block(stopAtClose) {
    let res = '';
    while (i < css.length) {
      const ch = css[i];
      if (ch === '}') { if (stopAtClose) { i++; return res; } i++; continue; }
      if (/\s/.test(ch)) { i++; continue; }
      const open = css.indexOf('{', i);
      const semi = css.indexOf(';', i);
      if (open === -1) break;
      if (semi !== -1 && semi < open && css[i] === '@') { res += css.slice(i, semi + 1); i = semi + 1; continue; }
      const head = css.slice(i, open).trim();
      i = open + 1;
      if (/^@(media|supports|container)/.test(head)) { res += head + '{' + block(true) + '}'; continue; }
      // cuerpo hasta la llave de cierre correspondiente
      let depth = 1, j = i;
      while (j < css.length && depth) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
      const body = css.slice(i, j - 1).trim();
      i = j;
      if (/^@(keyframes|font-face|-webkit-keyframes)/.test(head)) { res += head + '{' + body + '}'; continue; }
      res += prefixSel(head) + '{' + body.replace(/\s*\n\s*/g, '') + '}\n';
    }
    return res;
  }
  out = block(false);
  return out;
}

const files = readdirSync(cssDir).filter(f => f.endsWith('.css')).sort();
const src = files.map(f => readFileSync(cssDir + f, 'utf8')).join('\n');
const css = '/* Giftronic Rediseño — generado por tools/build-wp.mjs desde wp-plugin/css/. No editar a mano. */\n' + prefixCss(src);
mkdirSync(plugin + 'assets', { recursive: true });
writeFileSync(plugin + 'assets/gt.css', css);
console.log('gt.css', (css.length / 1024).toFixed(1), 'KB desde', files.join(', '));

// ZIP con rutas «giftronic-rediseno/…» (tar de Windows crea ZIP con barras normales).
mkdirSync(root + 'dist', { recursive: true });
const zip = root + 'dist/giftronic-rediseno.zip';
if (existsSync(zip)) rmSync(zip);
execFileSync(process.platform === 'win32' ? 'C:/Windows/System32/tar.exe' : 'zip',process.platform === 'win32' ? ['-a', '-c', '-f', '../dist/giftronic-rediseno.zip', 'giftronic-rediseno'] : ['-r', '../dist/giftronic-rediseno.zip', 'giftronic-rediseno'], { cwd: root + 'wp-plugin' });
console.log('ZIP:', zip);
