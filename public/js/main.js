import { espacios } from "../data/espacios.js"

// ---CAPTURA DE ELEMENTOS DEL DOM ---
const inputBuscar = document.getElementById("input-buscar");
const selectEdificio = document.getElementById("select-edificio");
const selectTipo = document.getElementById("select-tipo");
const selectCapacidad = document.getElementById("select-capacidad");
const contadorEspacios = document.getElementById("contador-espacios");
const gridEspacios = document.getElementById("espacios-grid");

// ---FUNCIONES DE COMPARACION Y FILTRADO ---
function coincideCapacidad(capacidadNumero, filtroSeleccionado) {
  if (!filtroSeleccionado) return true; // Si value="" (no hay filtro) , deja pasar todos
  if (filtroSeleccionado === "Pequeña") return capacidadNumero <= 15;
  if (filtroSeleccionado === "Mediana") return capacidadNumero > 15 && capacidadNumero <= 40;
  if (filtroSeleccionado === "Grande") return capacidadNumero > 40;
  return true;
}

//Funcion principal de filtrado que se ejecuta cada vez que el usuario cambia un filtro
function filtrarEspacios() {
  const texto = inputBuscar.value.toLowerCase().trim();
  const edificioSeleccionado = selectEdificio.value;
  const tipoSeleccionado = selectTipo.value;
  const capacidadSeleccionada = selectCapacidad.value;

  const resultado = espacios.filter(espacio => {
  
    // Coincidencia de texto
    const coincideTexto = 
      espacio.titulo.toLowerCase().includes(texto) ||
      espacio.descripcion.toLowerCase().includes(texto) ||
      espacio.tags.some(tag => tag.toLowerCase().includes(texto));

    // Coincidencias exactas.
    const coincideEdificio = !edificioSeleccionado || espacio.edificio === edificioSeleccionado;
    const coincideTipo = !tipoSeleccionado || espacio.tipo.toLowerCase() === tipoSeleccionado.toLowerCase();
    
    // Coincidencia con funcion auxiliar
    const cumpleCapacidad = coincideCapacidad(espacio.capacidad, capacidadSeleccionada);

		//Espacio pasa el filtro si cumple con todas las condiciones
    return coincideTexto && coincideEdificio && coincideTipo && cumpleCapacidad;
  });

  // Actualiza la vista y el texto del contador con los resultados filtrados
  renderizarTarjetas(resultado);
  
  //Para mostrar espacios disponibles al usuario
  if (contadorEspacios) {
    contadorEspacios.textContent = `${resultado.length} de ${espacios.length} espacios disponibles`;
  }
}

//Alertas
function mostrarAlerta(mensaje, tipo = "info") {
  const estilos = {
    danger:  { bg: "bg-rojoUnab/10",  text: "text-rojoUnab",  ring: "focus:ring-rojoUnab/30" },
    success: { bg: "bg-green-50",     text: "text-green-700", ring: "focus:ring-green-300" },
    info:    { bg: "bg-azulUnab/10",  text: "text-azulUnab",  ring: "focus:ring-azulUnab/30" },
  };
  const s = estilos[tipo];

  const alerta = document.createElement("div");
  alerta.className = `flex items-center p-4 rounded-lg text-sm ${s.bg} ${s.text} max-w-sm shadow-md`;
  alerta.setAttribute("role", "alert");

  alerta.innerHTML = `
    <svg class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
    <div class="ms-2">${mensaje}</div>
    <button type="button" class="ms-auto -mx-1.5 -my-1.5 ${s.ring} rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center hover:${s.bg} shrink-0">
      <span class="sr-only">Cerrar</span>
      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
      </svg>
    </button>
  `;

  alerta.querySelector("button").addEventListener("click", () => alerta.remove());

  document.getElementById("toast-container").appendChild(alerta);
  setTimeout(() => alerta.remove(), 5000);
}

// RENDERIZADO
function crearTarjeta(espacio) {
  const tpl = document.getElementById("tarjeta");
  const nodo = tpl.content.cloneNode(true);

  nodo.querySelector("article").dataset.id = espacio.id;
  
  nodo.querySelector("[data-slot=cover]").style.background = espacio.cover;
  nodo.querySelector("[data-slot=titulo]").textContent = espacio.titulo;
  nodo.querySelector("[data-slot=icon]").textContent = espacio.icon;
  nodo.querySelector("[data-slot=nombre]").textContent = espacio.nombre;
  nodo.querySelector("[data-slot=lugar]").textContent = espacio.lugar;
  nodo.querySelector("[data-slot=descripcion]").textContent = espacio.descripcion;
  nodo.querySelector("[data-slot=aforo]").textContent = espacio.aforo;

  const tagsWrap = nodo.querySelector("[data-slot=tags]");
  espacio.tags.forEach(tag => {
    const pill = document.createElement("span");
    pill.className = "px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs";
    pill.textContent = tag;
    tagsWrap.appendChild(pill);
  });

  return nodo;
}

function renderizarTarjetas(lista) {
  gridEspacios.innerHTML = "";
  lista.forEach(espacio => gridEspacios.appendChild(crearTarjeta(espacio)));
}



//MODAL
let espacioSeleccionadoActual = null; //Almacena el objeto del espacio que se reserva
const modalReserva = document.getElementById("modal-reserva");
const modalOverlay = document.getElementById("modal-overlay");
const btnCerrarModal = document.getElementById("modal-cerrar");
const modalTitulo = document.getElementById("modal-titulo-espacio");
const btnCancelarModal = document.getElementById("btn-cancelar-modal");



function abrirModal(espacio) {
  if (espacio) {
    espacioSeleccionadoActual = espacio; // Guarda la referencia de la sala
    modalTitulo.textContent = `Reservar: ${espacio.titulo}`;
  }
  // Limpiar campos del form al abrir
  document.getElementById("form-reserva").reset();
  contenedorHoras.classList.add("hidden");
  mensajeHorarios.classList.remove("hidden");
  inputHoraOculto.value = "";

  //Muestra modal y bloquea scroll
  modalReserva.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function cerrarModal() {
  modalReserva.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  espacioSeleccionadoActual = null;
}

btnCerrarModal.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", cerrarModal);
if (btnCancelarModal) btnCancelarModal.addEventListener("click", cerrarModal);


document.addEventListener("click", (e) => {
  const btnReservar = e.target.closest(".btn-solicitar-reserva");

  if (btnReservar) {
    const tarjeta = btnReservar.closest("article");
    const espacio = espacios.find(item => String(item.id) === tarjeta?.dataset.id);
    abrirModal(espacio);
  }
});

//SELECCION DE FECHA Y HORA MODAL
const inputFecha=document.getElementById("reserva-fecha");
const contenedorHoras=document.getElementById("contenedor-horas");
const mensajeHorarios=document.getElementById("mensaje-horarios");
const inputHoraOculto=document.getElementById("reserva-hora-seleccionada");

//Restringe reservas en fechas pasadas
const hoy=new Date().toISOString().split("T")[0];
inputFecha.setAttribute("min",hoy);

const horariosDisponibles=[
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

inputFecha.addEventListener("change", () => {
  if (inputFecha.value) {
    mensajeHorarios.classList.add("hidden");
    contenedorHoras.classList.remove("hidden");
    renderizarHorarios(horariosDisponibles);
  } else {
    contenedorHoras.classList.add("hidden");
    mensajeHorarios.classList.remove("hidden");
  }
});

//Bloques de tiempo
function renderizarHorarios(listaHora) {
  contenedorHoras.innerHTML = "";
  inputHoraOculto.value = "";
  

  listaHora.forEach(hora => {
    const btnHora = document.createElement("button");
    btnHora.type = "button"; // evita que actue como submit del formulario
    btnHora.textContent = hora;
    btnHora.className="btn-hora px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors";

    btnHora.addEventListener("click", () => {
	    // Limpia la seleccion visual de los otros botones
      document.querySelectorAll(".btn-hora").forEach(btn =>{
        btn.classList.remove("bg-blue-500", "text-white", "border-blue-500");
        btn.classList.add("border-gray-300", "text-gray-700");
      });

      // Aplicar estado activo unicamente al boton presionado
      btnHora.classList.remove('border-gray-300', 'text-gray-700');
      btnHora.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
        
      // Guarda el horario en el input hidden para el formulario
      inputHoraOculto.value=hora;
    });

      contenedorHoras.appendChild(btnHora);
    });
  }

// ---ASIGNACION DE EVENTOS ---
inputBuscar.addEventListener("input", filtrarEspacios);
selectEdificio.addEventListener("change", filtrarEspacios);
selectTipo.addEventListener("change", filtrarEspacios);
selectCapacidad.addEventListener("change", filtrarEspacios);

//NAVEGACION ESPACIOS-RESERVAS
const navEspacios = document.getElementById("nav-espacios");
const navReservas = document.getElementById("nav-reservas");
const vistaEspacios = document.getElementById("vista-espacios");
const vistaMisReservas = document.getElementById("vista-mis-reservas");

function cambiarVista(vista) {
  if (vista === "espacios") {
    vistaEspacios.classList.remove("hidden");
    vistaMisReservas.classList.add("hidden");

    navEspacios.classList.add("text-azulUnab", "border-b-2", "border-azulUnab", "pb-1");
    navEspacios.classList.remove("text-gray-500");

    navReservas.classList.remove("text-azulUnab", "border-b-2", "border-azulUnab", "pb-1");
    navReservas.classList.add("text-gray-500");
  } else if (vista === "reservas") {
    vistaEspacios.classList.add("hidden");
    vistaMisReservas.classList.remove("hidden");

    navReservas.classList.add("text-azulUnab", "border-b-2", "border-azulUnab", "pb-1");
    navReservas.classList.remove("text-gray-500");

    navEspacios.classList.remove("text-azulUnab", "border-b-2", "border-azulUnab", "pb-1");
    navEspacios.classList.add("text-gray-500");

    renderizarMisReservas();
  }
}

navEspacios.addEventListener("click", () => cambiarVista("espacios"));
navReservas.addEventListener("click", () => cambiarVista("reservas"));




//GESTION DE RESERVAS Y FORMULARIO
let reservasRealizadas = JSON.parse(localStorage.getItem("reservasRealizadas") || "[]");

const formReserva = document.getElementById("form-reserva");
const badgeTotalReservas = document.getElementById("badge-total-reservas");
const contenedorMisReservas = document.getElementById("contenedor-mis-reservas");
const sinReservas = document.getElementById("sin-reservas");

// Confirmar reserva desde el formulario 
formReserva.addEventListener("submit", (e) => {
  e.preventDefault(); //Detiene el envio que hay por defecto de HTTP y se evita la recarga de la pag

  const fecha = inputFecha.value;
  const hora = inputHoraOculto.value;
  const nombre = document.getElementById("reserva-nombre").value.trim();
  const motivo = document.getElementById("reserva-motivo").value.trim();

  // Validacion bloque de horario seleccionado
  if (!hora) {
    mostrarAlerta("Por favor selecciona un horario disponible.", "danger")
    return;
  }
  
  // Crear objeto y guardarlo en el arreglo
  const nuevaReserva = {
    id: Date.now(),
    espacioId: espacioSeleccionadoActual.id,
    espacioTitulo: espacioSeleccionadoActual.titulo,
    espacioLugar: espacioSeleccionadoActual.lugar,
    espacioCover: espacioSeleccionadoActual.cover,
    espacioIcon: espacioSeleccionadoActual.icon,
    nombre,
    fecha,
    hora,
    motivo
  };

  reservasRealizadas.push(nuevaReserva);
  localStorage.setItem("reservasRealizadas", JSON.stringify(reservasRealizadas));

  if (badgeTotalReservas) badgeTotalReservas.textContent = reservasRealizadas.length;

  cerrarModal();
  mostrarAlerta(`¡Reserva confirmada con éxito para ${nuevaReserva.espacioTitulo}!`, "success");

  // LLeva directamente a vista reservas para ver la reserva solicitada
  cambiarVista("reservas");
});


// Renderizar reservas en Mis Reservas
function renderizarMisReservas() {
  if (!contenedorMisReservas) return;
  contenedorMisReservas.innerHTML = "";

  // Si no hay elementos, contenedor en estado vacio
  if (reservasRealizadas.length === 0) {
    sinReservas.classList.remove("hidden");
    return;
  }

  sinReservas.classList.add("hidden");

  //Tarjetas de reserva
  reservasRealizadas.forEach(reserva => {
    const card = document.createElement("article");
    card.className = "bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm";
    card.innerHTML = `
      <div class="h-20 flex items-center justify-between px-5 text-white" style="background: ${reserva.espacioCover}">
        <span class="text-3xl">${reserva.espacioIcon}</span>
        <span class="text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-medium">Activa</span>
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-bold text-gray-900 text-lg">${reserva.espacioTitulo}</h3>
        <p class="text-xs text-blue-600 font-medium mb-3">${reserva.espacioLugar}</p>
        
        <div class="space-y-1 text-sm text-gray-600 mb-4 flex-1">
          <p><strong>Fecha:</strong> ${reserva.fecha}</p>
          <p><strong>Horario:</strong> ${reserva.hora}</p>
          <p><strong>Solicitante:</strong> ${reserva.nombre}</p>
          <p><strong>Motivo:</strong> ${reserva.motivo}</p>
        </div>

        <button type="button" data-id="${reserva.id}" class="btn-eliminar-reserva w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg border border-red-200 transition cursor-pointer">
          Cancelar reserva
        </button>
      </div>
    `;
    contenedorMisReservas.appendChild(card);
  });
}

//Cancelacion de reservas
document.addEventListener("click", (e) => {
  const btnCancelar = e.target.closest(".btn-eliminar-reserva");
  if (btnCancelar) {
    const id = Number(btnCancelar.dataset.id);
    //Se conservan las reservas excepto la que se elimino
    reservasRealizadas = reservasRealizadas.filter(r => r.id !== id);
    localStorage.setItem("reservasRealizadas", JSON.stringify(reservasRealizadas));

    if (badgeTotalReservas) badgeTotalReservas.textContent = reservasRealizadas.length;

    renderizarMisReservas();
    mostrarAlerta("Reserva cancelada correctamente.", "info");
  }
});


// ---CARGA INICIAL ---
if (badgeTotalReservas) badgeTotalReservas.textContent = reservasRealizadas.length;
filtrarEspacios();