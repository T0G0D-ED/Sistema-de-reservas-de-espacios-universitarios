import { useState } from "react";

function AuthModal({ onClose, onAuthenticated, onLogin, onRegister }) {
  const [modo, setModo] = useState("login");
  const [formulario, setFormulario] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(event) {
    event.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const session = modo === "registro"
        ? await onRegister(formulario)
        : await onLogin({ identificador: formulario.email, password: formulario.password });
      onAuthenticated(session);
    } catch (err) {
      setError(err.message || "No se pudo completar la autenticación.");
    } finally {
      setEnviando(false);
    }
  }

  function cambiarModo() {
    setModo((actual) => actual === "login" ? "registro" : "login");
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="auth-title" className="text-xl font-semibold text-[#263762]">
            {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-gray-500">&times;</button>
        </div>
        <form onSubmit={enviar} className="space-y-4">
          {modo === "registro" && (
            <label className="block text-sm font-medium text-gray-700">
              Nombre
              <input
                required
                value={formulario.nombre}
                onChange={(event) => setFormulario((actual) => ({ ...actual, nombre: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                autoComplete="name"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-gray-700">
            {modo === "login" ? "Usuario o correo" : "Correo"}
            <input
              required
              type={modo === "login" ? "text" : "email"}
              value={formulario.email}
              onChange={(event) => setFormulario((actual) => ({ ...actual, email: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              autoComplete={modo === "login" ? "username" : "email"}
              placeholder={modo === "login" ? "admin o correo@unab.cl" : ""}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Contraseña
            <input
              required
              type="password"
              value={formulario.password}
              onChange={(event) => setFormulario((actual) => ({ ...actual, password: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              autoComplete={modo === "login" ? "current-password" : "new-password"}
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={enviando} className="w-full rounded-lg bg-[#263762] py-2.5 font-medium text-white hover:bg-[#3B5597] disabled:opacity-50">
            {enviando ? "Procesando..." : modo === "login" ? "Ingresar" : "Registrarme"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {modo === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button type="button" onClick={cambiarModo} className="font-medium text-blue-700 underline">
            {modo === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default AuthModal;
