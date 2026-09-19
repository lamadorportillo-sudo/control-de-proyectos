# Control de Proyectos

Sistema web para control financiero, contractual y supervisión de proyectos, conectado a Supabase y usable en PC, tablet y celular.

## Arquitectura activa

- `frontend-v2/`: aplicación React/Vite/TypeScript y fuente principal.
- `index.html`: interfaz V2 publicada en la raíz de GitHub Pages.
- `assets/` y `v2/`: artefactos generados por la publicación.
- `legacy.html`: respaldo de la interfaz anterior; se conserva para reconstrucción y recuperación.
- `supabase/`: funciones y migraciones de la base de datos.
- `templates/` y `assets/formats/`: plantillas y formatos institucionales.
- `build-pages.cjs` y `authenticated-module-manifest-v1.cjs`: reconstrucción y control de módulos de la interfaz anterior.

## Funciones principales

- Proyectos, contratos, presupuestos, ampliaciones, estimaciones y pagos.
- Garantías, visitas de obra, evidencias, deficiencias y seguimientos.
- Compras, biblioteca documental, reportes, transparencia y auditoría.
- ZORDON y acceso desde Telegram.
- Trabajo responsive para PC, tablet y celular.

## Desarrollo local

Para validar la interfaz principal:

```bash
cd frontend-v2
npm install
npm run lint
npm run build
```

Para revisar la página generada desde la raíz, sirve el repositorio con cualquier servidor HTTP estático.

## Publicación

El workflow crítico de `main` valida la aplicación, construye `frontend-v2`, ejecuta las comprobaciones responsive y publica la V2 en la raíz conservando `legacy.html` como respaldo.

## Base de datos y seguridad

El sistema utiliza Supabase para autenticación y persistencia. En el navegador solo debe utilizarse configuración pública/publishable. Nunca deben agregarse claves `service_role`, secret keys, contraseñas ni otras credenciales privadas.

La rama principal es `main` y la página publicada es:

https://lamadorportillo-sudo.github.io/control-de-proyectos/
