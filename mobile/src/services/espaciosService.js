import { get } from "./api";

export async function listarEspacios() {
  const data = await get("/api/espacios");

  if (!Array.isArray(data)) {
    throw new Error("La API devolvió una respuesta de espacios no válida.");
  }

  return data;
}
