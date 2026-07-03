import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';

import api from '../../lib/axios';
import { formatPrice } from '../../lib/format';

const SUGGESTIONS = [
  'Show me apartments for rent',
  'Houses under 800k with 3 bedrooms',
  'How do I contact a seller?',
];

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm Haven, your property assistant. Ask me anything — I can find listings, compare options, or explain how HomeHaven works.",
};

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { pathname } = useLocation();

  // Give the assistant listing context when the user is on a details page
  const propertyId = pathname.match(/^\/properties\/([a-f\d]{24})$/i)?.[1];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', {
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
        ...(propertyId && { propertyId }),
      });
      setMessages((list) => [
        ...list,
        { role: 'assistant', content: data.reply, properties: data.properties?.slice(0, 3) },
      ]);
    } catch (error) {
      setMessages((list) => [
        ...list,
        { role: 'assistant', content: `Sorry, something went wrong: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 transition hover:scale-105 hover:bg-primary-700"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-primary-600 px-4 py-3.5 dark:border-gray-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-[18px] w-[18px] text-white" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Haven — AI Assistant</p>
                <p className="text-xs text-primary-100">Ask about any property</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-primary-600 px-3.5 py-2.5 text-sm text-white'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }
                  >
                    <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                    {m.properties?.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {m.properties.map((p) => (
                          <Link
                            key={p._id}
                            to={`/properties/${p._id}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2 transition hover:border-primary-300 dark:border-gray-700 dark:bg-gray-900"
                          >
                            <span className="h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                              {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-gray-900 dark:text-white">{p.title}</span>
                              <span className="block text-xs font-bold text-primary-600 dark:text-primary-400">
                                {formatPrice(p.price, p.status)}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                  </div>
                </div>
              )}
              {messages.length === 1 && !loading && (
                <div className="space-y-1.5 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-xs text-gray-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2 border-t border-gray-100 p-3 dark:border-gray-800"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about properties…"
                aria-label="Chat message"
                className="input-field flex-1 !py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
