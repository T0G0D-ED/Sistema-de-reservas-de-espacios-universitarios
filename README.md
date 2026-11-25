# Sistema de Reservas de Espacios Universitarios

## Problemática

Actualmente, la disponibilidad de espacios en la universidad (salas, laboratorios, salas de estudio) es difícil de consultar. La versión web que se usa hoy para este propósito presenta problemas, como permitir más de una reserva a la misma hora en el mismo lugar.

Este proyecto es una interfaz web que soluciona esto: permite ver qué espacios están libres, revisar sus detalles (capacidad y ubicación) y solicitar o cancelar una reserva de forma fácil desde cualquier dispositivo.

Este **Hito 3** evoluciona el prototipo del Taller 2 hacia una plataforma Full Stack, incorporando backend propio, persistencia real en SQL/NoSQL y reglas de negocio robustas.

### Continuidad y nuevas funcionalidades

Este Hito 3 conserva el catálogo de espacios del Taller 2, pero evoluciona la solución de un prototipo estático a una plataforma Full Stack. Las nuevas funcionalidades incorporadas son:

- **Autenticación y roles:** registro, login y diferenciación de roles (Estudiante, Docente, Admin) mediante JWT.
- **Flujo completo de reservas:** creación de solicitudes, aprobación, rechazo y cancelación con validación de permisos.
- **Reglas de negocio robustas:** validación de conflictos de horario (evita doble reserva) y bloqueo de reservas en días feriados.
- **Trazabilidad y auditoría:** historial inmutable de cambios de estado de las reservas almacenado en MongoDB.
- **Administración de infraestructura:** gestión (CRUD) de edificios y espacios por parte de usuarios administradores.

## Integrantes

- Francisco Molinet Henríquez
- Maximiliano Parra Mauro
- Iván Mandiola González

## Tecnologías y versiones utilizadas

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Axios |
| **Backend** | Node.js 20, Express 4, pg (PostgreSQL), Mongoose 8 (MongoDB) |
| **Seguridad** | bcryptjs, jsonwebtoken (JWT) |
| **Documentación** | swagger-jsdoc, swagger-ui-express |
| **Infraestructura** | Docker Compose, Git / GitHub |
| **APIs públicas** | Gov.cl (Feriados), Resend (Correos) |

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
| `PATCH` | `/api/reservas/:id/estado` | JWT + rol `ADMIN`/`DOCENTE` | Cambia el estado de una reserva |

### APIs públicas integradas

#### 1. Feriados nacionales (Gov.cl)

- **Documentación oficial:** <https://apis.digital.gob.cl/fl/feriados>
- **Endpoint utilizado:** `GET https://apis.digital.gob.cl/fl/feriados/{año}`
- **Uso y justificación:** se integra en el **backend** (`utils/feriados.js`) para validar días hábiles de forma ineludible antes de persistir una reserva. Esto evita que el frontend pueda ser manipulado para reservar en días no laborales. Incluye caché en memoria y fallback local para resiliencia ante caídas del servicio gubernamental.

#### 2. Resend

Integrada en el **backend** para enviar correos transaccionales de confirmación y cancelación con plantillas HTML.

---

## API de feriados

El backend consulta la API pública de feriados de Gobierno Digital de Chile mediante `GET https://apis.digital.gob.cl/fl/feriados/{año}`. De la respuesta utiliza la fecha (`fecha`) y el nombre (`nombre`) de cada feriado para impedir solicitudes en días festivos.

El frontend no consulta directamente al proveedor externo. Obtiene el calendario desde `GET /api/feriados/{año}` del propio backend; así se comparte el mismo origen de datos con la validación que se ejecuta al crear una reserva. La ruta es pública y también está descrita en Swagger, disponible en `http://localhost:3000/api-docs` al iniciar el backend.

Si el proveedor externo no responde o entrega una lista vacía, el backend informa `fuente: "respaldo"` y usa una lista local de feriados fijos. Ese respaldo no incluye todos los feriados móviles, por lo que la interfaz muestra un aviso y la lista no reemplaza la validación del calendario oficial cuando el proveedor vuelve a estar disponible.

## Instrucciones para ejecutar el proyecto

Se necesita [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Docker Compose. El Compose de desarrollo levanta el frontend, el backend, PostgreSQL y MongoDB. El código se monta como volumen para permitir la recarga durante el desarrollo.

### 1. Preparar las bases de datos

Si aún no tienes `backend/.env`, créalo desde el ejemplo:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

El Compose lee ese archivo. Además de `JWT_SECRET` y las variables de Resend, asegúrate de que tenga estas variables para inicializar las bases de datos:

```env
POSTGRES_PORT=5432
POSTGRES_USER=usuario_local
POSTGRES_PASSWORD=clave_local_postgres
POSTGRES_DB=reservas_db
MONGO_PORT=27017
MONGO_USER=usuario_mongo_local
MONGO_PASSWORD=clave_local_mongo
MONGO_DB=auditoria_db
```

> **Notas**
> - Usa las mismas credenciales durante ejecuciones posteriores. Los valores de arriba son solo ejemplos locales.
> - `POSTGRES_PORT` y `MONGO_PORT` son opcionales y usan `5432` y `27017` por defecto.
> - El Compose construye `DATABASE_URL` y `MONGO_URI` con los nombres internos de los servicios (`postgres` y `mongo`). **No** reemplaces esos hosts por `localhost` para la conexión interna entre contenedores.

Si vienes de los contenedores independientes creados anteriormente, detenlos para liberar los puertos. El Compose reutiliza sus volúmenes para conservar los datos:

```powershell
docker stop reservas-postgres reservas-mongo
```

Si aún no existen los volúmenes (por ejemplo, en una instalación nueva), créalos una vez:

```powershell
docker volume create reservas_pgdata
docker volume create reservas_mongodata
```

> ⚠️ No publiques ni compartas `backend/.env`.

### 2. Iniciar los servicios

Desde la carpeta raíz del proyecto, ejecuta:

```powershell
docker compose --env-file backend/.env up -d --build
```

La primera vez puede tardar mientras descarga imágenes e instala dependencias. Puedes seguir el arranque con:

```powershell
docker compose --env-file backend/.env logs -f
```

### 3. Crear tablas y datos de prueba

Después de que el backend esté iniciado, ejecuta la migración para crear las tablas de PostgreSQL:

```powershell
docker compose --env-file backend/.env exec backend npm run migrate
```

Para cargar datos y usuarios de prueba (opcional):

```powershell
docker compose --env-file backend/.env exec backend npm run seed
```

El seed incluye espacios y equipamiento de ejemplo, evita duplicarlos al ejecutarse nuevamente y crea la cuenta de administración de desarrollo:

| Usuario | Contraseña |
|---------|------------|
| `admin` | `admin` |

> ⚠️ Esta contraseña pública es solo para desarrollo local: no expongas esa cuenta en un despliegue real.

- El registro público siempre crea cuentas de **estudiante** y no permite elegir roles.
- La cuenta **ADMIN** puede crear, editar y desactivar edificios, salas y laboratorios desde Administración, además de gestionar las solicitudes de reserva. Las bajas son lógicas para conservar las reservas históricas.
- Las reservas requieren una cuenta: puedes iniciar sesión o registrarte desde el frontend. Los espacios y las reservas se leen y guardan en PostgreSQL.

### 4. Acceder y detener los servicios

| Servicio | URL |
|----------|-----|
| Frontend | <http://localhost:5173> |
| Backend y endpoint de salud | <http://localhost:3000/api/health> |
| Swagger UI | <http://localhost:3000/api-docs> |

Para detener los contenedores sin borrar los datos:

```powershell
docker compose --env-file backend/.env down
```

### Configuración de correos

Los correos requieren una clave válida en `RESEND_API_KEY` y un `RESEND_TEST_EMAIL` asociado a tu cuenta. Tanto las confirmaciones como las cancelaciones se envían a esa dirección de prueba.

Si cambias `backend/.env`, recrea los contenedores con:

```powershell
docker compose --env-file backend/.env up -d --force-recreate
```

---

## Pruebas realizadas y limitaciones conocidas

### Evidencia de pruebas

- **Flujo end-to-end:** Login → Consulta de espacios → Creación de reserva → Visualización en "Mis Reservas".
- **Aplicación móvil Hito 4:** el equipo comprobó el funcionamiento de la aplicación.
- **Regla de negocio (conflicto):** intentar reservar en un horario ya ocupado devuelve `409 Conflict`.
- **Regla de negocio (feriado):** intentar reservar un sábado o feriado nacional devuelve `400 Bad Request`.
- **Persistencia SQL:** los datos se mantienen tras reiniciar los contenedores.
- **Persistencia NoSQL:** el endpoint `/api/reservas/:id/historial` retorna correctamente los eventos de auditoría desde MongoDB.
- **Swagger:** ejecución exitosa de endpoints con token Bearer desde la interfaz web.
- **Manejo de errores:** el middleware global traduce errores crudos de PostgreSQL a mensajes seguros sin exponer trazas internas.

### Limitaciones conocidas

- El sistema asume que las fechas enviadas desde el frontend están en formato ISO 8601 (UTC).
- La API de feriados del gobierno puede presentar lentitud ocasional; el sistema la mitiga con caché en memoria, pero en casos extremos de caída prolongada podría requerir actualización manual del respaldo local.
- El dashboard de utilización es consultable por usuarios con rol `ADMIN` o `DOCENTE`.

---

## Uso de Inteligencia Artificial

De acuerdo con las normativas del curso, se detalla el uso de herramientas de IA durante el desarrollo:

| Herramienta | Propósito | Prompt representativo | Resultado | Validación humana | Aprendizaje |
|-------------|-----------|-----------------------|-----------|-------------------|-------------|
| **Qwen / ChatGPT** | Generación de esquema SQL y migraciones | "Genera script SQL para PostgreSQL con tablas de usuarios, edificios, espacios, equipamiento y reservas, incluyendo enums y constraints CHECK" | Script `001_init.sql` con relaciones y restricciones. | Se ajustaron los nombres de columnas al estándar snake_case del equipo y se agregaron índices compuestos. | Comprensión de restricciones CHECK y la importancia de los índices compuestos para validar conflictos de horario. |
| **Qwen / ChatGPT** | Documentación Swagger (JSDoc) | "Genera bloques JSDoc para Swagger/OpenAPI para un endpoint POST de reservas con validación de token JWT" | Comentarios estandarizados en `routes/reservas.routes.js`. | Se verificó que los ejemplos JSON coincidan exactamente con los DTOs reales del backend. | Aprendimos a estructurar la documentación para que Swagger genere formularios de prueba automáticos y seguros. |
| **Qwen / ChatGPT** | Lógica de validación de feriados | "Crea una función en Node.js que valide si una fecha es feriado en Chile usando la API de digital.gob.cl, con caché y fallback" | Archivo `utils/feriados.js` con lógica de caché en memoria. | Se probó manualmente con fechas de 2026 y se simuló la caída de la API para verificar el fallback. | Importancia de no bloquear el sistema principal si una API pública externa falla (resiliencia). |
| **Qwen / ChatGPT** | Middleware global de errores | "Crea un middleware global de Express que traduzca errores de PostgreSQL a mensajes seguros sin exponer trazas internas" | Archivo `utils/errores.js` con clase `AppError` y manejo de códigos SQL. | Se probaron errores de duplicado, FK y JWT para verificar que los mensajes sean claros y no expongan la estructura de la BD. | Diferencia entre errores operacionales esperados y bugs de código, y cómo manejarlos sin exponer detalles internos. |
| **ChatGPT / Gemini** | Generación de DTOs y validaciones | "Crea un DTO en NestJS para validar la reserva de un espacio..." | Código base del DTO con class-validator. | Se ajustaron reglas de solapamiento de horario. | Manejo avanzado de decoradores de validación personalizados. |
| **GitHub Copilot** | Revisión de rúbrica e implementación de mejoras para la app móvil del Hito 4 | "Revisar el Hito 4 y completar la consulta de equipamiento y los flujos/documentación móvil sin crear otro backend." | Consulta de equipamiento por la API compartida y visualización en React Native; ajustes de disponibilidad, validación de fechas y secciones plegables. | El equipo comprobó el funcionamiento de la aplicación móvil; se generó el bundle Android y se ejecutaron las pruebas del backend. | Uso de la API compartida para mantener los datos del cliente móvil alineados con el backend. |
