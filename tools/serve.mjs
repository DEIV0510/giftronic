// Servidor estático mínimo para revisar el prototipo con las fotos locales.
//   node tools/serve.mjs [puerto]   ->  http://localhost:5421/            (index.html + img/)
//                                        http://localhost:5421/dist/       (versión «pack» del Artifact)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PORT = +(process.argv[2] || process.env.PORT || 5421);
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.css':'text/css' };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/dist/' || path === '/dist') path = '/dist/giftronic-rediseno.html';
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(normalize(ROOT))) { res.writeHead(403); return res.end(); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch { res.writeHead(404); res.end('404'); }
}).listen(PORT, () => console.log(`Giftronic04 en http://localhost:${PORT}/`));
