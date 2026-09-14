import React from 'react';
import { exportToExcel, exportToPDF } from '../services/exportHelpers';
export default function Reports() {
    const [incidents] = React.useState([
        { id: 'INC-8942', dateTime: '2023-10-27 14:32', location: 'Zone C - Assembly', type: 'Equipment Failure', status: 'Critical' },
        { id: 'INC-8941', dateTime: '2023-10-27 10:15', location: 'Loading Bay 2', type: 'Safety Violation', status: 'Pending' },
        { id: 'INC-8940', dateTime: '2023-10-26 16:45', location: 'Chemical Storage', type: 'Spill Containment', status: 'Resolved' },
        { id: 'INC-8939', dateTime: '2023-10-26 09:10', location: 'Perimeter Fence North', type: 'Security Breach', status: 'Resolved' },
    ]);

    // Función que ejecutará los helpers
    const handleExport = (format) => {
        const fileName = `Reporte_Incidentes_${new Date().toISOString().slice(0, 10)}`;
        if (format === 'excel') {
            exportToExcel(incidents, fileName);
        } else if (format === 'pdf') {
            exportToPDF(incidents, fileName, 'Reporte de Incidentes');
        }
    };
    return (
        <main className="flex-1 overflow-y-auto p-gutter md:p-lg space-y-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
                <div>
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                        Reports & Incident Control
                    </h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
                        Comprehensive oversight and audit logs for plant operations.
                    </p>
                </div>
                <div className="flex items-center gap-sm">
                    <button className="flex items-center gap-xs px-md py-sm bg-surface-container text-on-surface font-label-md text-label-md rounded-DEFAULT border border-outline-variant hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        New Report
                    </button>
                </div>
            </div>

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
                            </span>
                        </div>
                    </div>

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
                                    onClick={() => handleExport('excel')}
                                    className="p-xs text-outline hover:text-primary border border-transparent hover:border-outline-variant rounded transition-all"
                                    title="Export"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface border-b-2 border-primary text-primary font-label-md text-label-md uppercase tracking-wider">
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
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-sm border-t border-outline-variant bg-surface flex justify-between items-center text-on-surface-variant font-label-md text-label-md">
                            <span>Showing 1-4 of 142 records</span>
                            <div className="flex gap-xs">
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors disabled:opacity-50">
                                    &lt;
                                </button>
                                <button className="px-2 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container transition-colors">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

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
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="flex-1 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md py-xs rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                                    PDF
                                </button>
                                <button 
                                    onClick={() => handleExport('excel')}
                                    className="flex-1 bg-surface-container text-primary border border-outline-variant font-label-md text-label-md py-xs rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-xs">
                                    <span className="material-symbols-outlined text-[16px]">grid_on</span>
                                    Excel
                                </button>
                            </div>
                            <button 
                                onClick={() => handleExport('pdf')}
                                className="w-full mt-sm bg-primary text-on-primary font-label-md text-label-md py-sm rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-xs shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                Generate Report
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col p-md">
                        <h4 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-sm">
                            Recent Exports
                        </h4>
                        <ul className="flex flex-col gap-xs">
                            <li className="flex items-center justify-between p-xs hover:bg-surface-container-low rounded cursor-pointer transition-colors border border-transparent hover:border-outline-variant">
                                <div className="flex items-center gap-xs">
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
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}