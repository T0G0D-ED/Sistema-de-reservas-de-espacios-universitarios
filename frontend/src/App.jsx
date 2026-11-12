import { useState } from "react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import AdministracionPage from "./pages/AdministracionPage";
import ReservaModal from "./components/ReservaModal";
import Toast from "./components/Toast";
import DashboardPage from "./pages/DashboardPage";
import EdificiosPage from "./pages/EdificiosPage";
import EspaciosPage from "./pages/EspaciosPage";
import HistorialPage from "./pages/HistorialPage";
import ReservasPage from "./pages/ReservasPage";
import { useAuth } from "./hooks/useAuth";
import { useAdministracion } from "./hooks/useAdministracion";
import { useDashboard } from "./hooks/useDashboard";
import { useEdificios } from "./hooks/useEdificios";
import { useEspacios } from "./hooks/useEspacios";
import { useHistorial } from "./hooks/useHistorial";
import { useReservas } from "./hooks/useReservas";

function App() {
  const [vista, setVista] = useState("espacios");
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const auth = useAuth();
  const esGestor = ["ADMIN", "DOCENTE"].includes(auth.sesion?.usuario.rol);
  const espacios = useEspacios();
  const edificios = useEdificios();
  const reservas = useReservas(auth.sesion);
  const historial = useHistorial(reservas.reservas, Boolean(auth.sesion?.token));
  const dashboard = useDashboard(esGestor && vista === "dashboard");
  const administracion = useAdministracion(auth.sesion?.usuario.rol === "ADMIN" && vista === "administracion");

  function notificar(texto, tipo = "success") {
    setMensaje({ texto, tipo });
    window.setTimeout(() => setMensaje(null), 5000);
  }

  function cambiarVista(nuevaVista) {
    if (["reservas", "historial", "dashboard", "administracion"].includes(nuevaVista) && !auth.sesion) {
      setVista(nuevaVista);
      auth.abrirAuth();
      return;
    }

    if (nuevaVista === "dashboard" && !esGestor) {
      notificar("No tienes permiso para consultar el dashboard.", "error");
      return;
    }
    if (nuevaVista === "administracion" && auth.sesion?.usuario.rol !== "ADMIN") {
      notificar("Solo un administrador puede gestionar edificios y espacios.", "error");
      return;
    }
    setVista(nuevaVista);
  }

  function solicitarReserva(espacio) {
    setEspacioSeleccionado(espacio);
    if (!auth.sesion) auth.abrirAuth();
  }

  async function confirmarReserva(datos) {
    const { reserva, correoEnviado } = await reservas.crear(espacioSeleccionado, datos);
    setEspacioSeleccionado(null);
    setVista("reservas");
    notificar(`Solicitud de reserva registrada. Estado: ${reserva.estado.toLowerCase()}.`);
    if (!correoEnviado) notificar("Solicitud registrada, pero no se pudo enviar el correo.", "warning");
  }

  async function cancelarReserva(id) {
    try {
      const { correoEnviado } = await reservas.cancelar(id);
      notificar(
        correoEnviado ? "Reserva cancelada exitosamente." : "Reserva cancelada, pero falló el envío de correo.",
        correoEnviado ? "info" : "warning"
      );
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      notificar(error.message || "No se pudo cancelar la reserva.", "error");
    }
  }

  async function cambiarEstadoReserva(id, nuevoEstado, motivoRechazo) {
    try {
      await reservas.cambiarEstado(id, nuevoEstado, motivoRechazo);
      notificar(nuevoEstado === "APROBADA" ? "Solicitud aprobada." : "Solicitud rechazada.", "info");
      return true;
    } catch (error) {
      console.error("Error al actualizar la solicitud:", error);
      notificar(error.message || "No se pudo actualizar la solicitud.", "error");
      return false;
    }
  }

  function cerrarSesion() {
    auth.cerrarSesion();
    setEspacioSeleccionado(null);
    setVista("espacios");
    notificar("Sesión cerrada.", "info");
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins'] text-gray-900">
      <Header
        vista={vista}
        onCambiarVista={cambiarVista}
        totalReservas={reservas.reservas.length}
        usuario={auth.sesion?.usuario}
        esGestor={esGestor}
        onAbrirSesion={auth.abrirAuth}
        onCerrarSesion={cerrarSesion}
      />
      <main className="container mx-auto px-5 py-8">
        {vista === "espacios" && (
          <EspaciosPage
            espacios={espacios.espacios}
            cargando={espacios.cargando}
            error={espacios.error}
            onReintentar={espacios.reintentar}
            onReservar={solicitarReserva}
          />
        )}
        {vista === "edificios" && (
          <EdificiosPage
            edificios={edificios.edificios}
            cargando={edificios.cargando}
            error={edificios.error}
            onReintentar={edificios.reintentar}
          />
        )}
        {vista === "administracion" && auth.sesion?.usuario.rol === "ADMIN" && (
          <AdministracionPage
            edificios={administracion.edificios}
            espacios={administracion.espacios}
            cargando={administracion.cargando}
            error={administracion.error}
            onReintentar={administracion.reintentar}
            onCrearEdificio={administracion.crearEdificio}
            onActualizarEdificio={administracion.actualizarEdificio}
            onCambiarEstadoEdificio={administracion.cambiarEstadoEdificio}
            onCrearEspacio={administracion.crearEspacio}
            onActualizarEspacio={administracion.actualizarEspacio}
            onCambiarDisponibilidad={administracion.cambiarDisponibilidad}
          />
        )}
        {vista === "reservas" && (
          <ReservasPage
            reservas={reservas.reservas}
            cargando={reservas.cargando}
            error={auth.sesion ? reservas.error : "Inicia sesión para consultar solicitudes."}
            esGestor={esGestor}
            nombreUsuario={auth.sesion?.usuario.nombre}
            usuarioId={auth.sesion?.usuario.id}
            rolUsuario={auth.sesion?.usuario.rol}
            onCancelar={cancelarReserva}
            onCambiarEstado={cambiarEstadoReserva}
            onReintentar={reservas.reintentar}
          />
        )}
        {vista === "historial" && (
          <HistorialPage
            reservas={reservas.reservas}
            reservaId={historial.reservaId}
            onSeleccionarReserva={historial.seleccionarReserva}
            eventos={historial.eventos}
            cargando={reservas.cargando || historial.cargando}
            error={auth.sesion ? reservas.error || historial.error : "Inicia sesión para consultar el historial."}
            onReintentar={historial.reintentar}
          />
        )}
        {vista === "dashboard" && esGestor && (
          <DashboardPage
            datos={dashboard.datos}
            cargando={dashboard.cargando}
            error={dashboard.error}
            onReintentar={dashboard.reintentar}
          />
        )}
      </main>
      {auth.authAbierta && (
        <AuthModal
          onClose={auth.cerrarAuth}
          onAuthenticated={auth.cerrarAuth}
          onLogin={auth.iniciarSesion}
          onRegister={auth.registrarUsuario}
        />
      )}
      {espacioSeleccionado && auth.sesion && (
        <ReservaModal
          espacio={espacioSeleccionado}
          onClose={() => setEspacioSeleccionado(null)}
          onConfirmar={confirmarReserva}
        />
      )}
      {mensaje && <Toast mensaje={mensaje} />}
    </div>
  );
}

export default App;
