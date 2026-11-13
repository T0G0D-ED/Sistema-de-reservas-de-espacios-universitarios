# Sistema de Reservas de Espacios Universitarios

## Problemática

Actualmente, la disponibilidad de espacios en la universidad (salas, laboratorios, salas de estudio) es difícil de consultar, teniendo problemas con la versión web que actualmente se usa para este próposito, como hacer más de una reserva a la misma hora en el mismo lugar. Este proyecto es una interfaz web que soluciona esto, permitiendo a los usuarios ver qué espacios están libres, revisar sus detalles como la capacidad y su ubicación, y solicitar o cancelar una reserva de forma fácil desde cualquier dispositivo.

## Integrantes

* Francisco Molinet Henríquez
* Maximiliano Parra Mauro
* Iván Mandiola González

## Tecnologías utilizadas

* **React:** Para construir la interfaz y gestionar el estado de filtros, reservas y formularios.
* **Vite:** Para el servidor de desarrollo y la compilación del frontend.
* **Tailwind:** Para darle diseño, color y forma a la página mediante clases utilitarias.
* **Node.js y Express:** Para ejecutar la API del backend.
* **PostgreSQL:** Para los usuarios, espacios y reservas.
* **MongoDB:** Para la base de datos NoSQL del backend.
* **JWT:** Para la autenticación de usuarios.
* **Resend:** Para enviar correos de confirmación y cancelación.
* **Git / GitHub / Git Flow / VisualStudioCode:** Para trabajar en equipo, llevar el control de versiones y juntar el código.

## Arquitectura del frontend

El código de `frontend/src` se organiza por responsabilidad:

* `pages/`: composición de páginas y presentación de datos.
* `components/`: elementos de interfaz reutilizables.
* `hooks/`: estado y flujos de autenticación, espacios y reservas.
* `services/`: cliente HTTP y acceso a los endpoints de cada recurso.

Las vistas de salas, edificios, administración, solicitudes, historial y utilización consumen la API propia. El dashboard muestra reservas activas y horas reservadas de los últimos 30 días; su acceso está limitado a docentes y administradores.

## Instrucciones para ejecutar el proyecto

Se necesita [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Docker Compose. El Compose de desarrollo levanta el frontend, el backend, PostgreSQL y MongoDB. El código de frontend y backend se monta como volumen para permitir la recarga durante el desarrollo.

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

Usa las mismas credenciales durante ejecuciones posteriores. Los valores de arriba son solo ejemplos locales. Los puertos `POSTGRES_PORT` y `MONGO_PORT` son opcionales y usan `5432` y `27017` por defecto.

El Compose construye `DATABASE_URL` y `MONGO_URI` con los nombres internos de los servicios (`postgres` y `mongo`). No reemplaces esos hosts por `localhost` para la conexión interna entre contenedores.

Si vienes de los contenedores independientes creados anteriormente, detenlos para liberar los puertos. El Compose reutiliza sus volúmenes para conservar los datos:

```powershell
docker stop reservas-postgres reservas-mongo
```

Si aún no existen los volúmenes (por ejemplo, en una instalación nueva), créalos una vez:

```powershell
docker volume create reservas_pgdata
docker volume create reservas_mongodata
```

No publiques ni compartas `backend/.env`.

### 2. Iniciar los servicios

Desde la carpeta raíz del proyecto, ejecuta:

```powershell
docker compose --env-file backend/.env up -d
```

La primera vez puede tardar mientras descarga imágenes e instala dependencias. Puedes seguir el arranque con `docker compose --env-file backend/.env logs -f`.

### 3. Crear tablas y datos de prueba

Después de que el backend esté iniciado, ejecuta la migración para crear las tablas de PostgreSQL:

```powershell
docker compose --env-file backend/.env exec backend npm run migrate
```

Para cargar datos y usuarios de prueba (opcional):

```powershell
docker compose --env-file backend/.env exec backend npm run seed
```

El seed incluye nueve espacios de ejemplo y evita duplicarlos al ejecutarse nuevamente.

El seed también crea la cuenta de administración de desarrollo `admin` / `admin`. Inicia sesión usando el nombre de usuario. Esta contraseña pública es solo para desarrollo local: no expongas esa cuenta en un despliegue real. El registro público siempre crea cuentas de estudiante y no permite elegir roles.

La cuenta ADMIN puede crear, editar y desactivar edificios, salas y laboratorios desde **Administración**, además de gestionar las solicitudes de reserva. Las bajas son lógicas para conservar las reservas históricas.

Las reservas requieren una cuenta: puedes iniciar sesión o registrarte desde el frontend. Los espacios y las reservas se leen y guardan en PostgreSQL.

### 4. Acceder y detener los servicios

* Frontend: `http://localhost:5173`
* Backend y endpoint de salud: `http://localhost:3000/api/health`

Para detener los contenedores sin borrar los datos:

```powershell
docker compose --env-file backend/.env down
```

Los correos requieren una clave válida en `RESEND_API_KEY` y un `RESEND_TEST_EMAIL` asociado a tu cuenta. Tanto las confirmaciones como las cancelaciones se envían a esa dirección de prueba. Si cambias `backend/.env`, recrea los contenedores con `docker compose --env-file backend/.env up -d --force-recreate`.

## Pruebas automatizadas

Las pruebas de reglas de reserva usan el ejecutor incluido en Node.js y no necesitan conectarse a PostgreSQL, MongoDB ni a la API de feriados.

Desde la carpeta backend, ejecuta npm ci y luego npm test.
