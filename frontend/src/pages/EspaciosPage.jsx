import { useState, useEffect } from "react";
import EspacioCard from "../components/EspacioCard";
import lupa from "../assets/lupa.png";
import { api } from "../services/api"; // ← Nuevo: importamos nuestro servicio

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
  
  // ← Nuevos estados para cumplir rubrica (carga, error, vacío)
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ← Nuevo: Cargar datos desde API al montar el componente
  useEffect(() => {
    const cargarEspacios = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get('/api/espacios');
        setEspacios(data);
      } catch (err) {
        console.error("Error al cargar espacios:", err);
        setError("No se pudieron cargar los espacios. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    cargarEspacios();
  }, []);

  // ← logica de filtros se mantiene igual (solo cambia la fuente de datos)
  const filtrados = espacios.filter((espacio) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto = 
      espacio.nombre.toLowerCase().includes(texto) || 
      espacio.descripcion?.toLowerCase().includes(texto) ||
      espacio.edificio_nombre?.toLowerCase().includes(texto);
    
    const coincideEdificio = !edificio || espacio.edificio_nombre === edificio;
    const coincideTipo = !tipo || espacio.tipo?.toLowerCase() === tipo.toLowerCase();
    const coincideCap = coincideCapacidad(espacio.capacidad, capacidad);
    
    return coincideTexto && coincideEdificio && coincideTipo && coincideCap;
  });

  // ← 1. Estado de CARGA (requerido por rubrica 4.1)
  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando espacios disponibles...</p>
        </div>
      </section>
    );
  }

  // ← 2. Estado de ERROR (requerido por rubrica 4.1)
  if (error) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <p className="text-red-600 font-medium mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  // ← 3. Estado de EXITO (interfaz normal)
  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Espacios Disponibles</h1>
        <p className="text-black mt-1">Consulta y reserva salas, laboratorios y espacios universitarios.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        {/* Buscador */}
        <label className="relative block mb-4">
          <img src={lupa} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4" />
          <input 
            value={busqueda} 
            onChange={(event) => setBusqueda(event.target.value)} 
            type="text" 
            placeholder="Buscar por nombre, edificio o características..." 
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 text-sm" 
          />
        </label>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <select 
            value={edificio} 
            onChange={(event) => setEdificio(event.target.value)} 
            className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="">Todos los edificios</option>
            {["Edificio A", "Edificio B", "Edificio C", "Edificio D", "Edificio E", "Biblioteca"].map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>

          <select 
            value={tipo} 
            onChange={(event) => setTipo(event.target.value)} 
            className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="">Tipo de sala: Todas</option>
            {["Sala de clases", "Laboratorio", "Sala de estudio", "Sala de reunion"].map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>

          <select 
            value={capacidad} 
            onChange={(event) => setCapacidad(event.target.value)} 
            className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="">Capacidad: Todas</option>
            {["Pequeña", "Mediana", "Grande"].map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>

        {/* Contador */}
        <p className="text-sm text-black mb-4 mt-4">
          {/* ← 4. Estado de VACÍO (requerido por rúbrica 4.1) */}
          {filtrados.length === 0 
            ? "No se encontraron espacios con esos filtros." 
            : `${filtrados.length} de ${espacios.length} espacios disponibles`
          }
        </p>

        {/* Grid de espacios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((espacio) => (
            <EspacioCard 
              key={espacio.id} 
              espacio={espacio} 
              onReservar={onReservar} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default EspaciosPage;