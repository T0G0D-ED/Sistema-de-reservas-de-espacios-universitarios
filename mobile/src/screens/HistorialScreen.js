import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { obtenerHistorial } from "../services/historialService";
import { listarReservas } from "../services/reservasService";

const eventos = {
  CREADA: "Solicitud creada",
  APROBADA: "Solicitud aprobada",
  RECHAZADA: "Solicitud rechazada",
  CANCELADA: "Reserva cancelada",
};

function HistorialScreen() {
  const [reservas, setReservas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarReservas = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const resultado = await listarReservas();
      setReservas(resultado);
      setSeleccionada((actual) =>
        resultado.some((reserva) => String(reserva.id) === String(actual))
          ? actual
          : resultado.length
            ? String(resultado[0].id)
            : null,
      );
    } catch (err) {
      setError(err.message || "No se pudieron cargar las reservas.");
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  useEffect(() => {
    let vigente = true;
    if (!seleccionada) {
      setHistorial([]);
      setCargando(false);
      return () => {
        vigente = false;
      };
    }

    setCargando(true);
    setError("");
    obtenerHistorial(seleccionada)
      .then((resultado) => {
        if (vigente) setHistorial(resultado);
      })
      .catch((err) => {
        if (vigente) setError(err.message || "No se pudo cargar el historial.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [seleccionada]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Historial</Text>
      <Text style={styles.subtitle}>Eventos registrados para tus reservas.</Text>
      {error ? (
        <View style={styles.notice}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={cargarReservas} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : reservas.length === 0 && !cargando ? (
        <Text style={styles.empty}>No hay reservas para consultar.</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Selecciona una reserva</Text>
          {reservas.map((reserva) => (
            <Pressable
              key={reserva.id}
              onPress={() => setSeleccionada(String(reserva.id))}
              style={[
                styles.reserva,
                String(reserva.id) === String(seleccionada) && styles.selected,
              ]}
            >
              <Text style={styles.reservaText}>
                #{reserva.id} · {reserva.espacio_nombre}
              </Text>
              <Text style={styles.muted}>
                {new Date(reserva.fecha_inicio).toLocaleString("es-CL", {
                  timeZone: "UTC",
                })}
              </Text>
            </Pressable>
          ))}
          {cargando ? (
            <ActivityIndicator color="#1746A2" style={styles.loader} />
          ) : historial.length === 0 ? (
            <Text style={styles.empty}>
              Esta reserva todavía no tiene eventos de auditoría.
            </Text>
          ) : (
            <View style={styles.timeline}>
              {historial.map((evento) => (
                <View key={evento._id} style={styles.event}>
                  <Text style={styles.eventTitle}>
                    {eventos[evento.tipoEvento] || evento.tipoEvento}
                  </Text>
                  <Text style={styles.muted}>
                    {new Date(evento.fecha).toLocaleString("es-CL")}
                  </Text>
                  <Text style={styles.detail}>Actor: {evento.actorEmail}</Text>
                  {evento.metadata?.motivo ? (
                    <Text style={styles.detail}>
                      Motivo: {evento.metadata.motivo}
                    </Text>
                  ) : null}
                  {evento.metadata?.motivoRechazo ? (
                    <Text style={styles.detail}>
                      Rechazo: {evento.metadata.motivoRechazo}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 30 },
  title: { color: "#14213D", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#586579", fontSize: 15, marginBottom: 16, marginTop: 6 },
  sectionTitle: { color: "#14213D", fontWeight: "700", marginBottom: 8 },
  reserva: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 11,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  selected: { borderColor: "#1746A2", borderWidth: 2 },
  reservaText: { color: "#14213D", fontWeight: "600" },
  muted: { color: "#586579", fontSize: 13, marginTop: 5 },
  loader: { marginTop: 22 },
  timeline: { marginTop: 12 },
  event: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderLeftColor: "#1746A2",
    borderLeftWidth: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  eventTitle: { color: "#14213D", fontSize: 16, fontWeight: "700" },
  detail: { color: "#586579", fontSize: 13, marginTop: 7 },
  empty: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 12,
    borderWidth: 1,
    color: "#586579",
    marginTop: 12,
    padding: 18,
    textAlign: "center",
  },
  notice: { alignItems: "center", backgroundColor: "#FEF3F2", borderRadius: 10, padding: 14 },
  error: { color: "#B42318", textAlign: "center" },
  button: { backgroundColor: "#1746A2", borderRadius: 8, marginTop: 10, padding: 10 },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
});

export default HistorialScreen;
