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

  nodo.querySelector("[data-slot=cover]").style.background = espacio.cover;
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

// ---ASIGNACIÓN DE EVENTOS ---
inputBuscar.addEventListener("input", filtrarEspacios);

selectEdificio.addEventListener("change", filtrarEspacios);
selectTipo.addEventListener("change", filtrarEspacios);
selectCapacidad.addEventListener("change", filtrarEspacios);

// ---CARGA INICIAL ---
filtrarEspacios();