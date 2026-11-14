function EdificiosPage({ edificios, cargando, error, onReintentar }) {
  if (cargando) {
    return <p role="status" className="py-16 text-center text-gray-600">Cargando edificios...</p>;
  }

  if (error) {
    return (
      <section role="alert" className="py-10 text-center bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={onReintentar} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reintentar</button>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#263762]">Edificios</h1>
        <p className="mt-1 text-gray-600">Consulta las salas de cada edificio y su estado de uso actual.</p>
      </header>
      {edificios.length === 0 ? (
        <p role="status" className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-600">No hay edificios registrados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {edificios.map((edificio) => (
            <article key={edificio.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{edificio.nombre}</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">{edificio.codigo}</span>
              </div>
              <p className="mb-4 text-sm text-gray-600">{edificio.ubicacion || "Ubicación no especificada"}</p>
              <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-green-800">{edificio.espacios_libres} libres</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{edificio.espacios_en_uso} en uso</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">{edificio.total_espacios} salas</span>
              </div>
              <div className="space-y-2 border-t border-gray-100 pt-4">
                {edificio.espacios.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 px-3 py-4 text-sm text-gray-500">Este edificio no tiene salas registradas.</p>
                ) : (
                  edificio.espacios.map((espacio) => {
                    const estado = espacio.en_uso
                      ? { texto: "En uso", estilo: "bg-amber-50 text-amber-800" }
                      : espacio.disponible
                        ? { texto: "Libre", estilo: "bg-green-50 text-green-800" }
                        : { texto: "No disponible", estilo: "bg-gray-100 text-gray-600" };

                    return (
                      <div key={espacio.id} className="flex min-w-0 items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-medium text-gray-900">{espacio.nombre}</h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {espacio.tipo.replace("_", " ")} · {espacio.capacidad} personas
                            {espacio.ubicacion ? ` · ${espacio.ubicacion}` : ""}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${estado.estilo}`}>
                          {estado.texto}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default EdificiosPage;
