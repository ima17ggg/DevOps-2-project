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
                <span 
                    translate="no"
                    className="material-symbols-outlined notranslate select-none"
                    style={iconColor === "text-error" ? { fontVariationSettings: "'FILL' 1", color: "var(--error)" } : { color: "var(--outline)" }}
                >
                    {icon}
                </span>
            </div>
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
                    </p>
                </div>
                <div className="flex items-center gap-sm">
                    <button className="flex items-center gap-xs px-md py-sm bg-surface-container text-on-surface font-label-md text-label-md rounded-DEFAULT border border-outline-variant hover:bg-surface-container-high transition-colors">
                        <span translate="no" className="material-symbols-outlined notranslate text-[18px]">calendar_today</span>
                        Últimos 30 días
                    </button>
                    <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
                        <span translate="no" className="material-symbols-outlined notranslate text-[18px]">add</span>
                        Nuevo Reporte
                    </button>
                </div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                
                {/* Fila de Tarjetas KPI */}
                <div className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-gutter">
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
                <div className="col-span-1 md:col-span-8 flex flex-col gap-gutter">
                    {/* Gráfico de Tendencias */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col h-[300px]">
                        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary">
                                Análisis de Tendencia de Incidencias
                            </h3>
                            <button className="p-xs text-outline hover:text-primary transition-colors" aria-label="Más opciones">
                                <span translate="no" className="material-symbols-outlined notranslate text-[20px]">more_vert</span>
                            </button>
                        </div>
                        <div className="flex-1 p-md flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJu idPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXRoPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjxwYXRoIGQ9Ik0gMCAyMDAgUTEwMCAxNTAgMjAwIDE4MCBUNDAwIDEwMCBUNjAwIDE1MCBUODAwIDgwIFQxMDAwIDEyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDQxNjMyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==')] bg-cover bg-center relative">
                            <span className="text-on-surface-variant font-label-md text-label-md bg-surface-container-lowest px-sm py-xs rounded border border-outline-variant opacity-80 z-10">
                                Vista del Gráfico Interactivo
                            </span>
                        </div>
                    </div>

                    {/* Tabla de Registro de Incidencias */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary">Bitácora de Control de Incidencias</h3>
                            <div className="flex gap-xs">
                                <button className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all" aria-label="Filtrar incidencias">
                                    <span translate="no" className="material-symbols-outlined notranslate text-[18px]">filter_list</span>
                                </button>
                                <button className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all" aria-label="Exportar registros">
                                    <span translate="no" className="material-symbols-outlined notranslate text-[18px]">download</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface border-b-2 border-primary text-primary font-label-md text-label-md uppercase tracking-wider">
                                        <th translate="no" className="p-sm pl-md font-semibold notranslate">ID</th>
                                        <th className="p-sm font-semibold">Fecha y Hora</th>
                                        <th className="p-sm font-semibold">Ubicación</th>
                                        <th className="p-sm font-semibold">Tipo</th>
                                        <th className="p-sm font-semibold">Estado</th>
                                        <th className="p-sm pr-md font-semibold text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-md text-body-md text-on-surface">
                                    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                        <td translate="no" className="p-sm pl-md font-code-md text-primary font-medium notranslate">INC-8942</td>
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
                                    <tr className="bg-surface hover:bg-surface-container-low transition-colors border-b border-outline-variant">
                                        <td translate="no" className="p-sm pl-md font-code-md text-primary font-medium notranslate">INC-8941</td>
                                        <td translate="no" className="p-sm whitespace-nowrap text-on-surface-variant notranslate">2023-10-27 10:15</td>
                                        <td className="p-sm">Andén de Carga 2</td>
                                        <td className="p-sm">Violación de Seguridad</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-high text-on-surface-variant border border-outline">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[orange] mr-1"></span>
                                                Pendiente
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">Ver</button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                        <td translate="no" className="p-sm pl-md font-code-md text-primary font-medium notranslate">INC-8940</td>
                                        <td translate="no" className="p-sm whitespace-nowrap text-on-surface-variant notranslate">2023-10-26 16:45</td>
                                        <td className="p-sm">Almacén de Químicos</td>
                                        <td className="p-sm">Contención de Derrames</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-highest text-on-surface border border-outline-variant">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[green] mr-1"></span>
                                                Resuelto
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">Ver</button>
                                        </td>
                                    </tr>
                                    <tr className="bg-surface hover:bg-surface-container-low transition-colors border-b border-outline-variant">
                                        <td translate="no" className="p-sm pl-md font-code-md text-primary font-medium notranslate">INC-8939</td>
                                        <td translate="no" className="p-sm whitespace-nowrap text-on-surface-variant notranslate">2023-10-26 09:10</td>
                                        <td className="p-sm">Cerca Perimetral Norte</td>
                                        <td className="p-sm">Brecha de Seguridad</td>
                                        <td className="p-sm">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-surface-container-highest text-on-surface border border-outline-variant">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[green] mr-1"></span>
                                                Resuelto
                                            </span>
                                        </td>
                                        <td className="p-sm pr-md text-right">
                                            <button className="text-tertiary hover:text-secondary-container font-label-md text-label-md underline">Ver</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {/* Paginación */}
                        <div className="p-sm border-t border-outline-variant bg-surface flex justify-between items-center text-on-surface-variant font-label-md text-label-md">
                            <span>Mostrando 1-4 de 142 registros</span>
                            <div className="flex gap-xs">
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors disabled:opacity-50" aria-label="Página anterior">
                                    &lt;
                                </button>
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors" aria-label="Página siguiente">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Generador de Reportes */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col">
                        <div className="px-md py-sm border-b border-outline-variant bg-surface">
                            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-xs">
                                <span translate="no" className="material-symbols-outlined notranslate text-[18px]">description</span>
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

                            <button className="mt-md w-full py-sm bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm text-center">
                                Generar Exportación
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </main>
    );
}