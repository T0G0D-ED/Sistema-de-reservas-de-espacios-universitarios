import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { listarEdificios } from "../services/edificiosService";

function EdificiosScreen() {
  const [edificios, setEdificios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [edificioExpandido, setEdificioExpandido] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setEdificios(await listarEdificios());
    } catch (err) {
      setError(err.message || "No se pudieron cargar los edificios.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edificios</Text>
      <Text style={styles.subtitle}>Espacios y estado de uso por edificio.</Text>
      {cargando ? (
        <ActivityIndicator size="large" color="#1746A2" style={styles.state} />
      ) : error ? (
        <View style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={cargar} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : edificios.length === 0 ? (
        <Text style={styles.message}>No hay edificios registrados.</Text>
      ) : (
        edificios.map((edificio) => {
          const expandido = edificioExpandido === edificio.id;
          return (
            <Pressable
              key={edificio.id}
              accessibilityRole="button"
              accessibilityState={{ expanded: expandido }}
              onPress={() =>
                setEdificioExpandido(expandido ? null : edificio.id)
              }
              style={styles.card}
            >
              <View style={styles.row}>
                <Text style={styles.name}>{edificio.nombre}</Text>
                <View style={styles.cardActions}>
                  <Text style={styles.code}>{edificio.codigo}</Text>
                </View>
              </View>
              <Text style={styles.muted}>
                {edificio.ubicacion || "Ubicación no especificada"}
              </Text>
              <View style={styles.stats}>
                <Text style={[styles.stat, styles.statAvailable]}>
                  {edificio.espacios_libres} libres
                </Text>
                <Text style={[styles.stat, styles.statInUse]}>
                  {edificio.espacios_en_uso} en uso
                </Text>
                <Text style={[styles.stat, styles.statTotal]}>
                  {edificio.total_espacios} salas
                </Text>
                <View style={styles.expandIndicator}>
                  <View
                    style={[
                      styles.chevronArm,
                      expandido ? styles.chevronUpLeft : styles.chevronDownLeft,
                    ]}
                  />
                  <View
                    style={[
                      styles.chevronArm,
                      expandido ? styles.chevronUpRight : styles.chevronDownRight,
                    ]}
                  />
                </View>
              </View>
              {expandido ? (
                <View style={styles.spaces}>
                  {edificio.espacios.length === 0 ? (
                    <Text style={styles.emptySpaces}>
                      Este edificio no tiene salas registradas.
                    </Text>
                  ) : (
                    edificio.espacios.map((espacio) => {
                      const estado = espacio.en_uso
                        ? {
                            texto: "En uso",
                            estilo: styles.statusInUse,
                          }
                        : espacio.disponible
                          ? {
                              texto: "Libre",
                              estilo: styles.statusAvailable,
                            }
                          : {
                              texto: "No disponible",
                              estilo: styles.statusUnavailable,
                            };
                      return (
                        <View key={espacio.id} style={styles.spaceRow}>
                          <View style={styles.spaceInfo}>
                            <Text style={styles.spaceName}>
                              {espacio.nombre}
                            </Text>
                            <Text style={styles.muted}>
                              {espacio.tipo.replace("_", " ")} ·{" "}
                              {espacio.capacidad} personas
                            </Text>
                          </View>
                          <Text style={[styles.status, estado.estilo]}>
                            {estado.texto}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              ) : null}
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 30 },
  title: { color: "#14213D", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#586579", fontSize: 15, marginTop: 6, marginBottom: 18 },
  state: { marginTop: 45 },
  message: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 20,
  },
  error: { color: "#B42318", textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    paddingBottom: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  cardActions: { alignItems: "center" },
  name: { color: "#14213D", flex: 1, fontSize: 18, fontWeight: "700" },
  code: {
    backgroundColor: "#EEF3FC",
    borderRadius: 16,
    color: "#1746A2",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  muted: { color: "#586579", fontSize: 13, marginTop: 5 },
  stats: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  stat: {
    borderRadius: 14,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statAvailable: { backgroundColor: "#F0FDF4", color: "#166534" },
  statInUse: { backgroundColor: "#FFFBEB", color: "#92400E" },
  statTotal: { backgroundColor: "#F3F4F6", color: "#374151" },
  spaces: {
    borderTopColor: "#F3F4F6",
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 12,
  },
  emptySpaces: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    color: "#6B7280",
    fontSize: 13,
    padding: 14,
  },
  spaceRow: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  spaceInfo: { flex: 1 },
  spaceName: { color: "#14213D", fontWeight: "600" },
  status: {
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusAvailable: { backgroundColor: "#F0FDF4", color: "#166534" },
  statusInUse: { backgroundColor: "#FFFBEB", color: "#92400E" },
  statusUnavailable: { backgroundColor: "#F3F4F6", color: "#4B5563" },
  expandIndicator: {
    alignItems: "center",
    height: 18,
    justifyContent: "center",
    marginLeft: "auto",
    width: 44,
  },
  chevronArm: {
    backgroundColor: "#1746A2",
    borderRadius: 1,
    height: 2,
    position: "absolute",
    top: 8,
    width: 16,
  },
  chevronDownLeft: { left: 8, transform: [{ rotate: "45deg" }] },
  chevronDownRight: { right: 8, transform: [{ rotate: "-45deg" }] },
  chevronUpLeft: { left: 8, transform: [{ rotate: "-45deg" }] },
  chevronUpRight: { right: 8, transform: [{ rotate: "45deg" }] },
  button: {
    backgroundColor: "#1746A2",
    borderRadius: 9,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
});

export default EdificiosScreen;
