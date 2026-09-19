# Estado de integración — AI Studio → Control Contractual

Fecha de actualización: 2026-09-18

## Rama y publicación segura
- Rama de trabajo: `integracion-ai-studio`.
- PR de seguimiento: `#25`.
- `main` continúa sin ser reemplazada durante la integración.
- Se preparó publicación paralela en `/control-de-proyectos/v2/` al fusionar, conservando la aplicación actual en la raíz.
- El workflow crítico construirá `frontend-v2`, copiará el artefacto a `v2/` y publicará ambos sin sustituir inmediatamente la página principal.

## Arquitectura confirmada
- React 19 + Vite + TypeScript + Tailwind.
- Supabase productivo: `flethujkrharehjikwgj`.
- Solo se usa configuración pública/publishable en navegador; nunca `service_role`.
- La V2 reutiliza la sesión productiva `control_contractual_session_v3`.
- Auth + RLS siguen controlando autorización por workspace.
- No se incorporó Firebase ni Firestore.
- ZORDON reutiliza `halu-chat`.
- Telegram Mini App reutiliza la misma V2 y el backend ya existente.
- El pequeño ingeniero canónico de ZORDON se conserva.

## Módulos físicos integrados
- Inicio.
- Proyectos.
- Expediente del proyecto por pestañas.
- Contratos.
- Contratistas.
- Convenios.
- Presupuestos y ampliaciones.
- Estimaciones y pagos.
- Garantías y pólizas.
- Visitas de obra.
- Registrar visita, flujo oficial de 5 pasos.
- Modo Campo.
- Compras y cotizaciones.
- Deficiencias y seguimiento.
- Biblioteca Documental.
- Reportes.
- Generador de Transparencia.
- Portal Público de Transparencia separado del shell administrativo.
- Auditoría.
- Configuración.
- ZORDON integrado.

## Datos productivos conectados
Entre las fuentes utilizadas:
- `projects`
- `contracts`
- `contract_changes`
- `project_budgets`
- `budget_movements`
- `estimates`
- `payments`
- `guarantees`
- `visits`
- `project_evidence`
- `deficiencies`
- `deficiency_followups`
- `alert_events`
- `audit_log`
- `generated_reports`
- `project_procurement_audit`

Los datos DEMO no se utilizan como sustituto de información productiva.

## Escrituras productivas
Ya existen flujos V2 protegidos por sesión y RLS para:
- contratos;
- estimaciones;
- garantías;
- pagos;
- deficiencias;
- seguimientos de deficiencias;
- verificación y cierre separados;
- visitas de obra;
- evidencia fotográfica y audio de visita;
- documentos/evidencias vinculadas.

### Visitas
- La V2 conserva un ID estable desde el borrador.
- Si no hay conexión, el borrador queda localmente con el mismo ID.
- En producción, `VITE_ENABLE_VISIT_WRITES=true`.
- La visita se guarda en `visits`.
- Fotos y audio se guardan en Storage y `project_evidence`.
- Una incidencia marcada durante la visita genera una deficiencia estructurada vinculada a esa visita.
- Corregida/verificada y cerrada permanecen como estados distintos.

## Transparencia
El Generador Administrativo y el Portal Público están separados.

### Generador
- Estado inicial sin categorías preseleccionadas.
- Selector de mes.
- Acción `Nuevo mes`.
- Selección múltiple de categorías.
- Portal web / PDF / ZIP.
- Solo prepara lo seleccionado.
- No usa KPIs de dashboard.

### Portal Público
- No muestra sidebar ni herramientas administrativas.
- Muestra únicamente categorías seleccionadas.
- Tiene presentación ciudadana independiente.
- La vista pública actual funciona como preview verificable antes de publicación definitiva.

## Reportes
- Lee `generated_reports`.
- Puede abrir documentos digitales públicos cuando existe token habilitado.
- Incluye generador de proyectos en ejecución.
- Permite Imprimir / Guardar PDF desde navegador.
- Permite CSV.
- El backend productivo conserva el generador avanzado de informes de visita con PDF/DOCX/QR.

## Rendimiento
- La carga inicial es liviana.
- Contratos, estimaciones, garantías, documentos y visitas se cargan bajo demanda.
- No se muestran todos los proyectos en módulos que deben iniciar con búsqueda.
- Se mantiene búsqueda focalizada y expediente central.

## Validación automatizada
Workflow: `Validate frontend-v2`.

Prueba:
1. TypeScript.
2. Build Vite de producción.
3. Artefacto de salida.
4. Same-origin session bridge.
5. Acceso bloqueado sin sesión.
6. ZORDON con misma sesión.
7. Telegram Mini App.
8. Reportes.
9. Transparencia.
10. Separación del Portal Público.
11. Registrar visita con escritura simulada bajo sesión.
12. PC.
13. Tablet.
14. Celular.
15. Anchos oficiales y ausencia de overflow horizontal.
16. Artefacto `frontend-v2-preview`.

## Seguridad confirmada
RLS productivo existe para escritura/lectura de:
- `visits`
- `project_evidence`
- `deficiencies`
- `deficiency_followups`
- `payments`

Las políticas requieren usuario autenticado y validan membresía/capacidad de edición del workspace.

## Paso de publicación
La estrategia final es progresiva y reversible:
1. terminar validación del PR;
2. fusionar `integracion-ai-studio` a `main`;
3. publicar V2 paralela en `/v2/`;
4. revisar con sesión productiva real;
5. cuando la V2 quede aprobada visual y funcionalmente, convertirla en interfaz principal sin eliminar inmediatamente el respaldo de la versión anterior.
