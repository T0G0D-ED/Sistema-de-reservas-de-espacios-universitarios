const STORAGE_KEY = "reservasRealizadas";

export function getReservas() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function addReserva({ espacio, ...datos }) {
  const reserva = { id: Date.now(), espacioId: espacio.id, espacioTitulo: espacio.titulo, espacioLugar: espacio.lugar, espacioCover: espacio.cover, espacioIcon: espacio.icon, ...datos };
  const reservas = [...getReservas(), reserva];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
  return reserva;
}

export function removeReserva(id) {
  const reservas = getReservas().filter((reserva) => reserva.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
  return reservas;
}