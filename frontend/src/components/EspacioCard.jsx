import classroomIcon from "../assets/icons/classroom.svg";
import labIcon from "../assets/icons/lab.svg";
import studyIcon from "../assets/icons/study.svg";
import meetingIcon from "../assets/icons/meeting.svg";

const iconosPorTipo = {
  "Sala de clases": classroomIcon,
  Laboratorio: labIcon,
  "Sala de estudio": studyIcon,
  "Sala de reunion": meetingIcon,
};

function EspacioCard({ espacio, onReservar }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-xl/40 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-40 flex items-center justify-center" style={{ background: espacio.cover }}><span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/25 backdrop-blur text-white text-xs font-medium">{espacio.nombre}</span><span className="flex h-13 w-13 items-center justify-center rounded-xl bg-white/15"><img src={iconosPorTipo[espacio.tipo]} alt="" className="h-7 w-7 [filter:brightness(0)_invert(1)]" /></span></div>
      <div className="p-5 flex flex-col flex-1"><h3 className="text-lg font-semibold text-gray-900">{espacio.titulo}</h3><p className="text-sm text-blue-600 mb-2">{espacio.lugar}</p><p className="text-sm text-gray-600 mb-2">{espacio.descripcion}</p><p className="text-sm text-gray-600 mb-2">{espacio.aforo}</p><div className="flex flex-wrap gap-2 mb-4">{espacio.tags.map((tag) => <span key={tag} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">{tag}</span>)}</div><button type="button" onClick={() => onReservar(espacio)} className="mt-auto w-full py-2.5 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Solicitar reserva</button></div>
    </article>
  );
}

export default EspacioCard;