# Hackatech Backend API

Complete REST API for employee time-tracking dashboard with QR code check-ins and GPS validation.

## Getting Started

### Prerequisites
- Node.js 16+
- Supabase project with the required tables

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

Server will listen on `http://localhost:3000`

## API Authentication

All endpoints (except `/health`) require a Bearer token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" http://localhost:3000/api/usuarios
```

## API Endpoints

### Health Check
- `GET /health` - Check if server is running (no auth required)

### CRUD Operations (all require authentication)

#### Usuarios (Users)
- `GET /api/usuarios` - List all users
- `GET /api/usuarios/:id` - Get user by ID
- `POST /api/usuarios` - Create user
- `PUT /api/usuarios/:id` - Update user
- `DELETE /api/usuarios/:id` - Delete user

#### Empleados (Employees)
- `GET /api/empleados` - List all employees
- `GET /api/empleados/:id` - Get employee by ID
- `GET /api/empleados/supervisor/:supervisorId/assigned` - Get employees assigned to supervisor
- `POST /api/empleados` - Create employee
- `PUT /api/empleados/:id` - Update employee
- `DELETE /api/empleados/:id` - Delete employee

#### Asignaciones (Assignments)
- `GET /api/asignaciones` - List all assignments
- `GET /api/asignaciones/:id` - Get assignment by ID
- `POST /api/asignaciones` - Create assignment
- `PUT /api/asignaciones/:id` - Update assignment
- `DELETE /api/asignaciones/:id` - Delete assignment

#### Plantas (Plants/Locations)
- `GET /api/plantas` - List all plants
- `GET /api/plantas/:id` - Get plant by ID
- `POST /api/plantas` - Create plant
- `PUT /api/plantas/:id` - Update plant
- `DELETE /api/plantas/:id` - Delete plant

#### Asistencias (Attendance)
- `GET /api/asistencias` - List all attendance records
- `GET /api/asistencias/:id` - Get attendance by ID
- `GET /api/asistencias/employee/:employeeId/today` - Get today's attendance for employee
- `POST /api/asistencias` - Create attendance record
- `PUT /api/asistencias/:id` - Update attendance record
- `DELETE /api/asistencias/:id` - Delete attendance record

#### Actividades (Activities)
- `GET /api/actividades` - List all activities
- `GET /api/actividades/:id` - Get activity by ID
- `POST /api/actividades` - Create activity
- `PUT /api/actividades/:id` - Update activity
- `DELETE /api/actividades/:id` - Delete activity

#### Códigos QR
- `GET /api/codigos-qr` - List all QR codes
- `GET /api/codigos-qr/:id` - Get QR code by ID
- `GET /api/codigos-qr/validate/:code` - Validate QR code
- `POST /api/codigos-qr` - Create QR code
- `PUT /api/codigos-qr/:id` - Update QR code
- `DELETE /api/codigos-qr/:id` - Delete QR code

#### Incidencias (Incidents)
- `GET /api/incidencias` - List all incidents
- `GET /api/incidencias/:id` - Get incident by ID
- `POST /api/incidencias` - Create incident
- `PUT /api/incidencias/:id` - Update incident
- `DELETE /api/incidencias/:id` - Delete incident

#### Notificaciones (Notifications)
- `GET /api/notificaciones` - List all notifications
- `GET /api/notificaciones/:id` - Get notification by ID
- `POST /api/notificaciones` - Create notification
- `PUT /api/notificaciones/:id` - Update notification
- `DELETE /api/notificaciones/:id` - Delete notification

#### Clientes (Clients)
- `GET /api/clientes` - List all clients
- `GET /api/clientes/:id` - Get client by ID
- `POST /api/clientes` - Create client
- `PUT /api/clientes/:id` - Update client
- `DELETE /api/clientes/:id` - Delete client

### Feature Endpoints

#### QR Code Operations
- `POST /api/qr/generate` - Generate new QR code for a plant
  ```bash
  POST /api/qr/generate
  { "id_planta": 1 }
  ```

- `POST /api/qr/validate` - Validate a QR code
  ```bash
  POST /api/qr/validate
  { "code": "plant_1_1234567890" }
  ```

#### GPS Location
- `POST /api/gps/validate-location` - Check if employee is within plant radius
  ```bash
  POST /api/gps/validate-location
  {
    "employee_lat": 14.0534,
    "employee_lon": -87.1921,
    "id_planta": 1
  }
  ```

- `GET /api/gps/distance` - Calculate distance between two coordinates
  ```bash
  GET /api/gps/distance?lat1=14.0534&lon1=-87.1921&lat2=14.0535&lon2=-87.1920
  ```

#### Excel Import
- `POST /api/excel/import` - Upload and import Excel file with employees
  ```bash
  POST /api/excel/import?dryRun=false
  Content-Type: multipart/form-data
  file: <usuarios.xlsx>
  ```

- `POST /api/excel/validate` - Validate Excel file without importing
  ```bash
  POST /api/excel/validate
  Content-Type: multipart/form-data
  file: <usuarios.xlsx>
  ```

#### Dashboard (Supervisor Views)
- `GET /api/dashboard/supervisor/:supervisorId/employees` - Get assigned employees

- `GET /api/dashboard/supervisor/:supervisorId/attendance/today` - Get today's attendance for supervisor's team

- `GET /api/dashboard/supervisor/:supervisorId/attendance/range?start_date=2026-05-20&end_date=2026-05-22` - Get attendance for date range

- `GET /api/dashboard/supervisor/:supervisorId/summary` - Get attendance summary (total, present, absent, pending QR)

- `GET /api/dashboard/employee/:employeeId/hours` - Get total hours worked by employee

- `GET /api/dashboard/employee/:employeeId/incidents` - Get incidents for employee

## Response Format

All endpoints return a standardized JSON response:

```json
{
  "success": true,
  "data": { /* actual data */ },
  "error": null,
  "timestamp": "2026-05-22T12:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": "Error message here",
  "timestamp": "2026-05-22T12:00:00Z"
}
```

## Example Requests

### Create a new employee
```bash
curl -X POST http://localhost:3000/api/empleados \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "rfc": "PERC000101ABC",
    "fecha_ingreso": "2026-01-15"
  }'
```

### Generate QR code for a plant
```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "id_planta": 1 }'
```

### Validate employee location
```bash
curl -X POST http://localhost:3000/api/gps/validate-location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_lat": 14.0534,
    "employee_lon": -87.1921,
    "id_planta": 1
  }'
```

### Import employees from Excel
```bash
curl -X POST http://localhost:3000/api/excel/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@usuarios.xlsx"
```

## Project Structure

```
/src/
├── server.js                    # Main Express app
├── middleware/
│   ├── auth.js                  # JWT authentication
│   └── errors.js                # Global error handler
├── routes/
│   ├── usuarios.js
│   ├── empleados.js
│   ├── asignaciones.js
│   ├── plantas.js
│   ├── asistencias.js
│   ├── actividades.js
│   ├── codigos_qr.js
│   ├── incidencias.js
│   ├── notificaciones.js
│   ├── clientes.js
│   ├── qr.js                    # QR generation & validation
│   ├── gps.js                   # GPS location validation
│   ├── excel.js                 # Excel import
│   └── dashboard.js             # Supervisor dashboard
└── utils/
    ├── supabase.js              # Supabase client
    ├── validation.js            # Input validation helpers
    ├── excel-import.js          # Excel parsing logic
    └── gps.js                   # Haversine distance calculations
```

## Error Handling

- **401 Unauthorized** - Missing or invalid JWT token
- **400 Bad Request** - Invalid input or missing required fields
- **404 Not Found** - Resource not found or endpoint not found
- **409 Conflict** - Duplicate entry (unique constraint violation)
- **500 Internal Server Error** - Unexpected server error

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SUPABASE_URL | Supabase project URL | Yes |
| SUPABASE_KEY | Supabase anon key | Yes |
| PORT | Server port (default: 3000) | No |
| FRONTEND_URL | Frontend URL for CORS | No |

## Development

### Start with auto-reload:
```bash
npm run dev
```

### Install nodemon if not present:
```bash
npm install -D nodemon
```

## Notes

- All date fields should be in ISO 8601 format (YYYY-MM-DD)
- GPS coordinates: latitude (-90 to 90), longitude (-180 to 180)
- Excel imports expect columns: correo, nombre, apellido_paterno, rfc, codigo_empleado
- Multer accepts files up to 50MB
- Face recognition is skipped for now (can be integrated later)
