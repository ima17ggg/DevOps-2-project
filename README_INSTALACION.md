# Paquete de implementación HelpDesk

Esta carpeta replica la estructura de `DevOps-2-project-main`. Para instalar
la funcionalidad, copie su contenido sobre la raíz del proyecto conservando
las rutas indicadas abajo.

## Archivos y ubicación de destino

| Archivo del paquete | Destino dentro del proyecto | Acción |
|---|---|---|
| `hackatec2026-frontend/src/Pages/Incidencias.jsx` | `hackatec2026-frontend/src/Pages/Incidencias.jsx` | Archivo nuevo |
| `hackatec2026-frontend/src/App.jsx` | `hackatec2026-frontend/src/App.jsx` | Reemplazar o integrar la importación y ruta `/incidents` |
| `hackatec2026-frontend/src/components/SideNavBar.jsx` | `hackatec2026-frontend/src/components/SideNavBar.jsx` | Reemplazar o integrar la opción HelpDesk |
| `hackatec2026-frontend/src/services/emailService.js` | `hackatec2026-frontend/src/services/emailService.js` | Reemplazar o integrar `sendIncidentEmail` |
| `hackatec2026-frontend/src/Pages/NotificationSettings.jsx` | `hackatec2026-frontend/src/Pages/NotificationSettings.jsx` | Reemplazar o integrar la configuración de incidencias |
| `hackatec2026-frontend/src/Pages/Reportes.jsx` | `hackatec2026-frontend/src/Pages/Reportes.jsx` | Reemplazar para habilitar el control de la bitácora |
| `Hackatec2026-AppWebMovil-backend/src/routes/incidencias.js` | `Hackatec2026-AppWebMovil-backend/src/routes/incidencias.js` | Reemplazar el CRUD básico |
| `Hackatec2026-AppWebMovil-backend/src/routes/reportes.js` | `Hackatec2026-AppWebMovil-backend/src/routes/reportes.js` | Reemplazar para habilitar detalle, cambios y seguimiento |
| `Hackatec2026-AppWebMovil-backend/src/server.js` | `Hackatec2026-AppWebMovil-backend/src/server.js` | Reemplazar o integrar la ruta `/api/reportes` |
| `Hackatec2026-AppWebMovil-backend/database/001_helpdesk_incidencias.sql` | `Hackatec2026-AppWebMovil-backend/database/001_helpdesk_incidencias.sql` | Archivo nuevo |
| `Hackatec2026-AppWebMovil-backend/API_DOCUMENTATION.md` | `Hackatec2026-AppWebMovil-backend/API_DOCUMENTATION.md` | Documentación actualizada |

## Orden de instalación

1. Haga una copia de seguridad de los archivos actuales que serán reemplazados.
2. Copie las dos carpetas de este paquete sobre la raíz del proyecto.
3. Abra Supabase y ejecute una sola vez el contenido de
   `Hackatec2026-AppWebMovil-backend/database/001_helpdesk_incidencias.sql`
   desde el SQL Editor.
4. Reinicie el backend.
5. En el frontend, instale las dependencias declaradas con `npm install` si
   todavía no existe `node_modules`, y después inicie o compile el proyecto.
6. Entre a **Notificaciones**, configure EmailJS y copie la plantilla genérica
   mostrada por la pantalla para habilitar los correos de incidencias.

## Funcionalidad incluida

- Formulario de reporte de incidencias.
- Folio y estado inicial automáticos.
- Listado limitado al usuario autenticado.
- Detalle e historial de seguimientos.
- Registro de comentarios de seguimiento.
- Validación de propiedad desde la API.
- Correos de creación y actualización mediante EmailJS.
- Endpoint protegido de reportes registrado en el servidor.
- Búsqueda por folio, asunto, empleado, tipo o ubicación en Reportes.
- Filtros independientes por estado y prioridad.
- Panel de control para cambiar estado y prioridad.
- Nota de resolución obligatoria al resolver o cerrar.
- Historial de auditoría con responsable, fecha, estado y comentario.

## Verificaciones realizadas

- Compilación de producción del frontend: correcta.
- ESLint sobre los archivos modificados: correcto.
- Comprobación de sintaxis de los archivos backend: correcta.
