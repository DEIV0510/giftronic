# Rediseño giftronic04.com — prototipo del sitio completo

Prototipo navegable de alta fidelidad para presentar al dueño de la tienda y guiar la implementación en WooCommerce + Astra + Elementor.

Abre **`index.html`** con doble clic. Es un solo archivo (HTML + CSS + JS vanilla), sin dependencias salvo la fuente Manrope de Google Fonts. La barra superior «Prototipo» lleva a cualquier vista y cambia entre escritorio y móvil (390 px).

## Vistas (rutas `#/…`)

| # | Vista | Ruta |
|---|---|---|
| 1 | Portada | `#/` |
| 2 | Categoría con filtros, rango de precio, orden, «Cargar más» y comparador | `#/categoria/portatiles` |
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

## Datos

- Catálogo real de 25 productos en `src/data.js` (arreglo `products`); todas las vistas se generan desde ahí.
- Marcados como **ejemplo** en el código: envío gratis desde $ 300.000, envío $ 15.000 / express $ 25.000, precio con financiación +7 %, stock de la Ricoh (3), orden «Más vendidos», usos de cada portátil y condiciones de las financieras.
- Las imágenes son ilustraciones SVG por categoría, sin logos de marcas.

## Editar

Las piezas están en `src/`. Después de cambiar algo:

```bash
node build.mjs
```

Genera `index.html` y `dist/giftronic-rediseno.html` (misma página, para publicar como Artifact).
