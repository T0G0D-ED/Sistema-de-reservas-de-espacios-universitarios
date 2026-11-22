import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import UtilizacionScreen from "./UtilizacionScreen";
import {
  actualizarEdificio,
  actualizarEspacio,
  cambiarDisponibilidadEspacio,
  cambiarEstadoEdificio,
  crearEdificio,
  crearEspacio,
  listarEdificios,
  listarEspacios,
} from "../services/administracionService";

const edificioVacio = { nombre: "", codigo: "", ubicacion: "", descripcion: "" };
const espacioVacio = {
  nombre: "",
  tipo: "SALA",
  edificioId: "",
  capacidad: "30",
  ubicacion: "",
  descripcion: "",
};
const tipos = [
  ["SALA", "Sala"],
  ["LABORATORIO", "Laboratorio"],
  ["AUDITORIO", "Auditorio"],
  ["SALA_ESTUDIO", "Estudio"],
];

function Campo({ label, value, onChangeText, placeholder, keyboardType, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        value={value}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

function AdministracionScreen() {
  const [edificios, setEdificios] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modal, setModal] = useState(null);
  const [edificioForm, setEdificioForm] = useState(edificioVacio);
  const [espacioForm, setEspacioForm] = useState(espacioVacio);
  const [seccion, setSeccion] = useState("recursos");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [listaEdificios, listaEspacios] = await Promise.all([
        listarEdificios(),
        listarEspacios(),
      ]);
      setEdificios(listaEdificios);
      setEspacios(listaEspacios);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los datos de administración.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function abrirEdificio(edificio = null) {
    setError("");
    setMensaje("");
    setEdificioForm(
      edificio
        ? {
            nombre: edificio.nombre,
            codigo: edificio.codigo,
            ubicacion: edificio.ubicacion || "",
            descripcion: edificio.descripcion || "",
          }
        : edificioVacio,
    );
    setModal({ tipo: "edificio", id: edificio?.id || null });
  }

  function abrirEspacio(espacio = null) {
    setError("");
    setMensaje("");
    setEspacioForm(
      espacio
        ? {
            nombre: espacio.nombre,
            tipo: espacio.tipo,
            edificioId: String(espacio.edificio_id),
            capacidad: String(espacio.capacidad),
            ubicacion: espacio.ubicacion || "",
            descripcion: espacio.descripcion || "",
          }
        : espacioVacio,
    );
    setModal({ tipo: "espacio", id: espacio?.id || null });
  }

  async function guardar() {
    setError("");
    setMensaje("");
    setGuardando(true);
    try {
      if (modal.tipo === "edificio") {
        if (modal.id) await actualizarEdificio(modal.id, edificioForm);
        else await crearEdificio(edificioForm);
      } else {
        const datos = {
          ...espacioForm,
          edificioId: Number(espacioForm.edificioId),
          capacidad: Number(espacioForm.capacidad),
        };
        if (modal.id) await actualizarEspacio(modal.id, datos);
        else await crearEspacio(datos);
      }
      setModal(null);
      setMensaje("Cambios guardados correctamente.");
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarActivo(accion, texto) {
    setError("");
    setMensaje("");
    try {
      await accion();
      setMensaje(texto);
      await cargar();
    } catch (err) {
      setError(err.message || "No se pudo completar la operación.");
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Administración</Text>
      <Text style={styles.subtitle}>Gestiona recursos y consulta utilización.</Text>
      <View style={styles.tabs}>
        {[
          ["recursos", "Recursos"],
          ["utilizacion", "Utilización"],
        ].map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setSeccion(id)}
            style={[styles.tab, seccion === id && styles.activeTab]}
          >
            <Text style={[styles.tabText, seccion === id && styles.activeTabText]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {seccion === "utilizacion" ? (
        <UtilizacionScreen />
      ) : cargando && !edificios.length && !espacios.length ? (
        <ActivityIndicator size="large" color="#1746A2" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Edificios</Text>
            <Pressable onPress={() => abrirEdificio()} style={styles.addButton}>
              <Text style={styles.addText}>+ Agregar</Text>
            </Pressable>
          </View>
          {edificios.map((edificio) => (
            <View key={edificio.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {edificio.nombre} ({edificio.codigo})
              </Text>
              <Text style={styles.detail}>
                {edificio.ubicacion || "Sin ubicación"} · {edificio.total_espacios} espacios
              </Text>
              <Text style={edificio.activo ? styles.active : styles.inactive}>
                {edificio.activo ? "Activo" : "Inactivo"}
              </Text>
              <View style={styles.actions}>
                <Pressable onPress={() => abrirEdificio(edificio)} style={styles.secondary}>
                  <Text style={styles.secondaryText}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    cambiarActivo(
                      () => cambiarEstadoEdificio(edificio.id, !edificio.activo),
                      edificio.activo ? "Edificio desactivado." : "Edificio activado.",
                    )
                  }
                  style={styles.secondary}
                >
                  <Text style={styles.secondaryText}>
                    {edificio.activo ? "Desactivar" : "Activar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}

          <View style={[styles.sectionHeader, styles.spaceHeader]}>
            <Text style={styles.sectionTitle}>Espacios</Text>
            <Pressable
              disabled={!edificios.some((edificio) => edificio.activo)}
              onPress={() => abrirEspacio()}
              style={[
                styles.addButton,
                !edificios.some((edificio) => edificio.activo) && styles.disabled,
              ]}
            >
              <Text style={styles.addText}>+ Agregar</Text>
            </Pressable>
          </View>
          {espacios.map((espacio) => (
            <View key={espacio.id} style={styles.card}>
              <Text style={styles.cardTitle}>{espacio.nombre}</Text>
              <Text style={styles.detail}>
                {espacio.tipo.replace("_", " ")} · {espacio.edificio_nombre} · Capacidad {espacio.capacidad}
              </Text>
              <Text
                style={
                  espacio.disponible && espacio.edificio_activo
                    ? styles.active
                    : styles.inactive
                }
              >
                {espacio.disponible && espacio.edificio_activo
                  ? "Disponible"
                  : "No disponible"}
              </Text>
              <View style={styles.actions}>
                <Pressable onPress={() => abrirEspacio(espacio)} style={styles.secondary}>
                  <Text style={styles.secondaryText}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    cambiarActivo(
                      () => cambiarDisponibilidadEspacio(espacio.id, !espacio.disponible),
                      espacio.disponible ? "Espacio desactivado." : "Espacio activado.",
                    )
                  }
                  style={styles.secondary}
                >
                  <Text style={styles.secondaryText}>
                    {espacio.disponible ? "Desactivar" : "Activar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        onRequestClose={() => setModal(null)}
        visible={Boolean(modal)}
      >
        {modal ? (
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>
              {modal.tipo === "edificio"
                ? modal.id
                  ? "Editar edificio"
                  : "Agregar edificio"
                : modal.id
                  ? "Editar espacio"
                  : "Agregar espacio"}
            </Text>
            {modal.tipo === "edificio" ? (
              <>
                <Campo
                  label="Nombre"
                  value={edificioForm.nombre}
                  onChangeText={(nombre) => setEdificioForm({ ...edificioForm, nombre })}
                />
                <Campo
                  label="Código"
                  value={edificioForm.codigo}
                  onChangeText={(codigo) => setEdificioForm({ ...edificioForm, codigo })}
                />
                <Campo
                  label="Ubicación"
                  value={edificioForm.ubicacion}
                  onChangeText={(ubicacion) => setEdificioForm({ ...edificioForm, ubicacion })}
                />
                <Campo
                  label="Descripción"
                  value={edificioForm.descripcion}
                  onChangeText={(descripcion) => setEdificioForm({ ...edificioForm, descripcion })}
                  multiline
                />
              </>
            ) : (
              <>
                <Campo
                  label="Nombre"
                  value={espacioForm.nombre}
                  onChangeText={(nombre) => setEspacioForm({ ...espacioForm, nombre })}
                />
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeChoices}>
                  {tipos.map(([value, label]) => (
                    <Pressable
                      key={value}
                      onPress={() => setEspacioForm({ ...espacioForm, tipo: value })}
                      style={[
                        styles.typeChoice,
                        espacioForm.tipo === value && styles.typeChoiceSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeChoiceText,
                          espacioForm.tipo === value && styles.typeChoiceTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.label}>Edificio</Text>
                {edificios
                  .filter((edificio) => edificio.activo)
                  .map((edificio) => (
                    <Pressable
                      key={edificio.id}
                      onPress={() =>
                        setEspacioForm({ ...espacioForm, edificioId: String(edificio.id) })
                      }
                      style={[
                        styles.buildingChoice,
                        espacioForm.edificioId === String(edificio.id) &&
                          styles.buildingChoiceSelected,
                      ]}
                    >
                      <Text style={styles.secondaryText}>{edificio.nombre}</Text>
                    </Pressable>
                  ))}
                <Campo
                  label="Capacidad"
                  value={espacioForm.capacidad}
                  onChangeText={(capacidad) => setEspacioForm({ ...espacioForm, capacidad })}
                  keyboardType="numeric"
                />
                <Campo
                  label="Ubicación"
                  value={espacioForm.ubicacion}
                  onChangeText={(ubicacion) => setEspacioForm({ ...espacioForm, ubicacion })}
                />
                <Campo
                  label="Descripción"
                  value={espacioForm.descripcion}
                  onChangeText={(descripcion) => setEspacioForm({ ...espacioForm, descripcion })}
                  multiline
                />
              </>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              disabled={guardando}
              onPress={guardar}
              style={[styles.saveButton, guardando && styles.disabled]}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Guardar</Text>
              )}
            </Pressable>
            <Pressable
              disabled={guardando}
              onPress={() => setModal(null)}
              style={styles.cancelButton}
            >
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { color: "#14213D", fontSize: 26, fontWeight: "700", marginHorizontal: 18, marginTop: 18 },
  subtitle: { color: "#586579", fontSize: 14, marginHorizontal: 18, marginTop: 5 },
  tabs: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    margin: 18,
    padding: 4,
  },
  tab: { alignItems: "center", borderRadius: 7, flex: 1, padding: 10 },
  activeTab: { backgroundColor: "#1746A2" },
  tabText: { color: "#586579", fontWeight: "600" },
  activeTabText: { color: "#FFFFFF" },
  content: { padding: 18, paddingTop: 0, paddingBottom: 30 },
  loader: { marginTop: 40 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: "#14213D", fontSize: 18, fontWeight: "700" },
  spaceHeader: { marginTop: 20 },
  addButton: { backgroundColor: "#1746A2", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  addText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E1E7F0", borderRadius: 12, borderWidth: 1, marginBottom: 9, padding: 14 },
  cardTitle: { color: "#14213D", fontWeight: "700" },
  detail: { color: "#586579", fontSize: 13, marginTop: 5 },
  active: { color: "#16803C", fontSize: 12, fontWeight: "700", marginTop: 7 },
  inactive: { color: "#586579", fontSize: 12, fontWeight: "700", marginTop: 7 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  secondary: { alignItems: "center", borderColor: "#CBD4E2", borderRadius: 8, borderWidth: 1, flex: 1, padding: 9 },
  secondaryText: { color: "#40516D", fontSize: 13, fontWeight: "600", textAlign: "center" },
  modalContent: { padding: 20, paddingTop: 35, paddingBottom: 40 },
  modalTitle: { color: "#14213D", fontSize: 22, fontWeight: "700", marginBottom: 12 },
  field: { marginTop: 14 },
  label: { color: "#14213D", fontSize: 14, fontWeight: "600", marginTop: 14 },
  input: { borderColor: "#CBD4E2", borderRadius: 9, borderWidth: 1, color: "#14213D", marginTop: 6, minHeight: 46, paddingHorizontal: 11 },
  multiline: { minHeight: 84, paddingTop: 10, textAlignVertical: "top" },
  typeChoices: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 7 },
  typeChoice: { borderColor: "#CBD4E2", borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 },
  typeChoiceSelected: { backgroundColor: "#1746A2", borderColor: "#1746A2" },
  typeChoiceText: { color: "#40516D", fontSize: 12 },
  typeChoiceTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  buildingChoice: { borderColor: "#CBD4E2", borderRadius: 8, borderWidth: 1, marginTop: 7, padding: 11 },
  buildingChoiceSelected: { borderColor: "#1746A2", backgroundColor: "#EEF3FC" },
  saveButton: { alignItems: "center", backgroundColor: "#1746A2", borderRadius: 9, justifyContent: "center", marginTop: 20, minHeight: 48 },
  saveText: { color: "#FFFFFF", fontWeight: "700" },
  cancelButton: { alignItems: "center", borderColor: "#CBD4E2", borderRadius: 9, borderWidth: 1, marginTop: 9, padding: 12 },
  disabled: { opacity: 0.5 },
  error: { backgroundColor: "#FEF3F2", borderRadius: 8, color: "#B42318", marginTop: 12, padding: 10 },
  success: { backgroundColor: "#ECFDF3", borderRadius: 8, color: "#16803C", marginBottom: 12, padding: 10 },
});

export default AdministracionScreen;
