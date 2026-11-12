import { useState } from "react";

const formularioEdificioVacio = { nombre: "", codigo: "", ubicacion: "", descripcion: "" };
const formularioEspacioVacio = {
  nombre: "",
  tipo: "SALA",
  edificioId: "",
  capacidad: "30",
  ubicacion: "",
  descripcion: "",
};
const tiposEspacio = [
  ["SALA", "Sala"],
  ["LABORATORIO", "Laboratorio"],
  ["AUDITORIO", "Auditorio"],
  ["SALA_ESTUDIO", "Sala de estudio"],
];

function AdministracionPage({
  edificios,
  espacios,
  cargando,
  error,
  onReintentar,
  onCrearEdificio,
  onActualizarEdificio,
  onCambiarEstadoEdificio,
  onCrearEspacio,
  onActualizarEspacio,
  onCambiarDisponibilidad,
}) {
  const [edificioForm, setEdificioForm] = useState(formularioEdificioVacio);
  const [espacioForm, setEspacioForm] = useState(formularioEspacioVacio);
  const [edificioEditando, setEdificioEditando] = useState(null);
  const [espacioEditando, setEspacioEditando] = useState(null);
  const [errorAccion, setErrorAccion] = useState("");

  function iniciarEdicionEdificio(edificio) {
    setEdificioEditando(edificio.id);
    setEdificioForm({
      nombre: edificio.nombre,
      codigo: edificio.codigo,
      ubicacion: edificio.ubicacion || "",
      descripcion: edificio.descripcion || "",
    });
  }

  function iniciarEdicionEspacio(espacio) {
    setEspacioEditando(espacio.id);
    setEspacioForm({
      nombre: espacio.nombre,
      tipo: espacio.tipo,
      edificioId: String(espacio.edificio_id),
      capacidad: String(espacio.capacidad),
      ubicacion: espacio.ubicacion || "",
      descripcion: espacio.descripcion || "",
    });
  }

  async function guardarEdificio(event) {
    event.preventDefault();
    setErrorAccion("");
    try {
      if (edificioEditando) await onActualizarEdificio(edificioEditando, edificioForm);
      else await onCrearEdificio(edificioForm);
      setEdificioForm(formularioEdificioVacio);
      setEdificioEditando(null);
    } catch (err) {
      setErrorAccion(err.message || "No se pudo guardar el edificio.");
    }
  }

  async function guardarEspacio(event) {
    event.preventDefault();
    setErrorAccion("");
    const datos = {
      ...espacioForm,
      edificioId: Number(espacioForm.edificioId),
      capacidad: Number(espacioForm.capacidad),
    };
    try {
      if (espacioEditando) await onActualizarEspacio(espacioEditando, datos);
      else await onCrearEspacio(datos);
      setEspacioForm(formularioEspacioVacio);
      setEspacioEditando(null);
    } catch (err) {
      setErrorAccion(err.message || "No se pudo guardar el espacio.");
    }
  }

  async function ejecutarAccion(accion) {
    setErrorAccion("");
    try {
      await accion();
    } catch (err) {
      setErrorAccion(err.message || "No se pudo completar la operación.");
    }
  }

  if (cargando) {
    return <p role="status" className="py-16 text-center text-gray-600">Cargando administración...</p>;
  }

  if (error) {
    return (
      <section role="alert" className="py-10 text-center bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={onReintentar} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reintentar</button>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-[#263762]">Administración de edificios, salas y laboratorios</h1>
        <p className="mt-1 text-gray-600">Crea, edita y desactiva recursos. La desactivación conserva su historial de reservas.</p>
      </header>
      {errorAccion && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorAccion}</p>}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <form onSubmit={guardarEdificio} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#263762]">{edificioEditando ? "Editar edificio" : "Agregar edificio"}</h2>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
            <input required maxLength={100} value={edificioForm.nombre} onChange={(event) => setEdificioForm({ ...edificioForm, nombre: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Código
            <input required maxLength={20} value={edificioForm.codigo} onChange={(event) => setEdificioForm({ ...edificioForm, codigo: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Ubicación
            <input maxLength={200} value={edificioForm.ubicacion} onChange={(event) => setEdificioForm({ ...edificioForm, ubicacion: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
            <textarea value={edificioForm.descripcion} onChange={(event) => setEdificioForm({ ...edificioForm, descripcion: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" rows={2} />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-[#263762] px-4 py-2 font-medium text-white hover:bg-[#3B5597]">{edificioEditando ? "Guardar cambios" : "Crear edificio"}</button>
            {edificioEditando && <button type="button" onClick={() => { setEdificioEditando(null); setEdificioForm(formularioEdificioVacio); }} className="rounded-lg border border-gray-300 px-4 py-2">Cancelar</button>}
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#263762]">Edificios registrados</h2>
          {edificios.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600">No hay edificios registrados.</p>}
          {edificios.map((edificio) => (
            <article key={edificio.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <h3 className="font-semibold">{edificio.nombre} <span className="text-sm font-normal text-gray-500">({edificio.codigo})</span></h3>
                <p className="text-sm text-gray-600">{edificio.ubicacion || "Sin ubicación"} · {edificio.total_espacios} espacios</p>
                <p className={`text-xs font-semibold ${edificio.activo ? "text-green-700" : "text-gray-500"}`}>{edificio.activo ? "Activo" : "Inactivo"}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => iniciarEdicionEdificio(edificio)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">Editar</button>
                <button type="button" onClick={() => ejecutarAccion(() => onCambiarEstadoEdificio(edificio.id, !edificio.activo))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{edificio.activo ? "Desactivar" : "Activar"}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <form onSubmit={guardarEspacio} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#263762]">{espacioEditando ? "Editar sala o laboratorio" : "Agregar sala o laboratorio"}</h2>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
            <input required maxLength={100} value={espacioForm.nombre} onChange={(event) => setEspacioForm({ ...espacioForm, nombre: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Tipo
            <select value={espacioForm.tipo} onChange={(event) => setEspacioForm({ ...espacioForm, tipo: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              {tiposEspacio.map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Edificio
            <select required value={espacioForm.edificioId} onChange={(event) => setEspacioForm({ ...espacioForm, edificioId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">Selecciona un edificio</option>
              {edificios.filter((edificio) => edificio.activo).map((edificio) => <option key={edificio.id} value={edificio.id}>{edificio.nombre}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Capacidad
            <input required type="number" min="1" step="1" value={espacioForm.capacidad} onChange={(event) => setEspacioForm({ ...espacioForm, capacidad: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Ubicación
            <input maxLength={150} value={espacioForm.ubicacion} onChange={(event) => setEspacioForm({ ...espacioForm, ubicacion: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
            <textarea value={espacioForm.descripcion} onChange={(event) => setEspacioForm({ ...espacioForm, descripcion: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" rows={2} />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={!edificios.some((edificio) => edificio.activo)} className="rounded-lg bg-[#263762] px-4 py-2 font-medium text-white hover:bg-[#3B5597] disabled:opacity-50">{espacioEditando ? "Guardar cambios" : "Crear espacio"}</button>
            {espacioEditando && <button type="button" onClick={() => { setEspacioEditando(null); setEspacioForm(formularioEspacioVacio); }} className="rounded-lg border border-gray-300 px-4 py-2">Cancelar</button>}
          </div>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#263762]">Salas y laboratorios registrados</h2>
          {espacios.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600">No hay espacios registrados.</p>}
          {espacios.map((espacio) => (
            <article key={espacio.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <h3 className="font-semibold">{espacio.nombre}</h3>
                <p className="text-sm text-gray-600">{espacio.tipo.replace("_", " ")} · {espacio.edificio_nombre} · Capacidad {espacio.capacidad}</p>
                <p className={`text-xs font-semibold ${espacio.disponible && espacio.edificio_activo ? "text-green-700" : "text-gray-500"}`}>{espacio.disponible && espacio.edificio_activo ? "Disponible" : "No disponible"}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => iniciarEdicionEspacio(espacio)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">Editar</button>
                <button type="button" onClick={() => ejecutarAccion(() => onCambiarDisponibilidad(espacio.id, !espacio.disponible))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{espacio.disponible ? "Desactivar" : "Activar"}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default AdministracionPage;
