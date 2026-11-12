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
* **JavaScript:** Para simular datos, validar formularios y guardar reservas en `localStorage`.
* **Git / GitHub / Git Flow / VisualStudioCode:** Para trabajar en equipo, llevar el control de versiones y juntar el código.

## Instrucciones para ejecutar el proyecto

1. Descarga o clona este repositorio y asegúrate de tener [Node.js](https://nodejs.org/) instalado.
2. Abre **dos terminales** en la carpeta raíz del repositorio. El frontend y el backend deben ejecutarse al mismo tiempo.

### Terminal 1: frontend

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará la dirección local de la aplicación, normalmente `http://localhost:5173`.

### Terminal 2: backend

```bash
cd backend
npm install
node index.js
```

El backend quedará disponible normalmente en `http://localhost:3000`.

Para enviar correos de prueba con Resend, configura estas variables en `backend/.env` antes de iniciar el backend:

```env
RESEND_API_KEY=re_tu_clave_de_resend
RESEND_TEST_EMAIL=tu-correo-registrado-en-resend@example.com
```

`RESEND_TEST_EMAIL` debe ser el correo asociado a tu cuenta de Resend. Tanto las confirmaciones como las cancelaciones se enviarán a esa dirección, independientemente del correo ingresado al reservar. No compartas ni publiques la API key. Si cambias el archivo `.env`, reinicia el backend para que cargue la configuración nueva.
