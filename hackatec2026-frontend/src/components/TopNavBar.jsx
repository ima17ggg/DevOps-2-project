export default function TopNavBar() {
  return (
    <header className="bg-surface-container-lowest text-primary border-b border-outline-variant flex justify-between items-center h-16 px-gutter sticky top-0 w-full z-10">
      <div className="flex items-center gap-xl flex-1">
        <span className="font-headline-sm text-headline-sm font-black text-primary">Workforce Manager</span>
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-xs pl-xl pr-md font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Search Records"
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <button className="text-on-surface-variant hover:text-secondary-container transition-colors p-xs rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-secondary-container transition-colors p-xs rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <button className="border border-primary text-primary font-label-md text-label-md py-xs px-md rounded-lg hover:bg-surface-container transition-colors ml-sm">
          Search Records
        </button>
        <div className="h-8 w-px bg-outline-variant mx-sm"></div>
        <img
          alt="Manager Profile"
          className="w-10 h-10 rounded-full border border-outline-variant object-cover cursor-pointer"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJCFh5oOduA4Ur3SXdZlCVbnptc4weRhP7Kzp0uVMsPwHBLZva4wJr7CKGUFwTtAYDUe8jnYm5X3-JAgFx-pQR0Pj-ILXRZGa_wkil41sO7Eu1H2RrfQNObLz0feUhw5OM2ME8a4kr-MA4pS3sgb1TDr-37k-m8XpGIvfM7yvFmrYOyFaw5LUTq5MZz4OJT1HWYlMI3G4a6Cab5F8g7B3WjDxEeBCTAc_jL2HdFCHFxPgxKFumx2aRJDOjnUPgrT6i_v-UdGk0kS8"
        />
      </div>
    </header>
  )
}