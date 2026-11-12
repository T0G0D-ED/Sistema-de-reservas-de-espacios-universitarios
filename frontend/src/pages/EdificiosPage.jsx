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
        <p className="mt-1 text-gray-600">Edificios registrados y disponibilidad de sus espacios.</p>
      </header>
      {edificios.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-600">No hay edificios registrados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {edificios.map((edificio) => (
            <article key={edificio.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{edificio.nombre}</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">{edificio.codigo}</span>
              </div>
              <p className="mb-5 text-sm text-gray-600">{edificio.ubicacion || "Ubicación no especificada"}</p>
              <div className="flex justify-between border-t border-gray-100 pt-4 text-sm">
                <span className="text-gray-600">Espacios</span>
                <strong className="text-gray-900">{edificio.espacios_disponibles} disponibles / {edificio.total_espacios}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default EdificiosPage;
