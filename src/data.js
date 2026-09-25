/* =====================================================================
   Datos: catálogo real de la tienda (brief v2). Todas las vistas salen de aquí.
   ===================================================================== */
const WA = '573017913140';
const FREE_SHIP = 300000;      // ejemplo: umbral de envío gratis
const SHIP_STD = 15000;        // ejemplo: envío estándar bajo el umbral
const SHIP_EXP = 25000;        // ejemplo: envío express en ciudades principales
const FIN_RATE = 1.07;         // ejemplo: precio con financiación = contado + 7 %
const MAIN_CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];

// stock: número = unidades conocidas · null = disponible sin cantidad publicada · 0 = agotado
// rank: orden de "Más vendidos" (ejemplo)
const products = [
  { id:1, slug:'combo-samsung-qled-40', brand:'Samsung', cat:'combos-tv', name:'Combo TV 40" QLED + barra HW-B400F', model:'QN40Q5FAAKXZL + HW-B400F', type:'Combo TV QLED 40" + barra de sonido', antes:1999999, precio:999999, stock:10, rank:1, rating:5, reviews:1,
    chips:['40"','Full HD','QLED','Tizen'], tags:['Combo'], a:{size:'40"', res:'Full HD', os:'Tizen'}, art:{k:'combo',h:235}, combo:true },
  { id:2, slug:'combo-hisense-40-a4nv', brand:'Hisense', cat:'combos-tv', name:'Combo TV 40" A4NV + barra compacta', model:'40A4NV + barra compacta', type:'Combo TV Full HD 40" + barra de sonido', antes:1999999, precio:935999, stock:null, rank:4,
    chips:['40"','Full HD','VIDAA','Barra compacta'], tags:['Combo'], a:{size:'40"', res:'Full HD', os:'VIDAA'}, art:{k:'combo',h:188}, combo:true },
  { id:3, slug:'combo-samsung-crystal-43', brand:'Samsung', cat:'combos-tv', name:'Combo TV 43" Crystal UHD 4K + barra HW-B400F', model:'U8500H + HW-B400F', type:'Combo TV 4K 43" + barra de sonido', antes:2899999, precio:1382900, stock:null, rank:3,
    chips:['43"','4K UHD','Crystal UHD','Tizen'], tags:['Combo'], a:{size:'43"', res:'4K UHD', os:'Tizen'}, art:{k:'combo',h:205}, combo:true },
  { id:4, slug:'samsung-crystal-uhd-43-u8500h', brand:'Samsung', cat:'televisores', name:'TV 43" Crystal UHD 4K U8500H', model:'U8500H', type:'Televisor 4K de 43"', antes:2499999, precio:1210999, stock:null, rank:6,
    chips:['43"','4K UHD','Crystal UHD','Tizen'], a:{size:'43"', res:'4K UHD', os:'Tizen'}, art:{k:'tv',h:212}, acc:[6] },
  { id:5, slug:'hisense-40a4nv', brand:'Hisense', cat:'televisores', name:'TV 40" Full HD 40A4NV', model:'40A4NV', type:'Televisor Full HD de 40"', antes:1699999, precio:748900, stock:null, rank:9,
    chips:['40"','Full HD','VIDAA'], a:{size:'40"', res:'Full HD', os:'VIDAA'}, art:{k:'tv',h:190}, acc:[7] },
  { id:6, slug:'samsung-barra-hw-b400f', brand:'Samsung', cat:'audio', name:'Barra de sonido HW-B400F', model:'HW-B400F/ZL', type:'Barra de sonido 2.0 canales', antes:499999, precio:219999, stock:null, rank:7,
    chips:['2.0 Ch','Woofer integrado','Bluetooth','HDMI ARC'], art:{k:'soundbar'} },
  { id:7, slug:'hisense-barra-hs1000', brand:'Hisense', cat:'audio', name:'Barra de sonido HS1000', model:'HS1000', type:'Barra de sonido 120 W', antes:499999, precio:242999, stock:null, rank:14,
    chips:['120 W','Dolby Audio','Bluetooth'], art:{k:'soundbar'} },
  { id:8, slug:'acer-aspire-go-15', brand:'Acer', cat:'portatiles', name:'Portátil Aspire Go 15', model:'Aspire Go 15', type:'Portátil de 15.6" para estudio y oficina', antes:3999999, precio:1874900, stock:null, rank:2,
    chips:['Core i5-13420H','8 GB','512 GB SSD','15.6"'], a:{cpu:'Intel Core i5', ram:'8 GB', ssd:'512 GB', scr:'15.6"', use:['Estudio','Oficina']}, art:{k:'laptop',h:150,base:'green'}, acc:[24,25],
    spec:[['Procesador','Intel Core i5-13420H'],['Memoria RAM','8 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','15.6"']] },
  { id:9, slug:'dell-inspiron-15-3530', brand:'Dell', cat:'portatiles', name:'Portátil Inspiron 15 3530', model:'Inspiron 15 3530', type:'Portátil de 15.6" Full HD', antes:3999999, precio:1979999, stock:null, rank:5,
    chips:['Core i5-1334U','8 GB','512 GB SSD','15.6" FHD'], a:{cpu:'Intel Core i5', ram:'8 GB', ssd:'512 GB', scr:'15.6"', use:['Oficina','Estudio']}, art:{k:'laptop',h:208}, acc:[24,25],
    spec:[['Procesador','Intel Core i5-1334U'],['Memoria RAM','8 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','15.6" Full HD']] },
  { id:10, slug:'hp-15-fc0029la', brand:'HP', cat:'portatiles', name:'Portátil HP 15-fc0029la', model:'15-fc0029la', type:'Portátil de 15.6"', antes:4399999, precio:2199999, stock:null, rank:8,
    chips:['Ryzen 5 7520U','16 GB','1 TB SSD','15.6"'], a:{cpu:'AMD Ryzen 5', ram:'16 GB', ssd:'1 TB', scr:'15.6"', use:['Oficina','Diseño']}, art:{k:'laptop',h:196}, acc:[24,25],
    spec:[['Procesador','AMD Ryzen 5 7520U'],['Memoria RAM','16 GB'],['Almacenamiento','1 TB SSD'],['Pantalla','15.6"']] },
  { id:11, slug:'hp-15-fc0354la', brand:'HP', cat:'portatiles', name:'Portátil HP 15-fc0354la', model:'15-fc0354la', type:'Portátil de 15.6" · 3 versiones de RAM', antes:3199999, precio:1599900, stock:0, rank:10,
    chips:['Ryzen 5 7530U','8 a 24 GB','15.6"'], a:{cpu:'AMD Ryzen 5', ram:['8 GB','16 GB','24 GB'], scr:'15.6"', use:['Estudio','Oficina']}, art:{k:'laptop',h:222}, acc:[24,25],
    spec:[['Procesador','AMD Ryzen 5 7530U'],['Memoria RAM','8, 16 o 24 GB según versión'],['Pantalla','15.6"']],
    variants:[ { v:'8 GB', antes:3199999, precio:1599900, stock:0 }, { v:'16 GB', antes:3499999, precio:1870000, stock:0 }, { v:'24 GB', antes:4399999, precio:1999900, stock:0 } ] },
  { id:12, slug:'hp-14-em0217la', brand:'HP', cat:'portatiles', name:'Portátil HP 14-em0217la', model:'14-em0217la', type:'Portátil de 14"', antes:2599999, precio:1298999, stock:null, rank:11,
    chips:['Athlon 7120U','8 GB','512 GB SSD','14"'], a:{cpu:'AMD Athlon', ram:'8 GB', ssd:'512 GB', scr:'14"', use:['Estudio']}, art:{k:'laptop',h:252}, acc:[24,25],
    spec:[['Procesador','AMD Athlon 7120U'],['Memoria RAM','8 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','14"']] },
  { id:13, slug:'acer-nitro-lite', brand:'Acer', cat:'portatiles-gamer', name:'Portátil gamer Nitro Lite', model:'Nitro Lite', type:'Portátil gamer con RTX 3050', antes:7599999, precio:3850999, stock:null, rank:12,
    chips:['Core 7 240H','16 GB','RTX 3050 6 GB','512 GB SSD'], tags:['Gamer'], a:{cpu:'Intel Core 7', ram:'16 GB', ssd:'512 GB', scr:'16"', use:['Gamer','Diseño']}, art:{k:'laptop',h:14,base:'dark',glow:true}, acc:[24,25],
    spec:[['Procesador','Intel Core 7 240H'],['Memoria RAM','16 GB'],['Gráficos','NVIDIA GeForce RTX 3050 6 GB'],['Almacenamiento','512 GB SSD']] },
  { id:14, slug:'acer-nitro-v15', brand:'Acer', cat:'portatiles-gamer', name:'Portátil gamer Nitro V15', model:'Nitro V15', type:'Portátil gamer de 15.6" con RTX 3050', antes:6499999, precio:3149900, stock:0, rank:13,
    chips:['Ryzen 7 7445HS','16 GB','RTX 3050 6 GB','15.6"'], tags:['Gamer'], a:{cpu:'AMD Ryzen 7', ram:'16 GB', scr:'15.6"', use:['Gamer']}, art:{k:'laptop',h:350,base:'dark',glow:true}, acc:[24,25],
    spec:[['Procesador','AMD Ryzen 7 7445HS'],['Memoria RAM','16 GB'],['Gráficos','NVIDIA GeForce RTX 3050 6 GB'],['Pantalla','15.6"']] },
  { id:15, slug:'lenovo-ideacentre-aio-27', brand:'Lenovo', cat:'all-in-one', name:'All in One IdeaCentre 27ARR9', model:'IdeaCentre AIO 27ARR9', type:'Computador todo en uno de 27"', antes:4499999, precio:2732999, stock:null, rank:15,
    chips:['Ryzen 7 7735HS','16 GB','512 GB SSD','27"'], a:{cpu:'AMD Ryzen 7', ram:'16 GB', ssd:'512 GB', scr:'27"'}, art:{k:'aio',h:168}, acc:[24,25],
    spec:[['Procesador','AMD Ryzen 7 7735HS'],['Memoria RAM','16 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','27"']] },
  { id:16, slug:'hp-aio-24-cr0234la', brand:'HP', cat:'all-in-one', name:'All in One HP 24-cr0234la', model:'24-cr0234la', type:'Computador todo en uno de 24"', antes:3699999, precio:1705900, stock:null, rank:16,
    chips:['Ryzen 3 7320U','8 GB','512 GB SSD','24"'], a:{cpu:'AMD Ryzen 3', ram:'8 GB', ssd:'512 GB', scr:'24"'}, art:{k:'aio',h:222}, acc:[24,25],
    spec:[['Procesador','AMD Ryzen 3 7320U'],['Memoria RAM','8 GB'],['Almacenamiento','512 GB SSD'],['Pantalla','24"']] },
  { id:17, slug:'lenovo-idea-tab-pro', brand:'Lenovo', cat:'tablets', name:'Idea Tab Pro 12.7" · Kit PRO', model:'Idea Tab Pro', type:'Tablet de 12.7" 3K con kit', antes:3399999, precio:1699900, stock:0, rank:17,
    chips:['12.7" 3K','8 GB','256 GB','Kit PRO'], a:{ram:'8 GB', ssd:'256 GB', scr:'12.7"'}, art:{k:'tablet',h:262,kb:true},
    spec:[['Pantalla','12.7" 3K'],['Memoria RAM','8 GB'],['Almacenamiento','256 GB'],['Incluye','Kit PRO']] },
  { id:18, slug:'lenovo-idea-tab-11', brand:'Lenovo', cat:'tablets', name:'Idea Tab 11" con lápiz y folio', model:'Idea Tab 11"', type:'Tablet de 11" 2.5K', antes:1699999, precio:799900, stock:null, rank:18,
    chips:['11" 2.5K','8 GB','128 GB','Lápiz + folio'], a:{ram:'8 GB', ssd:'128 GB', scr:'11"'}, art:{k:'tablet',h:28,folio:true},
    spec:[['Pantalla','11" 2.5K'],['Memoria RAM','8 GB'],['Almacenamiento','128 GB'],['Incluye','Lápiz y folio']] },
  { id:19, slug:'brother-dcp-t430w', brand:'Brother', cat:'impresion', name:'Multifuncional DCP-T430W', model:'DCP-T430W', type:'Impresora multifuncional de tinta continua', antes:1799999, precio:605900, stock:null, rank:19,
    chips:['Tinta continua','Imprime · copia · escanea','Wi-Fi'], a:{ptype:'Tinta continua', mf:true}, art:{k:'printer'},
    spec:[['Tipo','Tinta continua'],['Funciones','Imprime, copia y escanea'],['Conectividad','Wi-Fi']] },
  { id:20, slug:'ricoh-132-mf', brand:'Ricoh', cat:'impresion', name:'Multifuncional láser 132 MF', model:'132 MF', type:'Impresora multifuncional láser monocromática', antes:4999999, precio:1683900, stock:3, rank:20,   // stock 3: ejemplo para "Últimas unidades"
    chips:['Láser mono','Multifuncional'], a:{ptype:'Láser', mf:true}, art:{k:'laser'},
    spec:[['Tipo','Láser monocromática'],['Funciones','Multifuncional']] },
  { id:21, slug:'epson-ecotank-l6490', brand:'Epson', cat:'impresion', name:'EcoTank L6490 inalámbrica', model:'EcoTank L6490', type:'Impresora de tinta continua', antes:3399999, precio:1705999, stock:0, rank:21,
    chips:['Tinta continua','Inalámbrica'], a:{ptype:'Tinta continua'}, art:{k:'printer'},
    spec:[['Tipo','Tinta continua (EcoTank)'],['Conectividad','Inalámbrica']] },
  { id:22, slug:'caixun-c24f4f', brand:'Caixun', cat:'monitores', name:'Monitor gaming C24F4F 24"', model:'C24F4F', type:'Monitor gamer de 24"', antes:1099999, precio:495900, stock:null, rank:22,
    chips:['24" FHD','200 Hz','1 ms'], tags:['Gamer'], a:{scr:'24"'}, art:{k:'monitor',h:282}, acc:[24],
    spec:[['Pantalla','24" Full HD'],['Frecuencia','200 Hz'],['Tiempo de respuesta','1 ms']] },
  { id:23, slug:'vta-gunma-2', brand:'VTA', cat:'proyectores', name:'Proyector Gunma 2 HD', model:'Gunma 2', type:'Proyector LED HD con Android', antes:659999, precio:330999, stock:null, rank:23,
    chips:['HD','2.500 lm','Wi-Fi','Android'], art:{k:'projector',h:42}, acc:[7],
    spec:[['Resolución','HD'],['Brillo','2.500 lúmenes'],['Conectividad','Wi-Fi'],['Sistema','Android']] },
  { id:24, slug:'acer-nitro-nmw105', brand:'Acer', cat:'perifericos', name:'Mouse gamer Nitro NMW105', model:'NMW105', type:'Mouse gamer RGB', antes:299999, precio:110999, stock:null, rank:24,
    chips:['6400 DPI','RGB'], tags:['Gamer'], art:{k:'mouse',h:12}, acc:[25],
    spec:[['Sensor','6400 DPI'],['Iluminación','RGB']] },
  { id:25, slug:'vsg-omkara', brand:'VSG', cat:'perifericos', name:'Micrófono gamer USB Omkara', model:'Omkara', type:'Micrófono USB para streaming', antes:319999, precio:165999, stock:null, rank:25,
    chips:['USB'], tags:['Gamer'], art:{k:'mic',h:18}, acc:[24],
    spec:[['Conexión','USB']] }
];
const byId = Object.fromEntries(products.map(p => [p.id, p]));
const bySlug = Object.fromEntries(products.map(p => [p.slug, p]));

/* Ficha completa del combo Samsung (id 1) */
Object.assign(byId[1], {
  specGroups: [
    ['Televisor QN40Q5FAAKXZL', [['Tamaño','40"'],['Panel','QLED (Quantum Dot)'],['Resolución','Full HD 1920 × 1080'],['HDR','Sí · Potenciador de Contraste'],['Sistema operativo','Tizen · One UI'],['Contenido','Samsung TV Plus'],['Sonido','OTS Lite'],['Seguridad','Samsung Knox'],['Conectividad','Wi-Fi · Bluetooth'],['Puertos','HDMI · USB · RF'],['Diseño','Slim, negro']]],
    ['Barra de sonido HW-B400F/ZL', [['Canales','2.0 con woofer integrado'],['Audio','Dolby 2ch · LPCM'],['Formatos','MP3 · AAC · FLAC · WAV'],['Modos','Surround · Estándar · Noche · Mejora de voz'],['Bluetooth','4.2'],['Conexión al TV','HDMI ARC + CEC · Entrada óptica'],['USB','Sí'],['Consumo','20 W'],['Dimensiones','641 × 66,5 × 107 mm'],['Peso','2,1 kg'],['Color','Titan Black']]]
  ],
  highlights: [['tv','Pantalla','40" QLED Quantum Dot'],['scan','Resolución','Full HD · HDR'],['cpu','Sistema','Tizen · One UI'],['volume','Sonido','Barra 2.0 Ch Dolby'],['cable','Conexión','HDMI ARC + CEC'],['shield','Garantía','1 año con la marca']],
  box: [['tv','Televisor 40" QLED','QN40Q5FAAKXZL'],['speaker','Barra de sonido','HW-B400F/ZL'],['remote','Controles remotos','TV y barra'],['stand','Base del televisor','Soportes y tornillos'],['plug','Cables de alimentación','TV y barra'],['file','Manuales y garantía','Documentos de la marca']],
  benefits: [
    ['tv','Color con Quantum Dot','El panel QLED usa puntos cuánticos para mostrar colores más intensos, con HDR y Potenciador de Contraste.'],
    ['soundbar','Sonido que sigue la acción','OTS Lite ubica el sonido en pantalla y la barra 2.0 con woofer integrado le suma cuerpo.'],
    ['soundbar-zoom','Diálogos claros de noche','Modos Noche y Mejora de voz para ver sin subir el volumen.'],
    ['combo','Un cable, un control','Conecta la barra por HDMI ARC + CEC y maneja el volumen con el control del TV.']
  ],
  gallery: [
    { kind:'Foto principal', art:['combo',{h:235}] },
    { kind:'Televisor', art:['tv',{h:235}] },
    { kind:'Barra de sonido', art:['soundbar',{}] },
    { kind:'Detalle', art:['soundbar-zoom',{}] },
    { kind:'Infografía', info:{ icon:'sun', title:'Color QLED con Quantum Dot', lines:['40" Full HD 1920 × 1080','HDR · Potenciador de Contraste','Tizen · One UI'] } },
    { kind:'Infografía', info:{ icon:'volume', title:'Sonido Dolby 2.0 con woofer', lines:['OTS Lite en el televisor','Modos Noche y Mejora de voz'] } },
    { kind:'Infografía', info:{ icon:'cable', title:'Un solo cable con HDMI ARC', lines:['HDMI ARC + CEC · Entrada óptica','Bluetooth 4.2 · USB'] } },
    { kind:'Infografía', info:{ icon:'ruler', title:'Barra de 641 × 66,5 × 107 mm', lines:['Peso 2,1 kg','Color Titan Black'] } }
  ],
  warrantyNote: 'con empaques originales'
});

/* Familias del mega-menú */
const FAMILIES = [
  { id:'computacion', t:'Computación', i:'laptop', feat:8, subs:[['portatiles','Portátiles'],['portatiles-gamer','Portátiles gamer'],['all-in-one','All in One'],['monitores','Monitores'],['almacenamiento','Almacenamiento'],['perifericos','Periféricos']] },
  { id:'tv-audio', t:'TV y Audio', i:'tv', feat:1, subs:[['televisores','Televisores'],['combos-tv','Combos TV + barra'],['barras-de-sonido','Barras de sonido'],['proyectores','Proyectores'],['audio','Audio']] },
  { id:'impresion', t:'Impresión', i:'printer', feat:19, subs:[['tinta-continua','Tinta continua'],['laser','Láser'],['multifuncionales','Multifuncionales']] },
  { id:'celulares-tablets', t:'Celulares y Tablets', i:'smartphone', feat:18, subs:[['celulares','Celulares'],['tablets','Tablets'],['smartwatches','Smartwatches'],['accesorios','Accesorios']] },
  { id:'gaming', t:'Gaming', i:'gamepad', feat:13, subs:[['consolas','Consolas'],['accesorios-gamer','Accesorios'],['pc-gaming','PC Gaming']] },
  { id:'conectividad', t:'Conectividad', i:'router', feat:null, subs:[['redes','Redes'],['cables-y-hubs','Cables y hubs'],['camaras','Cámaras'],['tarjetas-de-memoria','Tarjetas de memoria']] }
];

/* Categorías: nombre, familia, qué productos incluye y qué filtros muestra */
const LAPTOP_F = ['brand','cpu','ram','ssd','scr','use','avail','deal'];
const TV_F = ['brand','size','res','os','avail','deal'];
const CATS = {
  'todo': { name:'Todo el catálogo', m:() => true, f:['brand','avail','deal'], seo:'Todo el catálogo de Giftronic04: tecnología original con garantía de marca, factura electrónica y envío a toda Colombia. Paga de contado o a cuotas con Addi, Sumas Pay o Sistecrédito.' },
  'portatiles': { name:'Portátiles', fam:'computacion', m:p => ['portatiles','portatiles-gamer'].includes(p.cat), f:LAPTOP_F, seo:'Portátiles originales Acer, Dell y HP con garantía directa de la marca, factura electrónica y envío a toda Colombia. Filtra por procesador, memoria RAM, almacenamiento, pantalla o uso, y págalo de contado o a cuotas con Addi, Sumas Pay o Sistecrédito sin cuota inicial.' },
  'portatiles-gamer': { name:'Portátiles gamer', fam:'computacion', m:p => p.cat === 'portatiles-gamer', f:LAPTOP_F, seo:'Portátiles gamer con tarjeta gráfica NVIDIA GeForce RTX para jugar, transmitir y editar. Garantía de marca y pago a cuotas.' },
  'all-in-one': { name:'All in One', fam:'computacion', m:p => p.cat === 'all-in-one', f:['brand','cpu','ram','ssd','scr','avail','deal'], seo:'Computadores todo en uno de Lenovo y HP: pantalla, procesador y parlantes en un solo equipo, ideal para casa y oficina.' },
  'monitores': { name:'Monitores', fam:'computacion', m:p => p.cat === 'monitores', f:['brand','avail','deal'], seo:'Monitores para gaming y oficina con alta frecuencia de actualización.' },
  'almacenamiento': { name:'Almacenamiento', fam:'computacion', m:() => false, f:['brand'], seo:'Discos, memorias USB y SSD.' },
  'perifericos': { name:'Periféricos', fam:'computacion', m:p => p.cat === 'perifericos', f:['brand','avail','deal'], seo:'Mouse, micrófonos y accesorios para tu escritorio.' },
  'tv-audio': { name:'TV y Audio', fam:'tv-audio', m:p => ['combos-tv','televisores','audio','proyectores'].includes(p.cat), f:['brand','avail','deal'], seo:'Televisores, combos con barra de sonido, audio y proyectores con garantía de marca.' },
  'televisores': { name:'Televisores', fam:'tv-audio', m:p => ['televisores','combos-tv'].includes(p.cat), f:TV_F, seo:'Televisores Samsung y Hisense Full HD y 4K con Smart TV, garantía de marca y envío a toda Colombia.' },
  'combos-tv': { name:'Combos TV + barra', fam:'tv-audio', m:p => p.cat === 'combos-tv', f:TV_F, seo:'Televisor y barra de sonido en un solo pedido: imagen y sonido listos para instalar.' },
  'barras-de-sonido': { name:'Barras de sonido', fam:'tv-audio', m:p => p.cat === 'audio', f:['brand','avail','deal'], seo:'Barras de sonido Samsung y Hisense con Bluetooth y Dolby.' },
  'audio': { name:'Audio', fam:'tv-audio', m:p => p.cat === 'audio', f:['brand','avail','deal'], seo:'Barras de sonido y audio para tu televisor.' },
  'proyectores': { name:'Proyectores', fam:'tv-audio', m:p => p.cat === 'proyectores', f:['brand','avail','deal'], seo:'Proyectores LED con Wi-Fi y Android para cine en casa.' },
  'impresion': { name:'Impresión', fam:'impresion', m:p => p.cat === 'impresion', f:['brand','ptype','avail','deal'], seo:'Impresoras de tinta continua y láser para casa y oficina: menor costo por página.' },
  'tinta-continua': { name:'Tinta continua', fam:'impresion', m:p => p.a && p.a.ptype === 'Tinta continua', f:['brand','avail','deal'], seo:'Impresoras de tinta continua Brother y Epson: imprime más pagando menos por página.' },
  'laser': { name:'Láser', fam:'impresion', m:p => p.a && p.a.ptype === 'Láser', f:['brand','avail','deal'], seo:'Impresoras láser para alto volumen de impresión.' },
  'multifuncionales': { name:'Multifuncionales', fam:'impresion', m:p => p.a && p.a.mf, f:['brand','ptype','avail','deal'], seo:'Impresoras que imprimen, copian y escanean.' },
  'celulares-tablets': { name:'Celulares y Tablets', fam:'celulares-tablets', m:p => p.cat === 'tablets', f:['brand','avail','deal'], seo:'Celulares, tablets y accesorios.' },
  'celulares': { name:'Celulares', fam:'celulares-tablets', m:() => false, f:['brand'], seo:'Celulares de las principales marcas.' },
  'tablets': { name:'Tablets', fam:'celulares-tablets', m:p => p.cat === 'tablets', f:['brand','ram','ssd','scr','avail','deal'], seo:'Tablets Lenovo para estudiar, tomar notas y ver contenido.' },
  'smartwatches': { name:'Smartwatches', fam:'celulares-tablets', m:() => false, f:['brand'], seo:'Relojes inteligentes.' },
  'accesorios': { name:'Accesorios', fam:'celulares-tablets', m:() => false, f:['brand'], seo:'Accesorios para celular y tablet.' },
  'gaming': { name:'Gaming', fam:'gaming', m:p => (p.tags || []).includes('Gamer'), f:['brand','avail','deal'], seo:'Portátiles gamer, monitores y accesorios para jugar.' },
  'consolas': { name:'Consolas', fam:'gaming', m:() => false, f:['brand'], seo:'Consolas de videojuegos.' },
  'accesorios-gamer': { name:'Accesorios gamer', fam:'gaming', m:p => p.cat === 'perifericos', f:['brand','avail','deal'], seo:'Mouse, micrófonos y accesorios gamer.' },
  'pc-gaming': { name:'PC Gaming', fam:'gaming', m:() => false, f:['brand'], seo:'Computadores de escritorio para gaming.' },
  'conectividad': { name:'Conectividad', fam:'conectividad', m:() => false, f:['brand'], seo:'Redes, cables, cámaras y memorias.' },
  'redes': { name:'Redes', fam:'conectividad', m:() => false, f:['brand'], seo:'Routers y equipos de red.' },
  'cables-y-hubs': { name:'Cables y hubs', fam:'conectividad', m:() => false, f:['brand'], seo:'Cables HDMI, USB y hubs.' },
  'camaras': { name:'Cámaras', fam:'conectividad', m:() => false, f:['brand'], seo:'Cámaras web y de seguridad.' },
  'tarjetas-de-memoria': { name:'Tarjetas de memoria', fam:'conectividad', m:() => false, f:['brand'], seo:'Tarjetas microSD y SD.' }
};
FAMILIES.forEach(f => { if (!CATS[f.id]) CATS[f.id] = { name:f.t, fam:f.id, m:p => f.subs.some(([s]) => CATS[s] && CATS[s].m(p)), f:['brand','avail','deal'], seo:'' }; });
const catOf = p => ({ 'combos-tv':'combos-tv', televisores:'televisores', audio:'barras-de-sonido', portatiles:'portatiles', 'portatiles-gamer':'portatiles-gamer', 'all-in-one':'all-in-one', tablets:'tablets', impresion:'impresion', monitores:'monitores', proyectores:'proyectores', perifericos:'perifericos' })[p.cat];
const famOf = slug => FAMILIES.find(f => f.id === (CATS[slug] || {}).fam);

/* Filtros (facetas) */
const stockOf = p => p.variants ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : p.stock;
const isOut = p => stockOf(p) === 0;
const FACETS = {
  brand: { t:'Marca', get:p => [p.brand] },
  cpu: { t:'Procesador', get:p => p.a && p.a.cpu ? [p.a.cpu] : [] },
  ram: { t:'Memoria RAM', get:p => p.a && p.a.ram ? [].concat(p.a.ram) : [], order:['8 GB','16 GB','24 GB'] },
  ssd: { t:'Almacenamiento', get:p => p.a && p.a.ssd ? [p.a.ssd] : [], order:['128 GB','256 GB','512 GB','1 TB'] },
  scr: { t:'Pantalla', get:p => p.a && p.a.scr ? [p.a.scr] : [], order:['11"','12.7"','14"','15.6"','16"','24"','27"'] },
  use: { t:'Uso', get:p => p.a && p.a.use ? p.a.use : [], order:['Estudio','Oficina','Gamer','Diseño'] },
  size: { t:'Tamaño', get:p => p.a && p.a.size ? [p.a.size] : [] },
  res: { t:'Resolución', get:p => p.a && p.a.res ? [p.a.res] : [] },
  os: { t:'Sistema', get:p => p.a && p.a.os ? [p.a.os] : [] },
  ptype: { t:'Tipo', get:p => p.a && p.a.ptype ? [p.a.ptype] : [] },
  avail: { t:'Disponibilidad', bool:'Solo disponibles', test:p => !isOut(p) },
  deal: { t:'Ofertas', bool:'Solo con descuento', test:p => p.antes > p.precio }
};

/* Financieras (condiciones de ejemplo, por confirmar con cada una) */
const FIN = [
  { id:'addi', name:'Addi', max:24, n:[3,6,9,12,18,24], financed:true, req:'Cédula colombiana, celular y correo', init:'Sin cuota inicial', time:'En minutos, en línea' },
  { id:'sumas', name:'Sumas Pay', max:36, n:[6,12,18,24,36], financed:true, req:'Cédula colombiana y celular', init:'Sin cuota inicial', time:'En línea' },
  { id:'siste', name:'Sistecrédito', max:6, n:[2,3,4,6], financed:true, req:'Cédula colombiana', init:'Según estudio', time:'En línea' },
  { id:'tc', name:'Tarjeta de crédito', max:36, n:[1,3,6,12,24,36], financed:false, req:'Tarjeta de crédito vigente', init:'No aplica', time:'Inmediata con Wompi' }
];

/* Departamentos y ciudades (muestra) */
const DEPTS = {
  'Bogotá D.C.':['Bogotá'], 'Antioquia':['Medellín','Bello','Envigado','Itagüí','Rionegro'], 'Valle del Cauca':['Cali','Palmira','Tuluá','Buga'], 'Atlántico':['Barranquilla','Soledad','Malambo'],
  'Cundinamarca':['Soacha','Chía','Zipaquirá','Facatativá','Villeta'], 'Santander':['Bucaramanga','Floridablanca','Girón'], 'Bolívar':['Cartagena'], 'Norte de Santander':['Cúcuta'],
  'Tolima':['Ibagué'], 'Risaralda':['Pereira','Dosquebradas'], 'Caldas':['Manizales'], 'Quindío':['Armenia'], 'Meta':['Villavicencio'], 'Huila':['Neiva','Pitalito'],
  'Nariño':['Pasto'], 'Córdoba':['Montería'], 'Magdalena':['Santa Marta'], 'Cesar':['Valledupar'], 'Boyacá':['Tunja','Duitama','Sogamoso']
};
const ALL_CITIES = Object.values(DEPTS).flat();

/* =====================================================================
   Utilidades de precio y fechas
   ===================================================================== */
const COP = new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0, maximumFractionDigits:0 });
const cop = n => COP.format(Math.round(n)).replace(/\s/g, ' ');
const finPrice = n => Math.round(n * FIN_RATE / 100) * 100;   // ejemplo
const cuota = (total, n) => Math.ceil(total / n / 100) * 100;
const offPct = (antes, precio) => Math.round((1 - precio / antes) * 100);
const DAYS = ['dom','lun','mar','mié','jue','vie','sáb'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function addBusinessDays(from, n) { const d = new Date(from); let k = 0; while (k < n) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) k++; } return d; }
function etaRange(city, express) {
  const main = MAIN_CITIES.includes(city);
  const [a, b] = express ? [1, 1] : main ? [1, 2] : [2, 5];
  const d1 = addBusinessDays(new Date(), a), d2 = addBusinessDays(new Date(), b);
  const f = d => `${DAYS[d.getDay()]} ${d.getDate()}`;
  const text = a === b ? `el ${f(d1)} de ${MONTHS[d1.getMonth()]}` : `entre el ${f(d1)} y el ${f(d2)}${d1.getMonth() === d2.getMonth() ? '' : ' de ' + MONTHS[d2.getMonth()]}`;
  return { main, text, days:`${a === b ? a : a + ' a ' + b} día${b > 1 ? 's' : ''} hábil${b > 1 ? 'es' : ''}` };
}
