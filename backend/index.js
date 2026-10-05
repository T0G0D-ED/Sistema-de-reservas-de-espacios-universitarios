import express from "express";
import cors from "cors";
import "dotenv/config";
import { enviarCorreoConfirmacion, enviarCorreoCancelacion } from "./services/resendService.js";

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));