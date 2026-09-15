import { useNavigate } from 'react-router-dom'

export default function Attendance() {
  const navigate = useNavigate()

  const handleCheckIn = () => {
    navigate('/checkin')
  }

  const handleCheckOut = () => {
    navigate('/checkout')
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-gutter h-16 shrink-0 z-50">
        <div className="flex items-center gap-sm">
          {/* Blindaje de ícono */}
          <span
            translate="no"
            className="material-symbols-outlined notranslate text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            factory
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary" translate="no">
            Industrial Ops
          </span>
        </div>
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs bg-surface-container-low px-sm py-xs rounded-full border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            <span className="font-label-md text-label-md text-on-surface-variant">System Online</span>
          </div>
          <button className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-sm rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            {/* Blindaje de ícono */}
            <span className="material-symbols-outlined notranslate" data-icon="help" translate="no">
              help
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-container-max mx-auto px-gutter py-xl flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl text-center mb-xl">
          <h1 className="font-headline-lg text-headline-lg mb-sm text-primary">
            Attendance & Access Control
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Please select your current action to register your time or finalize your operational shift.
            Ensure your badge is ready for scanning.
          </p>
        </div>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-lg">
          <button
            className="group relative flex flex-col items-center justify-center text-center p-xl bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-primary transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-fixed-dim focus:border-primary overflow-hidden"
            onClick={handleCheckIn}
            type="button"
          >
            <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-tertiary-fixed flex items-center justify-center mb-md group-hover:scale-110 transition-transform duration-300">
                {/* Blindaje de ícono */}
                <span
                  translate="no"
                  className="material-symbols-outlined notranslate text-tertiary-container text-5xl"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  qr_code_scanner
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mb-xs group-hover:text-tertiary-container transition-colors">
                Registro de Entrada
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Inicia tu turno escaneando tu código
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary-container transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <button
            className="group relative flex flex-col items-center justify-center text-center p-xl bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-secondary transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-secondary-fixed-dim focus:border-secondary overflow-hidden"
            onClick={handleCheckOut}
            type="button"
          >
            <div className="absolute inset-0 bg-secondary-container/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-secondary-fixed flex items-center justify-center mb-md group-hover:scale-110 transition-transform duration-300">
                {/* Blindaje de ícono */}
                <span
                  translate="no"
                  className="material-symbols-outlined notranslate text-secondary-container text-5xl"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  logout
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mb-xs group-hover:text-secondary-container transition-colors">
                Finalizar y Checkout
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Registra tu salida y actividades
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary-container transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>
        <div className="mt-xl pt-lg border-t border-outline-variant w-full max-w-4xl text-center">
          <p className="font-label-md text-label-md text-on-surface-variant">
            Secure Industrial Access Terminal A-04 • Last sync: Just now
          </p>
        </div>
      </main>
    </div>
  )
}