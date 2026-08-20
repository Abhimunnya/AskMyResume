function Sidebar() {
  return (
    <aside className="w-64 bg-neutral-900 text-white flex flex-col p-4 border-r border-neutral-800">
      {/* Logo / brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg">
          A
        </div>
        <span className="text-lg font-semibold tracking-tight">
          AskMyResume
        </span>
      </div>

      <p className="text-sm text-neutral-400">
        Ask me anything about my background, skills, and experience.
      </p>
    </aside>
  )
}

export default Sidebar