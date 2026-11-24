# Sistema de Reservas de Espacios Universitarios

Aplicación web y móvil para consultar espacios universitarios (salas, laboratorios y salas de estudio), revisar su disponibilidad y gestionar reservas con autenticación, roles y reglas de negocio.

## Contenido

- [Descripción general](#descripción-general)
- [Requisitos previos](#requisitos-previos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración inicial](#configuración-inicial)
- [Ejecutar la aplicación web con Docker (recomendado)](#ejecutar-la-aplicación-web-con-docker-recomendado)
- [Ejecución local sin Docker (opcional)](#ejecución-local-sin-docker-opcional)
- [Ejecutar la aplicación móvil (Expo)](#ejecutar-la-aplicación-móvil-expo)
- [Credenciales y datos de prueba](#credenciales-y-datos-de-prueba)
- [URLs y servicios disponibles](#urls-y-servicios-disponibles)
- [Scripts disponibles](#scripts-disponibles)
- [Solución de problemas](#solución-de-problemas)
- [Arquitectura y modelos de datos](#arquitectura-y-modelos-de-datos)
- [API REST y servicios externos](#api-rest-y-servicios-externos)
- [Pruebas realizadas y limitaciones conocidas](#pruebas-realizadas-y-limitaciones-conocidas)
- [Uso de Inteligencia Artificial](#uso-de-inteligencia-artificial)

## Descripción general

Actualmente, la disponibilidad de espacios en la universidad es difícil de consultar y algunas soluciones existentes presentan problemas, como permitir más de una reserva a la misma hora en el mismo lugar.

Este proyecto permite ver qué espacios están libres, revisar sus detalles (capacidad y ubicación) y solicitar o cancelar una reserva desde distintos dispositivos.

Este **Hito 3** evoluciona el prototipo del Taller 2 hacia una plataforma Full Stack, incorporando backend propio, persistencia real en SQL/NoSQL y reglas de negocio robustas.

### Funcionalidades principales

- **Autenticación y roles:** registro, login y diferenciación de roles (Estudiante, Docente, Admin) mediante JWT.
- **Flujo completo de reservas:** creación de solicitudes, aprobación, rechazo y cancelación con validación de permisos.
- **Reglas de negocio:** validación de conflictos de horario (evita doble reserva) y bloqueo de reservas en días feriados.
- **Trazabilidad y auditoría:** historial inmutable de cambios de estado de las reservas almacenado en MongoDB.
- **Administración de infraestructura:** gestión de edificios y espacios por parte de usuarios administradores.

## Requisitos previos

### Para la aplicación web (Docker)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Docker Compose v2 (`docker compose`).
- Puertos disponibles en tu máquina: `3000` (backend), `5173` (frontend), `5432` (PostgreSQL) y `27017` (MongoDB).
  - Los puertos de PostgreSQL y MongoDB se pueden cambiar en `backend/.env` (`POSTGRES_PORT`, `MONGO_PORT`).

### Para ejecución local sin Docker (opcional)

- Node.js y npm (el entorno Docker usa Node 22; se recomienda una versión compatible).
- PostgreSQL y MongoDB accesibles localmente (o en otra instancia) con credenciales configuradas en `backend/.env`.

### Para la aplicación móvil

- Backend en ejecución (por ejemplo, con Docker desde la raíz del proyecto).
- Node.js y npm.
- [Expo CLI / entorno de Expo](https://docs.expo.dev/get-started/installation/) y un emulador Android (Android Studio) o dispositivo compatible.
- `adb` disponible si vas a usar el reenvío de puerto al emulador Android.

## Estructura del proyecto

- `backend/`: API REST (Node.js/Express), migraciones, seeds y conexión a PostgreSQL/MongoDB.
- `frontend/`: aplicación web (React + Vite).
- `mobile/`: aplicación móvil en React Native con Expo (consume la misma API).
- `frontend-movil/`: carpeta adicional de app móvil (Expo Router); la app móvil documentada para ejecución en este README es `mobile/`.
- `docs/`: diagramas, documentación y material de apoyo.
- `compose.yaml`: orquestación de PostgreSQL, MongoDB, backend y frontend para desarrollo.

> Todos los comandos de Docker de este README se deben ejecutar desde la **carpeta raíz del proyecto**: `Sistema-de-reservas-de-espacios-universitarios`.

## Configuración inicial

### 1. Crear el archivo de entorno del backend

Si aún no existe, crea `backend/.env` a partir del ejemplo:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Edita `backend/.env` y revisa al menos:

- `JWT_SECRET`: usa un valor secreto y aleatorio (no dejes el de ejemplo).
- Credenciales de base de datos: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_DB`.
- Puertos de BD si los necesitas cambiar: `POSTGRES_PORT`, `MONGO_PORT`.
- Correo (Resend): `RESEND_API_KEY` y `RESEND_TEST_EMAIL` (necesarios para envío de correos; sin una configuración válida los correos no se enviarán correctamente).

> ⚠️ No publiques ni compartas `backend/.env` (contiene secretos y credenciales).

### 2. Variables de entorno relevantes

| Variable | Uso |
|----------|-----|
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Firma y expiración de tokens JWT. |
| `POSTGRES_*`, `DATABASE_URL` | Configuración de PostgreSQL. En Docker, `compose.yaml` construye `DATABASE_URL` para el backend usando los hosts internos `postgres`/`mongo`. |
| `MONGO_*`, `MONGO_URI` | Configuración de MongoDB. |
| `RESEND_API_KEY`, `RESEND_TEST_EMAIL` | Envío de correos transaccionales (confirmación/cancelación) vía Resend. |
| `VITE_API_URL` | URL base de la API consumida por el frontend. En Docker se define en `compose.yaml` como `http://localhost:3000`; para desarrollo local puedes usar `frontend/.env` o `frontend/.env.example` como referencia. |
| `EXPO_PUBLIC_API_URL` (`mobile/.env`) | URL base de la API para la app móvil. |

### 3. Preparar volúmenes Docker (primera vez)

El `compose.yaml` usa volúmenes externos para persistir datos:

- `reservas_pgdata` (PostgreSQL)
- `reservas_mongodata` (MongoDB)

Si no existen en tu máquina, créalos una vez:

```powershell
docker volume create reservas_pgdata
docker volume create reservas_mongodata
```

Si vienes de contenedores independientes antiguos con los mismos nombres, detenlos para liberar puertos:

```powershell
docker stop reservas-postgres reservas-mongo
```

## Ejecutar la aplicación web con Docker (recomendado)

Este flujo levanta frontend, backend, PostgreSQL y MongoDB. El código se monta en volúmenes para facilitar el desarrollo (recarga automática según el servicio).

### 1. Levantar servicios

Desde la carpeta raíz del proyecto:

```powershell
docker compose --env-file backend/.env up -d --build
```

La primera ejecución puede tardar mientras se descargan imágenes y se instalan dependencias (`npm ci` dentro de los contenedores).

Para ver el estado y los logs:

```powershell
docker compose --env-file backend/.env ps
docker compose --env-file backend/.env logs -f
```

### 2. Crear tablas y datos de prueba

Con los servicios iniciados (el backend espera a que las bases de datos estén saludables), ejecuta la migración:

```powershell
docker compose --env-file backend/.env exec backend npm run migrate
```

Opcional: cargar datos y usuarios de prueba (seed):

```powershell
docker compose --env-file backend/.env exec backend npm run seed
```

### 3. Abrir la aplicación

- Frontend (web): <http://localhost:5173>
- API / health check: <http://localhost:3000/api/health>
- Documentación Swagger: <http://localhost:3000/api-docs>

### 4. Detener o reiniciar

Detener contenedores sin borrar datos:

```powershell
docker compose --env-file backend/.env down
```

Si cambias `backend/.env`, recrea los servicios para aplicar la configuración:

```powershell
docker compose --env-file backend/.env up -d --force-recreate
```

## Ejecución local sin Docker (opcional)

Útil si quieres ejecutar backend/frontend directamente con Node.js en tu máquina.

1. **Bases de datos:** inicia PostgreSQL y MongoDB localmente (o asegúrate de tener acceso a instancias equivalentes).
2. **Configura `backend/.env`:** usa hosts/puertos locales (por ejemplo `POSTGRES_HOST=localhost`, `MONGO_HOST=127.0.0.1`) y credenciales válidas. Puedes partir de `backend/.env.example`.
3. **Backend:**
   ```powershell
   cd backend
   npm install
   npm run migrate
   npm run seed   # opcional
   npm run dev
   ```
   El backend expone la API en `http://localhost:3000` (según `PORT` en `.env`).
4. **Frontend:**
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   La app web se sirve normalmente en `http://localhost:5173`. Asegúrate de que `VITE_API_URL` apunte al backend (por ejemplo `http://localhost:3000`).

> Nota: para correos y validaciones externas (Resend, feriados) se aplican las mismas consideraciones de configuración que en Docker.

## Ejecutar la aplicación móvil (Expo)

La app móvil se desarrolla por separado en React Native con Expo, en la carpeta `mobile/`. Consume la misma API del backend; no tiene base de datos ni backend propios.

1. **Inicia el backend** desde la raíz del proyecto (por ejemplo con Docker):
   ```powershell
   docker compose --env-file backend/.env up -d
   ```

2. **Configura y ejecuta la app móvil** desde `mobile/`:
   ```powershell
   cd mobile
   Copy-Item .env.example .env
   npm install
   ```

3. **Si usas un emulador Android**, reenvía el puerto del backend al emulador para que `http://127.0.0.1:3000` funcione desde la app:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
   ```
   Ajusta la ruta de `adb.exe` si tu instalación de Android SDK está en otra ubicación.

4. **Inicia Expo** y abre la app:
   ```powershell
   npm start
   ```
   Presiona `a` en la terminal de Expo para abrirla en Android.

### Notas de la app móvil

- `EXPO_PUBLIC_API_URL` en `mobile/.env` define la URL base de la API. Si la cambias, reinicia Expo.
- `mobile/.env.example` trae una IP de ejemplo para red local; para emulador Android con `adb reverse` suele usarse `http://127.0.0.1:3000`.
- Para probar con usuarios de desarrollo, ejecuta el seed del backend (`npm run seed`) y usa las credenciales indicadas más abajo.
- La sesión móvil se mantiene solo mientras la app está abierta.

## Credenciales y datos de prueba

Al ejecutar `npm run seed` en el backend se cargan datos de ejemplo (espacios, etc.) y la cuenta de administración de desarrollo:

| Usuario | Contraseña |
|---------|------------|
| `admin` | `admin123` |

> ⚠️ Credenciales solo para desarrollo local. No expongas esta cuenta en un despliegue real.

- El registro público crea cuentas de **estudiante** y no permite elegir roles.
- La cuenta **ADMIN** puede gestionar edificios/espacios y solicitudes de reserva.
- Las reservas requieren iniciar sesión o registrarse desde la aplicación.

## URLs y servicios disponibles

| Servicio | URL / acceso | Descripción |
|----------|---------------|-------------|
| Frontend web | <http://localhost:5173> | Interfaz web (Vite dev server en Docker o local) |
| Backend (API) | <http://localhost:3000> | API REST |
| Health check | <http://localhost:3000/api/health> | Verificación de estado del backend |
| Swagger UI | <http://localhost:3000/api-docs> | Documentación interactiva de la API |
| PostgreSQL | `localhost:5432` (por defecto) | Base de datos relacional (estado actual) |
| MongoDB | `localhost:27017` (por defecto) | Auditoría/historial de reservas |

## Scripts disponibles

### Backend (`backend/package.json`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Inicia el servidor con recarga (`node --watch index.js`) |
| Migraciones | `npm run migrate` | Crea/actualiza tablas en PostgreSQL |
| Seed | `npm run seed` | Carga datos y usuarios de prueba |
| Pruebas | `npm test` | Ejecuta pruebas (`node --test`) |

### Frontend web (`frontend/package.json`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Inicia Vite en modo desarrollo |
| Build | `npm run build` | Genera build de producción |
| Preview | `npm run preview` | Sirve el build generado |

### App móvil (`mobile/package.json`)

| Script | Comando | Descripción |
|--------|---------|-------------|
| Inicio | `npm start` | Inicia Expo |
| Android | `npm run android` | Abre en Android |
| iOS | `npm run ios` | Abre en iOS |
| Web | `npm run web` | Ejecuta versión web de Expo |

## Solución de problemas

- **Puertos ocupados (`3000`, `5173`, `5432`, `27017`):** detén los procesos/contenedores que los usen o cambia `POSTGRES_PORT`/`MONGO_PORT` en `backend/.env` y reinicia.
- **`reservas_pgdata` o `reservas_mongodata` no existen:** crea los volúmenes externos con `docker volume create ...` (ver [Configuración inicial](#3-preparar-volúmenes-docker-primera-vez)).
- **Cambios en `backend/.env` no se reflejan:** recrea contenedores con `docker compose --env-file backend/.env up -d --force-recreate`.
- **El backend no arranca o falla la conexión a BD:** revisa logs (`docker compose --env-file backend/.env logs -f backend postgres mongo`) y verifica credenciales en `backend/.env`.
- **Correos no se envían:** confirma `RESEND_API_KEY` y `RESEND_TEST_EMAIL` válidos para tu cuenta de Resend.
- **Feriados en modo respaldo:** si el proveedor externo no responde, el backend puede usar respaldo local (`fuente: "respaldo"`); revisa conectividad y vuelve a intentar más tarde.
- **La app móvil no conecta al backend:** verifica que el backend esté activo, que `EXPO_PUBLIC_API_URL` sea correcto y que el emulador/dispositivo tenga acceso a la red/puerto (en Android con emulador, usa `adb reverse` si corresponde).

## Arquitectura y modelos de datos

### Diagramas

- **Arquitectura de componentes:** [Ver imagen](docs/arquitectura.svg) *(fuente: `docs/arquitectura.puml`)*
- **Flujo de creación de reserva:** [Ver imagen](docs/flujo-reserva.svg) *(fuente: `docs/flujo-reserva.puml`)*
- **Modelo entidad-relación (SQL):** [Ver imagen](docs/modelo-er.svg) *(fuente: `docs/modelo-er.puml`)*
- **Mapa de navegación (vistas y roles):** [Ver diagrama](docs/mapa-navegacion.md)

### Justificación del modelo NoSQL (MongoDB)

Se utiliza MongoDB exclusivamente para la colección `eventos_reserva` (auditoría y trazabilidad).

**¿Por qué no es duplicación de SQL?**
PostgreSQL mantiene el **estado actual** transaccional de la reserva (una fila que se actualiza). MongoDB mantiene el **historial inmutable** de cambios (modelo *append-only*). Un evento de "CREACIÓN" tiene metadatos distintos a uno de "RECHAZO". MongoDB permite esta variabilidad en un campo `metadata` flexible sin generar columnas `NULL` innecesarias en SQL, optimizando el rendimiento y cumpliendo con los requisitos de trazabilidad.

### Estados de interfaz del frontend

Las vistas muestran indicadores de carga mientras consultan datos, errores con opción para reintentar, y estados vacíos cuando no hay registros o los filtros no encuentran resultados. Las operaciones de reserva y administración presentan confirmaciones visuales al completarse; durante los cambios de administración se indica el progreso y se deshabilitan las acciones para evitar envíos repetidos.

## API REST y servicios externos

### Endpoints principales y Swagger

La API sigue principios RESTful con validación de payloads y códigos HTTP semánticos.

- **Documentación interactiva (Swagger/OpenAPI):** <http://localhost:3000/api-docs>

**Resumen de endpoints:**

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `POST` | `/api/auth/login` | Pública | Inicio de sesión |
| `GET` | `/api/espacios` | Pública | Listado de espacios |
| `POST` | `/api/reservas` | JWT | Crea una reserva; valida feriado y conflicto de horario |
| `GET` | `/api/reservas/:id/historial` | JWT | Consulta la auditoría en MongoDB |
| `GET` | `/api/feriados/{año}` | Pública | Calendario de feriados (mismo origen usado por el backend) |
| `PATCH` | `/api/reservas/:id/estado` | JWT + rol `ADMIN`/`DOCENTE` | Cambia el estado de una reserva |

> El listado completo y actualizado de endpoints, esquemas y pruebas interactivas está disponible en Swagger.

### APIs públicas integradas

#### 1. Feriados nacionales (Gov.cl)

- **Documentación oficial:** <https://apis.digital.gob.cl/fl/feriados>
- **Endpoint utilizado:** `GET https://apis.digital.gob.cl/fl/feriados/{año}`
- **Uso y justificación:** se integra en el **backend** (`utils/feriados.js`) para validar días hábiles de forma ineludible antes de persistir una reserva. Esto evita que el frontend pueda ser manipulado para reservar en días no laborales. Incluye caché en memoria y fallback local para resiliencia ante caídas del servicio gubernamental.
- **Exposición al frontend:** el frontend consume `GET /api/feriados/{año}` del backend (no consulta directamente al proveedor externo), compartiendo el mismo origen de datos que la validación de reservas. Si el proveedor externo no responde o entrega una lista vacía, el backend puede responder con `fuente: "respaldo"` y usar una lista local de feriados fijos (no incluye todos los feriados móviles).

#### 2. Resend

Integrada en el **backend** para enviar correos transaccionales de confirmación y cancelación con plantillas HTML.

## Pruebas realizadas y limitaciones conocidas

### Evidencia de pruebas

- **Flujo end-to-end:** Login → Consulta de espacios → Creación de reserva → Visualización en "Mis Reservas".
- **Regla de negocio (conflicto):** intentar reservar en un horario ya ocupado devuelve `409 Conflict`.
- **Regla de negocio (feriado):** intentar reservar un sábado o feriado nacional devuelve `400 Bad Request`.
- **Persistencia SQL:** los datos se mantienen tras reiniciar los contenedores.
- **Persistencia NoSQL:** el endpoint `/api/reservas/:id/historial` retorna correctamente los eventos de auditoría desde MongoDB.
- **Swagger:** ejecución exitosa de endpoints con token Bearer desde la interfaz web.
- **Manejo de errores:** el middleware global traduce errores crudos de PostgreSQL a mensajes seguros sin exponer trazas internas.

### Limitaciones conocidas

- El sistema asume que las fechas enviadas desde el frontend están en formato ISO 8601 (UTC).
- La API de feriados del gobierno puede presentar lentitud ocasional; el sistema la mitiga con caché en memoria, pero en casos extremos de caída prolongada podría requerir actualización manual del respaldo local.
- El dashboard de utilización es consultable solo por usuarios con rol `ADMIN`.

## Uso de Inteligencia Artificial

De acuerdo con las normativas del curso, se detalla el uso de herramientas de IA durante el desarrollo:

| Herramienta | Propósito | Prompt representativo | Resultado | Validación humana | Aprendizaje |
|-------------|-----------|-----------------------|-----------|-------------------|-------------|
| **Qwen / ChatGPT** | Generación de esquema SQL y migraciones | "Genera script SQL para PostgreSQL con tablas de usuarios, edificios, espacios, equipamiento y reservas, incluyendo enums y constraints CHECK" | Script `001_init.sql` con relaciones y restricciones. | Se ajustaron los nombres de columnas al estándar snake_case del equipo y se agregaron índices compuestos. | Comprensión de restricciones CHECK y la importancia de los índices compuestos para validar conflictos de horario. |
| **Qwen / ChatGPT** | Documentación Swagger (JSDoc) | "Genera bloques JSDoc para Swagger/OpenAPI para un endpoint POST de reservas con validación de token JWT" | Comentarios estandarizados en `routes/reservas.routes.js`. | Se verificó que los ejemplos JSON coincidan exactamente con los DTOs reales del backend. | Aprendimos a estructurar la documentación para que Swagger genere formularios de prueba automáticos y seguros. |
| **Qwen / ChatGPT** | Lógica de validación de feriados | "Crea una función en Node.js que valide si una fecha es feriado en Chile usando la API de digital.gob.cl, con caché y fallback" | Archivo `utils/feriados.js` con lógica de caché en memoria. | Se probó manualmente con fechas de 2026 y se simuló la caída de la API para verificar el fallback. | Importancia de no bloquear el sistema principal si una API pública externa falla (resiliencia). |
| **Qwen / ChatGPT** | Middleware global de errores | "Crea un middleware global de Express que traduzca errores de PostgreSQL a mensajes seguros sin exponer trazas internas" | Archivo `utils/errores.js` con clase `AppError` y manejo de códigos SQL. | Se probaron errores de duplicado, FK y JWT para verificar que los mensajes sean claros y no expongan la estructura de la BD. | Diferencia entre errores operacionales esperados y bugs de código, y cómo manejarlos sin exponer detalles internos. |
| **ChatGPT / Gemini** | Generación de DTOs y validaciones | "Crea un DTO en NestJS para validar la reserva de un espacio..." | Código base del DTO con class-validator. | Se ajustaron reglas de solapamiento de horario. | Manejo avanzado de decoradores de validación personalizados. |

## Integrantes

- Francisco Molinet Henríquez
- Maximiliano Parra Mauro
- Iván Mandiola González

## Licencia

Este proyecto se distribuye bajo los términos indicados en [LICENSE](LICENSE).
