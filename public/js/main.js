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
const modalReserva = document.getElementById("modal-reserva");
const modalOverlay = document.getElementById("modal-overlay");
const btnCerrarModal = document.getElementById("modal-cerrar");
const modalTitulo = document.getElementById("modal-titulo-espacio");

function abrirModal(espacio) {
  if (espacio) {
    modalTitulo.textContent = `Reservar: ${espacio.titulo}`;
  }
  modalReserva.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function cerrarModal() {
  modalReserva.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

btnCerrarModal.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", cerrarModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalReserva.classList.contains("hidden")){
    cerrarModal();
  }
});

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

//esto permite no seleccionar fechas pasadas en el input de fecha
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
  if (!inputFecha.value) {
    mensajeHorarios.classList.add("hidden");
    contenedorHoras.classList.remove("hidden");
    
    renderizarHorarios(horariosDisponibles);
  } else {
    contenedorHoras.classList.add("hidden");
    mensajeHorarios.classList.remove("hidden");
  }
});

function renderizarHorarios(listaHora) {
  contenedorHoras.innerHTML = "";
  inputHoraOculto.value = "";

  listaHora.forEach(hora => {
    const btnHora = document.createElement("button");
    btnHora.textContent=hora;
    btnHora.className="btn-hora px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors";

    btnHora.addEventListener("click", () => {
      document.querySelectorAll(".btn-hora").forEach(btn =>{
        btn.classList.remove("bg-blue-500", "text-white", "border-blue-500");
        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
      });
        btnHora.classList.remove('border-gray-300', 'text-gray-700');
        btnHora.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
        inputHoraOculto.value=hora;
      });
      contenedorHoras.appendChild(btnHora);
    });
  }

// ---ASIGNACIÓN DE EVENTOS ---
inputBuscar.addEventListener("input", filtrarEspacios);

selectEdificio.addEventListener("change", filtrarEspacios);
selectTipo.addEventListener("change", filtrarEspacios);
selectCapacidad.addEventListener("change", filtrarEspacios);

// ---CARGA INICIAL ---
filtrarEspacios();