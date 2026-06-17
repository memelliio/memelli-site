'use client';
import GrogBath from '../components/GrogBath';
import MellieDock from '../components/MellieDock';
import AuthControl from '../components/AuthControl';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#000000', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GrogBath />
      <MellieDock />
      <AuthControl />
    </main>
  );
}
