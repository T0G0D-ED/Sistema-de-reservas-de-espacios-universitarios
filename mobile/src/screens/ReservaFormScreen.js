import { useEffect, useState } from "react";
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
import { listarDisponibilidad } from "../services/reservasService";

const horas = Array.from({ length: 10 }, (_, index) => index + 8);
const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function ReservaFormScreen({ espacio, onVolver, onConfirmar }) {
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [selectorFecha, setSelectorFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
  const [errorDisponibilidad, setErrorDisponibilidad] = useState("");
  const [fechaConsultada, setFechaConsultada] = useState(null);
  const [intentoDisponibilidad, setIntentoDisponibilidad] = useState(0);
  const mesNumero = Number(mes);
  const anioNumero = Number(anio) || new Date().getFullYear();
  const anioActual = new Date().getFullYear();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const cantidadDias =
    mesNumero >= 1 && mesNumero <= 12
      ? new Date(anioNumero, mesNumero, 0).getDate()
      : 31;
  const diasDisponibles = Array.from(
    { length: cantidadDias },
    (_, index) => index + 1,
  );
  const mesesDisponibles = meses.map((nombre, index) => ({
    nombre,
    numero: index + 1,
  }));
  const aniosDisponibles = [anioActual, anioActual + 1];
  const fechaFormateada =
    dia && mes && anio
      ? `${dia.padStart(2, "0")}-${mes.padStart(2, "0")}-${anio}`
      : "";
  const diaNumeroSeleccionado = Number(dia);
  const anioSeleccionado = Number(anio);
  const fechaCompleta =
    /^\d{1,2}$/.test(dia) &&
    /^\d{1,2}$/.test(mes) &&
    /^\d{4}$/.test(anio);
  const fechaSeleccionada =
    fechaCompleta
      ? new Date(anioSeleccionado, mesNumero - 1, diaNumeroSeleccionado)
      : null;
  const fechaCalendarioValida =
    fechaSeleccionada &&
    fechaSeleccionada.getFullYear() === anioSeleccionado &&
    fechaSeleccionada.getMonth() === mesNumero - 1 &&
    fechaSeleccionada.getDate() === diaNumeroSeleccionado;
  let fechaError = "";
  if (fechaCompleta) {
    if (mesNumero < 1 || mesNumero > 12) {
      fechaError = "Ingresa un mes entre 01 y 12.";
    } else if (diaNumeroSeleccionado < 1 || diaNumeroSeleccionado > 31) {
      fechaError = "Ingresa un día entre 01 y 31.";
    } else if (!fechaCalendarioValida) {
      fechaError = `El ${diaNumeroSeleccionado} de ${meses[
        mesNumero - 1
      ].toLowerCase()} de ${anio} no existe. Revisa la fecha.`;
    } else if (fechaSeleccionada < hoy) {
      fechaError = "La fecha seleccionada ya pasó. Elige una fecha futura.";
    }
  }
  const fechaValida = Boolean(fechaCalendarioValida) && !fechaError;
  const claveFecha = fechaValida
    ? `${anioSeleccionado}-${String(mesNumero).padStart(2, "0")}-${String(
        diaNumeroSeleccionado,
      ).padStart(2, "0")}`
    : null;

  useEffect(() => {
    if (!claveFecha) {
      setHora(null);
      setHorariosOcupados([]);
      setFechaConsultada(null);
      setErrorDisponibilidad("");
      setCargandoDisponibilidad(false);
      return undefined;
    }

    let vigente = true;
    const inicioDia = new Date(
      anioNumero,
      mesNumero - 1,
      diaNumeroSeleccionado,
    );
    const finDia = new Date(
      anioNumero,
      mesNumero - 1,
      diaNumeroSeleccionado + 1,
    );

    setHora(null);
    setHorariosOcupados([]);
    setFechaConsultada(null);
    setErrorDisponibilidad("");
    setCargandoDisponibilidad(true);

    listarDisponibilidad(
      espacio.id,
      inicioDia.toISOString(),
      finDia.toISOString(),
    )
      .then((horarios) => {
        if (vigente) {
          setHorariosOcupados(horarios);
          setFechaConsultada(claveFecha);
        }
      })
      .catch((err) => {
        if (vigente) {
          setErrorDisponibilidad(
            err.message || "No se pudo consultar la disponibilidad.",
          );
        }
      })
      .finally(() => {
        if (vigente) setCargandoDisponibilidad(false);
      });

    return () => {
      vigente = false;
    };
  }, [
    anioNumero,
    claveFecha,
    diaNumeroSeleccionado,
    intentoDisponibilidad,
    mesNumero,
    espacio.id,
  ]);

  function horarioOcupado(horaInicio) {
    if (!claveFecha || fechaConsultada !== claveFecha) return false;
    const inicio = new Date(
      anioNumero,
      mesNumero - 1,
      diaNumeroSeleccionado,
      horaInicio,
    );
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000);
    return horariosOcupados.some(
      (reserva) =>
        new Date(reserva.fecha_inicio) < fin &&
        new Date(reserva.fecha_fin) > inicio,
    );
  }

  const disponibilidadLista =
    Boolean(claveFecha) &&
    fechaConsultada === claveFecha &&
    !cargandoDisponibilidad &&
    !errorDisponibilidad;

  function seleccionarMes(numero) {
    setMes(numero);
    setHora(null);
    setSelectorFecha(null);
    setError("");
  }

  function seleccionarAnio(valor) {
    setAnio(String(valor));
    setHora(null);
    setSelectorFecha(null);
    setError("");
  }

  async function enviar() {
    setError("");
    if (
      !/^\d{1,2}$/.test(dia) ||
      !/^\d{1,2}$/.test(mes) ||
      !/^\d{4}$/.test(anio)
    ) {
      setError("Completa el día, mes y año con formato DD-MM-AAAA.");
      return;
    }
    if (fechaError) {
      setError(fechaError);
      return;
    }
    if (hora === null) {
      setError("Selecciona un horario.");
      return;
    }
    if (!disponibilidadLista) {
      setError("Espera a que se consulte la disponibilidad de la sala.");
      return;
    }
    if (horarioOcupado(hora)) {
      setHora(null);
      setError("Ese horario ya está ocupado. Selecciona otro.");
      return;
    }
    if (!motivo.trim()) {
      setError("El motivo de la reserva es obligatorio.");
      return;
    }

    const diaNumero = Number(dia);
    const mesSeleccionado = Number(mes);
    const anioSeleccionado = Number(anio);
    const inicio = new Date(
      anioSeleccionado,
      mesSeleccionado - 1,
      diaNumero,
      hora,
      0,
      0,
    );
    const fin = new Date(inicio.getTime() + 60 * 60 * 1000);
    if (inicio <= new Date()) {
      setError("Elige una fecha y hora futuras.");
      return;
    }

    setEnviando(true);
    try {
      await onConfirmar({
        espacioId: espacio.id,
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
        motivo: motivo.trim(),
      });
    } catch (err) {
      setError(err.message || "No se pudo enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={onVolver} style={styles.back}>
          <Text style={styles.backText}>‹ Volver a salas</Text>
        </Pressable>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>SOLICITUD DE RESERVA</Text>
          <Text style={styles.title}>{espacio.nombre}</Text>
          <Text style={styles.subtitle}>
            {espacio.edificio_nombre || "Edificio"} · Reserva de una hora
          </Text>

          <Text style={styles.label}>Fecha (DD-MM-AAAA)</Text>
          <View style={styles.dateFields}>
            <View style={[styles.dateField, styles.dayField]}>
              <Text style={styles.dateLabel}>Día</Text>
              <View style={styles.dateInputGroup}>
                <TextInput
                  accessibilityLabel="Día"
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={(value) => setDia(value.replace(/\D/g, ""))}
                  placeholder="DD"
                  value={dia}
                  style={styles.dateInput}
                />
                <Pressable
                  accessibilityLabel="Seleccionar día"
                  onPress={() => setSelectorFecha("dia")}
                  style={styles.arrowButton}
                >
                  <Text style={styles.arrow}>▾</Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.dateField, styles.monthField]}>
              <Text style={styles.dateLabel}>Mes</Text>
              <View style={styles.dateInputGroup}>
                <TextInput
                  accessibilityLabel="Mes"
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={(value) => setMes(value.replace(/\D/g, ""))}
                  placeholder="MM"
                  value={mes}
                  style={styles.dateInput}
                />
                <Pressable
                  accessibilityLabel="Seleccionar mes"
                  onPress={() => setSelectorFecha("mes")}
                  style={styles.arrowButton}
                >
                  <Text style={styles.arrow}>▾</Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.dateField, styles.yearField]}>
              <Text style={styles.dateLabel}>Año</Text>
              <View style={styles.dateInputGroup}>
                <TextInput
                  accessibilityLabel="Año"
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={(value) => setAnio(value.replace(/\D/g, ""))}
                  placeholder="AAAA"
                  value={anio}
                  style={styles.yearText}
                />
                <Pressable
                  accessibilityLabel="Seleccionar año"
                  onPress={() => setSelectorFecha("anio")}
                  style={styles.arrowButton}
                >
                  <Text style={styles.arrow}>▾</Text>
                </Pressable>
              </View>
            </View>
          </View>
          {fechaFormateada ? (
            <Text style={styles.datePreview}>
              Fecha seleccionada: {fechaFormateada}
            </Text>
          ) : null}
          {fechaError ? (
            <Text accessibilityLiveRegion="polite" style={styles.dateError}>
              {fechaError}
            </Text>
          ) : null}

          <Text style={styles.label}>Horario</Text>
          {!claveFecha ? (
            <Text style={styles.availabilityMessage}>
              {fechaError
                ? "Corrige la fecha para consultar los horarios."
                : "Selecciona una fecha válida para consultar los horarios."}
            </Text>
          ) : cargandoDisponibilidad ? (
            <View style={styles.availabilityStatus}>
              <ActivityIndicator size="small" color="#1746A2" />
              <Text style={styles.availabilityMessage}>
                Consultando horarios ocupados...
              </Text>
            </View>
          ) : errorDisponibilidad ? (
            <View style={styles.availabilityError}>
              <Text style={styles.availabilityErrorText}>
                No se pudo consultar la disponibilidad. {errorDisponibilidad}
              </Text>
              <Pressable
                onPress={() =>
                  setIntentoDisponibilidad((intento) => intento + 1)
                }
                style={styles.retryAvailability}
              >
                <Text style={styles.retryAvailabilityText}>
                  Reintentar consulta
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.availabilityMessage}>
              Los horarios disponibles aparecen en verde y los ocupados en
              rojo.
            </Text>
          )}
          <View style={styles.hours}>
            {horas.map((value) => {
              const ocupado = horarioOcupado(value);
              return (
                <Pressable
                  key={value}
                  accessibilityState={{
                    disabled: !disponibilidadLista || ocupado,
                    selected: hora === value,
                  }}
                  disabled={!disponibilidadLista || ocupado}
                  onPress={() => setHora(value)}
                  style={[
                    styles.hour,
                    !disponibilidadLista && styles.hourDisabled,
                    disponibilidadLista &&
                      !ocupado &&
                      styles.hourAvailable,
                    ocupado && styles.hourUnavailable,
                    hora === value && styles.hourSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.hourText,
                      !disponibilidadLista && styles.hourDisabledText,
                      disponibilidadLista &&
                        !ocupado &&
                        styles.hourAvailableText,
                      ocupado && styles.hourUnavailableText,
                      hora === value && styles.hourTextSelected,
                    ]}
                  >
                    {String(value).padStart(2, "0")}:00
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {hora !== null ? (
            <Text style={styles.selectedTime}>
              {String(hora).padStart(2, "0")}:00–{String(hora + 1).padStart(2, "0")}:00
            </Text>
          ) : null}

          <Text style={styles.label}>Motivo</Text>
          <TextInput
            accessibilityLabel="Motivo de la reserva"
            onChangeText={setMotivo}
            placeholder="Ej. Estudio grupal"
            value={motivo}
            style={[styles.input, styles.multiline]}
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            disabled={enviando}
            onPress={enviar}
            style={[styles.submit, enviando && styles.disabled]}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Enviar solicitud</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setSelectorFecha(null)}
        transparent
        visible={Boolean(selectorFecha)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Cerrar selector de fecha"
            onPress={() => setSelectorFecha(null)}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {selectorFecha === "dia"
                  ? "Seleccionar día"
                  : selectorFecha === "mes"
                    ? "Seleccionar mes"
                    : "Seleccionar año"}
              </Text>
              <Pressable
                accessibilityLabel="Cerrar"
                onPress={() => setSelectorFecha(null)}
                style={styles.closePicker}
              >
                <Text style={styles.closePickerText}>×</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.pickerOptions}>
              {selectorFecha === "dia" ? (
                diasDisponibles.map((valor) => {
                  const numero = String(valor).padStart(2, "0");
                  return (
                    <Pressable
                      key={numero}
                      onPress={() => {
                        setDia(numero);
                        setSelectorFecha(null);
                        setError("");
                      }}
                      style={styles.pickerOption}
                    >
                      <Text style={styles.pickerOptionText}>{numero}</Text>
                    </Pressable>
                  );
                })
              ) : selectorFecha === "mes" ? (
                mesesDisponibles.map(({ nombre, numero: valor }) => {
                  const numero = String(valor).padStart(2, "0");
                  return (
                    <Pressable
                      key={numero}
                      onPress={() => seleccionarMes(numero)}
                      style={styles.pickerOption}
                    >
                      <Text style={styles.pickerOptionText}>
                        {numero} · {nombre}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                aniosDisponibles.map((valor) => (
                  <Pressable
                    key={valor}
                    onPress={() => seleccionarAnio(valor)}
                    style={styles.pickerOption}
                  >
                    <Text style={styles.pickerOptionText}>{valor}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 30 },
  back: { alignSelf: "flex-start", marginBottom: 14, paddingVertical: 6 },
  backText: { color: "#1746A2", fontSize: 15, fontWeight: "600" },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E7F0",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  eyebrow: { color: "#1746A2", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  title: { color: "#14213D", fontSize: 25, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#586579", fontSize: 14, marginBottom: 10, marginTop: 5 },
  label: { color: "#14213D", fontSize: 14, fontWeight: "600", marginTop: 18 },
  dateFields: { flexDirection: "row", gap: 8, marginTop: 8 },
  dateField: { minWidth: 0 },
  dayField: { width: 82 },
  monthField: { width: 95 },
  yearField: { flex: 1 },
  dateLabel: { color: "#586579", fontSize: 12, marginBottom: 5 },
  dateInputGroup: {
    alignItems: "center",
    borderColor: "#CBD4E2",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
  },
  dateInput: {
    color: "#14213D",
    flex: 1,
    fontSize: 16,
    minWidth: 0,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  arrowButton: { alignItems: "center", justifyContent: "center", minHeight: 44, width: 27 },
  arrow: { color: "#1746A2", fontSize: 18, fontWeight: "700" },
  yearText: { color: "#14213D", flex: 1, fontSize: 16, paddingHorizontal: 10, textAlign: "center" },
  datePreview: { color: "#1746A2", fontSize: 13, fontWeight: "600", marginTop: 8 },
  dateError: { color: "#B42318", fontSize: 13, marginTop: 6 },
  input: {
    borderColor: "#CBD4E2",
    borderRadius: 10,
    borderWidth: 1,
    color: "#14213D",
    fontSize: 16,
    marginTop: 7,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  hours: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 9 },
  availabilityStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  availabilityMessage: { color: "#586579", fontSize: 13, marginTop: 8 },
  availabilityError: {
    backgroundColor: "#FEF2F2",
    borderRadius: 9,
    marginTop: 8,
    padding: 10,
  },
  availabilityErrorText: { color: "#B42318", fontSize: 13 },
  retryAvailability: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingVertical: 4,
  },
  retryAvailabilityText: { color: "#1746A2", fontSize: 14, fontWeight: "700" },
  hour: {
    borderColor: "#CBD4E2",
    borderRadius: 9,
    borderWidth: 1,
    minWidth: 66,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  hourDisabled: { backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" },
  hourDisabledText: { color: "#9CA3AF" },
  hourAvailable: { backgroundColor: "#ECFDF3", borderColor: "#16A34A" },
  hourAvailableText: { color: "#15803D", fontWeight: "600" },
  hourUnavailable: { backgroundColor: "#FEF2F2", borderColor: "#DC2626" },
  hourUnavailableText: {
    color: "#991B1B",
    fontWeight: "700",
    textDecorationColor: "#7F1D1D",
    textDecorationLine: "line-through",
  },
  hourSelected: { backgroundColor: "#15803D", borderColor: "#15803D" },
  hourText: { color: "#40516D", textAlign: "center" },
  hourTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  selectedTime: { color: "#1746A2", fontWeight: "600", marginTop: 8 },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: "top" },
  error: { color: "#B42318", marginTop: 12 },
  submit: {
    alignItems: "center",
    backgroundColor: "#1746A2",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 50,
  },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.6 },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(20, 33, 61, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: "75%",
    overflow: "hidden",
    width: "100%",
  },
  pickerHeader: {
    alignItems: "center",
    borderBottomColor: "#E1E7F0",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 17,
    paddingVertical: 13,
  },
  pickerTitle: { color: "#14213D", fontSize: 17, fontWeight: "700" },
  closePicker: { alignItems: "center", height: 34, justifyContent: "center", width: 34 },
  closePickerText: { color: "#586579", fontSize: 25 },
  pickerOptions: { paddingHorizontal: 14 },
  pickerOption: {
    borderBottomColor: "#EDF0F5",
    borderBottomWidth: 1,
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  pickerOptionText: { color: "#14213D", fontSize: 15 },
});

export default ReservaFormScreen;
