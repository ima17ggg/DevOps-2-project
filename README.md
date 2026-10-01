# Hackatec 2026

Aplicación web para la gestión de personal, asistencia, asignaciones, plantas, incidencias, códigos QR, GPS, reportes y notificaciones.

El proyecto está dividido en dos partes:

- Backend: API en Node.js + Express conectada a Supabase.
- Frontend: interfaz en React + Vite.

## Versiones

Las versiones usadas en el proyecto corresponden a los package.json de cada parte:

### Backend

- name: hackatech-backend
- version: 1.0.0

Dependencias:

- @supabase/supabase-js: ^2.106.1
- bcryptjs: ^2.4.3
- cors: ^2.8.5
- dotenv: ^17.4.2
- exceljs: ^4.4.0
- express: ^4.18.2
- jsonwebtoken: ^9.0.3
- multer: ^1.4.5-lts.1
- pg: ^8.21.0
- qrcode: ^1.5.3
- uuid: ^14.0.0
- xlsx: ^0.18.5

DevDependencies:

- eslint: ^10.4.0
- nodemon: ^3.0.1

### Frontend

- name: hackatec2026-frontend
- version: 1.0.0

Dependencias:

- @emailjs/browser: ^4.4.1
- leaflet: ^1.9.4
- qrcode: ^1.5.4
- react: ^19.2.6
- react-dom: ^19.2.6
- react-native-background-geolocation: ^5.1.1
- react-router-dom: ^7.9.4

DevDependencies:

- @eslint/js: ^10.0.1
- @types/react: ^19.2.14
- @types/react-dom: ^19.2.3
- @vitejs/plugin-react: ^6.0.1
- eslint: ^10.3.0
- eslint-plugin-react-hooks: ^7.1.1
- eslint-plugin-react-refresh: ^0.5.2
- globals: ^17.6.0
- vite: ^8.0.12

## Estructura del proyecto

- Hackatec2026-AppWebMovil-backend: servidor API.
- hackatec2026-frontend: interfaz de usuario.

## Requisitos

- Node.js instalado.
- npm instalado.
- Variables de entorno configuradas en el backend.

### Variables necesarias del backend

Crear un archivo .env dentro de Hackatec2026-AppWebMovil-backend con al menos:

- SUPABASE_URL
- SUPABASE_KEY
- JWT_SECRET
- PORT opcional, por defecto 3000

## Cómo arrancar el proyecto en local

### 1. Levantar el backend

Abrir una terminal en la carpeta Hackatec2026-AppWebMovil-backend e instalar dependencias:

```bash
npm install
```

Luego iniciar el servidor:

```bash
npm run dev
```

El backend queda disponible normalmente en http://localhost:3000.

### 2. Levantar el frontend

Abrir otra terminal en la carpeta hackatec2026-frontend e instalar dependencias:

```bash
npm install
```

Luego iniciar la aplicación:

```bash
npm run dev
```

El frontend queda disponible normalmente en http://localhost:64190.

## Comunicación entre frontend y backend

El frontend usa el prefijo /api y Vite lo redirige al backend local en http://localhost:3000.

## Funcionalidades principales

- Autenticación y sesión.
- Gestión de usuarios y empleados.
- Asignaciones y plantas.
- Asistencia de entrada y salida.
- Generación y uso de códigos QR.
- Registro de incidencias.
- GPS y validación de ubicación.
- Exportación e importación por Excel.
- Dashboard y reportes.
- Notificaciones por correo con EmailJS.

## Notas

- El backend usa Supabase como fuente de datos.
- El frontend consume la API mediante fetch con credenciales incluidas.
