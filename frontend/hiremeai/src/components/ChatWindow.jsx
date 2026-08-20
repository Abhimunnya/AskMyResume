import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const API_URL = 'http://127.0.0.1:8000/chat'

function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const question = input.trim()
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

  // The input box itself — reused in both the centered and docked positions.
  const inputBox = (
    <div className="max-w-2xl mx-auto w-full flex items-end gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about my skills, experience, education..."
        rows={1}
        className="flex-1 resize-none bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button
        onClick={sendMessage}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-medium"
      >
        Send
      </button>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 h-screen bg-neutral-950 text-white">
      {!hasMessages ? (
        // Welcome state: heading + input box, both centered in the middle of the screen.
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <h1 className="text-2xl font-semibold">Welcome to AskMyResume</h1>
          <div className="w-full max-w-2xl">{inputBox}</div>
        </div>
      ) : (
        <>
          {/* Message area */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[80%] ${
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

          {/* Docked input bar at the bottom, once chatting has started */}
          <div className="border-t border-neutral-800 p-4">{inputBox}</div>
        </>
      )}
    </div>
  )
}

export default ChatWindow