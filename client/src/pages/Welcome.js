import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

const ClayPot = ({ position }) => (
  <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
    <mesh position={position}>
      <cylinderGeometry args={[0.6, 0.9, 1.4, 32]} />
      <meshStandardMaterial color="#C39B77" transparent opacity={0.4} />
    </mesh>
  </Float>
);

const GaneshaIdol = ({ position }) => (
  <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.2}>
    <mesh position={position}>
      <icosahedronGeometry args={[0.8, 1]} />
      <meshStandardMaterial color="#E0B39D" transparent opacity={0.3} />
    </mesh>
  </Float>
);

const ClayToy = ({ position }) => (
  <Float speed={1.8} rotationIntensity={1.3} floatIntensity={1.3}>
    <mesh position={position}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#D9A066" transparent opacity={0.35} />
    </mesh>
  </Float>
);

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Full Background Canvas */}
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          height: '100vh',
          width: '100vw',
          pointerEvents: 'none',
        }}
        camera={{ position: [0, 0, 8], fov: 60 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 4, 4]} intensity={0.7} />

        {/* Objects at corners */}
        <ClayPot position={[-4, -2.5, -3]} />
        <ClayToy position={[4, -2.5, -2]} />
        <GaneshaIdol position={[-4, 3, -2]} />
        <ClayPot position={[3.5, 2.8, -3]} />
      </Canvas>

      {/* Foreground Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 248, 240, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '750px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          color: '#4E342E',
        }}
      >
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3rem', marginBottom: '20px' }}>
          Welcome to MittiArts
        </h1>
        <p style={{ fontSize: '1.3rem', lineHeight: '1.8', marginBottom: '10px' }}>
          Experience the soul of tradition with our handcrafted clay pots
          each piece shaped with devotion and love.
        </p>
        <p style={{ fontSize: '1.2rem', color: '#6D4C41', marginBottom: '25px' }}>
          Our creations bring warmth, flavor, and spiritual grace into your homes — connecting you with
          nature and culture, one artisan masterpiece at a time.
        </p>

        <button
          onClick={() => navigate('/products')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#A0522D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={e => (e.target.style.backgroundColor = '#7A3E1D')}
          onMouseLeave={e => (e.target.style.backgroundColor = '#A0522D')}
        >
          View Collections
        </button>
      </div>
    </div>
  );
};

export default Welcome;
