import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Code2, Briefcase, FolderGit2, GraduationCap } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

const SUGGESTED_QUESTIONS = [
  { text: 'What are your technical skills?', icon: Code2, color: 'text-blue-400' },
  { text: 'Tell me about your work experience', icon: Briefcase, color: 'text-orange-400' },
  { text: 'What projects have you built?', icon: FolderGit2, color: 'text-green-400' },
  { text: 'What is your educational background?', icon: GraduationCap, color: 'text-purple-400' },
]

function ChatWindow({ onMenuClick }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(overrideQuestion) {
    const question = (overrideQuestion ?? input).trim()
    if (!question || loading) return

    const userMessage = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const inputBox = (
    <div className="max-w-2xl mx-auto w-full flex items-end gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message AskMyResume..."
        rows={1}
        className="flex-1 resize-none bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button
        onClick={() => sendMessage()}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-2xl text-sm font-medium flex-shrink-0"
      >
        Send
      </button>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 h-screen bg-neutral-950 text-white min-w-0">
      {/* Mobile top bar with menu button */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
        <button
          onClick={onMenuClick}
          className="text-neutral-300 hover:text-white text-xl"
          aria-label="Open menu"
        >
          ☰
        </button>
        <span className="font-semibold">AskMyResume</span>
      </div>

      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 gap-6">
          <h1 className="text-xl md:text-2xl font-semibold text-center">
            What would you like to know?
          </h1>

          <div className="w-full max-w-2xl">{inputBox}</div>

          {/* Suggested question pills */}
          <div className="w-full max-w-2xl flex flex-wrap justify-center gap-2">
            {SUGGESTED_QUESTIONS.map(({ text, icon: Icon, color }) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-full px-4 py-2 transition-colors"
              >
                <Icon size={16} className={color} />
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[90%] md:max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white whitespace-pre-wrap'
                        : 'bg-neutral-800 text-neutral-100 prose prose-invert prose-sm max-w-none'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-2xl bg-neutral-800 text-neutral-400">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-neutral-800 p-3 md:p-4">
            {inputBox}
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWindow