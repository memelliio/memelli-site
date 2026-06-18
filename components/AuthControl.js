'use client';
import { useEffect, useState } from 'react';
import { api } from '../app/lib/api';

export default function AuthControl({ onSignup }) {
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
  // In-place hot-swap to the signup surface (no route navigation). Stamp: universal-shell v1.
  return (
    <button
      onClick={onSignup}
      style={{ ...base, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 'bold' }}
    >
      Sign Up
    </button>
  );
}
