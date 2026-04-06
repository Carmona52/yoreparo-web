// pages/index.js o app/page.js (según la versión de Next.js)
export default function Home() {
    // Datos de ejemplo para los trabajos activos/pendientes
    const activeJobs = [
        { id: 1, name: "Remodelación Cocina", client: "Familia García", status: "activo", date: "2025-03-20" },
        { id: 2, name: "Instalación Eléctrica", client: "Oficinas Centrales", status: "pendiente", date: "2025-03-25" },
        { id: 3, name: "Pintura Exterior", client: "Residencial Los Pinos", status: "activo", date: "2025-03-18" },
        { id: 4, name: "Reparación de Techo", client: "Casa Martínez", status: "pendiente", date: "2025-03-28" },
    ];

    // Datos de ejemplo para empleados con herramientas prestadas
    const employeesWithTools = [
        { id: 1, name: "Carlos Méndez", tool: "Taladro percutor", borrowedDate: "2025-03-15" },
        { id: 2, name: "Lucía Fernández", tool: "Sierra circular", borrowedDate: "2025-03-16" },
        { id: 3, name: "Roberto Díaz", tool: "Compresor de aire", borrowedDate: "2025-03-14" },
        { id: 4, name: "Ana Ramírez", tool: "Lijadora eléctrica", borrowedDate: "2025-03-17" },
    ];

    // Datos de ejemplo para trabajos terminados
    const finishedJobs = [
        { id: 1, name: "Construcción Terraza", client: "Edificio Alfa", completionDate: "2025-03-10" },
        { id: 2, name: "Cambio de Ventanas", client: "Casa Torres", completionDate: "2025-03-05" },
        { id: 3, name: "Impermeabilización", client: "Bodega Norte", completionDate: "2025-02-28" },
        { id: 4, name: "Instalación de Aire Acond.", client: "Consultorio Médico", completionDate: "2025-03-01" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ===================== MENÚ LATERAL ===================== */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl">
                <div className="p-5 border-b border-slate-700">
                    <h1 className="text-2xl font-bold tracking-tight">Yo Reparo</h1>
                </div>

                <div className="p-4 border-t border-slate-700 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                            <span className="text-sm">👤</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Jesús Enrique Carmona Lezama.</p>
                            <p className="text-xs">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ===================== CONTENIDO PRINCIPAL ===================== */}
            <main className="flex-1 overflow-y-auto p-6">
                {/* Encabezado */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Panel de Control</h2>
                    <p className="text-gray-500 mt-1">Resumen de obras, personal y herramientas</p>
                </div>

                {/* Grid de 3 columnas responsivo */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tarjeta: Trabajos Activos / Pendientes */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-amber-500 px-5 py-3">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <span>⏳</span> Últimos trabajos activos / pendientes
                            </h3>
                        </div>
                        <div className="p-4 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                            {activeJobs.map((job) => (
                                <div key={job.id} className="py-3 flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-800">{job.name}</p>
                                        <p className="text-sm text-gray-500">{job.client}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(job.date).toLocaleDateString("es-MX")}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            job.status === "activo"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                    {job.status === "activo" ? "Activo" : "Pendiente"}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tarjeta: Empleados con herramientas prestadas */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-blue-600 px-5 py-3">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <span>🛠️</span> Empleados con herramientas prestadas
                            </h3>
                        </div>
                        <div className="p-4 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                            {employeesWithTools.map((emp) => (
                                <div key={emp.id} className="py-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-800">{emp.name}</p>
                                        <span className="text-xs text-gray-500">
                      {new Date(emp.borrowedDate).toLocaleDateString("es-MX")}
                    </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                        <span className="text-blue-500">🔧</span> {emp.tool}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tarjeta: Trabajos ya terminados */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-emerald-600 px-5 py-3">
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <span>✅</span> Trabajos terminados
                            </h3>
                        </div>
                        <div className="p-4 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                            {finishedJobs.map((job) => (
                                <div key={job.id} className="py-3 flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-800">{job.name}</p>
                                        <p className="text-sm text-gray-500">{job.client}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {new Date(job.completionDate).toLocaleDateString("es-MX")}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pie de página opcional (solo estético) */}
                <div className="mt-8 text-center text-gray-400 text-xs border-t pt-4">
                    Panel de contratista — Datos actualizados al {new Date().toLocaleDateString("es-MX")}
                </div>
            </main>
        </div>
    );
}
