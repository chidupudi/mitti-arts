import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Container, Grid, Paper, Button, Fade } from "@mui/material";
import { keyframes } from "@emotion/react";
import * as THREE from 'three';
import Img1 from '../assets/Aboutus1.jpg';
import Img2 from '../assets/Aboutus2.jpg';
import Img3 from '../assets/Aboutus3.jpg';
import Img4 from '../assets/Aboutus4.jpg';

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotateIn = keyframes`
  from {
    transform: rotate(-10deg) scale(0.9);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
`;

// Timeline data - Govardhan's actual journey and achievements
const timelineData = [
  {
    year: "1992",
    title: "Best Artist Award Recognition",
    description: "Received the prestigious Best Artist Award from Madhava Reddy, the Andhra Pradesh Minister, recognizing exceptional skill and contribution to traditional pottery arts.",
    image: Img1 // Replace with actual image path
  },
  {
    year: "1998",
    title: "Terracotta Pottery Demonstration",
    description: "Had the honor of explaining the intricate art of terracotta pottery to Rangarangen, the Governor of Andhra Pradesh, showcasing traditional techniques and cultural significance.",
    image: Img2 // Replace with actual image path
  },
  {
    year: "2010",
    title: "Educational Presentation at KVIC TTD",
    description: "At KVIC TTD Kalyana Mandapam, presented the importance and techniques of pottery to E.S.L. Narasimhan, Governor of Andhra Pradesh, promoting traditional crafts awareness.",
    image: Img3
  },
  {
    year: "2015",
    title: "SBH Head Office - Handicrafts Discussion",
    description: "At State Bank of Hyderabad head office, discussed the vital importance of pottery and handicrafts in preserving cultural heritage and supporting artisan livelihoods.",
    image: Img4
  },
  {
    year: "Present",
    title: "Mitti Arts - Leading Innovation",
    description: "Today, continuing the mission of empowering 2,500+ artists with modern technology while preserving traditional pottery techniques, creating eco-friendly products for a sustainable future.",
    image: "timeline_present.jpg" // Replace with actual image path
  }
];

// 3D Pottery Showcase Component
const PotteryShowcase = () => {
  const mountRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (mountRef.current) {
      observer.observe(mountRef.current);
    }
    
    return () => {
      if (mountRef.current) {
        observer.unobserve(mountRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!isVisible || !mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff8ef);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffd6a5, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Create Ganesha-inspired pot
    const createGaneshaPot = () => {
      const geometry = new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.8, 0),
          new THREE.Vector2(1.0, 0.3),
          new THREE.Vector2(1.2, 0.8),
          new THREE.Vector2(1.1, 1.5),
          new THREE.Vector2(1.3, 2.2),
          new THREE.Vector2(0.9, 2.8),
          new THREE.Vector2(0.7, 3.2),
          new THREE.Vector2(0, 3.2),
        ],
        32
      );
      
      // Traditional clay material
      const material = new THREE.MeshStandardMaterial({
        color: 0xd4a574,
        roughness: 0.9,
        metalness: 0.1,
      });
      
      const pot = new THREE.Mesh(geometry, material);
      pot.rotation.z = Math.PI;
      scene.add(pot);
      
      return pot;
    };
    
    const pot = createGaneshaPot();
    
    // Add clay particles representing eco-friendly materials
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 8;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xcd853f,
      transparent: true,
      opacity: 0.6
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      pot.rotation.y += 0.005;
      particlesMesh.rotation.y -= 0.002;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      scene.remove(pot);
      pot.geometry.dispose();
      pot.material.dispose();
      
      scene.remove(particlesMesh);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
    };
  }, [isVisible]);
  
  return (
    <Box 
      ref={mountRef} 
      sx={{ 
        height: "60vh", 
        width: "100%",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 5px 20px rgba(139, 69, 19, 0.2)",
        mb: 6 
      }} 
    />
  );
};

// Timeline Component with Images
const Timeline = () => {
  const [visibleItems, setVisibleItems] = useState({});
  const itemRefs = useRef([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => ({
              ...prev,
              [entry.target.dataset.year]: true
            }));
          }
        });
      },
      { threshold: 0.2 }
    );
    
    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    
    return () => {
      itemRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);
  
  return (
<Box sx={{ position: "relative", my: 12, px: { xs: 3, md: 6 } }}>
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ 
          mb: 6, 
          color: "#8b4513", 
          fontWeight: 600,
          position: "relative",
          "&:after": {
            content: '""',
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "3px",
            bgcolor: "#cd853f"
          }
        }}
      >
        Govardhan's Journey of Recognition & Achievement
      </Typography>

{/* Central line */}
<Box sx={{ 
  position: "absolute", 
  left: "50%", 
  top: 140, 
  bottom: 100, 
  width: "2px", 
  bgcolor: "#cd853f",
  transform: "translateX(-50%)",
  zIndex: 0,
  display: { xs: "none", md: "block" }
}}/>
            {timelineData.map((item, index) => (
  <Box 
    key={item.year}
    ref={el => itemRefs.current[index] = el}
    data-year={item.year}
    sx={{ 
      display: "flex",
      flexDirection: { xs: "column", md: index % 2 === 0 ? "row" : "row-reverse" },
      alignItems: "center",
mb: { xs: 8, md: 12 },
gap: { xs: 4, md: 8 },
      opacity: visibleItems[item.year] ? 1 : 0,
      transform: visibleItems[item.year] ? "translateY(0)" : "translateY(50px)",
      transition: "all 0.8s ease-out"
    }}
  >
    {/* Image Side */}
    <Box sx={{ 
      width: { xs: "100%", md: "45%" },
      position: "relative"
    }}>
      <Box sx={{ 
        borderRadius: 3,
        overflow: "hidden",
height: { xs: 200, md: 300 },
        backgroundColor: "#f5ebe0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 5px 15px rgba(139, 69, 19, 0.1)"
      }}>
        <Box sx={{
          width: "100%",
          height: "100%",
          backgroundImage: item.image ? `url(${item.image})` : 'none',
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5ebe0"
        }}>
          {!item.image && (
            <Box sx={{ textAlign: "center", color: "#8b4513", p: 2 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>📸</Typography>
              <Typography variant="h6">Historical Moment</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{item.year}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>

    {/* Information Side */}
    <Box sx={{ 
      width: { xs: "100%", md: "45%" },
      position: "relative"
    }}>
      {/* Year Badge */}
      <Box sx={{
        display: "inline-block",
        backgroundColor: "#cd853f",
        color: "#fff",
        px: 3,
        py: 1,
        borderRadius: 20,
        fontWeight: 700,
        fontSize: "1rem",
        mb: 2
      }}>
        {item.year}
      </Box>
      
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#8b4513" }}>
        {item.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {item.description}
      </Typography>
    </Box>
  </Box>
))}
    </Box>
  );
};

// Scroll Animation Component
const ScrollAnimation = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);
  
  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`
      }}
    >
      {children}
    </Box>
  );
};

// Main About Component
const About = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom right, #fffbf5, #fff8f0)",
        minHeight: "100vh",
        fontFamily: "Georgia, serif",
        overflowX: "hidden"
      }}
    >
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: "relative", 
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(139, 69, 19, 0.1)",
            zIndex: 1
          }
        }}
      >
        {/* Background */}
        <Box sx={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "linear-gradient(45deg, #deb887, #cd853f)",
          opacity: 0.8
        }}/>
        
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "#fff",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              animation: `${fadeInUp} 1s ease forwards`,
              mb: 3
            }}
          >
            Govardhan's Sacred Journey
          </Typography>

          <Typography
            variant="h5"
            sx={{ 
              color: "#fff", 
              textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
              animation: `${fadeInUp} 1.2s ease forwards`,
              maxWidth: "800px",
              mx: "auto"
            }}
          >
            From Family Legacy to Technological Innovation - Preserving Tradition for a Sustainable Future
          </Typography>
        </Container>
        
        {/* Scroll indicator */}
        <Box 
          sx={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s infinite",
            zIndex: 2,
            "@keyframes bounce": {
              "0%, 20%, 50%, 80%, 100%": {
                transform: "translateY(0) translateX(-50%)",
              },
              "40%": {
                transform: "translateY(-30px) translateX(-50%)",
              },
              "60%": {
                transform: "translateY(-15px) translateX(-50%)",
              }
            }
          }}
        >
          <Typography sx={{ color: "#fff", mb: 1 }}>Discover Our Story</Typography>
          <Box sx={{ 
            width: "30px", 
            height: "50px", 
            border: "2px solid #fff", 
            borderRadius: "20px",
            position: "relative",
            mx: "auto",
            "&:before": {
              content: '""',
              position: "absolute",
              top: "8px",
              left: "50%",
              width: "6px",
              height: "6px",
              backgroundColor: "#fff",
              borderRadius: "50%",
              transform: "translateX(-50%)",
              animation: "scrollDown 2s infinite"
            },
            "@keyframes scrollDown": {
              "0%": {
                opacity: 1,
                top: "8px"
              },
              "100%": {
                opacity: 0,
                top: "30px"
              }
            }
          }}/>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Introduction */}
        <ScrollAnimation>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#8b4513",
              mb: 3
            }}
          >
            About Mitti Arts & Govardhan's Vision
          </Typography>

          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 5, maxWidth: "900px", mx: "auto" }}
          >
            Born from 40+ years of traditional pottery mastery and fueled by a vision to empower artisans through technology, Mitti Arts bridges ancient wisdom with modern innovation for a sustainable future.
          </Typography>
        </ScrollAnimation>

        {/* 3D Pottery Showcase */}
        <ScrollAnimation delay={0.2}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 600,
              color: "#8b4513",
              mb: 4
            }}
          >
            Our Eco-Friendly Creations
          </Typography>
          <PotteryShowcase />
        </ScrollAnimation>

        {/* Founder's Story */}
        <ScrollAnimation delay={0.3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 5, 
              borderRadius: 4, 
              backgroundColor: "#fff8f0", 
              mb: 6,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <Box sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: "200px",
              height: "200px",
              bgcolor: "#cd853f",
              borderRadius: "50%",
              opacity: 0.1,
              zIndex: 0
            }}/>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, position: "relative", zIndex: 1 }}>
              From Generational Craft to Technological Innovation
            </Typography>
            <Typography sx={{ mb: 3, position: "relative", zIndex: 1 }}>
              My name is Govardhan, and pottery is more than just a profession for me—it's a legacy passed down through generations of my family. With over 40 years of experience, I've intimately understood the immense hard work and dedication that goes into crafting each pot, often for modest returns.
            </Typography>
            <Typography sx={{ position: "relative", zIndex: 1 }}>
              This firsthand experience fueled a desire to find ways to make pottery production easier and more viable for artisans. My journey took me across roughly 70% of India, learning traditional techniques while discovering emerging technologies that could preserve our craft while empowering our artisans.
            </Typography>
          </Paper>
        </ScrollAnimation>

        {/* Timeline Journey */}
        <Timeline />

        <Grid container spacing={5}>
          {/* TECHNOLOGY & TRADITION */}
          <Grid item xs={12} md={6}>
            <ScrollAnimation delay={0.4}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 4, 
                  backgroundColor: "#fff8f0", 
                  borderRadius: 4,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "120px",
                  height: "120px",
                  bgcolor: "#cd853f",
                  borderBottomLeftRadius: "100%",
                  opacity: 0.3,
                  zIndex: 0
                }}/>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, position: "relative", zIndex: 1 }}>
                  Technology Meets Tradition
                </Typography>
                <Typography sx={{ position: "relative", zIndex: 1 }}>
                  In 2017, with the invaluable support of the Telangana government, I led a delegation from the Ministry of BC Welfare to Gujarat. We witnessed advanced pottery technology and successfully brought it back to Telangana, training nearly 2,500 artists in new machinery and techniques while preserving traditional methods.
                </Typography>
              </Paper>
            </ScrollAnimation>
          </Grid>

          {/* ECO-FRIENDLY COMMITMENT */}
          <Grid item xs={12} md={6}>
            <ScrollAnimation delay={0.5}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 4, 
                  backgroundColor: "#fff8f0", 
                  borderRadius: 4,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "120px",
                  height: "120px",
                  bgcolor: "#cd853f",
                  borderTopRightRadius: "100%",
                  opacity: 0.3,
                  zIndex: 0
                }}/>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, position: "relative", zIndex: 1 }}>
                  Environmental Protection
                </Typography>
                <Typography sx={{ position: "relative", zIndex: 1 }}>
                  Our passion lies in the creative potential of clay and deep commitment to protecting our environment. We consciously create eco-friendly products, including thousands of clay Ganesha idols ranging from 8 inches to 8 feet, using only clay and biodegradable materials to preserve nature while celebrating cultural traditions.
                </Typography>
              </Paper>
            </ScrollAnimation>
          </Grid>

          {/* SOCIAL IMPACT */}
          <Grid item xs={12}>
            <ScrollAnimation delay={0.6}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 5, 
                  backgroundColor: "#f5ebe0", 
                  borderRadius: 4,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box sx={{
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: "300px",
                  height: "300px",
                  bgcolor: "#cd853f",
                  borderRadius: "50%",
                  opacity: 0.15,
                  zIndex: 0
                }}/>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, position: "relative", zIndex: 1 }}>
                  Empowering Artisan Communities
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ color: "#8b4513", fontWeight: 700 }}>2,500+</Typography>
                      <Typography variant="body1">Artists Trained in New Technology</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ color: "#8b4513", fontWeight: 700 }}>70%</Typography>
                      <Typography variant="body1">of India Explored for Techniques</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ color: "#8b4513", fontWeight: 700 }}>40+</Typography>
                      <Typography variant="body1">Years of Pottery Expertise</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </ScrollAnimation>
          </Grid>
          
          {/* CUSTOMER VOICES */}
          <Grid item xs={12}>
            <ScrollAnimation delay={0.7}>
              <Typography variant="h4" align="center" sx={{ fontWeight: 600, color: "#8b4513", mb: 4, mt: 2 }}>
                Voices From Our Community
              </Typography>
              <Grid container spacing={3}>
                {[
                  {
                    name: "Rajesh K.",
                    quote: "Govardhan sir's training transformed my pottery skills. The new techniques increased my productivity while keeping the traditional soul of our craft alive.",
                    location: "Telangana Potter"
                  },
                  {
                    name: "Lakshmi D.",
                    quote: "The clay Ganesha idols from Mitti Arts are perfect for our festivals. Knowing they're completely biodegradable makes our celebrations guilt-free and meaningful.",
                    location: "Festival Organizer, Hyderabad"
                  },
                  {
                    name: "Dr. Priya M.",
                    quote: "As an environmentalist, I'm impressed by Mitti Arts' commitment to sustainability. Their products prove that tradition and environmental responsibility can beautifully coexist.",
                    location: "Environmental Researcher"
                  }
                ].map((testimonial, i) => (
                  <Grid item xs={12} md={4} key={testimonial.name}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        height: "100%",
                        bgcolor: "#fff",
                        boxShadow: "0 4px 15px rgba(139, 69, 19, 0.08)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box sx={{ 
                        mb: 2, 
                        color: "#cd853f", 
                        fontSize: "2rem", 
                        height: "20px", 
                        fontFamily: "Georgia, serif" 
                      }}>
                        "
                      </Box>
                      <Typography sx={{ flex: 1, fontStyle: "italic", mb: 2 }}>
                        {testimonial.quote}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.location}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </ScrollAnimation>
          </Grid>
        </Grid>

        {/* CTA */}
        <ScrollAnimation delay={0.8}>
          <Box textAlign="center" mt={10} mb={4}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "#8b4513" }}>
              Join Our Mission of Sustainable Tradition
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: "700px", mx: "auto" }}>
              Be part of our journey to preserve ancient traditions while building a sustainable future. Every purchase supports artisan communities and environmental protection.
            </Typography>
            <Button
              variant="contained"
              href="/products"
              sx={{
                backgroundColor: "#8b4513",
                "&:hover": { backgroundColor: "#654321" },
                px: 5,
                py: 1.8,
                fontSize: "1.1rem",
                borderRadius: 8,
                boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  backgroundColor: "#654321",
                  transform: "translateY(-3px)",
                  boxShadow: "2px 5px 12px rgba(0,0,0,0.3)",
                }
              }}
            >
              Explore Our Eco-Friendly Collections
            </Button>
          </Box>
        </ScrollAnimation>
        
        {/* Philosophy */}
        <ScrollAnimation delay={0.9}>
          <Box sx={{ my: 8, px: 2 }}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 600, color: "#8b4513", mb: 5 }}>
              Our Philosophy: Creators, Not Job Seekers
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  position: "relative", 
                  bgcolor: "#f5ebe0", 
                  height: "100%", 
                  minHeight: 400, 
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Typography variant="h3" sx={{ 
                    color: "#8b4513", 
                    textAlign: "center",
                    fontWeight: 700,
                    px: 4
                  }}>
                    मिट्टी से मिले प्रेरणा
                    <br />
                    <Typography component="span" variant="h5" sx={{ color: "#cd853f" }}>
                      From Clay Comes Inspiration
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#8b4513" }}>
                    Innovation Rooted in Tradition
                  </Typography>
                  <Typography variant="body1" paragraph>
                    At Mitti Arts, we believe in being creators of opportunity, not just job seekers. This philosophy drives everything we do - from preserving ancient pottery techniques to embracing modern technology that empowers our artisans.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Our journey across India taught us that tradition and innovation aren't opposing forces - they're complementary. By bringing Gujarat's advanced pottery technology to Telangana, we've shown that respecting our heritage while embracing progress creates the strongest foundation for sustainable growth.
                  </Typography>
                  <Typography variant="body1">
                    Every clay Ganesha idol we craft, every artisan we train, every eco-friendly product we create represents our commitment to a future where cultural preservation and environmental protection go hand in hand.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </ScrollAnimation>
        
        {/* Ganesha Idols Showcase */}
        <ScrollAnimation delay={1.0}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4, 
              backgroundColor: "#fff8f0", 
              mb: 10,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <Box sx={{
              position: "absolute",
              top: -20,
              left: -20,
              width: "140px",
              height: "140px",
              bgcolor: "#cd853f",
              borderRadius: "50%",
              opacity: 0.2,
              zIndex: 0
            }}/>
            <Box sx={{
              position: "absolute",
              bottom: -30,
              right: -30,
              width: "180px",
              height: "180px",
              bgcolor: "#cd853f",
              borderRadius: "50%",
              opacity: 0.2,
              zIndex: 0
            }}/>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, position: "relative", zIndex: 1 }}>
              Our Signature: Eco-Friendly Ganesha Idols
            </Typography>
            <Typography sx={{ mb: 4, position: "relative", zIndex: 1 }}>
              We take pride in crafting thousands of clay Ganesha idols ranging from 8 inches to 8 feet, using only natural clay and biodegradable materials. Each idol represents our commitment to celebrating traditions while protecting our environment.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#8b4513", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="small idol">🐘</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    8" Mini Idols
                  </Typography>
                  <Typography variant="body2">
                    Perfect for home altars and personal worship, crafted with intricate details.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#8b4513", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="medium idol">🏛️</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Community Size
                  </Typography>
                  <Typography variant="body2">
                    Medium-sized idols ideal for community celebrations and neighborhood festivals.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#8b4513", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="large idol">🎭</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    8' Grand Idols
                  </Typography>
                  <Typography variant="body2">
                    Majestic large idols for grand celebrations, entirely biodegradable.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#8b4513", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="eco-friendly">🌱</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    100% Natural
                  </Typography>
                  <Typography variant="body2">
                    Made with pure clay and natural pigments, completely biodegradable.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="outlined"
                href="/ganesha-idols"
                sx={{
                  color: "#8b4513",
                  borderColor: "#8b4513",
                  "&:hover": { 
                    borderColor: "#654321",
                    backgroundColor: "rgba(139, 69, 19, 0.05)" 
                  },
                  px: 4,
                  py: 1,
                  borderRadius: 8
                }}
              >
                View Ganesha Collection
              </Button>
            </Box>
          </Paper>
        </ScrollAnimation>
        
        {/* Training & Workshops */}
        <ScrollAnimation delay={1.1}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 600, color: "#8b4513", mb: 4 }}>
            Artisan Training & Workshops
          </Typography>
          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 4, height: "100%" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#8b4513" }}>
                  Technology Training Programs
                </Typography>
                <Typography paragraph>
                  We offer comprehensive training programs that blend traditional pottery techniques with modern machinery. Our goal is to increase productivity while preserving the artistic integrity of handcrafted pottery.
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Advanced pottery wheel techniques</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Modern kiln operation and firing methods</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Quality control and finishing techniques</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Business skills and market access</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 4, height: "100%" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: "#8b4513" }}>
                  Traditional Craft Preservation
                </Typography>
                <Typography paragraph>
                  While embracing technology, we ensure that the soul of traditional Indian pottery is never lost. Our workshops focus on preserving ancient techniques alongside modern innovations.
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Hand-building and coiling methods</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Natural clay preparation techniques</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Traditional firing and glazing methods</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: "#cd853f", borderRadius: "50%", mr: 2 }} />
                  <Typography>Cultural significance and symbolism</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </ScrollAnimation>
        
        {/* Final CTA */}
        <ScrollAnimation delay={1.3}>
          <Box 
            sx={{ 
              
              textAlign: "center", 
              bgcolor: "#f5ebe0", 
              p: 6, 
              borderRadius: 4, 
              mt: 12
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "#8b4513" }}>
              "We are creators of opportunity, not just job seekers"
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: "#8b4513", fontStyle: "italic" }}>
              - Govardhan, Founder of Mitti Arts
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "text.secondary", maxWidth: "600px", mx: "auto" }}>
              Join us in our mission to preserve India's pottery heritage while building a sustainable, 
              technology-enabled future for artisan communities across the nation.
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  href="/products"
                  sx={{
                    backgroundColor: "#8b4513",
                    "&:hover": { backgroundColor: "#654321" },
                    px: 4,
                    py: 1.5,
                    borderRadius: 8
                  }}
                >
                  Shop Our Products
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  href="/training"
                  sx={{
                    color: "#8b4513",
                    borderColor: "#8b4513",
                    "&:hover": { 
                      borderColor: "#654321",
                      backgroundColor: "rgba(139, 69, 19, 0.05)" 
                    },
                    px: 4,
                    py: 1.5,
                    borderRadius: 8
                  }}
                >
                  Learn More About Training
                </Button>
              </Grid>
            </Grid>
          </Box>
        </ScrollAnimation>
      </Container>
      
    </Box>
  );
};

export default About;