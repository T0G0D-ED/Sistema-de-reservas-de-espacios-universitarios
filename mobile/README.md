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
los usuarios de desarrollo con `docker compose --env-file backend/.env exec backend npm run seed`;
la cuenta de administrador es `admin` / `admin`. La
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

La variable `EXPO_PUBLIC_API_URL` configura la URL base de la API. Si se cambia
el archivo `.env`, reinicia Expo para que tome la nueva configuración.
