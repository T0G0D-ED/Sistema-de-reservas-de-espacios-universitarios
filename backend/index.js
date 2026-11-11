import express from "express";
import cors from "cors";
import "dotenv/config";
import { enviarCorreoConfirmacion, enviarCorreoCancelacion } from "./services/resendService.js";
// Nuevo: importar las rutas de espacios 
import espaciosRoutes from "./routes/espacios.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

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
// Se le dice a express que cualquier peticion que empiece con /api/espacios
// se maneje con el archivo de rutas de espacios
app.use("/api/espacios", espaciosRoutes);

// ruta de salud como endpoint para verificar desde el navegador si el backend esta respondiendo
app.get("/api/health", async (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

// Encendido del Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
