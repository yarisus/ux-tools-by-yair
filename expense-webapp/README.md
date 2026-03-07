# Expense Web App

Aplicacion web para controlar gastos mensuales por categorias.

## Funcionalidades
- Alta, edicion y eliminacion de items.
- Categorias: gastos fijos, fijos variables y gastos variables.
- Filtros por categoria y estado.
- Resumen mensual: gasto total en uso, saldo disponible, estimado semanal y diario.
- Donut chart por categoria.
- Opcion para ocultar/mostrar sueldo mensual.
- Backup y restore en JSON.
- Exportacion de reporte a CSV y PDF.
- Sincronizacion cloud opcional con Supabase (subir/bajar por perfil).
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

## Cloud Sync (Supabase)
1. Crear tabla:
   - `id` (text, primary key)
   - `payload` (jsonb, not null)
   - `updated_at` (timestamptz, default now())
2. Configurar RLS/politicas para permitir `select` y `insert/upsert` al rol `anon` segun tu modelo de seguridad.
3. En la app:
   - `Configurar nube`
   - Cargar `Supabase URL`
   - Cargar `Supabase Anon Key`
   - Definir `ID de perfil` (ej: `usuario-1`)
4. Usar:
   - `Subir nube` para guardar snapshot actual.
   - `Bajar nube` para recuperar snapshot del perfil.

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
