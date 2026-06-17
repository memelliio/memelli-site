'use client';
import GrogBath from '../components/GrogBath';
import MellieDock from '../components/MellieDock';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#000000', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 1. Grog-Bath Wall */}
      <GrogBath />

      {/* 2. Solid Bar Dock */}
      <MellieDock />

      {/* 3. Link to Signup Portal Gate */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <Link href="/signup" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
          Sign Up
        </Link>
      </div>
    </main>
  );
}
