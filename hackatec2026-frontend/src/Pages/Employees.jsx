<<<<<<< HEAD
import { useEffect, useState } from 'react'
=======
import { useEffect, useRef, useState } from 'react'
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

const STATUS_COLORS = {
    'On Shift': 'bg-green-500',
    'Off Shift': 'bg-gray-400',
    'Pending Clearance': 'bg-orange-500',
}

<<<<<<< HEAD
=======
const EMPTY_FORM = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    rfc: '',
    fecha_ingreso: '',
    id_rol: '',
    id_planta_destino: '',
}

>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
export default function Employees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

<<<<<<< HEAD
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
=======
    // Add Employee modal state
    const [showAddModal, setShowAddModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [formError, setFormError] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Lookup data for id_rol / id_planta_destino selects
    const [roles, setRoles] = useState([])
    const [plantas, setPlantas] = useState([])

    // Search bar
    const [searchTerm, setSearchTerm] = useState('')

    // Excel import
    const fileInputRef = useRef(null)
    const [importing, setImporting] = useState(false)
    const [importSummary, setImportSummary] = useState(null)
    const [importError, setImportError] = useState(null)

    function fetchEmployees() {
        setLoading(true)
        setError(null)

        return fetch('/api/empleados') // ajusta si tu Express monta esta ruta con otro prefijo
            .then((res) => {
                if (!res.ok) throw new Error('No se pudo cargar la lista de empleados')
                return res.json()
            })
            .then((json) => setEmployees(Array.isArray(json) ? json : json.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    // Poblar los selects de Rol y Planta destino (ajusta las rutas si difieren)
    useEffect(() => {
        fetch('/api/roles')
            .then((res) => {
                if (!res.ok) throw new Error(`GET /api/roles -> ${res.status}`)
                return res.json()
            })
            .then((json) => setRoles(Array.isArray(json) ? json : json.data ?? []))
            .catch((err) => {
                console.error('No se pudieron cargar los roles:', err)
                setRoles([])
            })

        fetch('/api/plantas')
            .then((res) => {
                if (!res.ok) throw new Error(`GET /api/plantas -> ${res.status}`)
                return res.json()
            })
            .then((json) => setPlantas(Array.isArray(json) ? json : json.data ?? []))
            .catch((err) => {
                console.error('No se pudieron cargar las plantas:', err)
                setPlantas([])
            })
    }, [])

    function handleFormChange(e) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: name === 'rfc' ? value.toUpperCase() : value }))
    }

    function closeAddModal() {
        setShowAddModal(false)
        setForm(EMPTY_FORM)
        setFormError(null)
    }

    async function handleAddEmployee(e) {
        e.preventDefault()
        setFormError(null)

        if (!form.nombre.trim() || !form.rfc.trim() || !form.fecha_ingreso) {
            setFormError('Nombre, RFC y Fecha de ingreso son obligatorios.')
            return
        }

        setSubmitting(true)

        try {
            const payload = {
                nombre: form.nombre.trim(),
                apellido_paterno: form.apellido_paterno.trim() || null,
                apellido_materno: form.apellido_materno.trim() || null,
                telefono: form.telefono.trim() || null,
                rfc: form.rfc.trim(),
                fecha_ingreso: form.fecha_ingreso,
                id_rol: form.id_rol ? Number(form.id_rol) : null,
                id_planta_destino: form.id_planta_destino ? Number(form.id_planta_destino) : null,
            }

            const res = await fetch('/api/empleados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => null)
                throw new Error(body?.message || body?.error || 'No se pudo registrar el empleado')
            }

            const created = await res.json()
            const newEmployeeRaw = created?.data ?? created

            const roleId = newEmployeeRaw.id_rol != null ? Number(newEmployeeRaw.id_rol) : null
            const plantId = newEmployeeRaw.id_planta_destino != null ? Number(newEmployeeRaw.id_planta_destino) : null

            const roleName = roles.find((r) => Number(r.id ?? r.id_rol) === roleId)?.nombre
            const plantName = plantas.find((p) => Number(p.id ?? p.id_planta) === plantId)?.nombre_planta

            const newEmployee = {
                ...newEmployeeRaw,
                role: roleName || 'Sin rol asignado',
                plant: plantName || 'Sin planta asignada',
            }

            setEmployees((prev) => [newEmployee, ...prev])
            closeAddModal()
        } catch (err) {
            setFormError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleImportFile(e) {
        const file = e.target.files?.[0]
        e.target.value = '' // permite volver a elegir el mismo archivo si se corrige y reintenta

        if (!file) return

        setImporting(true)
        setImportError(null)
        setImportSummary(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/excel/import', {
                method: 'POST',
                body: formData,
            })

            const body = await res.json().catch(() => null)

            if (!res.ok || body?.success === false) {
                throw new Error(body?.error || 'No se pudo importar el archivo')
            }

            setImportSummary(body?.data ?? body)
            await fetchEmployees()
        } catch (err) {
            setImportError(err.message)
        } finally {
            setImporting(false)
        }
    }

    const filteredEmployees = employees.filter((employee) => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return true

        const haystack = [
            employee.name,
            employee.nombre,
            employee.apellido_paterno,
            employee.apellido_materno,
            employee.id,
            employee.id_empleado,
            employee.rfc,
            employee.role,
            employee.plant,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

        return haystack.includes(term)
    })

    return (
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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

<<<<<<< HEAD
                    <button className="h-12 px-5 rounded-xl bg-[#fc820c] hover:bg-[#e97808] transition-colors text-white font-semibold">
=======
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="h-12 px-5 rounded-xl border border-[#c5c6ce] bg-white hover:bg-[#f2f4f6] transition-colors font-semibold text-[#041632] disabled:opacity-60"
                    >
                        {importing ? 'Importando...' : 'Import Excel'}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportFile}
                        className="hidden"
                    />

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="h-12 px-5 rounded-xl bg-[#fc820c] hover:bg-[#e97808] transition-colors text-white font-semibold"
                    >
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                        Add Employee
                    </button>
                </div>
            </div>

<<<<<<< HEAD
=======
            {/* Import feedback */}
            {importSummary && (
                <div className="rounded-2xl border border-[#e0e3e5] bg-[#f7f9fb] px-5 py-4 text-sm text-[#041632]">
                    <p className="font-semibold">
                        Importación {importSummary.mode === 'dry-run' ? '(validación)' : ''} completa: {importSummary.success?.length ?? 0} de {importSummary.total ?? 0} filas importadas.
                    </p>

                    {importSummary.failed?.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-[#ba1a1a]">
                            {importSummary.failed.slice(0, 5).map((f) => (
                                <li key={f.row}>
                                    Fila {f.row} ({f.email}): {f.error}
                                </li>
                            ))}
                            {importSummary.failed.length > 5 && (
                                <li>...y {importSummary.failed.length - 5} más</li>
                            )}
                        </ul>
                    )}
                </div>
            )}

            {importError && (
                <div className="rounded-2xl border border-[#f3c2c2] bg-[#fdeeee] px-5 py-4 text-sm text-[#ba1a1a] font-medium">
                    {importError}
                </div>
            )}

>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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
<<<<<<< HEAD
=======
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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

<<<<<<< HEAD
                            {!loading && !error && employees.map((employee, index) => (
                                <tr
                                    key={employee.id}
=======
                            {!loading && !error && filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[#75777e]">
                                        {searchTerm.trim() ? 'No hay empleados que coincidan con la búsqueda.' : 'No hay empleados registrados.'}
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && filteredEmployees.map((employee, index) => (
                                <tr
                                    key={employee.id ?? employee.id_empleado}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                                    className={`border-b border-[#eceef0] hover:bg-[#d7e2ff]/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'
                                        }`}
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-[#191c1e]">
<<<<<<< HEAD
                                                {employee.name}
=======
                                                {employee.name ?? `${employee.nombre ?? ''} ${employee.apellido_paterno ?? ''}`.trim()}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
                                            </p>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-mono text-[#75777e]">
<<<<<<< HEAD
                                            {employee.id}
                                        </span>
                                    </TableCell>

                                    <TableCell>{employee.role}</TableCell>
                                    <TableCell>{employee.plant}</TableCell>
=======
                                            {employee.id ?? employee.id_empleado}
                                        </span>
                                    </TableCell>

                                    <TableCell>{employee.role ?? employee.id_rol}</TableCell>
                                    <TableCell>{employee.plant ?? employee.id_planta_destino}</TableCell>
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[employee.status] ?? 'bg-gray-400'}`}
                                            />

                                            <span className="font-semibold text-sm">
<<<<<<< HEAD
                                                {employee.status}
=======
                                                {employee.status ?? '—'}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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
<<<<<<< HEAD
=======

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-semibold text-[#041632]">Add Employee</h3>
                            <button
                                onClick={closeAddModal}
                                className="text-[#75777e] hover:text-[#041632] text-lg leading-none"
                                aria-label="Close"
                                type="button"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Nombre *" name="nombre" value={form.nombre} onChange={handleFormChange} required />
                                <Field label="Apellido paterno" name="apellido_paterno" value={form.apellido_paterno} onChange={handleFormChange} />
                                <Field label="Apellido materno" name="apellido_materno" value={form.apellido_materno} onChange={handleFormChange} />
                            </div>

                            <Field label="RFC *" name="rfc" value={form.rfc} onChange={handleFormChange} required maxLength={13} />

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Teléfono" name="telefono" value={form.telefono} onChange={handleFormChange} type="tel" />
                                <Field label="Fecha de ingreso *" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleFormChange} type="date" required />
                            </div>

                            <SelectField label="Rol" name="id_rol" value={form.id_rol} onChange={handleFormChange} options={roles} placeholder="Sin asignar" labelKey="descripcion" />

                            <SelectField label="Planta asignada" name="id_planta_destino" value={form.id_planta_destino} onChange={handleFormChange} options={plantas} placeholder="Sin asignar" />

                            {formError && (
                                <p className="text-sm text-[#ba1a1a]">{formError}</p>
                            )}

                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="h-11 px-5 rounded-xl border border-[#c5c6ce] hover:bg-[#f2f4f6] transition-colors font-semibold text-[#041632]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-11 px-5 rounded-xl bg-[#fc820c] hover:bg-[#e97808] disabled:opacity-60 transition-colors text-white font-semibold"
                                >
                                    {submitting ? 'Saving...' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
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
<<<<<<< HEAD
=======

function Field({ label, name, value, onChange, type = 'text', required = false, maxLength }) {
    return (
        <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#041632]">{label}</span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                maxLength={maxLength}
                className="h-11 rounded-xl border border-[#c5c6ce] bg-[#f7f9fb] px-3 outline-none focus:border-[#041632]"
            />
        </label>
    );
}

function SelectField({ label, name, value, onChange, options, placeholder, labelKey }) {
    return (
        <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[#041632]">{label}</span>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="h-11 rounded-xl border border-[#c5c6ce] bg-[#f7f9fb] px-3 outline-none focus:border-[#041632]"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => {
                    const optId = opt.id ?? opt.id_rol ?? opt.id_planta
                    const optLabel = (labelKey && opt[labelKey]) ?? opt.nombre ?? opt.nombre_planta ?? opt.name
                    return (
                        <option key={optId} value={optId}>
                            {optLabel}
                        </option>
                    )
                })}
            </select>
        </label>
    );
}
>>>>>>> c6ff33a76164ec989520315e224f2a0954ebeb10
