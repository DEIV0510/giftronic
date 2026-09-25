# Rediseño giftronic04.com — prototipo navegable

Borrador de alta fidelidad del rediseño de la tienda (WooCommerce + Elementor + Astra).

Abre **`index.html`** con doble clic. Es un solo archivo con HTML, CSS y JS, sin dependencias salvo la fuente Manrope de Google Fonts.

## Qué incluye

| Vista | Qué muestra |
|---|---|
| **Home** | Barra superior, header con buscador, mega-menú de 6 familias, hero con H1 real, franja de confianza, categorías con foto, carruseles por intención, bloque de medios de pago y footer completo |
| **Categoría** | Portátiles con filtros funcionales (marca, precio, procesador, RAM, almacenamiento, pantalla, uso, disponibilidad), orden y panel «Filtrar» en móvil |
| **Producto** | Combo Samsung 40" QLED + HW-B400F: galería ordenada con zoom, precio de contado y con financiación, calculadora de cuotas, envío, garantía, qué incluye la caja, especificaciones, preguntas frecuentes, reseñas y barra fija de compra en móvil |
| **Plan de cambios** | Lista priorizada para WooCommerce + Elementor + Astra y la recomendación sobre precios de referencia (Ley 1480) |

El botón **Móvil** de la barra superior muestra la tienda a 390 px de ancho.

## Datos

- Productos, precios y especificaciones: los de la tienda (`src/data.js`).
- De ejemplo, por confirmar: tiempos de envío, horario, stock «Últimas unidades» y precio con financiación (+7 % sobre contado).
- Las imágenes son ilustraciones SVG de muestra, sin logos de marcas.

## Editar

Las piezas están en `src/`. Después de cambiar algo:

```bash
node build.mjs
```

Genera `index.html` (documento completo) y `dist/giftronic-rediseno.html` (misma página, para publicar como Artifact).
