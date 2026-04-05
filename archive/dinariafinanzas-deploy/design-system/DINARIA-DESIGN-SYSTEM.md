# Dinaria Design System v2

## 1. Objetivo y alcance
Este sistema define la base visual, verbal y de interaccion de Dinaria para desktop y mobile.
Su objetivo es asegurar consistencia, confianza y velocidad de implementacion.

Incluye:
- Componentes.
- Colores.
- Tipografia.
- Elevaciones.
- Spacing.
- Manual de voz y tono.

## 2. Principios del sistema
1. Claridad primero: cada pantalla debe explicar "que pasa con mi dinero" en segundos.
2. Consistencia por tokens: no usar valores sueltos si existe token del sistema.
3. Jerarquia util: lo importante (monto, disponible, accion primaria) siempre destaca.
4. Accesibilidad operativa: foco visible, contraste suficiente y targets de 44px minimo.
5. Escalabilidad: cada patron debe servir para nuevas features sin romper coherencia.

## 3. Fundaciones
### 3.1 Color
Color primario de marca:
- `Primary / 500`: `#3C499D`

Paleta de marca:
- `Brand 50`: `#EEF2FF`
- `Brand 100`: `#E0E7FF`
- `Brand 200`: `#C7D2FE`
- `Brand 300`: `#A5B4FC`
- `Brand 400`: `#818CF8`
- `Brand 500`: `#3C499D`
- `Brand 600`: `#334082`
- `Brand 700`: `#293566`
- `Brand 800`: `#1F2A4A`
- `Brand 900`: `#141D32`

Semanticos:
- `Success`: `#16A34A`
- `Danger`: `#E11D48`
- `Warning`: `#D97706`
- `Info`: `#2563EB`

Neutros base:
- `Surface`: `#FFFFFF`
- `Canvas`: `#F4F7FB`
- `Text primary`: `#0F172A`
- `Text secondary`: `#475569`
- `Text muted`: `#64748B`

Regla:
- Estados y componentes deben leer desde tokens (`tokens.css`), no desde hex hardcodeados.

### 3.2 Tipografia
Familia:
- Principal: `Nunito`
- Fallback: `"Segoe UI", system-ui, -apple-system, sans-serif`

Pesos:
- `500`: cuerpo
- `600`: labels y controles
- `700`: titulos, montos y acciones principales

Escala:
- `12`: helper / microcopy
- `14`: texto secundario
- `16`: body y labels principales
- `20`: subtitulos de seccion
- `24`: titulo de panel
- `30`: valor KPI
- `56`: hero (solo desktop grande)

### 3.3 Spacing
Escala oficial:
- `4, 8, 12, 16, 20, 24, 32, 40`

Reglas de layout:
- Card KPI: `padding 16`
- Gap principal desktop: `24`
- Gap principal mobile: `12-16`
- Separacion entre secciones: `24-32`
- Margen horizontal de app: segun breakpoints del shell

### 3.4 Elevaciones
Sombras:
- `Shadow sm`: `0 4px 14px rgba(15, 23, 42, 0.08)`
- `Shadow md`: `0 16px 34px rgba(15, 23, 42, 0.16)`

Uso recomendado:
- Cards y contenedores de datos: `sm`
- Modales y overlays: `md`

### 3.5 Radius y bordes
- Inputs / botones: `8-12`
- Cards / paneles: `16`
- Chips / pills: `999`
- Bordes base: `1px` con token de borde sutil

### 3.6 Iconografia
- Estilo oficial: `Material Symbols Rounded` (o equivalente rounded).
- Tamanos recomendados:
- `16`: apoyo de label
- `20`: acciones secundarias
- `24`: info icon en KPI

## 4. Sistema de componentes
### 4.1 Topbar
Anatomia:
- Logo a la izquierda.
- Acciones a la derecha (tema, ayuda, feedback, perfil).

Estados:
- Default, hover, focus-visible.

### 4.2 Botones
Tipos:
- Primario (accion principal).
- Secundario/Ghost (accion de soporte).
- Icon-only (acciones compactas).
- Danger (acciones destructivas).

Reglas:
- Alto minimo `44px`.
- No mezclar estilos fuera del sistema de tokens.

### 4.3 Inputs y selects
Incluye:
- Text input, monto input, select, textarea.

Reglas:
- Borde/fondo/focus desde tokens.
- Chevron del select alineado y con padding derecho consistente.
- Formato de dinero visible durante edicion cuando aplique.

### 4.4 KPI cards
Anatomia:
- Label.
- Icono info con tooltip.
- Valor principal.
- Accion de editar (solo donde corresponda).

Reglas:
- Valor KPI con jerarquia alta.
- Tooltip corto, claro y accionable.

### 4.5 Tabla de gastos (desktop)
Estructura:
- Encabezados alineados con columnas.
- Monto alineado a la derecha.
- Acciones en ultima columna.

Interaccion:
- Filtro por dropdown.
- Hover por fila para escaneabilidad.

### 4.6 Lista de gastos (mobile)
Estructura por item:
- Nombre y estado arriba.
- Monto visible y acciones compactas.
- Jerarquia para lectura rapida con una mano.

### 4.7 Chips de categoria
Regla cromatica:
- Fondo claro (aprox. 100).
- Texto y borde medio/fuerte (600-800).
- Contraste suficiente en ambos temas.

### 4.8 Donut + leyenda
Reglas:
- Centro: label `Total` + monto.
- Leyenda ordenada de mayor a menor.
- Mostrar solo categorias con monto > 0.
- Tooltip en hover con categoria y monto acumulado.

### 4.9 Modales
Reglas:
- Titulo claro, sin iconografia decorativa innecesaria.
- Jerarquia de acciones: secundaria izquierda, primaria derecha.
- Confirmaciones destructivas en modal propio (no `confirm()` del navegador).

### 4.10 Dropdowns y sheets
- Desktop: priorizar dropdown para filtros simples.
- Mobile: usar bottom sheet cuando el flujo requiera mas contexto o acciones multiples.

### 4.11 Toasts y feedback del sistema
- Success, warning, error, info.
- Mensaje breve + accion sugerida cuando aplique.

## 5. Manual de voz y tono
### 5.1 Personalidad de marca
- Clara.
- Cercana.
- Practica.
- Confiable.
- Sin tecnicismos innecesarios.

### 5.2 Principios de redaccion
1. Hablar como persona, no como sistema frio.
2. Explicar que paso y que hacer despues.
3. Evitar culpa al usuario.
4. Ser breve en UI; ampliar solo en ayuda/onboarding.

### 5.3 Tono por contexto
Onboarding:
- Didactico y simple.
- Ejemplo: "En 1 minuto puedes registrar tus gastos del mes."

Operacion diaria:
- Directo y util.
- Ejemplo: "Disponible para gastar: $ 430.000"

Error:
- Claro y sin dramatizar.
- Ejemplo: "No pudimos sincronizar. Revisa tu conexion e intenta de nuevo."

Exito:
- Breve y confirmatorio.
- Ejemplo: "Gasto guardado correctamente."

Accion destructiva:
- Preciso y preventivo.
- Ejemplo: "Esta accion elimina el gasto y no se puede deshacer."

### 5.4 Guía de copy (Do / Dont)
Do:
- "Agregar gasto"
- "Iniciar sesion con Google"
- "No pudimos leer tus datos desde la nube"

Dont:
- "Error fatal en sincronizacion cloud"
- "Operacion fallida por excepcion desconocida"

### 5.5 Convenciones de dinero y numeros
- Mostrar moneda con simbolo `$`.
- Usar separador de miles con punto para AR.
- Mantener formato consistente en KPIs, tabla, donut y modales.

## 6. Accesibilidad y calidad
Minimo de contraste que aplicamos en Dinaria:
1. Texto normal (hasta 23px): ratio minimo `4.5:1`.
2. Texto grande (24px+ o bold): ratio minimo `3:1`.
3. Iconos y bordes de controles interactivos: ratio minimo `3:1`.
4. Chips de categoria: texto y borde siempre con contraste de texto normal (`4.5:1`).

Nota:
- No buscamos sobre-optimizar, pero estos minimos no se negocian en componentes de produccion.

Checklist minimo antes de publicar:
1. Contraste AA en texto y controles interactivos.
2. Foco visible en todos los elementos navegables por teclado.
3. Targets tactiles minimo `44x44`.
4. Tooltips accesibles por hover y foco.
5. Estados disabled distinguibles sin depender solo del color.

## 7. Gobernanza del sistema
Reglas para cambios:
1. Si agregas un componente nuevo, documentar:
- Anatomia.
- Estados.
- Medidas.
- Version desktop/mobile.
2. Si agregas color o sombra nueva, primero crear token.
3. No mergear UI sin validar consistencia con este documento.

## 8. Archivos fuente del sistema
- [tokens.css](/Users/Yair-/ai-lab/expense-webapp/design-system/tokens.css)
- [DINARIA-DESIGN-SYSTEM.md](/Users/Yair-/ai-lab/expense-webapp/design-system/DINARIA-DESIGN-SYSTEM.md)
- [styles.css](/Users/Yair-/ai-lab/expense-webapp/styles.css)
- [index.html](/Users/Yair-/ai-lab/expense-webapp/index.html)

## 9. Siguiente fase recomendada
- Fase 3: separar `styles.css` en capas (`foundations.css`, `components.css`, `overrides.css`) y crear checklist visual por release.
