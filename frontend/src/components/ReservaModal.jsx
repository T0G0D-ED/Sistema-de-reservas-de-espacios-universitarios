import { useState, useEffect } from "react";
import { getFeriados } from "../services/feriadosService";

const horariosDisponibles = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

function ReservaModal({ espacio, onClose, onConfirmar }) {
  const [formulario, setFormulario] = useState({
    fecha: "",
    hora: "",
    motivo: "",
  });
  const hoy = new Date().toISOString().split("T")[0];
  const [feriados, setFeriados] = useState([]);
  const [avisoFeriados, setAvisoFeriados] = useState("");
  const [errorFeriado, setErrorFeriado] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const anio = new Date().getFullYear();
    let activo = true;

    Promise.all([getFeriados(anio), getFeriados(anio + 1)])
      .then(([actual, siguiente]) => {
        if (!activo) return;

        setFeriados([...actual.feriados, ...siguiente.feriados]);
      })
      .catch(() => {
        if (!activo) return;

        setAvisoFeriados(
          "No se pudo cargar el calendario de feriados. El servidor validará la fecha al enviar la solicitud."
        );
      });

    return () => {
      activo = false;
    };
  }, []);

  function actualizar(campo, valor) {
    if (campo === "fecha") {
      const feriado = feriados.find((f) => f.fecha === valor);

      if (feriado) {
        setErrorFeriado(
          `El ${valor.split("-").reverse().join("/")} es feriado (${feriado.nombre}). Elige otra fecha.`
        );
        setFormulario((actual) => ({ ...actual, fecha: "", hora: "" }));
        return;
      }

      setErrorFeriado("");
    }

    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
      ...(campo === "fecha" ? { hora: "" } : {}),
    }));
  }

  async function enviar(event) {
    event.preventDefault();

    if (!formulario.hora) return;

    setError("");
    setEnviando(true);

    try {
      await onConfirmar(formulario);
    } catch (err) {
      setError(err.message || "No se pudo crear la solicitud de reserva.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-600 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-2 rounded-t-xl border-b border-gray-200 bg-[#263762] p-4 text-white sm:p-5">
          <h2 className="min-w-0 break-words text-base font-semibold sm:text-lg">
            Reservar: {espacio.nombre}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-2xl leading-none text-gray-300 hover:text-white"
          >
            &times;
          </button>
        </div>

        <form onSubmit={enviar} className="space-y-4 p-4 sm:p-5">
          <label className="block text-sm font-medium text-gray-700">
            Selecciona la fecha <span className="text-red-500">*</span>
            <input
              type="date"
              required
              min={hoy}
              value={formulario.fecha}
              onChange={(event) => actualizar("fecha", event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          {errorFeriado && (
            <p className="text-sm font-medium text-red-600">{errorFeriado}</p>
          )}

          {avisoFeriados && (
            <p role="status" className="text-sm text-amber-700">
              {avisoFeriados}
            </p>
          )}

          <div>
            <p className="mb-2 block text-sm font-medium text-gray-700">
              Selecciona un horario disponible{" "}
              <span className="text-red-500">*</span>
            </p>

            {!formulario.fecha && (
              <p className="text-sm italic text-gray-500">
                Por favor, selecciona una fecha para ver los horarios
                disponibles.
              </p>
            )}

            {formulario.fecha && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {horariosDisponibles.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => actualizar("hora", opcion)}
                    className={`whitespace-nowrap rounded-lg border px-2 py-2 text-[0.6875rem] font-semibold transition-colors sm:px-3 sm:text-xs ${
                      formulario.hora === opcion
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                    }`}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Motivo de la reserva <span className="text-red-500">*</span>
            <input
              required
              value={formulario.motivo}
              onChange={(event) => actualizar("motivo", event.target.value)}
              placeholder="Ej. Estudio grupal / Taller"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-3 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="min-h-11 w-1/2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="min-h-11 w-1/2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservaModal;