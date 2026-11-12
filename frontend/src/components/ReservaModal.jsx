import { useState, useEffect } from "react";
import { getFeriados } from "../services/feriadosService";

const horariosDisponibles = ["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"];

function ReservaModal({ espacio, onClose, onConfirmar }) {
  const [formulario, setFormulario] = useState({ fecha: "", hora: "", nombre: "", correo: "", motivo: "" });
  const hoy = new Date().toISOString().split("T")[0];
  const [feriados, setFeriados] = useState([]);
  const [errorFeriado, setErrorFeriado] = useState("");

  useEffect(() => {
    const anio = new Date().getFullYear();
    Promise.all([getFeriados(anio), getFeriados(anio + 1)]).then(([actual, siguiente]) =>
      setFeriados([...actual, ...siguiente])
    );
  }, []);

  function actualizar(campo, valor) {
    if (campo === "fecha") {
      const feriado = feriados.find((f) => f.fecha === valor);
      if (feriado) {
        setErrorFeriado(`El ${valor.split("-").reverse().join("/")} es feriado (${feriado.nombre}). Elige otra fecha.`);
        setFormulario((actual) => ({ ...actual, fecha: "", hora: "" }));
        return;
      }
      setErrorFeriado("");
    }
    setFormulario((actual) => ({ ...actual, [campo]: valor, ...(campo === "fecha" ? { hora: "" } : {}) }));
  }

  function enviar(event) {
    event.preventDefault();
    if (formulario.hora) onConfirmar(formulario);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="Cerrar modal" onClick={onClose} className="absolute inset-0 bg-black/50 cursor-default" /><div className="relative bg-white rounded-xl shadow-xl border border-gray-600 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"><div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#263762] text-white rounded-t-xl"><h2 className="text-lg font-semibold">Reservar: {espacio.titulo}</h2><button type="button" onClick={onClose} className="text-gray-300 hover:text-white text-2xl leading-none cursor-pointer">&times;</button></div><form onSubmit={enviar} className="p-5 space-y-4">
      <label className="block text-sm font-medium text-gray-700">Selecciona la fecha <span className="text-red-500">*</span><input type="date" required min={hoy} value={formulario.fecha} onChange={(event) => actualizar("fecha", event.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></label>{errorFeriado && <p className="text-sm text-red-600 font-medium">{errorFeriado}</p>}
      <div><p className="block text-sm font-medium text-gray-700 mb-2">Selecciona un horario disponible <span className="text-red-500">*</span></p>{!formulario.fecha && <p className="text-sm text-gray-500 italic">Por favor, selecciona una fecha para ver los horarios disponibles.</p>}{formulario.fecha && <div className="grid grid-cols-3 gap-2">{horariosDisponibles.map((opcion) => <button key={opcion} type="button" onClick={() => actualizar("hora", opcion)} className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${formulario.hora === opcion ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"}`}>{opcion}</button>)}</div>}</div>
      <label className="block text-sm font-medium text-gray-700">Nombre del solicitante <span className="text-red-500">*</span><input required value={formulario.nombre} onChange={(event) => actualizar("nombre", event.target.value)} placeholder="Ej. Tu Nombre" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></label>
      <label className="block text-sm font-medium text-gray-700">Correo institucional <span className="text-red-500">*</span><input type="email" required value={formulario.correo} onChange={(event) => actualizar("correo", event.target.value)} placeholder="ejemplo@uandresbello.edu" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></label>
      <label className="block text-sm font-medium text-gray-700">Motivo de la reserva <span className="text-red-500">*</span><input required value={formulario.motivo} onChange={(event) => actualizar("motivo", event.target.value)} placeholder="Ej. Estudio grupal / Taller" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></label>
      <div className="flex gap-3 pt-3"><button type="button" onClick={onClose} className="w-1/2 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancelar</button><button type="submit" className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer">Confirmar</button></div>
    </form></div></div>
  );
}

export default ReservaModal;