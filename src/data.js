/* ---------- Catálogo real de la tienda (precio anterior -> precio actual) ---------- */
const WA = '573017913140';
const P = [
  { id:'sam40', brand:'Samsung', name:'TV 40" QLED + barra de sonido HW-B400F', full:'Televisor Samsung 40" QLED QN40Q5FAAKXZL + Barra de sonido HW-B400F', antes:1999999, ahora:999999, chips:['40" QLED','Full HD','Tizen','Barra 2.0 Ch'], tags:['Combo'], art:{k:'combo',h:235}, rating:5, reviews:1 },
  { id:'his40', brand:'Hisense', name:'TV 40" A4NV + barra de sonido compacta', full:'Televisor Hisense 40" A4NV FHD Smart TV VIDAA + Barra de sonido compacta', antes:1999999, ahora:935999, chips:['40" Full HD','Smart TV VIDAA','Barra compacta'], tags:['Combo'], art:{k:'combo',h:188} },
  { id:'sam43c', brand:'Samsung', name:'TV 43" Crystal UHD 4K + barra HW-B400F', full:'TV Samsung Smart 43" Crystal UHD 4K U8500H + Barra HW-B400F', antes:2899999, ahora:1382900, chips:['43" 4K UHD','Crystal UHD','Tizen','Barra 2.0 Ch'], tags:['Combo'], art:{k:'combo',h:205} },
  { id:'sam43', brand:'Samsung', name:'TV 43" Crystal UHD 4K U8500H', full:'Televisor Samsung 43" U8500H Crystal UHD 4K, Tizen OS', antes:2499999, ahora:1210999, chips:['43"','4K UHD','Tizen OS'], art:{k:'tv',h:212} },
  { id:'b400', brand:'Samsung', name:'Barra de sonido HW-B400F', full:'Barra de sonido Samsung HW-B400F 2.0 Ch, subwoofer integrado, Bluetooth', antes:499999, ahora:219999, chips:['2.0 Ch','Subwoofer integrado','Bluetooth'], art:{k:'soundbar'} },
  { id:'hs1000', brand:'Hisense', name:'Barra de sonido HS1000', full:'Barra de sonido Hisense HS1000 120 W, Bluetooth, Dolby Audio', antes:499999, ahora:242999, chips:['120 W','Bluetooth','Dolby Audio'], art:{k:'soundbar'} },
  { id:'acergo', brand:'Acer', name:'Portátil Aspire Go 15', full:'Portátil Acer Aspire Go AG15-71P · i5-13420H · 8 GB · 512 GB SSD · Green', antes:3999999, ahora:1874900, chips:['Intel i5-13420H','8 GB RAM','512 GB SSD','15.6" FHD'], art:{k:'laptop',h:150,base:'green'}, f:{cpu:'Intel Core i5',ram:'8 GB',ssd:'512 GB',scr:'15.6"',use:['Estudio','Trabajo']} },
  { id:'dell3530', brand:'Dell', name:'Portátil Inspiron 15 3530', full:'Portátil Dell Inspiron 15 3530 · 15.6" FHD · i5-1334U · 8 GB · 512 GB SSD', antes:3999999, ahora:1979999, chips:['Intel i5-1334U','8 GB RAM','512 GB SSD','15.6" FHD'], art:{k:'laptop',h:208}, f:{cpu:'Intel Core i5',ram:'8 GB',ssd:'512 GB',scr:'15.6"',use:['Trabajo','Estudio']} },
  { id:'hp15', brand:'HP', name:'Portátil HP 15-fc0029la', full:'Portátil HP 15-fc0029la · Ryzen 5 7520U · 16 GB · 1 TB SSD', antes:4399999, ahora:2199999, chips:['Ryzen 5 7520U','16 GB RAM','1 TB SSD','15.6"'], art:{k:'laptop',h:196}, f:{cpu:'AMD Ryzen 5',ram:'16 GB',ssd:'1 TB',scr:'15.6"',use:['Trabajo','Estudio']} },
  { id:'hp14', brand:'HP', name:'Portátil HP 14-em0217la', full:'Portátil HP 14-em0217la · Athlon 7120U · 8 GB · 512 GB SSD', antes:2599999, ahora:1298999, chips:['Athlon 7120U','8 GB RAM','512 GB SSD','14"'], art:{k:'laptop',h:252}, f:{cpu:'AMD Athlon',ram:'8 GB',ssd:'512 GB',scr:'14"',use:['Estudio']} },
  { id:'nitrolite', brand:'Acer', name:'Portátil gamer Nitro Lite', full:'Portátil Gamer Acer Nitro Lite · Core 7-240H · 16 GB · 512 GB · RTX 3050 6 GB', antes:7599999, ahora:3850999, chips:['Core 7 240H','16 GB RAM','512 GB SSD','RTX 3050 6 GB'], tags:['Gamer'], art:{k:'laptop',h:14,base:'dark',glow:true}, f:{cpu:'Intel Core 7',ram:'16 GB',ssd:'512 GB',scr:'16"',use:['Gamer']} },
  { id:'nitrov15', brand:'Acer', name:'Portátil gamer Nitro V15', full:'Portátil Gamer Acer Nitro V15 · R7-7445HS · 16 GB · RTX 3050 6 GB', antes:6499999, ahora:3149900, chips:['Ryzen 7 7445HS','16 GB RAM','RTX 3050 6 GB','15.6"'], tags:['Gamer'], out:true, art:{k:'laptop',h:350,base:'dark',glow:true}, f:{cpu:'AMD Ryzen 7',ram:'16 GB',ssd:null,scr:'15.6"',use:['Gamer']} },
  { id:'aiolenovo', brand:'Lenovo', name:'All in One IdeaCentre 27ARR9', full:'AIO Lenovo IdeaCentre 27ARR9 · R7-7735HS · 16 GB · 512 GB SSD', antes:4499999, ahora:2732999, chips:['Ryzen 7 7735HS','16 GB RAM','512 GB SSD','27"'], art:{k:'aio',h:168} },
  { id:'aiohp', brand:'HP', name:'All in One HP 24-cr0234la', full:'AIO HP 24-cr0234la · R3-7320U · 8 GB · 512 GB SSD', antes:3699999, ahora:1705900, chips:['Ryzen 3 7320U','8 GB RAM','512 GB SSD','24"'], art:{k:'aio',h:222} },
  { id:'tabpro', brand:'Lenovo', name:'Idea Tab Pro 12.7" · Kit PRO', full:'Tablet Lenovo Idea Tab Pro 12.7" 3K · 8 GB/256 GB · Kit PRO', antes:3399999, ahora:1699900, chips:['12.7" 3K','8 GB RAM','256 GB','Kit PRO'], out:true, art:{k:'tablet',h:262,kb:true} },
  { id:'tab11', brand:'Lenovo', name:'Idea Tab 11" con lápiz y folio', full:'Tablet Lenovo Idea Tab 11" 2.5K · 8 GB/128 GB · lápiz + folio', antes:1699999, ahora:799900, chips:['11" 2.5K','8 GB RAM','128 GB','Lápiz + folio'], art:{k:'tablet',h:28,folio:true} },
  { id:'brother', brand:'Brother', name:'Multifuncional DCP-T430W', full:'Impresora multifuncional Brother DCP-T430W · tinta continua · Wi-Fi', antes:1799999, ahora:605900, chips:['Tinta continua','Wi-Fi','Multifuncional'], art:{k:'printer'} },
  { id:'ricoh', brand:'Ricoh', name:'Multifuncional láser 132 MF', full:'Impresora multifuncional láser Ricoh 132 MF monocromática', antes:4999999, ahora:1683900, chips:['Láser','Monocromática','Multifuncional'], tags:['Últimas unidades'], art:{k:'laser'} },
  { id:'caixun', brand:'Caixun', name:'Monitor gamer C24F4F 24"', full:'Monitor gaming Caixun C24F4F 24" FHD · 200 Hz · 1 ms · HDR', antes:1099999, ahora:495900, chips:['24" FHD','200 Hz','1 ms','HDR'], tags:['Gamer'], art:{k:'monitor',h:282} },
  { id:'gunma', brand:'VTA', name:'Proyector LED Gunma 2 HD', full:'Proyector LED VTA Gunma 2 HD · 2.500 lúmenes · Wi-Fi · Android', antes:659999, ahora:330999, chips:['HD','2.500 lúmenes','Wi-Fi','Android'], art:{k:'projector',h:42} },
  { id:'nmw105', brand:'Acer', name:'Mouse gamer Nitro NMW105', full:'Mouse Gamer Acer Nitro NMW105 · 6400 DPI · RGB', antes:299999, ahora:110999, chips:['6400 DPI','RGB'], tags:['Gamer'], art:{k:'mouse',h:12} },
  { id:'omkara', brand:'VSG', name:'Micrófono gamer USB Omkara', full:'Micrófono gamer USB VSG Omkara', antes:319999, ahora:165999, chips:['USB'], tags:['Gamer'], art:{k:'mic',h:18} }
];
const byId = Object.fromEntries(P.map(p => [p.id, p]));

/* Familias del mega-menú */
const FAM = [
  { t:'Computación', i:'laptop', l:['Portátiles','Portátiles gamer','All in One','Monitores','Periféricos','Almacenamiento'] },
  { t:'TV y Audio', i:'tv', l:['Televisores','Combos TV + barra','Barras de sonido','Proyectores / Video Beams','Audio'] },
  { t:'Impresión', i:'printer', l:['Tinta continua','Láser','Multifuncionales'] },
  { t:'Celulares y Tablets', i:'smartphone', l:['Celulares','Tablets','Smartwatches','Accesorios'] },
  { t:'Gaming', i:'gamepad', l:['Consolas','Accesorios gamer','PC Gaming'] },
  { t:'Cámaras, Redes y Cables', i:'camera', l:['Cámaras','Redes y Wi-Fi','Cables y adaptadores'] }
];

/* Tarjetas de categoría del home */
const TILES = [
  ['Portátiles','laptop',{h:205}], ['Televisores','tv',{h:230}], ['Combos TV + barra','combo',{h:245}],
  ['All in One','aio',{h:172}], ['Tablets','tablet',{h:28,folio:true}], ['Impresoras','printer',{}],
  ['Monitores','monitor',{h:285}], ['Audio','soundbar',{}], ['Gaming','gamepad',{h:12}],
  ['Video Beams','projector',{h:42}], ['Periféricos','mouse',{h:330}], ['Celulares','phone',{h:258}]
];

/* Financieras (cuotas de ejemplo) */
const FIN = {
  addi:  { name:'Addi', max:24, n:[3,6,9,12,18,24] },
  sumas: { name:'Sumas Pay', max:36, n:[6,12,18,24,36] },
  siste: { name:'Sistecrédito', max:6, n:[2,3,4,6] }
};

/* ---------- Helpers de precio (formato colombiano) ---------- */
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const cop = n => '$ ' + miles(n);
const finPrice = p => Math.round(p.ahora * 1.07 / 100) * 100;          // ejemplo: ~7 % sobre contado
const cuota = (total, n) => Math.ceil(total / n / 100) * 100;
const off = p => Math.round((1 - p.ahora / p.antes) * 100);
