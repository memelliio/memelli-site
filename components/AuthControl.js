'use client';
import { useEffect, useState } from 'react';
import { api } from '../app/lib/api';

export default function AuthControl() {
  const [who, setWho] = useState(undefined); // undefined=checking, null=guest, obj=user

  useEffect(() => {
    let active = true;
    api.whoami().then(r => { if (active) setWho(r && r.ok ? (r.user || r) : null); }).catch(() => active && setWho(null));
    return () => { active = false; };
  }, []);

  async function doLogout() {
    try { await api.logout(); } catch (e) {}
    window.location.reload();
  }

  const style = { position: 'fixed', top: '20px', right: '20px', zIndex: 100, color: '#aaa', fontSize: '14px', fontWeight: 'bold' };
  if (who === undefined) return <div style={style}>…</div>;
  if (who) return <button onClick={doLogout} style={{ ...style, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 'bold' }}>Log Out</button>;
  return <a href="/signup" style={{ ...style, textDecoration: 'none' }}>Sign Up</a>;
}
