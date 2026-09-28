import { useState } from "react";
import EspacioCard from "../components/EspacioCard";
import lupa from "../assets/lupa.png";
import espacios from "../data/espacios.json";

function coincideCapacidad(capacidad, filtro) {
  if (!filtro) return true;
  if (filtro === "Pequeña") return capacidad <= 15;
  if (filtro === "Mediana") return capacidad > 15 && capacidad <= 40;
  return capacidad > 40;
}

function EspaciosPage({ onReservar }) {
  const [busqueda, setBusqueda] = useState("");
  const [edificio, setEdificio] = useState("");
  const [tipo, setTipo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const filtrados = espacios.filter((espacio) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto = espacio.titulo.toLowerCase().includes(texto) || espacio.descripcion.toLowerCase().includes(texto) || espacio.tags.some((tag) => tag.toLowerCase().includes(texto));
    return coincideTexto && (!edificio || espacio.edificio === edificio) && (!tipo || espacio.tipo.toLowerCase() === tipo.toLowerCase()) && coincideCapacidad(espacio.capacidad, capacidad);
  });

  return <section><div className="mb-6"><h1 className="text-2xl font-bold text-black">Espacios Disponibles</h1><p className="text-black mt-1">Consulta y reserva salas, laboratorios y espacios universitarios.</p></div><div className="bg-white border border-gray-200 rounded-xl p-5 mb-6"><label className="relative block mb-4"><img src={lupa} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4" /><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} type="text" placeholder="Buscar por nombre, edificio o características..." className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 text-sm" /></label><div className="flex flex-wrap gap-3"><select value={edificio} onChange={(event) => setEdificio(event.target.value)} className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="">Todos los edificios</option>{["Edificio A", "Edificio B", "Edificio C", "Edificio D", "Edificio E", "Biblioteca"].map((opcion) => <option key={opcion}>{opcion}</option>)}</select><select value={tipo} onChange={(event) => setTipo(event.target.value)} className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="">Tipo de sala: Todas</option>{["Sala de clases", "Laboratorio", "Sala de estudio", "Sala de reunion"].map((opcion) => <option key={opcion}>{opcion}</option>)}</select><select value={capacidad} onChange={(event) => setCapacidad(event.target.value)} className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="">Capacidad: Todas</option>{["Pequeña", "Mediana", "Grande"].map((opcion) => <option key={opcion}>{opcion}</option>)}</select></div><p className="text-sm text-black mb-4 mt-4">{filtrados.length} de {espacios.length} espacios disponibles</p><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtrados.map((espacio) => <EspacioCard key={espacio.id} espacio={espacio} onReservar={onReservar} />)}</div></div></section>;
}

export default EspaciosPage;