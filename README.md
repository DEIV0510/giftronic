# Rediseño giftronic04.com — prototipo del sitio completo con el catálogo real

Prototipo navegable de alta fidelidad para presentar al dueño de la tienda y guiar la implementación en WooCommerce + Astra + Elementor.

Abre **`index.html`** con doble clic: la carpeta **`img/`** debe estar al lado (ahí están las fotos). Es un solo archivo (HTML + CSS + JS vanilla), sin dependencias salvo la fuente Manrope de Google Fonts. La barra superior «Prototipo» lleva a cualquier vista y cambia entre escritorio y móvil (390 px).

Para revisarlo con un servidor local: `node tools/serve.mjs` → http://localhost:5421/ (y `/dist/` para la versión publicada).

## Vistas (rutas `#/…`)

| # | Vista | Ruta |
|---|---|---|
| 1 | Portada | `#/` |
| 2 | Categoría con filtros, rango de precio, orden, «Cargar más» y comparador | `#/categoria/portatiles` (y todas las demás) |
| 3 | Búsqueda y estado sin resultados | `#/buscar?q=` |
| 4 | Producto simple | `#/producto/acer-aspire-go-15` |
| 5 | Producto combo (ficha dividida por producto) | `#/producto/combo-samsung-qled-40` |
| 6 | Producto agotado («Avísame») y con variantes | `#/producto/acer-nitro-v15`, `#/producto/hp-15-fc0354la` |
| 7 | Carrito (panel lateral + página) | `#/carrito` |
| 8 | Checkout en 3 pasos | `#/checkout` |
| 9 | Pedido confirmado | `#/pedido-confirmado` |
| 10 | Mi cuenta | `#/cuenta` |
| 11 | Rastrear pedido | `#/rastreo` |
| 12 | Ofertas y combos | `#/ofertas` |
| 13 | Compra a cuotas | `#/cuotas` |
| 14 | Quiénes somos | `#/nosotros` |
| 15 | Políticas (plantilla legal) | `#/legal/envios` … `#/legal/privacidad` |
| 16 | Contacto y FAQ | `#/contacto` |
| 17 | Error 404 | `#/404` |
| — | Guía del sistema de diseño | `#/design-system` |
| — | Plan de implementación y decisiones de diseño | `#/plan` |

## Catálogo y fotos

- Fuente: `Desktop\GIFTRONIC\giftronic04-imagenes\catalogo.json` (324 filas) + carpeta `imagenes/`.
- `node tools/import-catalog.mjs [carpeta]` lo convierte en `src/catalog.js` (304 productos: las versiones de un mismo portátil que solo cambian de RAM se unen como variantes), optimiza las fotos a `img/<id>.webp` (800 px) y arma `dist/img-pack.json` (480 px) para la versión publicada.
- Marca, categoría, specs (CPU, RAM, SSD, pantalla, GPU, panel, sistema) y nombre corto se leen del nombre de la tienda (`tools/parse.mjs`).
- Los 25 productos del brief conservan su ficha detallada (`CURATED_LIST` en `src/data.js`) sobre los datos reales.
- En local, la galería de la ficha carga las fotos de giftronic04.com (requiere internet); si una no carga se descarta. En la versión publicada se muestra la foto principal.
- Marcados como **ejemplo** en el código: envío gratis desde $ 300.000, envío $ 15.000 / express $ 25.000, precio con financiación +7 %, 10 unidades del combo y «Últimas 3» de la Ricoh, orden «Más vendidos», uso de cada portátil y condiciones de las financieras.

## Editar

Las piezas están en `src/`. Después de cambiar algo:

```bash
node build.mjs
```

Genera `index.html` (fotos desde `img/`) y `dist/giftronic-rediseno.html` (fotos desde `img-pack.json`, para publicar como Artifact).
