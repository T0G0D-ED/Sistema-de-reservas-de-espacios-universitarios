# Aplicación móvil

La app móvil se desarrolla por separado en React Native con Expo. Consume la
misma API del backend; no tiene una base de datos ni un backend propios.

## Ejecutar en un emulador Android

1. Inicia el backend desde la raíz del proyecto:

   ```powershell
   docker compose --env-file backend/.env up -d
   ```

2. Desde esta carpeta, crea la configuración local de la API e instala las
   dependencias. Reenvía también el puerto de la API al emulador:

   ```powershell
   Copy-Item .env.example .env
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000
   npm install
   ```

3. Inicia Expo y abre la aplicación en el emulador Android:

   ```powershell
   npm start
   ```

   Presiona `a` en la terminal de Expo. El reenvío de ADB permite que la app acceda al
   backend publicado por Docker en el computador mediante
   `http://127.0.0.1:3000`.

El logo institucional aparece en la pantalla de inicio de sesión. El splash
personalizado también está configurado; para verlo durante la carga inicial,
abre una compilación nativa con `npx expo run:android`. Expo Go muestra su propia
pantalla de carga y no permite reemplazarla por el splash de esta app.

Al abrir la app se solicita iniciar sesión. Para probar en local, carga primero
los usuarios y los datos de espacios/equipamiento de desarrollo con
`docker compose --env-file backend/.env exec backend npm run seed`;
la cuenta de administrador es `admin` / `admin` y la de estudiante es
`estudiante@unab.cl` / `estudiante123`. La
sesión se mantiene solo mientras la app está abierta, por lo que al abrirla de
nuevo se debe iniciar sesión otra vez.

Después de iniciar sesión, el menú muestra las secciones permitidas para el rol:

- Estudiante: Salas, Edificios, Mis reservas e Historial.
- Docente: Salas, Edificios, Solicitudes, Historial y Utilización.
- Administrador: Salas, Edificios, Solicitudes, Administración e Historial.

En Edificios, toca una tarjeta para desplegar sus salas; los estados Libre y En
uso se distinguen con colores verde y ámbar.

Desde Salas se puede solicitar un bloque de una hora. En Solicitudes, docentes
y administradores pueden aprobar o rechazar solicitudes pendientes; el usuario
puede consultar o cancelar sus propias reservas. Administración permite
gestionar edificios y espacios, y consultar utilización.

Al seleccionar una fecha en el formulario de reserva, la app consulta los
intervalos ocupados de esa sala. Los horarios que se cruzan con reservas
pendientes o aprobadas aparecen tachados en rojo y no se pueden seleccionar.
Si falla la consulta, los horarios permanecen deshabilitados hasta reintentar;
el backend también valida los conflictos al crear la reserva.

La variable `EXPO_PUBLIC_API_URL` configura la URL base de la API. Si se cambia
el archivo `.env`, reinicia Expo para que tome la nueva configuración.

## Endpoints usados por la app móvil

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión. |
| `GET` | `/api/espacios` | Consultar salas, capacidad, ubicación y equipamiento. |
| `GET` | `/api/edificios` | Consultar edificios, salas y disponibilidad actual. |
| `GET` | `/api/reservas` | Consultar reservas propias; docentes y administradores consultan solicitudes. |
| `GET` | `/api/reservas/disponibilidad` | Consultar intervalos ocupados de una sala y fecha. |
| `POST` | `/api/reservas` | Solicitar una reserva. |
| `PATCH` | `/api/reservas/:id/estado` | Cancelar una reserva propia o gestionar solicitudes según el rol. |
| `GET` | `/api/reservas/:id/historial` | Consultar eventos de auditoría de la reserva. |
| `GET` | `/api/administracion/edificios` | Listar edificios para administración (ADMIN). |
| `POST` | `/api/administracion/edificios` | Crear un edificio (ADMIN). |
| `PUT` | `/api/administracion/edificios/:id` | Editar un edificio (ADMIN). |
| `PATCH` | `/api/administracion/edificios/:id/activo` | Activar o desactivar un edificio (ADMIN). |
| `GET` | `/api/administracion/espacios` | Listar espacios para administración (ADMIN). |
| `POST` | `/api/administracion/espacios` | Crear un espacio (ADMIN). |
| `PUT` | `/api/administracion/espacios/:id` | Editar un espacio (ADMIN). |
| `PATCH` | `/api/administracion/espacios/:id/disponible` | Activar o desactivar un espacio (ADMIN). |
| `GET` | `/api/dashboard/utilizacion` | Consultar utilización (ADMIN y DOCENTE). |

Todas estas operaciones usan la API del backend; la app móvil no se conecta
directamente a PostgreSQL ni MongoDB.

## Guion de demostración Hito 4

1. Inicia backend y app móvil siguiendo las instrucciones anteriores e inicia
   sesión con una cuenta de estudiante de desarrollo.
2. En **Salas**, muestra capacidad, ubicación y equipamiento. Elige una fecha
   futura y un horario libre, completa el motivo y envía la solicitud.
3. En **Mis reservas**, comprueba que la solicitud aparezca con estado
   **Pendiente**.
4. Abre la aplicación web con la misma cuenta y verifica que la reserva
   aparece allí. Luego cancélala desde el móvil y confirma el cambio de estado
   al volver a consultar desde la web.
5. Para mostrar una validación, intenta elegir un horario ocupado (permanece
   deshabilitado) o completa una fecha inválida; la app debe explicar el
   problema sin enviar la solicitud.
