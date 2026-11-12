import classroomIcon from "../assets/icons/classroom.svg";
import labIcon from "../assets/icons/lab.svg";
import studyIcon from "../assets/icons/study.svg";
import meetingIcon from "../assets/icons/meeting.svg";

// Actualizado para coincidir con los ENUM de PostgreSQL
const iconosPorTipo = {
  "SALA": classroomIcon,
  "LABORATORIO": labIcon,
  "SALA_ESTUDIO": studyIcon,
  "AUDITORIO": meetingIcon,
};

const fondosPorEspacio = [
  "linear-gradient(135deg, #2563eb, #1e3a8a)",
  "linear-gradient(135deg, #0f766e, #134e4a)",
  "linear-gradient(135deg, #7e22ce, #4c1d95)",
  "linear-gradient(135deg, #c2410c, #7c2d12)",
  "linear-gradient(135deg, #be123c, #881337)",
  "linear-gradient(135deg, #0369a1, #0c4a6e)",
  "linear-gradient(135deg, #4d7c0f, #365314)",
  "linear-gradient(135deg, #4338ca, #312e81)",
];

function EspacioCard({ espacio, onReservar }) {
  const indiceFondo = Number(espacio.id) % fondosPorEspacio.length;
  const bgStyle = espacio.cover 
    ? { background: espacio.cover } 
    : { background: fondosPorEspacio[indiceFondo] };

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-xl/40 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-40 flex items-center justify-center" style={bgStyle}>
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/25 backdrop-blur text-white text-xs font-medium">
          {espacio.nombre}
        </span>
        <span className="flex h-13 w-13 items-center justify-center rounded-xl bg-white/15">
          <img 
            src={iconosPorTipo[espacio.tipo] || classroomIcon} 
            alt={espacio.tipo} 
            className="h-7 w-7 [filter:brightness(0)_invert(1)]" 
          />
        </span>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{espacio.nombre}</h3>
        <p className="text-sm text-blue-600 mb-2">{espacio.edificio_nombre}</p>
        <p className="text-sm text-gray-600 mb-2">{espacio.descripcion}</p>
        <p className="text-sm text-gray-600 mb-2 font-medium">Capacidad: {espacio.capacidad} personas</p>
        
        {/* Reemplazamos los tags por el tipo de espacio para evitar errores si no viene del JSON */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
            {espacio.tipo}
          </span>
        </div>

        <button 
          type="button" 
          onClick={() => onReservar(espacio)} 
          className="mt-auto w-full py-2.5 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
        >
          Solicitar reserva
        </button>
      </div>
    </article>
  );
}

export default EspacioCard;