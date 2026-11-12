import express from "express";
import cors from "cors";  // Permite que el frontend hable con este backend
import "dotenv/config"; // Carga las variables del .env PORT, DATABASE_URL, JWT_SECRET
import { connectMongo } from './services/mongoService.js';
import { enviarCorreoConfirmacion, enviarCorreoCancelacion } from "./services/resendService.js";
import espaciosRoutes from "./routes/espacios.routes.js";
import edificiosRoutes from "./routes/edificios.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import administracionRoutes from "./routes/administracion.routes.js";
// Importar enrutador
import authRoutes from "./routes/auth.routes.js"; 
// Importar rutas de reservas
import reservasRoutes from "./routes/reservas.routes.js";

const app = express();

// Middlewares globales:
// cors() permite que el frontend pueda hacer peticiones a este servidor.
app.use(cors());
// express.json() lee el cuerpo JSON de las peticiones POST (como email y password) y lo guarda en req.body.
app.use(express.json());

// Conectar a MongoDB al iniciar
connectMongo(); // LLAMAR FUNCION

// Rutas existentes Resend
app.post("/api/enviar-correo", async (req, res) => {
  try {
    const { tipo, ...datos } = req.body;
    let resultado;

    if (tipo === "cancelacion") {
      resultado = await enviarCorreoCancelacion(datos);
    } else {
      resultado = await enviarCorreoConfirmacion(datos);
    }

    res.json(resultado);
  } catch (error) {
    console.error("Error al procesar el correo en el backend:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Rutas nuevas PostgreSQL
// 2. MONTAR EL PREFIJO DE RUTA 
// Se le dice a Express que todo lo que empiece con /api/auth, envialo a authRoutes
// Como dentro de authRoutes se define /login y /registro, express los une automaticamente
// formando las URLs completas /api/auth/login y /api/auth/registro.
app.use("/api/auth", authRoutes);

// Las peticiones a /api/espacios las maneja espaciosRoutes
app.use("/api/espacios", espaciosRoutes);

// Edificios disponibles para las vistas del frontend.
app.use("/api/edificios", edificiosRoutes);

// Las peticiones a /api/reservas las maneja reservasRoutes
// Todas las rutas dentro de este archivo están protegidas por authMiddleware
app.use("/api/reservas", reservasRoutes); 
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/administracion", administracionRoutes);

// Ruta de salud como endpoint para verificar desde el navegador si el backend esta respondiendo
app.get("/api/health", async (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

// Encendido del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger (pendiente): http://localhost:${PORT}/api-docs`);
});