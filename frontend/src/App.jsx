import { useState } from "react";
import Header from "./components/Header";
import ReservaModal from "./components/ReservaModal";
import Toast from "./components/Toast";
import EspaciosPage from "./pages/EspaciosPage";
import ReservasPage from "./pages/ReservasPage";
import { addReserva, getReservas, removeReserva } from "./services/reservasService";
import { enviarCorreoConfirmacion, enviarCorreoCancelacion } from "./services/resendCall";  

function App() {
  const [vista, setVista] = useState("espacios");
  const [reservas, setReservas] = useState(getReservas);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  function notificar(texto, tipo = "success") {
    setMensaje({ texto, tipo });
    window.setTimeout(() => setMensaje(null), 5000);
  }

  async function confirmarReserva(datos) {
    const nuevaReserva = addReserva({ ...datos, espacio: espacioSeleccionado });
    setReservas((reservasActuales) => [...reservasActuales, nuevaReserva]);
    setEspacioSeleccionado(null);
    setVista("reservas");
    notificar(`¡Reserva confirmada con éxito para ${nuevaReserva.espacioTitulo}!`);

    try {
      await enviarCorreoConfirmacion({
        espacioTitulo: nuevaReserva.espacioTitulo,
        fecha: nuevaReserva.fecha,
        hora: nuevaReserva.hora,
        correoDestino: nuevaReserva.correo,
        solicitante: nuevaReserva.nombre,
        motivo: nuevaReserva.motivo
      });
      notificar("Correo de confirmación enviado exitosamente.", "info");
    } catch (error){
      console.error("Error al enviar el correo de confirmación: ", error);
      notificar("Reserva guardada, pero no se pudo enviar el correo.", "warning");
    }
  }

  async function cancelarReserva(id) {
    const reservaACancelar = reservas.find((r) => r.id === id);
    const nuevasReservas = removeReserva(id);
    setReservas(nuevasReservas);
    notificar("Reserva cancelada exitosamente.", "info");

    if(reservaACancelar){
      try{await enviarCorreoCancelacion({
        espacioTitulo: reservaACancelar.espacioTitulo,
        fecha: reservaACancelar.fecha,
        hora: reservaACancelar.hora,
        correoDestino: reservaACancelar.correo,
        solicitante: reservaACancelar.nombre,
        motivo: reservaACancelar.motivo
      });
      notificar("Reserva cancelada exitosamente.", "info");
    } catch (error) {
      console.error("Error al enviar correo de cancelación:", error);
      notificar("Reserva cancelada, pero falló el envío de correo.", "warning");
    }

  }
}

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins'] text-gray-900">
      <Header vista={vista} onCambiarVista={setVista} totalReservas={reservas.length} />
      <main className="container mx-auto px-5 py-8">
        {vista === "espacios" ? <EspaciosPage onReservar={setEspacioSeleccionado} /> : <ReservasPage reservas={reservas} onCancelar={cancelarReserva} />}
      </main>
      {espacioSeleccionado && <ReservaModal espacio={espacioSeleccionado} onClose={() => setEspacioSeleccionado(null)} onConfirmar={confirmarReserva} />}
      {mensaje && <Toast mensaje={mensaje} />}
    </div>
  );
}

export default App;