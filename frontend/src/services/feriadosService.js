import feriadosLocal from "../data/feriados.json";

const API_URL = "https://feriados.devschile.cl/api/holidays";

function aplanar(data) {
  return Object.values(data.feriados)
    .flat()
    .map((f) => ({
      fecha: `${data.year}-${String(f.mes).padStart(2, "0")}-${String(f.dia).padStart(2, "0")}`,
      nombre: f.descripcion,
    }));
}

export async function getFeriados(anio) {
  try {
    const response = await fetch(`${API_URL}/${anio}`);
    if (!response.ok) throw new Error("No fue posible consultar los feriados en línea");
    return aplanar(await response.json());
  } catch (error) {
    console.warn("Usando datos locales:", error.message);
    return feriadosLocal.year === anio ? aplanar(feriadosLocal) : [];
  }
}