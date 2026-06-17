'use client';
import { useEffect, useState } from 'react';
import { api } from '../app/lib/api';

export default function AuthControl() {
  const [who, setWho] = useState(null); // default: guest (Sign Up). swaps to Log Out only if session confirmed.

  useEffect(() => {
    let active = true;
    api.whoami().then(r => { if (active && r && r.ok) setWho(r.user || r); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function doLogout() {
    try { await api.logout(); } catch (e) {}
    window.location.reload();
  }

  const base = { position: 'fixed', top: '20px', right: '20px', zIndex: 100, color: '#aaa', fontSize: '14px', fontWeight: 'bold' };
  if (who) return <button onClick={doLogout} style={{ ...base, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 'bold' }}>Log Out</button>;
  return <a href="/signup" style={{ ...base, textDecoration: 'none' }}>Sign Up</a>;
}
