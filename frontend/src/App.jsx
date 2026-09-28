import { useState } from "react";
import { espacios } from "./data/espacios.js";

const horariosDisponibles = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00"
];

function coincideCapacidad(capacidad, filtro) {
  if (!filtro) return true;
  if (filtro === "Pequeña") return capacidad <= 15;
  if (filtro === "Mediana") return capacidad > 15 && capacidad <= 40;
  return capacidad > 40;
}

function EspacioCard({ espacio, onReservar }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-xl/40 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-40 flex items-center justify-center" style={{ background: espacio.cover }}>
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/25 backdrop-blur text-white text-xs font-medium">{espacio.nombre}</span>
        <span className="text-5xl">{espacio.icon}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{espacio.titulo}</h3>
        <p className="text-sm text-blue-600 mb-2">{espacio.lugar}</p>
        <p className="text-sm text-gray-600 mb-2">{espacio.descripcion}</p>
        <p className="text-sm text-gray-600 mb-2">{espacio.aforo}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {espacio.tags.map((tag) => <span key={tag} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">{tag}</span>)}
        </div>
        <button type="button" onClick={() => onReservar(espacio)} className="mt-auto w-full py-2.5 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
          Solicitar reserva
        </button>
      </div>
    </article>
  );
}

function ReservaCard({ reserva, onCancelar }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="h-20 flex items-center justify-between px-5 text-white" style={{ background: reserva.espacioCover }}>
        <span className="text-3xl">{reserva.espacioIcon}</span>
        <span className="text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-medium">Activa</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-lg">{reserva.espacioTitulo}</h3>
        <p className="text-xs text-blue-600 font-medium mb-3">{reserva.espacioLugar}</p>
        <div className="space-y-1 text-sm text-gray-600 mb-4 flex-1">
          <p><strong>Fecha:</strong> {reserva.fecha}</p>
          <p><strong>Horario:</strong> {reserva.hora}</p>
          <p><strong>Solicitante:</strong> {reserva.nombre}</p>
          <p><strong>Motivo:</strong> {reserva.motivo}</p>
        </div>
        <button type="button" onClick={() => onCancelar(reserva.id)} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg border border-red-200 transition cursor-pointer">
          Cancelar reserva
        </button>
      </div>
    </article>
  );
}

function ReservaModal({ espacio, onClose, onConfirmar }) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [motivo, setMotivo] = useState("");
  const hoy = new Date().toISOString().split("T")[0];

  function enviar(event) {
    event.preventDefault();
    if (!hora) return;
    onConfirmar({ fecha, hora, nombre, correo, motivo });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar modal" onClick={onClose} className="absolute inset-0 bg-black/50 cursor-default" />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-600 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#263762] text-white rounded-t-xl">
          <h2 className="text-lg font-semibold">Reservar: {espacio.titulo}</h2>
          <button type="button" onClick={onClose} className="text-gray-300 hover:text-white text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        <form onSubmit={enviar} className="p-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Selecciona la fecha <span className="text-red-500">*</span>
            <input type="date" required min={hoy} value={fecha} onChange={(event) => { setFecha(event.target.value); setHora(""); }} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </label>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Selecciona un horario disponible <span className="text-red-500">*</span></p>
            {!fecha && <p className="text-sm text-gray-500 italic">Por favor, selecciona una fecha para ver los horarios disponibles.</p>}
            {fecha && <div className="grid grid-cols-3 gap-2">{horariosDisponibles.map((opcion) => <button key={opcion} type="button" onClick={() => setHora(opcion)} className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${hora === opcion ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"}`}>{opcion}</button>)}</div>}
          </div>
          <label className="block text-sm font-medium text-gray-700">Nombre del solicitante <span className="text-red-500">*</span>
            <input required value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej. Tu Nombre" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Correo institucional <span className="text-red-500">*</span>
            <input type="email" required value={correo} onChange={(event) => setCorreo(event.target.value)} placeholder="ejemplo@uandresbello.edu" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Motivo de la reserva <span className="text-red-500">*</span>
            <input required value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Ej. Estudio grupal / Taller" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </label>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="w-1/2 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancelar</button>
            <button type="submit" className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [vista, setVista] = useState("espacios");
  const [busqueda, setBusqueda] = useState("");
  const [edificio, setEdificio] = useState("");
  const [tipo, setTipo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [reservas, setReservas] = useState(() => JSON.parse(localStorage.getItem("reservasRealizadas") || "[]"));
  const [mensaje, setMensaje] = useState(null);

  const filtrados = espacios.filter((espacio) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto = espacio.titulo.toLowerCase().includes(texto) || espacio.descripcion.toLowerCase().includes(texto) || espacio.tags.some((tag) => tag.toLowerCase().includes(texto));
    return coincideTexto && (!edificio || espacio.edificio === edificio) && (!tipo || espacio.tipo.toLowerCase() === tipo.toLowerCase()) && coincideCapacidad(espacio.capacidad, capacidad);
  });

  function notificar(texto, tipoMensaje = "success") {
    setMensaje({ texto, tipo: tipoMensaje });
    window.setTimeout(() => setMensaje(null), 5000);
  }

  function confirmarReserva(datos) {
    const nuevaReserva = { id: Date.now(), espacioId: espacioSeleccionado.id, espacioTitulo: espacioSeleccionado.titulo, espacioLugar: espacioSeleccionado.lugar, espacioCover: espacioSeleccionado.cover, espacioIcon: espacioSeleccionado.icon, ...datos };
    const nuevasReservas = [...reservas, nuevaReserva];
    setReservas(nuevasReservas);
    localStorage.setItem("reservasRealizadas", JSON.stringify(nuevasReservas));
    setEspacioSeleccionado(null);
    setVista("reservas");
    notificar(`¡Reserva confirmada con éxito para ${nuevaReserva.espacioTitulo}!`);
  }

  function cancelarReserva(id) {
    const nuevasReservas = reservas.filter((reserva) => reserva.id !== id);
    setReservas(nuevasReservas);
    localStorage.setItem("reservasRealizadas", JSON.stringify(nuevasReservas));
    notificar("Reserva cancelada correctamente.", "info");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins'] text-gray-900">
      <header className="text-gray-600 bg-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between p-5">
          <a href="/" className="flex items-center text-gray-900 mb-4 md:mb-0">
            <img src="/assets/logo-unab.png" alt="Logo UNAB" className="w-35 h-15 p-2" />
            <span className="ml-3 text-xl text-[#263762] font-semibold md:border-l md:border-gray-400 md:pl-4">ReservaUNAB</span>
          </a>
          <nav className="flex items-center text-base md:pl-5 md:ml-5 gap-5">
            <button type="button" onClick={() => setVista("espacios")} className={vista === "espacios" ? "text-[#263762] font-semibold border-b-2 border-[#263762] pb-1" : "text-gray-500 hover:text-[#263762]"}>Espacios</button>
            <button type="button" onClick={() => setVista("reservas")} className={vista === "reservas" ? "text-[#263762] font-semibold border-b-2 border-[#263762] pb-1 flex items-center gap-1" : "text-gray-500 flex items-center gap-1"}>Mis reservas <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full font-bold">{reservas.length}</span></button>
          </nav>
          <a href="https://portal2.unab.cl/ingresar-al-portal" className="px-4 py-2 bg-[#263762] text-white rounded-full md:ml-auto font-light hover:bg-[#3B5597]">
            <img src="/assets/icono-login.png" alt="Login" className="inline-block w-6 h-6 mr-1" /> ACCESO INTRANET
          </a>
        </div>
      </header>

      <main className="container mx-auto px-5 py-8">
        {vista === "espacios" ? <section>
          <div className="mb-6"><h1 className="text-2xl font-bold text-black">Espacios Disponibles</h1><p className="text-black mt-1">Consulta y reserva salas, laboratorios y espacios universitarios.</p></div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <label className="relative block mb-4"><img src="/assets/lupa.png" alt="" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-4" /><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} type="text" placeholder="Buscar por nombre, edificio o características..." className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 text-sm" /></label>
            <div className="flex flex-wrap gap-3">
              <select value={edificio} onChange={(event) => setEdificio(event.target.value)} className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="">Todos los edificios</option>{["Edificio A", "Edificio B", "Edificio C", "Edificio D", "Edificio E", "Biblioteca"].map((opcion) => <option key={opcion}>{opcion}</option>)}</select>
              <select value={tipo} onChange={(event) => setTipo(event.target.value)} className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="">Tipo de sala: Todas</option>{["Sala de clases", "Laboratorio", "Sala de estudio", "Sala de reunion"].map((opcion) => <option key={opcion}>{opcion}</option>)}</select>
              <select value={capacidad} onChange={(event) => setCapacidad(event.target.value)} className="px-7 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="">Capacidad: Todas</option>{["Pequeña", "Mediana", "Grande"].map((opcion) => <option key={opcion}>{opcion}</option>)}</select>
            </div>
            <p className="text-sm text-black mb-4 mt-4">{filtrados.length} de {espacios.length} espacios disponibles</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filtrados.map((espacio) => <EspacioCard key={espacio.id} espacio={espacio} onReservar={setEspacioSeleccionado} />)}</div>
          </div>
        </section> : <section>
          <div className="mb-6"><h1 className="text-2xl font-bold text-[#263762]">Mis Reservas</h1><p className="text-gray-600 mt-1">Revisa el estado de tus solicitudes activas o cancela reservas registradas.</p></div>
          {reservas.length === 0 ? <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm"><span className="text-5xl block mb-3">📅</span><p className="text-gray-700 font-semibold text-lg">No tienes reservas registradas</p><p className="text-gray-500 text-sm mt-1">Selecciona un espacio disponible para realizar tu primera solicitud.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{reservas.map((reserva) => <ReservaCard key={reserva.id} reserva={reserva} onCancelar={cancelarReserva} />)}</div>}
        </section>}
      </main>

      {espacioSeleccionado && <ReservaModal espacio={espacioSeleccionado} onClose={() => setEspacioSeleccionado(null)} onConfirmar={confirmarReserva} />}
      {mensaje && <div role="alert" className={`fixed bottom-5 right-5 z-[60] max-w-sm p-4 rounded-lg text-sm shadow-md ${mensaje.tipo === "info" ? "bg-[#263762]/10 text-[#263762]" : "bg-green-50 text-green-700"}`}>{mensaje.texto}</div>}
    </div>
  );
}

export default App;