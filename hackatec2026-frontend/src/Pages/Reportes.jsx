<<<<<<< HEAD
import React from 'react';

// Subcomponente de Tarjeta de Métricas (KPI)
const MetricCard = ({ title, icon, value, badgeText, badgeType, iconColor = "text-outline" }) => {
    const badgeStyles = {
        error: "text-error",
        success: "text-[green]",
        neutral: "text-outline"
    };

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
            <div className="flex justify-between items-start mb-sm">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    {title}
                </span>
                {/* BLINDAJE: Los nombres de íconos de Material Symbols no se deben traducir */}
                <span 
                    translate="no"
                    className="material-symbols-outlined notranslate select-none ${iconColor}"
                    style={iconColor === "text-error" ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                    {icon}
                </span>
            </div>
            {/* BLINDAJE: Los valores numéricos/métricas no deben traducirse */}
            <div translate="no" className={`font-headline-lg text-headline-lg notranslate ${badgeType === 'error' ? 'text-error' : 'text-primary'}`}>
                {value}
            </div>
            <div className={`flex items-center mt-xs text-[12px] font-medium ${badgeStyles[badgeType]}`}>
                {badgeText}
            </div>
        </div>
    );
};

export default function Reports() {
    return (
        <main className="flex-1 overflow-y-auto p-gutter md:p-lg space-y-lg">
            {/* Encabezado / Acciones Principales */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
                <div>
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                        Reportes y Control de Incidencias
                    </h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
                        Supervisión integral y registros de auditoría para operaciones de planta.
=======
export default function Reports() {
    return (
        <main className="flex-1 overflow-y-auto p-gutter md:p-lg space-y-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
                <div>
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                        Reports & Incident Control
                    </h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
                        Comprehensive oversight and audit logs for plant operations.
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                    </p>
                </div>
                <div className="flex items-center gap-sm">
                    <button className="flex items-center gap-xs px-md py-sm bg-surface-container text-on-surface font-label-md text-label-md rounded-DEFAULT border border-outline-variant hover:bg-surface-container-high transition-colors">
<<<<<<< HEAD
                        <span translate="no" className="material-symbols-outlined notranslate text-sm">calendar_today</span>
                        Últimos 30 días
                    </button>
                    <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
                        <span translate="no" className="material-symbols-outlined notranslate text-sm">add</span>
                        Nuevo Reporte
=======
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New Report
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                    </button>
                </div>
            </div>

<<<<<<< HEAD
            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                
                {/* Fila de Tarjetas KPI */}
                <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-gutter">
                    <MetricCard 
                        title="Total de Incidencias"
                        icon="assignment_late"
                        value="142"
                        badgeType="error"
                        badgeText={
                            <>
                                <span translate="no" className="material-symbols-outlined notranslate text-[14px] mr-[2px]">trending_up</span>
                                <span translate="no" className="notranslate">+12%</span> vs mes anterior
                            </>
                        }
                    />
                    <MetricCard 
                        title="Abiertas Críticas"
                        icon="warning"
                        iconColor="text-error"
                        value="3"
                        badgeType="neutral"
                        badgeText="Requiere acción inmediata"
                    />
                    <MetricCard 
                        title="Tiempo Prom. Resolución"
                        icon="timer"
                        value="4.2h"
                        badgeType="success"
                        badgeText={
                            <>
                                <span translate="no" className="material-symbols-outlined notranslate text-[14px] mr-[2px]">trending_down</span>
                                <span translate="no" className="notranslate">-0.5h</span> vs mes anterior
                            </>
                        }
                    />
                    <MetricCard 
                        title="Auditorías Completadas"
                        icon="fact_check"
                        value="28"
                        badgeType="neutral"
                        badgeText="100% tasa de cumplimiento"
                    />
                </div>

                {/* Columna Izquierda: Gráfico y Tabla */}
                <div className="md:col-span-8 flex flex-col gap-gutter">
                    {/* Gráfico de Tendencias */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col h-[300px]">
                        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary">
                                Análisis de Tendencia de Incidencias
                            </h3>
                            <button className="p-xs text-outline hover:text-primary transition-colors" aria-label="Más opciones">
                                <span translate="no" className="material-symbols-outlined notranslate text-base">more_vert</span>
                            </button>
                        </div>
                        <div className="flex-1 p-md flex items-center justify-center bg-surface-container-low relative">
                            <span className="text-on-surface-variant font-label-md text-label-md bg-surface-container-lowest px-sm py-xs rounded border border-outline-variant opacity-80 z-10">
                                Vista del Gráfico Interactivo
=======
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                <div className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-gutter">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
                        <div className="flex justify-between items-start mb-sm">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                                Total Incidents
                            </span>
                            <span className="material-symbols-outlined text-outline">assignment_late</span>
                        </div>
                        <div className="font-headline-lg text-headline-lg text-primary">142</div>
                        <div className="flex items-center mt-xs text-[12px] text-error font-medium">
                            <span className="material-symbols-outlined text-[14px] mr-[2px]">trending_up</span>
                            +12% vs last month
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
                        <div className="flex justify-between items-start mb-sm">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                                Critical Open
                            </span>
                            <span
                                className="material-symbols-outlined text-error"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                warning
                            </span>
                        </div>
                        <div className="font-headline-lg text-headline-lg text-error">3</div>
                        <div className="flex items-center mt-xs text-[12px] text-outline font-medium">
                            Requires immediate action
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
                        <div className="flex justify-between items-start mb-sm">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                                Avg Resolution Time
                            </span>
                            <span className="material-symbols-outlined text-outline">timer</span>
                        </div>
                        <div className="font-headline-lg text-headline-lg text-primary">4.2h</div>
                        <div className="flex items-center mt-xs text-[12px] text-[green] font-medium">
                            <span className="material-symbols-outlined text-[14px] mr-[2px]">trending_down</span>
                            -0.5h vs last month
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm">
                        <div className="flex justify-between items-start mb-sm">
                            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                                Audits Completed
                            </span>
                            <span className="material-symbols-outlined text-outline">fact_check</span>
                        </div>
                        <div className="font-headline-lg text-headline-lg text-primary">28</div>
                        <div className="flex items-center mt-xs text-[12px] text-outline font-medium">
                            100% compliance rate
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-8 flex flex-col gap-gutter">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col h-[300px]">
                        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary">
                                Incident Trend Analysis
                            </h3>
                            <button className="p-xs text-outline hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                        </div>
                        <div className="flex-1 p-md flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXRoPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjxwYXRoIGQ9Ik0gMCAyMDAgUTEwMCAxNTAgMjAwIDE4MCBUNDAwIDEwMCBUNjAwIDE1MCBUODAwIDgwIFQxMDAwIDEyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDQxNjMyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==')] bg-cover bg-center">
                            <span className="text-on-surface-variant font-label-md text-label-md bg-surface-container-lowest px-sm py-xs rounded border border-outline-variant opacity-80">
                                Interactive Chart View
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                            </span>
                        </div>
                    </div>

<<<<<<< HEAD
                    {/* Tabla de Registro de Incidencias */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary">Bitácora de Control de Incidencias</h3>
                            <div className="flex gap-xs">
                                <button className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all" aria-label="Filtrar incidencias">
                                    <span translate="no" className="material-symbols-outlined notranslate text-sm">filter_list</span>
                                </button>
                                <button className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all" aria-label="Exportar registros">
                                    <span translate="no" className="material-symbols-outlined notranslate text-sm">download</span>
=======
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary">Incident Control Log</h3>
                            <div className="flex gap-xs">
                                <button
                                    className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all"
                                    title="Filter"
                                >
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                </button>
                                <button
                                    className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all"
                                    title="Export"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface border-b-2 border-primary text-primary font-label-md text-label-md uppercase tracking-wider">
<<<<<<< HEAD
                                        {/* BLINDAJE: ID es un término/acrónimo estándar */}
                                        <th translate="no" className="p-sm pl-md font-semibold notranslate">ID</th>
                                        <th className="p-sm font-semibold">Fecha y Hora</th>
                                        <th className="p-sm font-semibold">Ubicación</th>
                                        <th className="p-sm font-semibold">Tipo</th>
                                        <th className="p-sm font-semibold">Estado</th>
                                        <th className="p-sm pr-md font-semibold text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                                    <tr className="hover:bg-surface-container-low transition-colors">
                                        {/* BLINDAJE: Código del ticket/incidencia */}
                                        <td translate="no" className="p-sm pl-md font-code-md text-primary font-medium notranslate">INC-8942</td>
                                        {/* BLINDAJE: Marcas de tiempo de log */}
                                        <td translate="no" className="p-sm whitespace-nowrap text-on-surface-variant notranslate">2023-10-27 14:32</td>
                                        <td className="p-sm">Zona C - Ensamblaje</td>
                                        <td className="p-sm">Falla de Equipo</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-error-container text-on-error-container border border-error">
                                                <span className="w-1.5 h-1.5 rounded-full bg-error mr-1"></span>
                                                Crítica
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">Ver</button>
                                        </td>
                                    </tr>
                                    <tr className="bg-surface hover:bg-surface-container-low transition-colors">
                                        <td translate="no" className="p-sm pl-md font-code-md text-primary font-medium notranslate">INC-8941</td>
                                        <td translate="no" className="p-sm whitespace-nowrap text-on-surface-variant notranslate">2023-10-27 10:15</td>
                                        <td className="p-sm">Andén de Carga 2</td>
                                        <td className="p-sm">Violación de Seguridad</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-high text-on-surface-variant border border-outline">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
                                                Pendiente
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">Ver</button>
=======
                                        <th className="p-sm pl-md font-semibold">ID</th>
                                        <th className="p-sm font-semibold">Date & Time</th>
                                        <th className="p-sm font-semibold">Location</th>
                                        <th className="p-sm font-semibold">Type</th>
                                        <th className="p-sm font-semibold">Status</th>
                                        <th className="p-sm pr-md font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-md text-body-md text-on-surface">
                                    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                        <td className="p-sm pl-md font-code-md text-primary font-medium">INC-8942</td>
                                        <td className="p-sm whitespace-nowrap text-on-surface-variant">2023-10-27 14:32</td>
                                        <td className="p-sm">Zone C - Assembly</td>
                                        <td className="p-sm">Equipment Failure</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-error-container text-on-error-container border border-error">
                                                <span className="w-1.5 h-1.5 rounded-full bg-error mr-1"></span>
                                                Critical
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="bg-surface hover:bg-surface-container-low transition-colors border-b border-outline-variant">
                                        <td className="p-sm pl-md font-code-md text-primary font-medium">INC-8941</td>
                                        <td className="p-sm whitespace-nowrap text-on-surface-variant">2023-10-27 10:15</td>
                                        <td className="p-sm">Loading Bay 2</td>
                                        <td className="p-sm">Safety Violation</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-high text-on-surface-variant border border-outline">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[orange] mr-1"></span>
                                                Pending
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                        <td className="p-sm pl-md font-code-md text-primary font-medium">INC-8940</td>
                                        <td className="p-sm whitespace-nowrap text-on-surface-variant">2023-10-26 16:45</td>
                                        <td className="p-sm">Chemical Storage</td>
                                        <td className="p-sm">Spill Containment</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-highest text-on-surface border border-outline-variant">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[green] mr-1"></span>
                                                Resolved
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="bg-surface hover:bg-surface-container-low transition-colors border-b border-outline-variant">
                                        <td className="p-sm pl-md font-code-md text-primary font-medium">INC-8939</td>
                                        <td className="p-sm whitespace-nowrap text-on-surface-variant">2023-10-26 09:10</td>
                                        <td className="p-sm">Perimeter Fence North</td>
                                        <td className="p-sm">Security Breach</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-highest text-on-surface border border-outline-variant">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[green] mr-1"></span>
                                                Resolved
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">
                                                View
                                            </button>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
<<<<<<< HEAD
                        {/* Paginación */}
                        <div className="p-sm border-t border-outline-variant bg-surface flex justify-between items-center text-on-surface-variant font-label-md text-label-md">
                            <span>Mostrando 1-4 de 142 registros</span>
                            <div className="flex gap-xs">
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors disabled:opacity-50" aria-label="Página anterior">&lt;</button>
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors" aria-label="Página siguiente">&gt;</button>
=======
                        <div className="p-sm border-t border-outline-variant bg-surface flex justify-between items-center text-on-surface-variant font-label-md text-label-md">
                            <span>Showing 1-4 of 142 records</span>
                            <div className="flex gap-xs">
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors disabled:opacity-50">
                                    &lt;
                                </button>
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                    &gt;
                                </button>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                            </div>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                {/* Columna Derecha: Generador de Reportes y Exportaciones Recientes */}
                <div className="md:col-span-4 flex flex-col gap-gutter">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col">
                        <div className="px-md py-sm border-b border-outline-variant bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                <span translate="no" className="material-symbols-outlined notranslate text-base">description</span>
                                Generador de Reportes
                            </h3>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()} className="p-md flex flex-col gap-sm">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="report-type">
                                    Tipo de Reporte
                                </label>
                                <select id="report-type" className="bg-surface border border-outline-variant rounded p-xs font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none">
                                    <option>Auditoría Integral</option>
                                    <option>Resumen de Incidencias</option>
                                    <option>Lista de Verificación de Cumplimiento</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-xs mt-sm">
                                <span className="font-label-md text-label-md text-on-surface-variant">Rango de Fechas</span>
                                <div className="grid grid-cols-2 gap-sm">
                                    <input aria-label="Fecha Inicial" className="bg-surface border border-outline-variant rounded p-xs font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none" type="date" />
                                    <input aria-label="Fecha Final" className="bg-surface border border-outline-variant rounded p-xs font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none" type="date" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-xs mt-sm mb-md">
                                <span className="font-label-md text-label-md text-on-surface-variant">Incluir Secciones</span>
                                <div className="flex flex-col gap-1">
                                    {["Resumen Ejecutivo", "Bitácora Detallada de Incidencias", "Métricas de Tiempo de Resolución"].map((section, idx) => (
                                        <label key={idx} className="flex items-center gap-xs font-body-md text-body-md text-on-surface cursor-pointer">
                                            <input defaultChecked={idx < 2} className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                                            {section}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-sm mt-auto pt-sm border-t border-outline-variant">
                                {/* BLINDAJE: Formatos de exportación (PDF, Excel) */}
                                <button type="button" className="flex-1 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md py-xs rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                                    <span translate="no" className="material-symbols-outlined notranslate text-sm">picture_as_pdf</span> 
                                    <span translate="no" className="notranslate">PDF</span>
                                </button>
                                <button type="button" className="flex-1 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md py-xs rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                                    <span translate="no" className="material-symbols-outlined notranslate text-sm">grid_on</span> 
                                    <span translate="no" className="notranslate">Excel</span>
                                </button>
                            </div>
                            <button type="submit" className="w-full mt-sm bg-primary text-on-primary font-label-md text-label-md py-sm rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-xs shadow-sm">
                                <span translate="no" className="material-symbols-outlined notranslate text-sm">play_arrow</span>
                                Generar Reporte
                            </button>
                        </form>
=======
                <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col">
                        <div className="px-md py-sm border-b border-outline-variant bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[20px]">description</span>
                                Report Generator
                            </h3>
                        </div>
                        <div className="p-md flex flex-col gap-sm">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-on-surface-variant">
                                    Report Type
                                </label>
                                <select className="bg-surface border border-outline-variant rounded p-xs font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none">
                                    <option>Comprehensive Audit</option>
                                    <option>Incident Summary</option>
                                    <option>Compliance Checklist</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-xs mt-sm">
                                <label className="font-label-md text-label-md text-on-surface-variant">
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-sm">
                                    <input
                                        className="bg-surface border border-outline-variant rounded p-xs font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none"
                                        type="date"
                                    />
                                    <input
                                        className="bg-surface border border-outline-variant rounded p-xs font-body-md text-body-md text-on-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none"
                                        type="date"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-xs mt-sm mb-md">
                                <label className="font-label-md text-label-md text-on-surface-variant">
                                    Include Sections
                                </label>
                                <div className="flex flex-col gap-1">
                                    <label className="flex items-center gap-xs font-body-md text-body-md text-on-surface cursor-pointer">
                                        <input
                                            defaultChecked
                                            className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                            type="checkbox"
                                        />
                                        Executive Summary
                                    </label>
                                    <label className="flex items-center gap-xs font-body-md text-body-md text-on-surface cursor-pointer">
                                        <input
                                            defaultChecked
                                            className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                            type="checkbox"
                                        />
                                        Detailed Incident Logs
                                    </label>
                                    <label className="flex items-center gap-xs font-body-md text-body-md text-on-surface cursor-pointer">
                                        <input
                                            className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                                            type="checkbox"
                                        />
                                        Resolution Time Metrics
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-sm mt-auto pt-sm border-t border-outline-variant">
                                <button className="flex-1 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md py-xs rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                    PDF
                                </button>
                                <button className="flex-1 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md py-xs rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                                    <span className="material-symbols-outlined text-[16px]">grid_on</span>
                                    Excel
                                </button>
                            </div>
                            <button className="w-full mt-sm bg-primary text-on-primary font-label-md text-label-md py-sm rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-xs shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                Generate Report
                            </button>
                        </div>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col p-md">
                        <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-sm">
<<<<<<< HEAD
                            Exportaciones Recientes
=======
                            Recent Exports
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                        </h4>
                        <ul className="flex flex-col gap-xs">
                            <li className="flex items-center justify-between p-xs hover:bg-surface-container-low rounded cursor-pointer transition-colors border border-transparent hover:border-outline-variant">
                                <div className="flex items-center gap-xs">
<<<<<<< HEAD
                                    <span translate="no" className="material-symbols-outlined notranslate text-error text-sm">picture_as_pdf</span>
                                    {/* BLINDAJE: Nombres de archivo */}
                                    <span translate="no" className="font-body-md text-body-md text-on-surface notranslate">Oct_Cumplimiento_v2.pdf</span>
                                </div>
                                <span className="font-label-md text-label-md text-outline">Hace 2h</span>
=======
                                    <span className="material-symbols-outlined text-error text-[18px]">
                                        picture_as_pdf
                                    </span>
                                    <span className="font-body-md text-body-md text-on-surface">
                                        Oct_Compliance_v2.pdf
                                    </span>
                                </div>
                                <span className="font-label-md text-label-md text-outline">2h ago</span>
                            </li>
                            <li className="flex items-center justify-between p-xs hover:bg-surface-container-low rounded cursor-pointer transition-colors border border-transparent hover:border-outline-variant">
                                <div className="flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[green] text-[18px]">
                                        grid_on
                                    </span>
                                    <span className="font-body-md text-body-md text-on-surface">
                                        Incident_Log_Q3.xlsx
                                    </span>
                                </div>
                                <span className="font-label-md text-label-md text-outline">1d ago</span>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                            </li>
                        </ul>
                    </div>
                </div>
<<<<<<< HEAD

=======
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
            </div>
        </main>
    );
}