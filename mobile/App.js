import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import EspaciosScreen from "./src/screens/EspaciosScreen";
import EdificiosScreen from "./src/screens/EdificiosScreen";
import ReservasScreen from "./src/screens/ReservasScreen";
import ReservaFormScreen from "./src/screens/ReservaFormScreen";
import HistorialScreen from "./src/screens/HistorialScreen";
import UtilizacionScreen from "./src/screens/UtilizacionScreen";
import AdministracionScreen from "./src/screens/AdministracionScreen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { listarEspacios } from "./src/services/espaciosService";
import { crearReserva } from "./src/services/reservasService";

function MainApp() {
  // 1. Se enchufa al AuthContext en lugar de manejar estados de sesion locales
  const {
    usuario,
    cargandoAuth,
    iniciandoSesion,
    errorSesion,
    autenticar,
    cerrarSesion,
  } = useAuth();

  const [espacios, setEspacios] = useState([]);
  const [cargandoEspacios, setCargandoEspacios] = useState(false);
  const [errorEspacios, setErrorEspacios] = useState("");
  const [vista, setVista] = useState("espacios");
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [mostrarFlechaMenu, setMostrarFlechaMenu] = useState(false);
  const [mostrarFlechaIzquierdaMenu, setMostrarFlechaIzquierdaMenu] =
    useState(false);
  const menuRef = useRef(null);
  const menuMedidas = useRef({ ancho: 0, contenido: 0, desplazamiento: 0 });

  const manejarLogin = useCallback(
    async (credenciales) => {
      const ok = await autenticar(credenciales);
      if (ok) {
        setVista("espacios");
      }
    },
    [autenticar]
  );

  const cargarEspacios = useCallback(async () => {
    setCargandoEspacios(true);
    setErrorEspacios("");
    try {
      setEspacios(await listarEspacios());
    } catch (err) {
      setErrorEspacios(err.message || "No se pudieron cargar los espacios.");
    } finally {
      setCargandoEspacios(false);
    }
  }, []);

  useEffect(() => {
    if (usuario && vista === "espacios" && !espacioSeleccionado) {
      cargarEspacios();
    }
  }, [usuario, vista, espacioSeleccionado, cargarEspacios]);

  // 2. Limpia las listas en pantalla automáticamente cuando se cierra sesión o expira el token (401)
  useEffect(() => {
    if (!usuario) {
      setEspacios([]);
      setErrorEspacios("");
      setEspacioSeleccionado(null);
      setVista("espacios");
    }
  }, [usuario]);

  function actualizarFlechasMenu(desplazamiento, ancho, contenido) {
    setMostrarFlechaIzquierdaMenu(desplazamiento > 1);
    setMostrarFlechaMenu(desplazamiento + ancho < contenido - 1);
  }

  // 3. Telon de carga mientras AsyncStorage verifica si habia una sesion abierta
  if (cargandoAuth) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F6FB" />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1746A2" />
          <Text style={styles.loadingText}>Verificando sesión...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 4. Ruta protegida: si no hay sesion activa, bloquea el acceso y muestra Login
  if (!usuario) {
    return (
      <LoginScreen
        onIniciarSesion={manejarLogin}
        cargando={iniciandoSesion}
        error={errorSesion}
      />
    );
  }

  const esGestor = ["ADMIN", "DOCENTE"].includes(usuario.rol);
  const opcionesMenu = [
    { id: "espacios", etiqueta: "Salas" },
    { id: "edificios", etiqueta: "Edificios" },
    { id: "reservas", etiqueta: esGestor ? "Solicitudes" : "Mis reservas" },
    ...(usuario.rol === "ADMIN"
      ? [{ id: "administracion", etiqueta: "Administración" }]
      : []),
    { id: "historial", etiqueta: "Historial" },
    ...(esGestor && usuario.rol !== "ADMIN"
      ? [{ id: "utilizacion", etiqueta: "Utilización" }]
      : []),
  ];

  async function confirmarReserva(datos) {
    await crearReserva(datos);
    setEspacioSeleccionado(null);
    setVista("reservas");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FB" />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="Universidad Andrés Bello"
              accessible
              resizeMode="contain"
              source={require("./assets/logo-unab.png")}
              style={styles.logo}
            />
            <View style={styles.brandLabel}>
              <Text style={styles.brandTitle}>ReservaUNAB</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={cerrarSesion}
            style={({ pressed }) => [
              styles.logout,
              pressed && styles.logoutPressed,
            ]}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </View>
        <Text style={styles.greeting}>Hola, {usuario.nombre}</Text>
      </View>

      <View style={styles.menuContainer}>
        <ScrollView
          ref={menuRef}
          horizontal
          onLayout={({ nativeEvent }) => {
            menuMedidas.current.ancho = nativeEvent.layout.width;
            actualizarFlechasMenu(
              menuMedidas.current.desplazamiento,
              nativeEvent.layout.width,
              menuMedidas.current.contenido
            );
          }}
          onContentSizeChange={(width) => {
            menuMedidas.current.contenido = width;
            actualizarFlechasMenu(
              menuMedidas.current.desplazamiento,
              menuMedidas.current.ancho,
              width
            );
          }}
          onScroll={({ nativeEvent }) => {
            const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
            menuMedidas.current.desplazamiento = contentOffset.x;
            actualizarFlechasMenu(
              contentOffset.x,
              layoutMeasurement.width,
              contentSize.width
            );
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          style={styles.menuScroll}
          contentContainerStyle={styles.menu}
        >
          {opcionesMenu.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: vista === item.id }}
              onPress={() => {
                setEspacioSeleccionado(null);
                setVista(item.id);
              }}
              style={[
                styles.menuItem,
                vista === item.id && styles.menuItemActive,
              ]}
            >
              <Text
                style={[
                  styles.menuText,
                  vista === item.id && styles.menuTextActive,
                ]}
              >
                {item.etiqueta}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {mostrarFlechaIzquierdaMenu ? (
          <Pressable
            accessibilityLabel="Ver categorías anteriores"
            accessibilityRole="button"
            onPress={() => menuRef.current?.scrollTo({ x: 0, animated: true })}
            style={styles.menuLeftArrowButton}
          >
            <Text style={styles.menuArrow}>‹</Text>
          </Pressable>
        ) : null}
        {mostrarFlechaMenu ? (
          <Pressable
            accessibilityLabel="Ver más categorías"
            accessibilityRole="button"
            onPress={() => {
              const { ancho, desplazamiento } = menuMedidas.current;
              menuRef.current?.scrollTo({
                x: desplazamiento + ancho * 0.7,
                animated: true,
              });
            }}
            style={styles.menuArrowButton}
          >
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.content}>
        {espacioSeleccionado ? (
          <ReservaFormScreen
            espacio={espacioSeleccionado}
            onVolver={() => setEspacioSeleccionado(null)}
            onConfirmar={confirmarReserva}
          />
        ) : vista === "espacios" ? (
          cargandoEspacios && espacios.length === 0 && !errorEspacios ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#1746A2" />
              <Text style={styles.loadingText}>Cargando espacios...</Text>
            </View>
          ) : (
            <EspaciosScreen
              espacios={espacios}
              cargando={cargandoEspacios}
              error={errorEspacios}
              onReintentar={cargarEspacios}
              onReservar={setEspacioSeleccionado}
            />
          )
        ) : vista === "edificios" ? (
          <EdificiosScreen />
        ) : vista === "reservas" ? (
          <ReservasScreen usuario={usuario} />
        ) : vista === "historial" ? (
          <HistorialScreen />
        ) : vista === "utilizacion" && esGestor && usuario.rol !== "ADMIN" ? (
          <UtilizacionScreen />
        ) : vista === "administracion" && usuario.rol === "ADMIN" ? (
          <AdministracionScreen />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// 5. Proveedor global que envuelve toda la aplicacion
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F3F6FB", flex: 1 },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E1E7F0",
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 10,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: { alignItems: "center", flexDirection: "row" },
  logo: { height: 44, width: 108 },
  brandLabel: { marginLeft: 8 },
  brandTitle: { color: "#263762", fontSize: 14, fontWeight: "600" },
  greeting: { color: "#586579", fontSize: 13, marginTop: 5 },
  logout: {
    alignItems: "center",
    backgroundColor: "#263762",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 12,
  },
  logoutPressed: { backgroundColor: "#3B5597" },
  logoutText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  menuScroll: { flexGrow: 0, height: 52 },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    height: 52,
    position: "relative",
  },
  menu: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingRight: 48,
  },
  menuArrowButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderLeftColor: "#E1E7F0",
    borderLeftWidth: 1,
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: 42,
  },
  menuLeftArrowButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRightColor: "#E1E7F0",
    borderRightWidth: 1,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    top: 0,
    width: 42,
  },
  menuArrow: { color: "#1746A2", fontSize: 30, fontWeight: "700" },
  menuItem: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 },
  menuItemActive: { backgroundColor: "#1746A2" },
  menuText: { color: "#586579", fontSize: 13, fontWeight: "600" },
  menuTextActive: { color: "#FFFFFF" },
  content: { flex: 1 },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  loadingText: { color: "#586579", marginTop: 12 },
});
