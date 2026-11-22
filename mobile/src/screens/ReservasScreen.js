import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { actualizarEstadoReserva, listarReservas } from "../services/reservasService";

const estados = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  CANCELADA: "Cancelada",
};

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReservasScreen({ usuario }) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [accion, setAccion] = useState("");
  const [rechazoId, setRechazoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const esGestor = ["ADMIN", "DOCENTE"].includes(usuario.rol);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setReservas(await listarReservas());
    } catch (err) {
      setError(err.message || "No se pudieron cargar las reservas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function cambiarEstado(reserva, estado, motivo) {
    setAccion(String(reserva.id));
    setError("");
    try {
      await actualizarEstadoReserva(reserva.id, estado, motivo);
      setRechazoId(null);
      setMotivoRechazo("");
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudo actualizar la reserva.");
    } finally {
      setAccion("");
    }
  }

  if (cargando && reservas.length === 0) {
    return <ActivityIndicator size="large" color="#1746A2" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{esGestor ? "Solicitudes" : "Mis reservas"}</Text>
      <Text style={styles.subtitle}>
        {esGestor
          ? "Revisa las solicitudes y administra su estado."
          : "Consulta tus solicitudes y cancela las reservas activas."}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {cargando ? <ActivityIndicator color="#1746A2" style={styles.refreshing} /> : null}
      {!cargando && reservas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Aún no tienes solicitudes</Text>
          <Text style={styles.muted}>
            Las reservas que solicites aparecerán aquí.
          </Text>
        </View>
      ) : (
        reservas.map((reserva) => {
          const esPropietario =
            Number(reserva.usuario_id) === Number(usuario.id);
          const puedeCancelar =
            ["PENDIENTE", "APROBADA"].includes(reserva.estado) &&
            (usuario.rol === "ADMIN" || esPropietario);
          const puedeGestionar = esGestor && reserva.estado === "PENDIENTE";
          const estaActuando = accion === String(reserva.id);

          return (
            <View key={reserva.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.spaceType}>{reserva.espacio_tipo}</Text>
                <Text style={styles.badge}>
                  {estados[reserva.estado] || reserva.estado}
                </Text>
              </View>
              <Text style={styles.spaceName}>{reserva.espacio_nombre}</Text>
              <Text style={styles.building}>{reserva.edificio_nombre}</Text>
              <View style={styles.details}>
                <Text style={styles.detail}>
                  <Text style={styles.detailLabel}>Fecha: </Text>
                  {formatoFecha(reserva.fecha_inicio)}
                </Text>
                <Text style={styles.detail}>
                  <Text style={styles.detailLabel}>Hasta: </Text>
                  {formatoFecha(reserva.fecha_fin)}
                </Text>
                {esGestor ? (
                  <Text style={styles.detail}>
                    <Text style={styles.detailLabel}>Solicitante: </Text>
                    {reserva.usuario_nombre}
                  </Text>
                ) : null}
                <Text style={styles.detail}>
                  <Text style={styles.detailLabel}>Motivo: </Text>
                  {reserva.motivo}
                </Text>
                {reserva.motivo_rechazo ? (
                  <Text style={styles.detail}>
                    <Text style={styles.detailLabel}>Rechazo: </Text>
                    {reserva.motivo_rechazo}
                  </Text>
                ) : null}
              </View>
              {puedeGestionar ? (
                <View style={styles.actions}>
                  <Pressable
                    disabled={estaActuando}
                    onPress={() => cambiarEstado(reserva, "APROBADA")}
                    style={[styles.actionButton, styles.approve]}
                  >
                    <Text style={styles.actionText}>Aprobar</Text>
                  </Pressable>
                  <Pressable
                    disabled={estaActuando}
                    onPress={() => {
                      setRechazoId(rechazoId === reserva.id ? null : reserva.id);
                      setMotivoRechazo("");
                    }}
                    style={[styles.actionButton, styles.reject]}
                  >
                    <Text style={styles.rejectText}>Rechazar</Text>
                  </Pressable>
                </View>
              ) : null}
              {rechazoId === reserva.id ? (
                <View style={styles.rejectForm}>
                  <TextInput
                    accessibilityLabel="Motivo del rechazo"
                    onChangeText={setMotivoRechazo}
                    placeholder="Motivo del rechazo"
                    value={motivoRechazo}
                    style={styles.input}
                  />
                  <Pressable
                    disabled={!motivoRechazo.trim() || estaActuando}
                    onPress={() =>
                      cambiarEstado(reserva, "RECHAZADA", motivoRechazo.trim())
                    }
                    style={styles.reject}
                  >
                    <Text style={styles.rejectText}>Confirmar rechazo</Text>
                  </Pressable>
                </View>
              ) : null}
              {puedeCancelar ? (
                <Pressable
                  disabled={estaActuando}
                  onPress={() => cambiarEstado(reserva, "CANCELADA")}
                  style={styles.cancel}
                >
                  <Text style={styles.cancelText}>Cancelar reserva</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 30 },
  loader: { marginTop: 50 },
  refreshing: { marginVertical: 8 },
  title: { color: "#14213D", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#586579", fontSize: 15, marginBottom: 16, marginTop: 6 },
  error: {
    backgroundColor: "#FEF3F2",
    borderRadius: 9,
    color: "#B42318",
    marginBottom: 12,
    padding: 12,
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 24,
  },
  emptyTitle: { color: "#14213D", fontSize: 17, fontWeight: "700" },
  muted: { color: "#586579", marginTop: 6, textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 13,
    padding: 16,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  spaceType: { color: "#1746A2", fontSize: 12, fontWeight: "700" },
  badge: {
    backgroundColor: "#EEF3FC",
    borderRadius: 14,
    color: "#1746A2",
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  spaceName: { color: "#14213D", fontSize: 18, fontWeight: "700", marginTop: 10 },
  building: { color: "#586579", fontSize: 13, marginTop: 4 },
  details: { borderTopColor: "#EDF0F5", borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
  detail: { color: "#586579", fontSize: 13, lineHeight: 20, marginTop: 3 },
  detailLabel: { color: "#14213D", fontWeight: "600" },
  actions: { flexDirection: "row", gap: 9, marginTop: 12 },
  actionButton: { alignItems: "center", borderRadius: 9, flex: 1, padding: 11 },
  approve: { backgroundColor: "#16803C" },
  actionText: { color: "#FFFFFF", fontWeight: "600" },
  reject: {
    alignItems: "center",
    backgroundColor: "#FEF3F2",
    borderRadius: 9,
    justifyContent: "center",
    padding: 11,
  },
  rejectText: { color: "#B42318", fontWeight: "600" },
  rejectForm: { gap: 8, marginTop: 10 },
  input: {
    borderColor: "#CBD4E2",
    borderRadius: 9,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 11,
  },
  cancel: {
    alignItems: "center",
    backgroundColor: "#FEF3F2",
    borderColor: "#FECACA",
    borderRadius: 9,
    borderWidth: 1,
    marginTop: 12,
    padding: 11,
  },
  cancelText: { color: "#B42318", fontWeight: "600" },
});

export default ReservasScreen;
