import { espacios } from "../data/espacios.js"

function crearTarjeta(espacio) {
    const tpl=document.getElementById("tarjeta");
    const nodo=tpl.content.cloneNode(true);

    nodo.querySelector("[data-slot=cover]").style.background=espacio.cover;
    nodo.querySelector("[data-slot=icon]").textContent =espacio.icon;
    nodo.querySelector("[data-slot=nombre]").textContent=espacio.nombre;
    nodo.querySelector("[data-slot=lugar]").textContent=espacio.lugar;
    nodo.querySelector("[data-slot=descripcion]").textContent=espacio.descripcion;
    nodo.querySelector("[data-slot=aforo]").textContent=espacio.aforo;

    const tagsWrap=nodo.querySelector("[data-slot=tags]");
    espacio.tags.forEach(tag=>{
        const pill=document.createElement("span");
        pill.className="px-2.5 py-1 rounded-full bg-gray text-gray-600 text-xs";
        pill.textContent=tag;
        tagsWrap.appendChild(pill);
});
return nodo;
}

function renderizarTarjetas(lista) {
    const grid=document.getElementById("espacios-grid");
    grid.innerHTML="";
    lista.forEach(espacio=>grid.appendChild(crearTarjeta(espacio)));
}

renderizarTarjetas(espacios);