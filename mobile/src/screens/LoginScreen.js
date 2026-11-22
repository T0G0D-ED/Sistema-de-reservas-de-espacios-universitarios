import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function LoginScreen({ onIniciarSesion, cargando, error }) {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  function enviar() {
    onIniciarSesion({ identificador: identificador.trim(), password });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FB" />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image
              accessibilityLabel="Universidad Andrés Bello"
              accessible
              resizeMode="contain"
              source={require("../../assets/logo-unab.png")}
              style={styles.logo}
            />
            <Text style={styles.eyebrow}>ReservaUNAB</Text>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>
              Ingresa con tu usuario o correo universitario.
            </Text>

            <Text style={styles.label}>Usuario o correo</Text>
            <TextInput
              accessibilityLabel="Usuario o correo"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              editable={!cargando}
              onChangeText={setIdentificador}
              onSubmitEditing={() => {}}
              placeholder="usuario o correo@unab.cl"
              returnKeyType="next"
              style={styles.input}
              value={identificador}
            />

            <Text style={styles.label}>Contraseña</Text>
            <View>
              <TextInput
                accessibilityLabel="Contraseña"
                autoCapitalize="none"
                autoComplete="current-password"
                editable={!cargando}
                onChangeText={setPassword}
                onSubmitEditing={enviar}
                placeholder="Tu contraseña"
                returnKeyType="done"
                secureTextEntry={!mostrarPassword}
                style={[styles.input, styles.passwordInput]}
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                disabled={cargando}
                onPress={() => setMostrarPassword((visible) => !visible)}
                style={styles.passwordToggle}
              >
                <View style={styles.eye}>
                  <View style={[styles.eyeLash, styles.eyeLashLeft]} />
                  <View style={[styles.eyeLash, styles.eyeLashCenter]} />
                  <View style={[styles.eyeLash, styles.eyeLashRight]} />
                  <View style={[styles.eyeOutline, styles.eyeTopLeft]} />
                  <View style={[styles.eyeOutline, styles.eyeTopRight]} />
                  <View style={[styles.eyeOutline, styles.eyeBottomLeft]} />
                  <View style={[styles.eyeOutline, styles.eyeBottomRight]} />
                  <View style={styles.eyePupil} />
                  {!mostrarPassword ? <View style={styles.eyeSlash} /> : null}
                </View>
              </Pressable>
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={cargando || !identificador.trim() || !password}
              onPress={enviar}
              style={({ pressed }) => [
                styles.button,
                (cargando || !identificador.trim() || !password) &&
                  styles.buttonDisabled,
                pressed && !cargando && styles.buttonPressed,
              ]}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
  },
  logo: {
    alignSelf: "center",
    height: 62,
    marginBottom: 18,
    width: 200,
  },
  eyebrow: {
    alignSelf: "center",
    color: "#263762",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    color: "#14213D",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
  },
  subtitle: {
    color: "#586579",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 6,
  },
  label: {
    color: "#14213D",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD4E2",
    borderRadius: 10,
    borderWidth: 1,
    color: "#14213D",
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  passwordInput: {
    paddingRight: 52,
  },
  passwordToggle: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: 48,
  },
  eye: {
    alignItems: "center",
    height: 16,
    justifyContent: "center",
    width: 24,
  },
  eyeOutline: {
    backgroundColor: "#586579",
    borderRadius: 1,
    height: 2,
    position: "absolute",
    width: 13,
  },
  eyeLash: {
    backgroundColor: "#586579",
    height: 4,
    position: "absolute",
    width: 2,
  },
  eyeLashLeft: { left: 5, top: -3, transform: [{ rotate: "-25deg" }] },
  eyeLashCenter: { left: 11, top: -5 },
  eyeLashRight: {
    right: 5,
    top: -3,
    transform: [{ rotate: "25deg" }],
  },
  eyeTopLeft: { left: 0, top: 3.5, transform: [{ rotate: "-32deg" }] },
  eyeTopRight: { left: 11, top: 3.5, transform: [{ rotate: "32deg" }] },
  eyeBottomLeft: { left: 0, top: 10.5, transform: [{ rotate: "32deg" }] },
  eyeBottomRight: { left: 11, top: 10.5, transform: [{ rotate: "-32deg" }] },
  eyePupil: {
    backgroundColor: "#586579",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  eyeSlash: {
    backgroundColor: "#586579",
    height: 2,
    position: "absolute",
    transform: [{ rotate: "-45deg" }],
    width: 24,
  },
  error: {
    color: "#B42318",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1746A2",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 22,
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    backgroundColor: "#12377E",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default LoginScreen;
