import { useEffect, useState } from 'react'

const STATUS_COLORS = {
    'On Shift': 'bg-green-500',
    'Off Shift': 'bg-gray-400',
    'Pending Clearance': 'bg-orange-500',
}

export default function Employees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

     useEffect(() => {
        fetch('/api/empleados') // ajusta si tu Express monta esta ruta con otro prefijo
            .then((res) => {
                if (!res.ok) throw new Error('No se pudo cargar la lista de empleados')
                return res.json()
                })
                .then((json) => setEmployees(Array.isArray(json) ? json : json.data))
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false))
        }, [])

     return (
        <main className="flex-grow p-lg flex flex-col gap-lg">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-[#041632] mb-2">
                        Employee Directory
                    </h1>

                    <p className="text-[#44474d]">
                        Manage plant personnel, roles and operational status.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="h-12 px-5 rounded-xl border border-[#c5c6ce] bg-white hover:bg-[#f2f4f6] transition-colors font-semibold text-[#041632]">
                        Export Roster
                    </button>

                    <button className="h-12 px-5 rounded-xl bg-[#fc820c] hover:bg-[#e97808] transition-colors text-white font-semibold">
                        Add Employee
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard title="Total Employees" value={loading ? '—' : String(employees.length)} />
                <KpiCard title="On Shift" value={loading ? '—' : String(employees.filter((e) => e.status === 'On Shift').length)} />
                <KpiCard title="Incidents" value={loading ? '—' : String(employees.filter((e) => e.status === 'Pending Clearance').length)} />
            </div>

            {/* Table */}
            <div className="bg-white border border-[#e0e3e5] rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#e0e3e5] flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-[#041632]">
                            Active Employees
                        </h3>
                    </div>

                    <input
                        type="text"
                        placeholder="Search employee..."
                        className="w-72 h-11 rounded-xl border border-[#c5c6ce] bg-[#f7f9fb] px-4 outline-none focus:border-[#041632]"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-[#f2f4f6] border-b border-[#e0e3e5]">
                            <tr>
                                <TableHead>Employee</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Plant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Check-In</TableHead>
                                <TableHead align="right">Actions</TableHead>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[#75777e]">
                                        Cargando empleados...
                                    </td>
                                </tr>
                            )}

                            {error && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[#ba1a1a]">
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && employees.map((employee, index) => (
                                <tr
                                    key={employee.id}
                                    className={`border-b border-[#eceef0] hover:bg-[#d7e2ff]/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'
                                        }`}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-[#191c1e]">
                                                {employee.name}
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-mono text-[#75777e]">
                                            {employee.id}
                                        </span>
                                    </TableCell>

                                    <TableCell>{employee.role}</TableCell>
                                    <TableCell>{employee.plant}</TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[employee.status] ?? 'bg-gray-400'}`}
                                            />

                                            <span className="font-semibold text-sm">
                                                {employee.status}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-[#44474d]">
                                            {employee.checkIn}
                                        </span>
                                    </TableCell>

                                    <TableCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button className="px-4 h-9 rounded-lg border border-[#c5c6ce] hover:bg-[#f2f4f6] transition-colors text-sm font-medium">
                                                View
                                            </button>

                                            <button className="px-4 h-9 rounded-lg bg-[#041632] hover:bg-[#1b2b48] transition-colors text-white text-sm font-medium">
                                                Details
                                            </button>
                                        </div>
                                    </TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

function KpiCard({ title, value }) {
    return (
        <div className="bg-white border border-[#e0e3e5] rounded-2xl p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.15em] text-[#75777e] mb-3 font-semibold">
                {title}
            </p>

            <h3 className="text-5xl font-bold text-[#041632]">{value}</h3>
        </div>
    );
}

function TableHead({ children, align = 'left' }) {
    return (
        <th
            className={`px-6 py-4 text-sm uppercase tracking-[0.08em] font-semibold text-[#041632] text-${align}`}
        >
            {children}
        </th>
    );
}

function TableCell({ children, align = 'left' }) {
    return (
        <td className={`px-6 py-5 text-${align} text-sm`}>
            {children}
        </td>
    );
}
