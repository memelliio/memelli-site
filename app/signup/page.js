'use client';
import { useState } from 'react';
import { api } from '../lib/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('processing...');
    try {
      // Maps direct cross-schema insertion data targets straight to the rail
      await api.submitSignup(formData);
      setStatus('Account initialized.');
    } catch (error) {
      setStatus('Initialization error.');
      console.error('Signup network pipeline error:', error);
    }
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
        <h2>Create your account</h2>
        <input type="text" placeholder="Full name" onChange={e => setFormData({ ...formData, fullName: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff' }} required />
        <input type="email" placeholder="Email" onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff' }} required />
        <input type="text" placeholder="Phone" onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff' }} required />
        <input type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ padding: '10px', backgroundColor: '#111', border: '1px solid #222', color: '#fff' }} required />
        <button type="submit" style={{ padding: '12px', backgroundColor: '#ff0000', color: '#fff', border: 'none', fontWeight: 'bold' }}>Create account</button>
        {status && <p style={{ fontSize: '12px', color: '#aaa' }}>{status}</p>}
      </form>
    </div>
  );
}
