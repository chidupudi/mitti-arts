import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import img1 from '../assets/Welcome_1.jpg';
import img2 from '../assets/Welcome_2.jpg';


// Three.js Background Component
const ThreeBackground = () => {
  const mountRef = React.useRef(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);
    
    // Create clay objects
    const objects = [];
    
    // Clay pot geometry
    const potGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 32);
    const potMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xC39B77, 
      transparent: true, 
      opacity: 0.3 
    });
    
    const pot1 = new THREE.Mesh(potGeometry, potMaterial);
    pot1.position.set(-3, -1.5, -2);
    scene.add(pot1);
    objects.push({ mesh: pot1, speed: 0.01 });
    
    const pot2 = new THREE.Mesh(potGeometry, potMaterial);
    pot2.position.set(-2.5, 2, -2.5);
    scene.add(pot2);
    objects.push({ mesh: pot2, speed: -0.008 });
    
    // Ganesha idol geometry
    const idolGeometry = new THREE.IcosahedronGeometry(0.5, 1);
    const idolMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xE0B39D, 
      transparent: true, 
      opacity: 0.25 
    });
    
    const idol1 = new THREE.Mesh(idolGeometry, idolMaterial);
    idol1.position.set(3, -1.8, -1.5);
    scene.add(idol1);
    objects.push({ mesh: idol1, speed: 0.012 });
    
    const idol2 = new THREE.Mesh(idolGeometry, idolMaterial);
    idol2.position.set(2.8, 1.5, -2);
    scene.add(idol2);
    objects.push({ mesh: idol2, speed: -0.01 });
    
    camera.position.z = 6;
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      objects.forEach(obj => {
        obj.mesh.rotation.y += obj.speed;
        obj.mesh.position.y += Math.sin(Date.now() * 0.001 + obj.mesh.position.x) * 0.001;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

// Image component with fade-in effect
const FadeInImage = ({ src, alt, style, className }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1.2s ease-in-out',
        filter: 'brightness(1.05) contrast(1.1)',
      }}
      onLoad={() => setLoaded(true)}
    />
  );
};

const Welcome = () => {
   const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Handle scroll and resize
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const handleExploreClick = () => {
  navigate('/products');
};

const handleAboutClick = () => {
  navigate('/about');
};

  return (
    <div style={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#FFFBF5',
      overflow: 'hidden'
    }}>
      {/* 3D Background Canvas */}
      {!isMobile && <ThreeBackground />}

      {/* Main Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        minHeight: '100vh',
        padding: isMobile ? '20px 16px' : '40px 24px'
      }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '24px' : '48px',
            minHeight: '100vh',
            maxWidth: '1400px',
            margin: '0 auto',
            alignItems: 'center',
          }}
        >
          {/* Left Side - Images */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              transform: !isMobile ? `translateY(${scrollY * 0.05}px)` : 'none',
              transition: 'transform 0.3s ease-out',
              order: isMobile ? 2 : 1,
            }}
          >
            {/* First Image Card */}
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)',
                background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(139, 69, 19, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 69, 19, 0.15)';
              }}
            >
              <div style={{ position: 'relative' }}>
                <FadeInImage
                  src={img1}
                  alt="Artisan crafting clay pot"
                  style={{
                    width: '100%',
                    height: isMobile ? '250px' : '300px',
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(139, 69, 19, 0.8))',
                  color: 'white',
                  padding: '24px',
                }}>
                  <h3 style={{ 
                    color: 'white', 
                    margin: 0, 
                    marginBottom: '8px',
                    fontSize: '1.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                   Founder, Art of Indian Pottery - Mittiarts
                  </h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    Every piece shaped by skilled hands
                  </p>
                </div>
              </div>
            </div>

            {/* Second Image Card */}
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)',
                background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
                transform: !isMobile ? `translateY(${scrollY * -0.03}px)` : 'none',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = !isMobile ? 
                  `translateY(${scrollY * -0.03 - 4}px)` : 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(139, 69, 19, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = !isMobile ? 
                  `translateY(${scrollY * -0.03}px)` : 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 69, 19, 0.15)';
              }}
            >
              <div style={{ position: 'relative' }}>
                <FadeInImage
                  src={img2}
                  alt="Traditional Ganesha idol"
                  style={{
                    width: '100%',
                    height: isMobile ? '250px' : '300px',
                    objectFit: 'cover',
                    borderRadius: '16px 16px 0 0',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(139, 69, 19, 0.8))',
                  color: 'white',
                  padding: '24px',
                }}>
                  <h3 style={{ 
                    color: 'white', 
                    margin: 0, 
                    marginBottom: '8px',
                    fontSize: '1.5rem',
                    fontFamily: 'Georgia, serif'
                  }}>
                    Sacred Traditions
                  </h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)',
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    From Ganesha idols to daily pottery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Welcome Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '32px',
              paddingLeft: !isMobile ? '32px' : '0',
              order: isMobile ? 1 : 2,
            }}
          >
            {/* Main Welcome Section */}
            <div style={{ 
              textAlign: isMobile ? 'center' : 'left',
              marginBottom: '24px'
            }}>
              <h1 
                style={{ 
                  fontFamily: 'Georgia, serif',
                  fontSize: isMobile ? '2.5rem' : '3.5rem',
                  fontWeight: 700,
                  color: '#4E342E',
                  marginBottom: '16px',
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  margin: '0 0 16px 0',
                }}
              >
                Welcome to{' '}
                <span style={{ 
                  background: 'linear-gradient(135deg, #CD853F, #A0522D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  MittiArts
                </span>
              </h1>
              
              <p 
                style={{ 
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  lineHeight: 1.7,
                  color: '#6D4C41',
                  marginBottom: '24px',
                  maxWidth: '500px',
                  margin: isMobile ? '0 auto 24px' : '0 0 24px 0',
                }}
              >
               From cookware and tableware to sacred Pooja items like<strong style={{ color: '#8B4513' }}> Ganesh idols</strong> each piece is a direct creation from our muddy hands.
                Experience the legacy of Govardhan's 40+ years of craftsmanship.
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '16px',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'flex-start'
              }}>
                <button
                  onClick={handleExploreClick}
                  style={{
                    backgroundColor: '#A0522D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    height: '48px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    padding: '0 24px',
                    boxShadow: '0 4px 16px rgba(160, 82, 45, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#8B4513';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(160, 82, 45, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#A0522D';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(160, 82, 45, 0.3)';
                  }}
                >
                  🛒 Explore Collections
                </button>
                
                <button
                  onClick={handleAboutClick}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: '#A0522D',
                    color: '#A0522D',
                    border: '2px solid #A0522D',
                    borderRadius: '8px',
                    height: '48px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    padding: '0 24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#A0522D';
                    e.target.style.color = '#FFFFFF';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#A0522D';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ❤️ Our Story
                </button>
              </div>
            </div>

            <div style={{ 
              height: '1px', 
              background: 'linear-gradient(to right, transparent, #D4A574, transparent)',
              margin: '32px 0'
            }} />

            {/* Info Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFF8F0, #FFFFFF)',
                  boxShadow: '0 4px 16px rgba(139, 69, 19, 0.1)',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '12px',
                }}>
                  🏺
                </div>
                <h4 style={{ 
                  color: '#4E342E', 
                  marginBottom: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  margin: '0 0 8px 0'
                }}>
                  2,500+ Artists
                </h4>
                <p style={{ 
                  color: '#6D4C41',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  Trained in modern pottery techniques
                </p>
              </div>

              <div
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFF8F0, #FFFFFF)',
                  boxShadow: '0 4px 16px rgba(139, 69, 19, 0.1)',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '12px',
                }}>
                  🌱
                </div>
                <h4 style={{ 
                  color: '#4E342E', 
                  marginBottom: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  margin: '0 0 8px 0'
                }}>
                  Eco-Friendly
                </h4>
                <p style={{ 
                  color: '#6D4C41',
                  margin: 0,
                  fontSize: '0.95rem'
                }}>
                  100% biodegradable clay products
                </p>
              </div>
            </div>

            {/* Journey Card */}
            <div
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F5EBE0, #FFF8F0)',
                boxShadow: '0 4px 16px rgba(139, 69, 19, 0.1)',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <h4 style={{ 
                color: '#4E342E', 
                marginBottom: '12px',
                fontSize: '1.3rem',
                fontWeight: 600,
                margin: '0 0 12px 0'
              }}>
                From Tradition to Innovation
              </h4>
              <p style={{ 
                color: '#6D4C41', 
                marginBottom: '16px',
                lineHeight: 1.6,
                margin: '0 0 16px 0'
              }}>
We honor the earth, believing that from it we come, and to it, we return. Join us in celebrating this connection to nature through our handcrafted pottery.
              </p>
              <button
                onClick={handleAboutClick}
                style={{
                  color: '#A0522D',
                  background: 'none',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  textDecoration: 'underline',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#8B4513'}
                onMouseLeave={(e) => e.target.style.color = '#A0522D'}
              >
                Learn More About Our Journey →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <button
          onClick={handleExploreClick}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            width: '56px',
            height: '56px',
            backgroundColor: '#A0522D',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '0 4px 16px rgba(160, 82, 45, 0.4)',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#8B4513';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#A0522D';
            e.target.style.transform = 'scale(1)';
          }}
        >
          🛒
        </button>
      )}
    </div>
  );
};

export default Welcome;