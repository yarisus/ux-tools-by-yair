# Expense Web App

Aplicacion web para controlar gastos mensuales por categorias.

## Funcionalidades
- Alta, edicion y eliminacion de gastos.
- Categorias: gastos fijos, gastos semifijos y gastos variables.
- Filtro por categoria.
- Resumen mensual: gasto total en uso, saldo disponible y presupuesto estimado semanal y diario.
- Grafico de gastos por categoria.
- Opcion para ocultar/mostrar sueldo mensual.
- Boton de descarga con exportacion de reporte a CSV o PDF.
- Datos guardados en `localStorage` del navegador.
- Instalacion como app (PWA) en navegadores compatibles.

## Uso local
1. Abrir con un servidor estatico (recomendado para PWA):
   - `cd C:\Users\Yair-\ai-lab\expense-webapp`
   - `python -m http.server 5500`
2. Entrar en `http://localhost:5500`.

Tambien se puede abrir `index.html` directo, pero la instalacion PWA y service worker no funcionan en `file://`.

## Persistencia de datos
- Los datos **no se borran al reiniciar la compu**.
- Se guardan en el navegador del usuario (localStorage).
- Se pierden si el usuario borra datos del sitio, usa modo incognito o cambia de dispositivo/navegador.

## Publicar en GitHub Pages
1. Subir esta carpeta al repositorio.
2. En GitHub: `Settings > Pages`.
3. Seleccionar branch y carpeta de deploy.
4. Abrir la URL publicada.

## Estructura
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon-192.svg`
- `icon-512.svg`
