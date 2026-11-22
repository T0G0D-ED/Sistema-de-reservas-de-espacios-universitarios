import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const etiquetasTipo = {
  SALA: "Sala",
  LABORATORIO: "Laboratorio",
  SALA_ESTUDIO: "Sala de estudio",
  AUDITORIO: "Auditorio",
};

const fondosPorEspacio = [
  ["#2563eb", "#1e3a8a"],
  ["#0f766e", "#134e4a"],
  ["#7e22ce", "#4c1d95"],
  ["#c2410c", "#7c2d12"],
  ["#be123c", "#881337"],
  ["#0369a1", "#0c4a6e"],
  ["#4d7c0f", "#365314"],
  ["#4338ca", "#312e81"],
];

function IconoEspacio({ tipo }) {
  const estiloPath = {
    fill: "none",
    stroke: "#FFFFFF",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" {...estiloPath}>
      {tipo === "LABORATORIO" ? (
        <Path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.75 3h10.5A2 2 0 0 0 19 18l-5-9V3M8 15h8" />
      ) : tipo === "SALA_ESTUDIO" ? (
        <>
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" />
          <Path d="M8 7h8M8 11h6" />
        </>
      ) : tipo === "AUDITORIO" ? (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <Path d="M17 8h6M20 5v6" />
        </>
      ) : (
        <Path d="M3 4h18v12H3zM8 20h8M12 16v4M7 8h6M7 12h10" />
      )}
    </Svg>
  );
}

function TarjetaEspacio({ espacio, onReservar }) {
  const indiceFondo =
    (Number(espacio.id) || 0) % fondosPorEspacio.length;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={fondosPorEspacio[indiceFondo]}
        style={styles.cardHero}
      >
        <Text numberOfLines={1} style={styles.cardNameBadge}>
          {espacio.nombre}
        </Text>
        <View style={styles.cardIcon}>
          <IconoEspacio tipo={espacio.tipo} />
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <Text style={styles.cardType}>
          {etiquetasTipo[espacio.tipo] || espacio.tipo}
        </Text>
        <Text style={styles.cardDetail}>
          {espacio.edificio_nombre || "Edificio"}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDetail}>Capacidad: {espacio.capacidad}</Text>
          {espacio.ubicacion ? (
            <Text style={styles.cardDetail}>{espacio.ubicacion}</Text>
          ) : null}
        </View>
        <Pressable onPress={() => onReservar(espacio)} style={styles.button}>
          <Text style={styles.buttonText}>Solicitar reserva</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EspaciosScreen({ espacios, cargando, error, onReintentar, onReservar }) {
  if (cargando) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color="#1746A2" />
        <Text style={styles.stateText}>Cargando espacios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>No se pudo conectar</Text>
        <Text style={styles.stateText}>{error}</Text>
        <Pressable onPress={onReintentar} style={styles.button}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={espacios}
      keyExtractor={(espacio) => String(espacio.id)}
      renderItem={({ item }) => (
        <TarjetaEspacio espacio={item} onReservar={onReservar} />
      )}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Espacios</Text>
          <Text style={styles.subtitle}>
            {espacios.length} espacios disponibles
          </Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.stateText}>
          No hay espacios disponibles por ahora.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 28 },
  title: { color: "#14213D", fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#586579", fontSize: 15, marginBottom: 14, marginTop: 6 },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHero: {
    alignItems: "center",
    height: 112,
    justifyContent: "center",
  },
  cardNameBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 18,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    left: 12,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 5,
    position: "absolute",
    right: 12,
    textAlign: "center",
    top: 10,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    bottom: 12,
    height: 52,
    justifyContent: "center",
    position: "absolute",
    width: 52,
  },
  cardContent: { padding: 16 },
  cardType: { color: "#1746A2", fontSize: 12, fontWeight: "700" },
  cardDetail: { color: "#586579", fontSize: 14, marginTop: 5 },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 0,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1746A2",
    borderRadius: 9,
    marginTop: 14,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  state: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  stateTitle: { color: "#14213D", fontSize: 18, fontWeight: "700" },
  stateText: { color: "#586579", fontSize: 15, lineHeight: 22, marginTop: 12, textAlign: "center" },
});

export default EspaciosScreen;
