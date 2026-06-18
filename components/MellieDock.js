'use client';
// MellieDock — Ask Mellie communication. Sends text to /api/mellie/chat AND renders the reply
// + speaks voice_url. Previously the reply was thrown away; this is the fix. Stamp: universal-shell v1.
import { useState, useRef, useEffect } from 'react';
import { api } from '../app/lib/api';

const BASE_URL = 'https://memelli-bar-control.up.railway.app';

export default function MellieDock() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState([]); // {role:'you'|'mellie', text}
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [msgs, loading]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMsgs((m) => [...m, { role: 'you', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.sendChat(text);
      const reply = (res && (res.reply || res.answer)) || '(no reply)';
      setMsgs((m) => [...m, { role: 'mellie', text: reply }]);
      // Speak Mellie's voice (user gesture already happened on submit -> autoplay allowed).
      if (res && res.voice_url) {
        try { new Audio(BASE_URL + res.voice_url).play().catch(() => {}); } catch (_) {}
      }
    } catch (error) {
      console.error('MellieDock pipeline transmission error:', error);
      setMsgs((m) => [...m, { role: 'mellie', text: '(connection error — try again)' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '90%', maxWidth: 600 }}>
      {(msgs.length > 0 || loading) && (
        <div
          ref={threadRef}
          style={{
            maxHeight: 260, overflowY: 'auto', marginBottom: 10, padding: 12,
            background: 'rgba(10,10,10,0.78)', backdropFilter: 'blur(8px)',
            border: '1px solid #222', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8,
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'you' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 14, lineHeight: 1.4,
                background: m.role === 'you' ? '#e11d2a' : '#1a1a1a',
                color: m.role === 'you' ? '#fff' : '#eee',
                border: m.role === 'you' ? 'none' : '1px solid #2a2a2a',
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && <div style={{ alignSelf: 'flex-start', color: '#888', fontSize: 13, fontStyle: 'italic' }}>Mellie is thinking…</div>}
        </div>
      )}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Mellie about credit, funding, or your business..."
          disabled={loading}
          style={{ flexGrow: 1, padding: 12, borderRadius: 8, border: '1px solid #222', backgroundColor: '#111', color: '#fff' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 24px', borderRadius: 8, backgroundColor: '#e11d2a', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
          {loading ? '...' : 'ASK'}
        </button>
      </form>
    </div>
  );
}
