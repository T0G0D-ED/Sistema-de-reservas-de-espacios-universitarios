import express from "express";
import cors from "cors";
import "dotenv/config";
import { enviarCorreoConfirmacion } from "./services/resendService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/enviar-correo", async (req, res) => {
  try {
    const resultado = await enviarCorreoConfirmacion(req.body);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));