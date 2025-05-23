import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import img from '../assets/Welcome_1.jpg';
import img2 from '../assets/Welcome_2.jpg';

// Clay objects for 3D background
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

// Image component with fade-in effect
const FadeInImage = ({ src, alt, className, style }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
};

const Welcome = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  
  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#FFF8F0',
      minHeight: '100vh',
    }}>
      {/* 3D Background Canvas */}
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

        {/* Floating clay objects in the corners */}
        <ClayPot position={[-4, -2.5, -3]} />
        <ClayToy position={[4, -2.5, -2]} />
        <GaneshaIdol position={[-4, 3, -2]} />
        <ClayPot position={[3.5, 2.8, -3]} />
      </Canvas>

      {/* Main Content Section */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 20px',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '60px',
            padding: '20px',
          }}
        >
          <h1 
            style={{ 
              fontFamily: 'Georgia, serif', 
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
              marginBottom: '20px',
              color: '#4E342E',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Welcome to MittiArts
          </h1>
          <p 
            style={{ 
              fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', 
              lineHeight: '1.8',
              color: '#6D4C41', 
              maxWidth: '800px',
              margin: '0 auto 25px',
            }}
          >
            Celebrating the ancient tradition of Indian pottery, where earth meets art.
          </p>
          
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 28px',
              backgroundColor: '#A0522D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#7A3E1D')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#A0522D')}
          >
            Explore Our Collections
          </button>
        </div>

        {/* Craftspeople Showcase */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '80px',
            padding: '20px',
            backgroundColor: 'rgba(255, 248, 240, 0.85)',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(5px)',
          }}
        >
          {/* First Featured Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: '30px',
              alignItems: 'center',
            }}
          >
            {/* Image with parallax effect */}
            <div 
              style={{
                flex: '0 0 45%',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                transform: `translateY(${scrollY * 0.1}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <FadeInImage
                src={img}
                alt="Artisan crafting a clay pot"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </div>
            
            {/* Text content */}
            <div style={{ flex: '1' }}>
              <h2 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
                  color: '#4E342E',
                  marginBottom: '20px'
                }}
              >
                Handcrafted with Passion
              </h2>
              <p 
                style={{ 
                  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                  lineHeight: '1.8',
                  color: '#6D4C41',
                  marginBottom: '15px'
                }}
              >
                At MittiArts, our journey began in a small town, fueled by one man's vision to shape humble earth into beautiful, functional crafts. Each piece is a direct creation from our muddy hands, reflecting our passion for preserving this ancient art form.
              </p>
              <p 
                style={{ 
                  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                  lineHeight: '1.8',
                  color: '#6D4C41' 
                }}
              >
                Every pot, every vessel tells a story of tradition, craftsmanship, and the potter's dedication to excellence.
              </p>
            </div>
          </div>

          {/* Second Featured Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < 768 ? 'column-reverse' : 'row',
              gap: '30px',
              alignItems: 'center',
            }}
          >
            {/* Text content */}
            <div style={{ flex: '1' }}>
              <h2 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
                  color: '#4E342E',
                  marginBottom: '20px'
                }}
              >
                Sacred Art & Traditions
              </h2>
              <p 
                style={{ 
                  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                  lineHeight: '1.8',
                  color: '#6D4C41',
                  marginBottom: '15px'
                }}
              >
                From cookware and tableware to sacred Pooja items like Ganesh idols, our artisans blend traditional techniques with contemporary designs. We honor the earth, believing that from it we come, and to it, we return.
              </p>
              <p 
                style={{ 
                  fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
                  lineHeight: '1.8',
                  color: '#6D4C41' 
                }}
              >
                Join us in celebrating this connection to nature through our handcrafted pottery that brings the essence of Indian culture into your home.
              </p>
            </div>
            
            {/* Image with parallax effect */}
            <div 
              style={{
                flex: '0 0 45%',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                transform: `translateY(${scrollY * -0.05}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <FadeInImage
                src={img2}
                alt="Artisan painting a Ganesha idol"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div
          style={{
            textAlign: 'center',
            margin: '60px 0',
            padding: '40px 20px',
            backgroundColor: 'rgba(193, 154, 107, 0.15)',
            borderRadius: '12px',
          }}
        >
          <h2 
            style={{ 
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
              color: '#4E342E',
              marginBottom: '20px'
            }}
          >
            Experience the Art of Indian Pottery
          </h2>
          <p 
            style={{ 
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              lineHeight: '1.6',
              color: '#6D4C41',
              maxWidth: '700px',
              margin: '0 auto 25px',
            }}
          >
            Discover our collection of handcrafted pottery that brings warmth, tradition, and beauty to your home.
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '14px 32px',
              backgroundColor: '#A0522D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#7A3E1D')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#A0522D')}
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;