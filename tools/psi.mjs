// Mide la tienda en vivo con PageSpeed Insights (Lighthouse en los servidores de Google).
//   node tools/psi.mjs [etiqueta]   -> guarda dist/psi-<etiqueta>.json y muestra un resumen
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const tag = process.argv[2] || 'medicion';
const pages = {
  portada: 'https://giftronic04.com/',
  categoria: 'https://giftronic04.com/index.php/product-category/computacion/componentes-de-pc-portatiles/',
  ficha: 'https://giftronic04.com/index.php/product/televisor-samsung-40-qled-qn40q5faakxzl-con-barra-de-sonido-hw-b400f/',
};
const strategies = ['mobile', 'desktop'];

async function run(name, url, strategy) {
  const api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + encodeURIComponent(url)
    + '&strategy=' + strategy + '&category=performance&category=accessibility&category=best-practices&category=seo&locale=es';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(api);
      const j = await r.json();
      if (!j.lighthouseResult) throw new Error(JSON.stringify(j.error || j).slice(0, 200));
      return { name, strategy, lh: j.lighthouseResult };
    } catch (e) {
      if (attempt === 3) return { name, strategy, error: String(e) };
      await new Promise(r => setTimeout(r, 4000));
    }
  }
}

const jobs = [];
for (const [name, url] of Object.entries(pages)) for (const s of strategies) jobs.push(run(name, url, s));
const results = await Promise.all(jobs);

const out = {};
for (const r of results) {
  const key = r.name + '-' + r.strategy;
  if (r.error) { out[key] = { error: r.error }; console.log(key.padEnd(20), 'ERROR', r.error.slice(0, 120)); continue; }
  const a = r.lh.audits, c = r.lh.categories;
  const num = id => a[id] && a[id].numericValue;
  const opps = Object.values(a).filter(x => x.details && x.details.type === 'opportunity' && (x.details.overallSavingsMs > 80 || x.details.overallSavingsBytes > 20000))
    .map(x => ({ id: x.id, title: x.title, ms: Math.round(x.details.overallSavingsMs || 0), kb: Math.round((x.details.overallSavingsBytes || 0) / 1024) }));
  const net = (a['network-requests'] && a['network-requests'].details.items) || [];
  const byType = {};
  for (const it of net) { const t = it.resourceType || 'Other'; byType[t] = byType[t] || { n: 0, kb: 0 }; byType[t].n++; byType[t].kb += (it.transferSize || 0) / 1024; }
  const heavy = net.slice().sort((x, y) => (y.transferSize || 0) - (x.transferSize || 0)).slice(0, 15).map(it => Math.round((it.transferSize || 0) / 1024) + ' KB ' + it.url.replace('https://giftronic04.com', '').slice(0, 110));
  const lcpEl = a['largest-contentful-paint-element'] && a['largest-contentful-paint-element'].details && JSON.stringify(a['largest-contentful-paint-element'].details.items).slice(0, 300);
  const failed = Object.values(a).filter(x => x.score !== null && x.score < 0.9 && x.scoreDisplayMode === 'binary').map(x => x.id);
  out[key] = {
    scores: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, Math.round(v.score * 100)])),
    FCP: Math.round(num('first-contentful-paint')), LCP: Math.round(num('largest-contentful-paint')), TBT: Math.round(num('total-blocking-time')),
    CLS: +(num('cumulative-layout-shift') || 0).toFixed(3), SI: Math.round(num('speed-index')), TTFB: Math.round(num('server-response-time') || 0),
    pesoKB: Math.round((num('total-byte-weight') || 0) / 1024), peticiones: net.length, porTipo: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.n + ' / ' + Math.round(v.kb) + ' KB'])),
    lcpEl, opps, heavy, failed,
  };
  const s = out[key];
  console.log(key.padEnd(20), 'perf', s.scores.performance, 'a11y', s.scores.accessibility, 'bp', s.scores['best-practices'], 'seo', s.scores.seo,
    '| FCP', s.FCP, 'LCP', s.LCP, 'TBT', s.TBT, 'CLS', s.CLS, 'TTFB', s.TTFB, '|', s.pesoKB + ' KB en', s.peticiones, 'peticiones');
}
mkdirSync(root + 'dist', { recursive: true });
writeFileSync(root + 'dist/psi-' + tag + '.json', JSON.stringify(out, null, 2));
console.log('Guardado: dist/psi-' + tag + '.json');
