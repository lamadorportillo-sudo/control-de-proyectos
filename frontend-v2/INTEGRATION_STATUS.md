# Estado de integración — AI Studio → Control Contractual

Fecha: 2026-09-15

## Rama de trabajo
- `integracion-ai-studio`
- `main` permanece intacta.

## Base importada
La nueva interfaz React/Vite vive en `frontend-v2/` para evitar sustituir prematuramente la SPA productiva actual.

## Confirmado
- React 19 + Vite + TypeScript + Tailwind.
- Cliente Supabase preparado con variables `VITE_SUPABASE_*`.
- Proyecto Supabase existente: `flethujkrharehjikwgj`.
- No se incorpora Firebase ni Firestore.
- Se conserva el avatar canónico de ZORDON: `/control-de-proyectos/engineer-assistant-avatar.png`.
- El launcher de ZORDON conserva indicador de disponibilidad y `aria-label="Abrir ZORDON"`.
- Se mantiene la infraestructura productiva existente de Supabase, Telegram, MFA, Edge Functions y pruebas.

## Importado hasta este punto
- configuración Vite/TypeScript;
- estilos base;
- tipos de dominio;
- motor de cálculos;
- adaptador de backend;
- cliente Supabase;
- navegación lateral responsive;
- launcher/avatar ZORDON;
- vista Compras.

## Pendiente antes de publicar
1. Completar la importación de componentes/vistas restantes de AI Studio.
2. Sustituir `mockData` y `LocalDataRepository` por adaptadores Supabase.
3. Reutilizar autenticación/MFA productiva existente.
4. Conectar ZORDON al Edge Function real `halu-chat`.
5. Conectar Telegram Mini App/Bot al backend existente.
6. Reutilizar flujo offline/sincronización existente.
7. Validar Convenios, Reportes, Biblioteca, Contratistas y demás módulos que AI Studio no dejó completos.
8. Ejecutar TypeScript/build y pruebas funcionales/responsive.
9. Crear preview de la rama.
10. Fusionar a `main` únicamente tras validación.

## Regla
No publicar `frontend-v2` como producción mientras existan datos DEMO o adaptadores locales como fuente principal.
