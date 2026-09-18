# Estado de integración — AI Studio → Control Contractual

Fecha de actualización: 2026-09-16

## Rama de trabajo
- `integracion-ai-studio`
- `main` permanece intacta.
- PR de seguimiento: `#25` en estado **draft**.

## Estado técnico confirmado
- React 19 + Vite + TypeScript + Tailwind.
- Supabase productivo: `flethujkrharehjikwgj`.
- Clave **publishable** configurada para navegador; no se incluye `service_role` ni secretos privados.
- La V2 reutiliza la sesión productiva `control_contractual_session_v3` y Supabase Auth.
- Las consultas productivas se bloquean si no existe una sesión válida; no se muestran datos ficticios como sustituto.
- Las políticas RLS continúan siendo la barrera de autorización.
- No se incorpora Firebase ni Firestore.
- ZORDON reutiliza el Edge Function existente `halu-chat`.
- Telegram conserva la infraestructura existente y la V2 detecta Telegram WebApp.
- El avatar canónico de ZORDON se conserva en `/control-de-proyectos/engineer-assistant-avatar.png`.

## Módulos V2 conectados / montados
- Inicio operativo.
- Proyectos con búsqueda focalizada, sin cargar los 73 expedientes al entrar.
- Expediente de proyecto por pestañas: resumen, contrato, presupuesto, estimaciones, garantías, visitas, deficiencias y documentos.
- Contratos y contratistas.
- Presupuestos.
- Estimaciones y pagos.
- Garantías.
- Compras y cotizaciones.
- Deficiencias y seguimiento.
- Documentos y evidencias.
- Transparencia como generador selectivo de categorías.
- Auditoría.
- Modo Campo.
- Configuración segura.
- ZORDON dentro de la nueva interfaz.

## Fuente de datos
`SupabaseDataRepository` ya lee las tablas productivas existentes, entre ellas:
- `projects`
- `contracts`
- `estimates`
- `guarantees`
- `visits`
- `project_evidence`
- `alert_events`
- `audit_log`

Los datos DEMO fueron retirados como fuente principal. `LocalDataRepository` queda únicamente como mecanismo técnico de fallback y no debe utilizarse para sustituir información productiva.

## Protección de escritura
Las operaciones de escritura directa desde la V2 siguen bloqueadas hasta validar los RPC/RLS productivos. Esto evita duplicar proyectos, contratos, estimaciones, garantías, visitas o evidencias durante la migración.

## Validación automatizada
Workflow: `Validate frontend-v2`

Valida en cada cambio relevante:
1. instalación de dependencias;
2. TypeScript (`tsc --noEmit`);
3. build de producción con Vite;
4. existencia de `dist/index.html` y assets.

La validación del commit `deba28941fe59ca7bfdfbe90272994e6a257faf3` terminó correctamente en todos los pasos.

## Pendiente antes de producción
1. Validar la V2 en navegador bajo el mismo origen de GitHub Pages con una sesión real iniciada.
2. Probar RLS con los roles reales del workspace.
3. Probar ZORDON autenticado desde la V2 y confirmar continuidad con Telegram.
4. Corregir cualquier diferencia de mapeo detectada con datos reales (alertas, auditoría y documentos).
5. Conectar los flujos productivos de escritura usando RPC/funciones ya autorizadas, no inserciones inseguras desde el navegador.
6. Completar prueba responsive PC, tablet, celular y Telegram Mini App.
7. Preparar preview controlado.
8. Mantener el PR #25 como borrador hasta terminar estas pruebas.
9. Fusionar a `main` únicamente después de la validación final.

## Regla de seguridad
La aplicación productiva actual no se reemplaza durante esta fase. La migración debe ser progresiva, reversible y sin pérdida de datos.


## Avance 2026-09-18
- Convenios incorporado como módulo físico sin inventar registros: usa únicamente evidencias reales identificadas como convenio.
- Reportes conectado a `generated_reports`, incluyendo acceso a documento público verificado cuando existe token público habilitado.
- Biblioteca Documental ahora incorpora también reportes digitales generados.
- Transparencia toma conteos reales para procesos de contratación y convenios respaldados por evidencia.
- Módulo Contratistas consolidado desde contratos productivos.
- Compras consulta `project_procurement_audit`.
- Presupuesto consulta movimientos reales de `budget_movements`.
- Sesión V2 protegida: sin sesión productiva no se leen datos ni se abre la interfaz operativa.
- Registro de visita ya tiene el flujo oficial de 5 pasos y guardado de borrador local con ID estable.
- El guardado productivo de visita continúa bloqueado hasta terminar la integración segura de evidencia binaria y sincronización.
- Smoke tests responsive aprobados en 360, 480, 768, 1024 y 1440 px.
- Se genera artefacto `frontend-v2-preview` en GitHub Actions para inspección sin tocar `main`.
