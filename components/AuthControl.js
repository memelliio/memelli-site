'use client';
import { useEffect, useState } from 'react';
import { api } from '../app/lib/api';

export default function AuthControl() {
  const [ceo, setCeo] = useState(false);

  useEffect(() => {
    let active = true;
    api.ceoAuth().then(r => { if (active && r && r.ceo) setCeo(true); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function doLogout() {
    try { await api.logout(); } catch (e) {}
    window.location.reload();
  }

  const base = { position: 'fixed', top: '20px', right: '20px', zIndex: 100, color: '#aaa', fontSize: '14px', fontWeight: 'bold', display: 'flex', gap: '14px', alignItems: 'center' };
  if (ceo) {
    return (
      <div style={base}>
        <span style={{ color: '#e11d2a' }}>CEO</span>
        <button onClick={doLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', font: 'inherit', fontWeight: 'bold' }}>Log Out</button>
      </div>
    );
  }
  return <a href="/signup" style={{ ...base, textDecoration: 'none' }}>Sign Up</a>;
}
