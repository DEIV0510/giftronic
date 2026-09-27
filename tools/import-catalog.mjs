// Importa el catálogo real de giftronic04.com (catalogo.json + imagenes/) al prototipo.
//   node tools/import-catalog.mjs [carpeta-origen]
// Genera:
//   src/catalog.js          -> arreglo CATALOG con los productos normalizados
//   img/<id>.webp           -> foto principal optimizada (800 px) para abrir index.html en local
//   dist/img-pack.json      -> fotos en 480 px como data URI para la versión publicada (Artifact)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { brandOf, shortName, specsOf, catOf, chipsOf, usesOf, KIND, TYPE } from './parse.mjs';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/Lenovo/Desktop/PROYECTOS-CLAUDE/capsclub/node_modules/sharp');
const SRC = (process.argv[2] || 'C:/Users/Lenovo/Desktop/GIFTRONIC/giftronic04-imagenes').replace(/\\/g, '/');
const ROOT = new URL('../', import.meta.url);
const raw = JSON.parse(readFileSync(`${SRC}/catalogo.json`, 'utf8'));
const BANNER = /CREDITO-SUMAS-PAY|ADDI-NEW|MEDIOS-DE-CREDITO/i;

const slugOf = url => (url.match(/product\/([^/]+)\/?$/) || [])[1] || '';
const TYPE_WORDS = /^(port[áa]til|gamer|televisor|tv|smart|monitor|curvo|gaming|impresora|multifuncional|inal[áa]mbrica|l[áa]ser|tablet|computador|aio|all|in|one|pc|mouse|teclado|combo|barra|de|sonido|aud[íi]fonos|diadema|proyector|led|control|micr[óo]fono)$/i;
function modelOf(short, brand) {
  const w = short.split(' ');
  let i = 0;
  while (i < w.length - 1 && (TYPE_WORDS.test(w[i]) || (brand && w[i].toLowerCase() === brand.toLowerCase()))) i++;
  const m = w.slice(i).join(' ').replace(new RegExp('\\b' + (brand || '§') + '\\b\\s?', 'i'), '').trim();
  return m.length >= 3 ? m : short;
}
function specRows(s, brand, model, name) {
  const r = [];
  if (brand) r.push(['Marca', brand]);
  r.push(['Referencia', model]);
  if (s.cpu) r.push(['Procesador', s.cpu]);
  if (s.ram) r.push(['Memoria RAM', s.ram]);
  if (s.ssd) r.push(['Almacenamiento', s.ssd + (s.ssdType ? ' SSD' : '')]);
  if (s.gpu) r.push(['Gráficos', s.gpu]);
  if (s.scr) r.push(['Pantalla', s.scr + (s.res ? ' ' + s.res : '')]);
  else if (s.res) r.push(['Resolución', s.res]);
  if (s.panel) r.push(['Panel', s.panel]);
  if (s.os) r.push(['Sistema operativo', s.os]);
  if (s.hz) r.push(['Frecuencia', s.hz]);
  if (s.ms) r.push(['Tiempo de respuesta', s.ms]);
  if (s.ptype) r.push(['Tipo', s.ptype]);
  if (s.mf) r.push(['Funciones', 'Multifuncional']);
  if (s.wifi) r.push(['Conectividad', 'Wi-Fi']);
  if (s.lte) r.push(['Conectividad móvil', '4G LTE']);
  const extra = name.split('|').slice(1).map(x => x.trim()).filter(Boolean);
  if (extra.length) r.push(['Características', extra.join(' · ')]);
  return r;
}

let list = raw.map((p, i) => {
  const cat = catOf(p.nombre, p.categoria), s = specsOf(p.nombre), brand = brandOf(p.nombre) || '';
  const short = shortName(p.nombre, cat), model = modelOf(short, brand);
  const a = {};
  if (s.cpuFam) a.cpu = s.cpuFam;
  if (s.ram) a.ram = s.ram;
  if (s.ssd) a.ssd = s.ssd;
  if (s.scr) { a.scr = s.scr; a.size = s.scr; }
  if (s.res) a.res = s.res;
  if (s.os) a.os = s.os;
  if (s.panel) a.panel = s.panel;
  if (s.hz) a.hz = s.hz;
  if (s.ptype) a.ptype = s.ptype;
  if (s.mf) a.mf = true;
  const use = usesOf(s, cat); if (use) a.use = use;
  const gal = [...new Set(p.galeria_urls)].filter(u => !BANNER.test(u));
  return {
    id: p.id, slug: slugOf(p.url_producto) || String(p.id), brand, cat, name: short, model, full: p.nombre.replace(/\s+/g, ' ').trim(),
    type: TYPE[cat] + (s.scr && !['televisores', 'combos-tv'].includes(cat) ? ` de ${s.scr}` : ''),
    antes: p.precio_antes, precio: p.precio_ahora, stock: p.en_stock ? null : 0, rank: i + 100,
    chips: chipsOf(cat, s, p.nombre), a, spec: specRows(s, brand, model, p.nombre),
    art: { k: KIND[cat] || 'monitor', h: 200 + (p.id % 140), ...(cat === 'portatiles-gamer' ? { base: 'dark', glow: true } : {}) },
    tags: [cat === 'combos-tv' ? 'Combo' : null, /gamer|gaming/i.test(p.nombre) || cat === 'portatiles-gamer' ? 'Gamer' : null].filter(Boolean),
    wc: p.categoria, url: p.url_producto.replace('/index.php/', '/'), imgUrl: p.imagen_principal_url, gal, local: p.imagen_local
  };
});

// Mismo portátil en varias versiones de RAM -> un producto con variantes
const groups = {};
list.filter(p => ['portatiles', 'portatiles-gamer'].includes(p.cat)).forEach(p => {
  const k = [p.brand, p.name, p.a.cpu, p.a.ssd, p.spec.find(r => r[0] === 'Procesador')?.[1]].join('|');
  (groups[k] = groups[k] || []).push(p);
});
const drop = new Set();
for (const g of Object.values(groups)) {
  // solo si el nombre trae un código de modelo (letras + números); con nombres genéricos podrían ser equipos distintos
  if (g.length < 2 || new Set(g.map(p => p.a.ram)).size !== g.length || !/\b(?=\S*\d)(?=\S*[a-z])\S{3,}\b/i.test(g[0].name.replace(/^Portátil\s(Gamer\s)?/i, ''))) continue;
  g.sort((x, y) => parseInt(x.a.ram) - parseInt(y.a.ram));
  const base = g[0], rams = g.map(p => p.a.ram);
  base.variants = g.map(p => ({ v: p.a.ram, antes: p.antes, precio: p.precio, stock: p.stock, id: p.id }));
  base.a.ram = rams;
  base.chips = base.chips.map(c => c === rams[0] ? `${parseInt(rams[0])} a ${rams[rams.length - 1]}` : c);
  base.spec = base.spec.map(r => r[0] === 'Memoria RAM' ? ['Memoria RAM', rams.join(', ') + ' según versión'] : r);
  base.antes = Math.min(...g.map(p => p.antes)); base.precio = Math.min(...g.map(p => p.precio));
  base.stock = g.some(p => p.stock !== 0) ? null : 0;
  g.slice(1).forEach(p => drop.add(p.id));
  console.log('variantes:', base.id, base.name, base.variants.map(v => v.v).join(' / '));
}
list = list.filter(p => !drop.has(p.id));

// Imágenes
mkdirSync(new URL('img/', ROOT), { recursive: true });
mkdirSync(new URL('dist/', ROOT), { recursive: true });
const pack = {};
let done = 0;
for (const p of list) {
  const src = `${SRC}/${p.local}`;
  const out = new URL(`img/${p.id}.webp`, ROOT);
  if (!existsSync(src)) { console.warn('sin imagen local:', p.id); p.noLocal = true; continue; }
  const base = sharp(src).flatten({ background: '#ffffff' });
  if (!existsSync(out)) await base.clone().resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(out.pathname.replace(/^\/([A-Z]:)/, '$1'));
  const small = await base.clone().resize(480, 480, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
  pack[p.id] = 'data:image/webp;base64,' + small.toString('base64');
  if (++done % 50 === 0) console.log('imágenes', done);
  delete p.local;
}
writeFileSync(new URL('dist/img-pack.json', ROOT), JSON.stringify(pack));
writeFileSync(new URL('src/catalog.js', ROOT), '/* Generado por tools/import-catalog.mjs desde catalogo.json (no editar a mano) */\nconst CATALOG = ' + JSON.stringify(list) + ';\n');
const cats = {}; list.forEach(p => { cats[p.cat] = (cats[p.cat] || 0) + 1; });
console.log('productos:', list.length, cats);
console.log('pack KB:', Math.round(JSON.stringify(pack).length / 1024));
