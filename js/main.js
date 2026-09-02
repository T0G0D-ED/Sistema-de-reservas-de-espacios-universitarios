import { espacios } from "../public/data/espacios.js";

// ---CAPTURA DE ELEMENTOS DEL DOM ---
// Guardando las referencias a los elementos HTML en constantes para no buscarlos en el DOM de forma frecuente
const inputBuscar = document.getElementById("input-buscar");
const selectEdificio = document.getElementById("select-edificio");
const selectTipo = document.getElementById("select-tipo");
const selectCapacidad = document.getElementById("select-capacidad");
const contadorEspacios = document.getElementById("contador-espacios");
const gridEspacios = document.getElementById("espacios-grid");

// ---FUNCIONES DE COMPARACIÓN Y FILTRADO ---
// Funcion auxiliar que se encarga solo de una cosa
// Ve si la capacidad de un espacio cumple con la seleccionada por el usuario
function coincideCapacidad(capacidadNumero, filtroSeleccionado) {
  if (!filtroSeleccionado) return true; // Si value="" (no hay filtro) , deja pasar todos
  if (filtroSeleccionado === "Pequeña") return capacidadNumero <= 15;
  if (filtroSeleccionado === "Mediana") return capacidadNumero > 15 && capacidadNumero <= 40;
  if (filtroSeleccionado === "Grande") return capacidadNumero > 40;
  return true;
}

//Funcion principal de filtrado que se ejecuta cada vez que el usuario cambia un filtro
function filtrarEspacios() {
	// Obtener los valores actuales de los inputs
  const texto = inputBuscar.value.toLowerCase().trim();
  const edificioSeleccionado = selectEdificio.value;
  const tipoSeleccionado = selectTipo.value;
  const capacidadSeleccionada = selectCapacidad.value;

	//.filter() para crear un nuevo array solo con los elementos que cumplan la condicion
  const resultado = espacios.filter(espacio => {
  
    // Coincidencia de texto: busca en título, descripción o en los tags
    const coincideTexto = 
      espacio.titulo.toLowerCase().includes(texto) ||
      espacio.descripcion.toLowerCase().includes(texto) ||
      espacio.tags.some(tag => tag.toLowerCase().includes(texto));

    // Coincidencias exactas. Si select vacio evalua true !!!!
    const coincideEdificio = !edificioSeleccionado || espacio.edificio === edificioSeleccionado;
    const coincideTipo = !tipoSeleccionado || espacio.tipo.toLowerCase() === tipoSeleccionado.toLowerCase();
    
    // Coincidencia por rango numérico con funcion auxiliar
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

// ---RENDERIZADO ---
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
// Usamos 'input' en el buscador para respuesta inmediata mientras escribe
//se dispara en cada tecla que el usuario presiona
inputBuscar.addEventListener("input", filtrarEspacios);

// Usamos 'change' en los selects para reaccionar a la nueva opción elegida
selectEdificio.addEventListener("change", filtrarEspacios);
selectTipo.addEventListener("change", filtrarEspacios);
selectCapacidad.addEventListener("change", filtrarEspacios);

// ---CARGA INICIAL ---
// Se llama a la funcion una vez al cargar el script
filtrarEspacios();