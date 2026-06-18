'use client';
// SignupSurface — signup form as an in-shell surface over the wall (no black full-screen route).
// Logic unchanged from app/signup/page.js: api.submitSignup -> /api/auth/signup.
// onDone() called on success, onBack() returns to home. Stamp: universal-shell v1.
import { useState } from 'react';
import { api } from '../app/lib/api';

export default function SignupSurface({ onDone, onBack }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('processing...');
    try {
      await api.submitSignup(formData);
      setStatus('Account initialized.');
      if (onDone) setTimeout(onDone, 900);
    } catch (error) {
      setStatus('Initialization error.');
      console.error('Signup network pipeline error:', error);
    }
  }

  const field = { padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff', borderRadius: 6 };

  return (
    <section
      style={{
        position: 'relative', zIndex: 5, minHeight: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 6vw',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', flexDirection: 'column', gap: 15, width: 320,
          background: 'rgba(10,10,10,0.72)', backdropFilter: 'blur(8px)',
          border: '1px solid #222', borderRadius: 14, padding: 26,
        }}
      >
        <button type="button" onClick={onBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', font: 'inherit', padding: 0 }}>
          ← Back
        </button>
        <h2 style={{ margin: 0, color: '#fff' }}>Create your account</h2>
        <input type="text" placeholder="Full name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} style={field} required />
        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={field} required />
        <input type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={field} required />
        <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={field} required />
        <button type="submit" style={{ padding: 12, backgroundColor: '#e11d2a', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: 6, cursor: 'pointer' }}>Create account</button>
        {status && <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>{status}</p>}
      </form>
    </section>
  );
}
