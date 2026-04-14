import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Trash2 } from 'lucide-react';
import { useAIChatStore, usePlayerStore } from '../../store';
import { aiAPI } from '../../services/api';

export default function AIChat() {
  const { messages, isOpen, isTyping, addMessage, setTyping, toggleChat, clearChat } = useAIChatStore();
  const { currentSong } = usePlayerStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    addMessage({ role: 'user', content: msg });
    setTyping(true);
    try {
      const { data } = await aiAPI.chat(msg, {
        currentSong: currentSong ? `${currentSong.title} by ${currentSong.artist}` : undefined,
      });
      addMessage({ role: 'assistant', content: data.reply });
    } catch {
      addMessage({ role: 'assistant', content: 'Lo siento, no puedo responder en este momento. ¡Intenta de nuevo!' });
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggleChat}
        className="fixed bottom-28 right-6 w-12 h-12 rounded-2xl btn-mood flex items-center justify-center z-50 shadow-xl"
        style={{ boxShadow: '0 8px 30px var(--mood-glow)' }}
      >
        <Sparkles size={20} />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-44 right-6 w-80 glass-strong rounded-2xl flex flex-col overflow-hidden z-50"
            style={{ height: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--mood-surface)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full btn-mood flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--mood-primary)', fontFamily: "'Clash Display',sans-serif" }}>
                  Harmonia IA
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
                  <Trash2 size={14} />
                </button>
                <button onClick={toggleChat} className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'btn-mood rounded-br-sm'
                        : 'ai-bubble rounded-bl-sm'
                    }`}
                    style={m.role === 'assistant' ? { color: 'rgba(255,255,255,0.9)' } : {}}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="ai-bubble px-3 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Pregúntame sobre música..."
                  className="flex-1 bg-transparent text-xs text-white/80 placeholder-white/25 outline-none"
                />
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  style={{ color: input.trim() ? 'var(--mood-primary)' : 'rgba(255,255,255,0.2)' }}
                  className="transition-colors">
                  <Send size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
