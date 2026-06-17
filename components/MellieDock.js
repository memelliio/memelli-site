'use client';
import { useState } from 'react';
import { api } from '../app/lib/api';

export default function MellieDock() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      // Passes text fields instantly via verified { text } payload key
      await api.sendChat(input);
      setInput(''); // Zero chat logs or offline caches saved local
    } catch (error) {
      console.error('MellieDock pipeline transmission error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: '90%', maxWidth: '600px' }}>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Mellie about credit, funding, or your business..."
          disabled={loading}
          style={{ flexGrow: 1, padding: '12px', borderRadius: '8px', border: '1px solid #222', backgroundColor: '#111', color: '#fff' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#ff0000', color: '#fff', border: 'none', fontWeight: 'bold' }}>
          {loading ? '...' : 'SPAWN'}
        </button>
      </form>
    </div>
  );
}
