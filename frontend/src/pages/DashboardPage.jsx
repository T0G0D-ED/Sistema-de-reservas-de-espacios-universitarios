function DashboardPage({ datos, cargando, error, onReintentar }) {
  if (cargando) {
    return <p role="status" className="py-16 text-center text-gray-600">Cargando utilización...</p>;
  }

  if (error) {
    return (
      <section role="alert" className="py-10 text-center bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={onReintentar} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Reintentar</button>
      </section>
    );
  }

  if (!datos) return null;

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#263762]">Dashboard de utilización</h1>
        <p className="mt-1 text-gray-600">Reservas pendientes o aprobadas durante los últimos {datos.periodoDias} días.</p>
      </header>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Espacios disponibles</p>
          <p className="mt-2 text-3xl font-bold text-[#263762]">{datos.resumen.espacios}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Reservas activas</p>
          <p className="mt-2 text-3xl font-bold text-[#263762]">{datos.resumen.reservasActivas}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">Horas reservadas</p>
          <p className="mt-2 text-3xl font-bold text-[#263762]">{datos.resumen.horasReservadas}</p>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Utilización por edificio</h2>
          {datos.porEdificio.length === 0 ? (
            <p className="p-5 text-sm text-gray-600">No hay edificios con espacios disponibles.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr><th className="px-5 py-3">Edificio</th><th className="px-5 py-3">Espacios</th><th className="px-5 py-3">Reservas</th><th className="px-5 py-3">Horas</th></tr>
                </thead>
                <tbody>
                  {datos.porEdificio.map((edificio) => (
                    <tr key={edificio.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-900">{edificio.nombre}</td>
                      <td className="px-5 py-3">{edificio.espacios}</td>
                      <td className="px-5 py-3">{edificio.reservasActivas}</td>
                      <td className="px-5 py-3">{edificio.horasReservadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">Utilización por espacio</h2>
          {datos.espacios.length === 0 ? (
            <p className="p-5 text-sm text-gray-600">No hay espacios disponibles.</p>
          ) : (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 text-gray-600">
                  <tr><th className="px-5 py-3">Espacio</th><th className="px-5 py-3">Edificio</th><th className="px-5 py-3">Reservas</th><th className="px-5 py-3">Horas</th></tr>
                </thead>
                <tbody>
                  {datos.espacios.map((espacio) => (
                    <tr key={espacio.id} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-900">{espacio.nombre}</td>
                      <td className="px-5 py-3">{espacio.edificioNombre}</td>
                      <td className="px-5 py-3">{espacio.reservasActivas}</td>
                      <td className="px-5 py-3">{espacio.horasReservadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default DashboardPage;
