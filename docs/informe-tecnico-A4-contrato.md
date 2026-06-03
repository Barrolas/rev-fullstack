# Contrato de formato A4 — Informe técnico REV

Documento fuente: [`informe-tecnico-integral-rev.html`](informe-tecnico-integral-rev.html)

**Este archivo debe conservarse.** Al actualizar el informe, respetar estas reglas para que **cada hoja sea una cara A4** con diseño propio.

---

## Regla principal

**Una hoja física = un `<section class="page page-break">`.**

Estructura obligatoria en páginas interiores:

```html
<section class="page page-break" id="cap3-2">
  <header class="sheet-head">…</header>
  <div class="sheet-main">…contenido…</div>
  <footer class="sheet-foot">…<span class="sheet-foot__num"></span></footer>
</section>
```

La **portada** usa `class="page page--cover page-break"` con `cover-layout` (no lleva `sheet-head`).

---

## Medidas fijas (no cambiar)

| Variable | Valor |
|----------|-------|
| `--a4-w` | `210mm` |
| `--a4-h` | `297mm` |
| `.page` | `height: 297mm; overflow: hidden;` |
| `@page` | `size: 210mm 297mm; margin: 0;` |

Márgenes visuales: `sheet-head` / `sheet-main` / `sheet-foot` (16 mm laterales).

---

## Al agregar contenido nuevo

1. Estimar altura útil (~240 mm en `sheet-main`).
2. Si no cabe, **crear otra `.page`** (`cap5-2`, `cap5-3`, …) — no alargar una sola sección.
3. Mantener el bloque de comentario **CONTRATO DE FORMATO A4** en el `<style>` del HTML.
4. Actualizar versión en portada si el cambio es sustancial.
5. Opcional: ejecutar `node docs/informe-wrap-pages.mjs` solo tras reestructurar secciones manualmente (editar splits en el script si añades capítulos).

---

## Tema visual

- **Informe:** fondo blanco, texto navy, acento `#F97316`, cabecera/pie en cada hoja.
- **App REV:** tema oscuro en `theme.css` (no mezclar con el informe).

---

## Exportar PDF

1. Abrir el HTML en Chrome o Edge.
2. `Ctrl+P` → **Guardar como PDF**.
3. Papel **A4**, vertical, márgenes **Ninguno** o **Predeterminados** (el layout ya incluye márgenes internos).
4. **Gráficos de fondo** activados.
5. Escala **100%**.

---

## Checklist

- [ ] Cada `<section class="page">` tiene altura fija A4
- [ ] Capítulos largos partidos en varias hojas
- [ ] Portada `page--cover` con meta grid
- [ ] Comentario CONTRATO presente en CSS
- [ ] Probado en vista previa e impresión PDF

Regla Cursor: `.cursor/rules/informe-tecnico-rev.mdc`
