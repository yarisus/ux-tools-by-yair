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
- Login con Google usando Supabase OAuth.
- Sincronizacion de datos por usuario (desktop + mobile).
- Instalacion como app (PWA) en navegadores compatibles.

## Seguridad y confianza
- Sesion por Google OAuth (Supabase Auth), sin guardar passwords en esta app.
- Datos por usuario (aislados por `user_id`) con Row Level Security (RLS) en Supabase.
- Trafico cifrado por HTTPS (Vercel + Supabase).
- Headers de hardening en produccion (`CSP`, `HSTS`, `X-Frame-Options`, `nosniff`, `Permissions-Policy`).
- Sincronizacion cloud con fallback local para evitar perdida por caidas temporales.

Recomendaciones para publicarla a usuarios:
- No compartir `service_role` key (solo `anon public key` en frontend).
- Mantener `Site URL` y `Redirect URLs` estrictas en Supabase.
- Revisar logs de Auth y Rate Limits en Supabase periodicamente.
- Publicar una politica de privacidad simple (que datos guardas, para que, y como pedir borrado).

## Uso local
1. Abrir con un servidor estatico (recomendado para PWA):
   - `cd C:\Users\Yair-\ai-lab\expense-webapp`
   - `python -m http.server 5500`
2. Entrar en `http://localhost:5500`.

Tambien se puede abrir `index.html` directo, pero la instalacion PWA y service worker no funcionan en `file://`.

## Storybook local (Design System)
1. Instalar dependencias:
   - `cd C:\Users\Yair-\ai-lab\expense-webapp`
   - `npm install`
2. Levantar Storybook:
   - `npm run storybook`
3. Abrir:
   - `http://localhost:6006`

Stories incluidas:
- Fundaciones (colores, tipografia, spacing, elevaciones)
- Buttons
- Inputs & Selects
- Category Chips
- KPI Cards
- Modals
- Expense Table

## Persistencia de datos
- Los datos **no se borran al reiniciar la compu**.
- Se guardan en el navegador del usuario (localStorage).
- Se pierden si el usuario borra datos del sitio, usa modo incognito o cambia de dispositivo/navegador.
- Si configuras Supabase y el usuario inicia sesion, los datos tambien quedan en la nube.

## Setup cloud gratis (Supabase)
1. Crea un proyecto en Supabase (plan Free).
2. Ve a `Project Settings > API` y copia:
   - `Project URL`
   - `anon public key`
3. En Supabase SQL Editor, ejecuta:

```sql
create table if not exists public.user_app_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_app_states enable row level security;

drop policy if exists "Users can read own app state" on public.user_app_states;
create policy "Users can read own app state"
on public.user_app_states
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own app state" on public.user_app_states;
create policy "Users can insert own app state"
on public.user_app_states
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own app state" on public.user_app_states;
create policy "Users can update own app state"
on public.user_app_states
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

4. En la app, abre `Cuenta y sincronizacion`.
5. Pega `Supabase URL` y `Anon Key`, guarda configuracion.
6. En Supabase activa Google OAuth:
   - `Authentication > Providers > Google`.
   - Habilita el provider y configura credenciales de Google si tu panel lo pide.
   - En `URL Configuration`, agrega la URL de produccion (ej: `https://expense-webapp-delta.vercel.app`).
7. Usa `Iniciar sesion con Google`.
8. Usa la misma cuenta en desktop y mobile para ver los mismos datos.

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

## Design System
- Manual completo: [design-system/DINARIA-DESIGN-SYSTEM.md](/Users/Yair-/ai-lab/expense-webapp/design-system/DINARIA-DESIGN-SYSTEM.md)
- Tokens visuales: [design-system/tokens.css](/Users/Yair-/ai-lab/expense-webapp/design-system/tokens.css)
- Libreria visual de componentes: [design-system/library.html](/Users/Yair-/ai-lab/expense-webapp/design-system/library.html)

## Fuentes
- La app usa `Nunito` autohospedada para evitar que el navegador cambie de tipografia si Google Fonts falla.
- Archivo de fuente local: [assets/fonts/Nunito-VariableFont_wght.ttf](/Users/Yair-/ai-lab/expense-webapp/assets/fonts/Nunito-VariableFont_wght.ttf)
- Definicion `@font-face`: [assets/fonts/fonts.css](/Users/Yair-/ai-lab/expense-webapp/assets/fonts/fonts.css)
