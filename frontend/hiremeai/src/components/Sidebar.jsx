function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Dark overlay behind the sidebar on mobile, click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white flex flex-col p-4 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <button
          onClick={onClose}
          className="md:hidden self-end mb-4 text-neutral-400 hover:text-white text-xl"
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
            A
          </div>
          <span className="text-lg font-semibold tracking-tight">
            AskMyResume
          </span>
        </div>

        <p className="text-sm text-neutral-400">
          Hi, I'm Abhimunnya 👋

This is my AI-powered portfolio — instead of scrolling through a static resume, just ask me anything. I'm trained on my own background, so I can tell you about my skills, work experience, projects, and education directly, in a conversation.

Curious where I've worked, what I've built, or what I know? Just ask.
        </p>
      </aside>
    </>
  )
}

export default Sidebar