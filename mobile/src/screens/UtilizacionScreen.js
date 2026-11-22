import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { obtenerUtilizacion } from "../services/dashboardService";

function UtilizacionScreen() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setDatos(await obtenerUtilizacion());
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos de utilización.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando && !datos) {
    return <ActivityIndicator size="large" color="#1746A2" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.message}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={cargar} style={styles.button}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Utilización</Text>
      <Text style={styles.subtitle}>
        Reservas pendientes o aprobadas durante los próximos {datos.periodoDias} días.
      </Text>
      <View style={styles.summary}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Espacios habilitados</Text>
          <Text style={styles.statValue}>{datos.resumen.espacios}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Reservas en el periodo</Text>
          <Text style={styles.statValue}>{datos.resumen.reservasActivas}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Horas reservadas</Text>
          <Text style={styles.statValue}>{datos.resumen.horasReservadas}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Por edificio</Text>
      {datos.porEdificio.length === 0 ? (
        <Text style={styles.empty}>No hay datos de utilización.</Text>
      ) : (
        datos.porEdificio.map((edificio) => (
          <View key={edificio.id} style={styles.card}>
            <Text style={styles.cardTitle}>{edificio.nombre}</Text>
            <Text style={styles.cardDetail}>
              {edificio.espacios} espacios · {edificio.reservasActivas} reservas
            </Text>
            <Text style={styles.cardDetail}>
              {edificio.horasReservadas} horas reservadas
            </Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Por espacio</Text>
      {datos.espacios.map((espacio) => (
        <View key={espacio.id} style={styles.card}>
          <Text style={styles.cardTitle}>{espacio.nombre}</Text>
          <Text style={styles.cardDetail}>
            {espacio.edificioNombre} · {espacio.reservasActivas} reservas
          </Text>
          <Text style={styles.cardDetail}>
            {espacio.horasReservadas} horas reservadas
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 30 },
  loader: { marginTop: 50 },
  title: { color: "#14213D", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#586579", fontSize: 15, marginBottom: 16, marginTop: 6 },
  summary: { gap: 9, marginBottom: 18 },
  stat: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  statLabel: { color: "#586579", fontSize: 13 },
  statValue: { color: "#1746A2", fontSize: 25, fontWeight: "700", marginTop: 3 },
  sectionTitle: { color: "#14213D", fontSize: 18, fontWeight: "700", marginBottom: 10, marginTop: 8 },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 9,
    padding: 14,
  },
  cardTitle: { color: "#14213D", fontWeight: "700" },
  cardDetail: { color: "#586579", fontSize: 13, marginTop: 5 },
  empty: { color: "#586579", marginBottom: 12 },
  message: { alignItems: "center", margin: 20, padding: 20 },
  error: { color: "#B42318", textAlign: "center" },
  button: { backgroundColor: "#1746A2", borderRadius: 8, marginTop: 12, padding: 11 },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
});

export default UtilizacionScreen;
