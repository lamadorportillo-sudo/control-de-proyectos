# Integración AI Studio → Control Contractual

Esta carpeta contiene la interfaz React/Vite generada en AI Studio y preparada para integrarse gradualmente al repositorio productivo sin sustituir de golpe la aplicación actual.

## Reglas de integración

- `main` permanece intacta durante esta fase.
- La UI nueva vive temporalmente en `frontend-v2/`.
- Supabase existente sigue siendo la fuente de verdad.
- No se usa Firebase/Firestore.
- Los datos de `src/data/mockData.ts` son solo demostrativos y deben eliminarse al completar la migración.
- `LocalDataRepository` se mantiene como fallback temporal; la siguiente fase es implementar `SupabaseDataRepository`.
- ZORDON debe conectarse al backend existente (`supabase/functions/halu-chat`) y conservar el avatar canónico `engineer-assistant-avatar.png`.
- Telegram debe reutilizar la infraestructura existente del repositorio, no crear un bot o base paralela.
- Autenticación productiva debe reutilizar Supabase Auth, MFA y controles ya existentes.

## Orden de conexión

1. Autenticación y sesión.
2. Proyectos.
3. Contratos.
4. Presupuestos / ampliaciones.
5. Estimaciones y pagos.
6. Visitas y evidencias.
7. Deficiencias.
8. Garantías y pólizas.
9. Convenios.
10. Biblioteca / reportes / transparencia.
11. ZORDON y Telegram.
12. Offline y sincronización.

No publicar esta versión como producción hasta completar los adaptadores y pruebas.
