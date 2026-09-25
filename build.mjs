// Une las piezas de src/ en un solo HTML autocontenido (sin dependencias).
//   index.html                    -> documento completo (se abre con doble clic)
//   dist/giftronic-rediseno.html  -> misma página sin <html>/<head>/<body> (para Artifact)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = f => readFileSync(new URL(`./src/${f}`, import.meta.url), 'utf8');
const css = ['styles-1.css', 'styles-2.css', 'styles-3.css', 'styles-4.css'].map(read).join('\n');
const js = ['art.js', 'data.js', 'ui.js', 'views-home.js', 'views-catalog.js', 'views-product.js', 'views-product2.js', 'views-cart.js', 'views-pages.js', 'views-doc.js', 'app.js', 'app-2.js'].map(read).join('\n');
const body = read('shell.html');

const title = 'Rediseño Giftronic04';
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap">';
const head = `<title>${title}</title>\n${fonts}\n<style>\n${css}\n</style>`;
const tail = `<script>\n${js}\n</script>`;
const desc = 'Prototipo navegable del rediseño de giftronic04.com: 17 vistas, carrito, checkout, sistema de diseño y plan de implementación en WooCommerce.';

writeFileSync(new URL('./index.html', import.meta.url),
  `<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="description" content="${desc}">\n${head}\n</head>\n<body>\n${body}\n${tail}\n</body>\n</html>\n`);
mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('./dist/giftronic-rediseno.html', import.meta.url), `${head}\n${body}\n${tail}\n`);
console.log('OK', Math.round((css.length + js.length + body.length) / 1024), 'KB');
