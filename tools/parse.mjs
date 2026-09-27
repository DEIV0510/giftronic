// Análisis de los nombres del catálogo real: marca, categoría, specs, nombre corto y chips.
// Los nombres de la tienda vienen como «Nombre | spec | spec | color».

export const BRANDS = ['Samsung','Hisense','LG','iFFALCON','TCL','Kalley','Challenger','Xiaomi','Lenovo','HP','Acer','ASUS','Dell','Apple','MSI','Huawei','Honor','Brother','Epson','Ricoh','Canon','Caixun','AOC','VTA','VSG','HyperX','Logitech','Redragon','Genius','JBL','Sony','Microsoft','Nintendo','Kingston','Western Digital','Seagate','SanDisk','TP-Link','Mercusys','Tenda','Motorola','Janus','Gigabyte','Corsair','Razer','Trust','Xtech','Klip Xtreme','Philips','BenQ','ViewSonic','Forza','Unitec','Adata','Crucial','Hikvision','Ezviz','Imou','Amazon','Google','Nokia','Oppo','Realme','Vivo','Infinix','Tecno','ZTE','Alcatel','Panasonic','Sharp','Toshiba','Skyworth','Olimpo','Primus','Cooler Master','Thermaltake','Havit','Energy Sistem','Maxell','Anker','Baseus','Ugreen','Pantum','Compumax','XKIM','Sennheiser','CDP'];
const esc = s => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
const BRAND_RE = new RegExp('\\b(' + BRANDS.map(esc).join('|') + ')\\b', 'i');
const ALIAS = [[/gygabyte/i, 'Gigabyte'], [/\bipad\b|\bmacbook\b|\biphone\b/i, 'Apple'], [/\bomen\b|\bvictus\b/i, 'HP'], [/\blegion\b|thinkcentre|thinkvision|thinkpad|ideapad|ideacentre/i, 'Lenovo'], [/\bps[45]\b|playstation/i, 'Sony'], [/\brog\b|\btuf\b|vivobook|zenbook/i, 'ASUS']];
const UPPER_OK = /^(HP|LG|AOC|MSI|TCL|VTA|VSG|JBL|AIO|AMD|SSD|HDD|RAM|RTX|GTX|TV|HD|FHD|UHD|QHD|WUXGA|QLED|OLED|IPS|VA|USB|HDMI|LED|LTE|4G|5G|PC|NFC|DDR\d|LPDDR\d|WQHD|OS|ROG|TUF|II|III|IV|3K|2K|4K|8K|SIM|CPU|GPU|UPS|SD|DPI|RGB|CDP|XKIM|MF|PS4|PS5|AVR)$/i;
const COMPUTERS = ['portatiles', 'portatiles-gamer', 'all-in-one', 'pc-escritorio', 'pc-gaming'];

export function brandOf(name) {
  const m = name.match(BRAND_RE);
  if (m) return BRANDS.find(b => b.toLowerCase() === m[1].toLowerCase());
  const a = ALIAS.find(([re]) => re.test(name));
  return a ? a[1] : null;
}
const clean = s => s.replace(/[®™]/g, '').replace(/\s+/g, ' ').trim();

// Nombre corto: primer tramo antes de «|», «:» o « – »; en computadores, además, antes del primer token de specs
const SPEC_CUT = /\s(?:\d{2}(?:[.,]\d)?\s?(?:"|”|″|′|''|pulgadas)|FHD\b|Intel\b|AMD\b|Ryzen\b|R\d-|i[3579]-|Core\s(?:i|Ultra|\d)|Ultra\s\d|RAM\b|\d+\s?GB\b).*/i;
export function shortName(name, cat) {
  let s = clean(name).split('|')[0];
  s = s.split(/\s[–—-]\s|:\s/)[0];
  if (COMPUTERS.includes(cat)) {
    let t = s.replace(SPEC_CUT, '');
    if (t.split(' ').length < 3) t = s.replace(/\s\d{2}(?:[.,]\d)?\s?(?:"|”|″|′|''|pulgadas)/i, '').replace(SPEC_CUT, '');
    s = t;
  }
  s = s.split(' ').map(w => (/^[A-ZÁÉÍÓÚÑ]{3,}$/.test(w) && !UPPER_OK.test(w)) ? w.charAt(0) + w.slice(1).toLowerCase() : w).join(' ');
  s = s.replace(/^Portatil\b/i, 'Portátil').replace(/^Aio\b/, 'AIO');
  for (const b of BRANDS) s = s.replace(new RegExp('\\b' + esc(b) + '\\b', 'gi'), b);
  if (s.length > 70) s = s.slice(0, 68).replace(/\s\S*$/, '');
  return s.replace(/[\s.,;:(]+$/, '').trim();
}

// Specs a partir del nombre
export function specsOf(name) {
  const n = clean(name).replace(/SDD/g, 'SSD');
  const out = {};
  const scr = n.match(/(\d{2}(?:[.,]\d)?)\s?(?:"|”|″|′|''|pulgadas|pulg\b)/i);
  if (scr) out.scr = scr[1].replace(',', '.') + '"';
  let m;
  if ((m = n.match(/Ultra\s*(\d)[-\s]?(\d{3}[A-Z]{0,2})/i))) { out.cpu = `Core Ultra ${m[1]} ${m[2].toUpperCase()}`; out.cpuFam = `Intel Core Ultra ${m[1]}`; }
  else if ((m = n.match(/\bi([3579])[-\s]?(\d{4,5}[A-Z]{0,2})/i))) { out.cpu = `Core i${m[1]}-${m[2].toUpperCase()}`; out.cpuFam = `Intel Core i${m[1]}`; }
  else if ((m = n.match(/Core\s*(\d)[-\s]?(N?\d{3}[A-Z]{0,2})/i))) { out.cpu = `Core ${m[1]} ${m[2].toUpperCase()}`; out.cpuFam = `Intel Core ${m[1]}`; }
  else if ((m = n.match(/(?:Ryzen|\bR)[-\s]?([3579])[-\s]?(\d{4}[A-Z]{0,2})/i))) { out.cpu = `Ryzen ${m[1]} ${m[2].toUpperCase()}`; out.cpuFam = `AMD Ryzen ${m[1]}`; }
  else if ((m = n.match(/Athlon\s*(?:Silver|Gold)?\s*(\d{4}[A-Z]{0,2})/i))) { out.cpu = `Athlon ${m[1].toUpperCase()}`; out.cpuFam = 'AMD Athlon'; }
  else if ((m = n.match(/\b(Celeron|Pentium)\b\s*(N?\d{3,4})?/i))) { const f = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase(); out.cpu = f + (m[2] ? ' ' + m[2].toUpperCase() : ''); out.cpuFam = 'Intel ' + f; }
  else if ((m = n.match(/\bN(100|150|200|305|355)\b/))) { out.cpu = `Intel N${m[1]}`; out.cpuFam = 'Intel N'; }
  else if ((m = n.match(/\bChip M([1-4])\b|\bM([1-4])\s(?:Pro|Max)\b/i))) { out.cpu = `Apple M${m[1] || m[2]}`; out.cpuFam = 'Apple M'; }
  const ram = n.match(/(?:RAM\s*(\d{1,2})\s?GB)|(?:(\d{1,2})\s?GB\s*(?:de\s*)?(?:RAM|DDR\d|LPDDR\d))/i);
  const gbs = [...n.matchAll(/(\d{1,4})\s?GB/gi)].map(x => +x[1]);
  if (ram) out.ram = (ram[1] || ram[2]) + ' GB';
  else if (gbs.length >= 2 && Math.min(...gbs) <= 32) out.ram = Math.min(...gbs) + ' GB';
  const tb = n.match(/(\d)\s?TB/i);
  const st = [...n.matchAll(/(\d{3,4})\s?GB\s*(SSD|HDD|eMMC)?/gi)].find(x => +x[1] >= 64);
  if (tb) out.ssd = tb[1] + ' TB'; else if (st) out.ssd = st[1] + ' GB';
  if (out.ssd && /SSD/i.test(n)) out.ssdType = 'SSD';
  const gpu = n.match(/\b(RTX|GTX|RX)\s?(\d{4})\s?(Ti)?(?:[^|+]*?(\d{1,2})\s?GB)?/i);
  if (gpu) out.gpu = `${gpu[1].toUpperCase()} ${gpu[2]}${gpu[3] ? ' Ti' : ''}${gpu[4] && +gpu[4] <= 24 ? ' ' + gpu[4] + ' GB' : ''}`;
  const res = n.match(/\b(8K|4K|UHD|QHD|WQHD|WUXGA|FHD\+?|Full HD|HD)\b/i);
  if (res) { const r = res[1].toUpperCase(); out.res = /4K|UHD/.test(r) ? '4K UHD' : (r === 'FULL HD' || r.startsWith('FHD')) ? 'Full HD' : r; }
  const panel = n.match(/\b(Neo QLED|QLED|OLED|QNED|NanoCell|Crystal UHD|Mini LED|IPS|VA)\b/i);
  if (panel) out.panel = panel[1].replace(/^qled$/i, 'QLED').replace(/^oled$/i, 'OLED').replace(/^ips$/i, 'IPS');
  const os = n.match(/(Google TV|Android TV|Tizen|web ?OS|VIDAA|Roku|Fire TV|Windows 11)/i);
  if (os) out.os = os[1].replace(/vidaa/i, 'VIDAA').replace(/tizen/i, 'Tizen').replace(/web ?os/i, 'webOS').replace(/google tv/i, 'Google TV');
  const hz = n.match(/(\d{2,3})\s?Hz/i); if (hz) out.hz = hz[1] + ' Hz';
  const ms = n.match(/(\d+(?:[.,]\d+)?)\s?ms\b/i); if (ms) out.ms = ms[1].replace(',', '.') + ' ms';
  if (/tinta continua|ecotank|ink ?tank|smart ?tank|tanque/i.test(n)) out.ptype = 'Tinta continua';
  else if (/l[áa]ser/i.test(n)) out.ptype = 'Láser';
  if (/multifunci|print,? scan|copia|\bdcp\b|\bmfc\b|\bmf\b/i.test(n)) out.mf = true;
  if (/wi-?fi|inal[áa]mbric/i.test(n)) out.wifi = true;
  if (/\b(4G|LTE|5G)\b/.test(n)) out.lte = true;
  return out;
}

// Categoría del prototipo a partir del nombre y de la categoría de WooCommerce
const GAMER = /gamer|gaming|nitro|\brog\b|\btuf\b|omen|victus|legion|\bloq\b|predator|rtx|gtx|odyssey|esports|strix/i;
export function catOf(name, wcCat) {
  const c = (wcCat || '').toLowerCase();
  const isTV = /^(televisor|tv\b|smart tv)/i.test(name) || (/(^|\/)tv($|\/)/.test(c) && !/^barra/i.test(name));
  if (isTV && /(con|\+)\s*barra|combo/i.test(name)) return 'combos-tv';
  if (isTV) return 'televisores';
  if (/tablet|ipad|\btab\b|galaxy tab/i.test(name)) return 'tablets';
  if (/smartwatch|reloj inteligente|smart band|\bwatch\b/i.test(name)) return 'smartwatches';
  if (/celular|smartphone|iphone|galaxy [asmz]\d/i.test(name)) return 'celulares';
  if (/gamepad|joystick|volante|control (?:inal|al[áa]m|gamer|gaming|pc|vsg|acer)/i.test(name)) return 'accesorios-gamer';
  if (/barra de sonido|soundbar|parlante|altavoz|speaker|aud[íi]fono|diadema|headset|auricular|earbuds|torre de sonido/i.test(name)) return 'audio';
  if (/port[áa]til|laptop|notebook|macbook|chromebook|expertbook|vivobook|zenbook|thinkpad|ideapad|strix scar|zephyrus/i.test(name) && !/\bbase\b|malet[íi]n|morral|bolso|cargador|soporte/i.test(name)) return GAMER.test(name) ? 'portatiles-gamer' : 'portatiles';
  if (/all in one|\baio\b|todo en uno/i.test(name) || (/all in one/.test(c) && !/monitor|mouse|teclado|cargador|bolso/i.test(name))) return 'all-in-one';
  if (/pc de escritorio|computador de escritorio|desktop|thinkcentre|torre gamer/i.test(name) || /pc de escritorio/.test(c)) return GAMER.test(name) ? 'pc-gaming' : 'pc-escritorio';
  if (/monitor/i.test(name)) return 'monitores';
  if (/impresora|multifuncional|ecotank|esc[áa]ner|plotter/i.test(name) || /impresi/.test(c)) return 'impresion';
  if (/consola|playstation|\bps[45]\b|xbox|nintendo|switch|videojuego|\bjuego\b/i.test(name) || /consolas/.test(c)) return 'consolas';
  if (/video ?beam|proyector|pantalla de proyecci|tel[óo]n/i.test(name) || /video beams/.test(c)) return 'proyectores';
  if (/webcam|c[áa]mara/i.test(name) || /c[áa]maras/.test(c)) return 'camaras';
  if (/microsd|tarjeta de memoria|memoria sd/i.test(name)) return 'tarjetas-de-memoria';
  if (/disco|\bssd\b|memoria usb|pendrive|almacenamiento/i.test(name) || /almacenamiento/.test(c)) return 'almacenamiento';
  if (/router|repetidor|access point|mesh|adaptador (usb )?wi|switch de red|tarjeta de red/i.test(name) || /redes/.test(c)) return 'redes';
  if (/cable|\bhub\b|adaptador|convertidor/i.test(name)) return 'cables-y-hubs';
  if (/mouse|teclado|mousepad|micr[óo]fono/i.test(name) || /mouses|perif[ée]ricos/.test(c)) return GAMER.test(name) ? 'accesorios-gamer' : 'perifericos';
  return 'accesorios-pc';
}

// Uso (heurística documentada en las decisiones de diseño)
export function usesOf(s, cat) {
  if (!['portatiles', 'portatiles-gamer'].includes(cat)) return undefined;
  const u = new Set(), ram = parseInt(s.ram) || 0, fam = s.cpuFam || '';
  if (cat === 'portatiles-gamer' || s.gpu) u.add('Gamer');
  if (/i3|Ryzen 3|Athlon|Celeron|Pentium|Intel N|Core 3/.test(fam) || (ram && ram <= 8)) u.add('Estudio');
  if (/i5|Ryzen 5|Core 5|Ultra 5|i7|Ryzen 7|Core 7|Ultra 7/.test(fam) || ram >= 16) u.add('Oficina');
  if (ram >= 16 && (/i7|i9|Ryzen 7|Ryzen 9|Ultra 7|Ultra 9|Core 7/.test(fam) || s.gpu)) u.add('Diseño');
  if (!u.size) u.add('Oficina');
  return ['Estudio', 'Oficina', 'Gamer', 'Diseño'].filter(x => u.has(x));
}

// Chips (máx. 4) según el tipo de producto
export function chipsOf(cat, s, name) {
  const segs = clean(name).split('|').slice(1).map(x => x.trim()).filter(x => x && x.length <= 24 && !/^(color|silver|green|grey|gray|negro|black|blanco|white|plata|gris|azul|blue|rojo|fresh blue)\b/i.test(x));
  const pick = arr => [...new Set(arr.filter(Boolean))].slice(0, 4);
  if (COMPUTERS.includes(cat)) return pick([s.cpu, s.ram, s.gpu, s.ssd && s.ssd + (s.ssdType ? ' SSD' : ''), s.scr]);
  if (['televisores', 'combos-tv'].includes(cat)) return pick([s.scr, s.res, s.panel, s.os, cat === 'combos-tv' ? 'Barra de sonido' : null]);
  if (cat === 'monitores') return pick([s.scr, s.res, s.hz, s.ms || s.panel]);
  if (cat === 'impresion') return pick([s.ptype, s.mf ? 'Multifuncional' : null, s.wifi ? 'Wi-Fi' : null]);
  if (cat === 'tablets') return pick([s.scr, s.ram, s.ssd, s.lte ? '4G LTE' : null]);
  const n = clean(name), g = [];
  let m;
  if ((m = n.match(/(\d{2,4})\s?W\b/i))) g.push(m[1] + ' W');
  if ((m = n.match(/(\d[.,]\d)\s?Ch/i))) g.push(m[1].replace(',', '.') + ' Ch');
  if ((m = n.match(/(\d{3,5})\s?DPI/i))) g.push(m[1] + ' DPI');
  if (/bluetooth/i.test(n)) g.push('Bluetooth');
  if (/inal[áa]mbric/i.test(n)) g.push('Inalámbrico'); else if (/al[áa]mbric/i.test(n)) g.push('Alámbrico');
  if (/dolby/i.test(n)) g.push('Dolby');
  if (/\bRGB\b/i.test(n)) g.push('RGB');
  if ((m = n.match(/(\d{3,4})\s?VA\b/i))) g.push(m[1] + ' VA');
  if ((m = n.match(/(\d{2,4})\s?GB/i)) && ['almacenamiento', 'tarjetas-de-memoria', 'accesorios-pc'].includes(cat)) g.push(m[1] + ' GB');
  if (/\bPS4\b/.test(n)) g.push('PS4'); if (/\bPS5\b/.test(n)) g.push('PS5');
  if (s.scr && cat === 'proyectores') g.push(s.scr);
  if (s.res && ['proyectores', 'camaras'].includes(cat)) g.push(s.res);
  return pick([...g, ...segs]);
}

export const KIND = { 'combos-tv':'combo', televisores:'tv', audio:'soundbar', portatiles:'laptop', 'portatiles-gamer':'laptop', 'all-in-one':'aio', 'pc-escritorio':'aio', 'pc-gaming':'monitor', monitores:'monitor', impresion:'printer', tablets:'tablet', proyectores:'projector', perifericos:'mouse', 'accesorios-gamer':'gamepad', consolas:'gamepad', celulares:'phone', smartwatches:'phone', camaras:'monitor', almacenamiento:'mouse', 'tarjetas-de-memoria':'mouse', redes:'monitor', 'cables-y-hubs':'mouse', 'accesorios-pc':'mouse' };
export const TYPE = { 'combos-tv':'Combo TV + barra de sonido', televisores:'Televisor', audio:'Audio', portatiles:'Portátil', 'portatiles-gamer':'Portátil gamer', 'all-in-one':'Computador All in One', 'pc-escritorio':'PC de escritorio', 'pc-gaming':'PC gamer', monitores:'Monitor', impresion:'Impresora', tablets:'Tablet', proyectores:'Proyector', perifericos:'Periférico', 'accesorios-gamer':'Accesorio gamer', consolas:'Consolas y videojuegos', celulares:'Celular', smartwatches:'Smartwatch', camaras:'Cámara', 'tarjetas-de-memoria':'Tarjeta de memoria', almacenamiento:'Almacenamiento', redes:'Redes', 'cables-y-hubs':'Cable o adaptador', 'accesorios-pc':'Accesorio de computación' };
