'use client';
// Universal shell — ONE page. Wall + Mellie dock + auth stay mounted; the center
// surface hot-swaps in place (home <-> signup) with NO route navigation.
// Stamp: universal-shell v1.
import { useState } from 'react';
import GrogBath from '../components/GrogBath';
import MellieDock from '../components/MellieDock';
import AuthControl from '../components/AuthControl';
import HomeSurface from '../components/HomeSurface';
import SignupSurface from '../components/SignupSurface';

export default function Home() {
  const [surface, setSurface] = useState('home'); // 'home' | 'signup'

  return (
    <main style={{ backgroundColor: '#000000', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GrogBath />
      <AuthControl onSignup={() => setSurface('signup')} />

      {surface === 'home' ? (
        <HomeSurface onStart={() => setSurface('signup')} />
      ) : (
        <SignupSurface onDone={() => setSurface('home')} onBack={() => setSurface('home')} />
      )}

      <MellieDock />
    </main>
  );
}
