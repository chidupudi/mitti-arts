import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Container, Grid, Paper, Button, Fade } from "@mui/material";
import { keyframes } from "@emotion/react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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

// Timeline data
const timelineData = [
  {
    year: "1985",
    title: "Our Humble Beginnings",
    description: "Started with a small workshop in rural Gujarat, mastering traditional pottery techniques passed down for generations."
  },
  {
    year: "1997",
    title: "Revival of Lost Arts",
    description: "Rediscovered ancient firing techniques and patterns from the Indus Valley Civilization, incorporating them into our modern designs."
  },
  {
    year: "2005",
    title: "Community Collectives",
    description: "Expanded to partner with artisan communities across India, creating sustainable livelihoods for over 200 families."
  },
  {
    year: "2012",
    title: "Eco-Innovation",
    description: "Pioneered water-conservation techniques in pottery production, reducing water usage by 60% while maintaining traditional quality."
  },
  {
    year: "2018",
    title: "Global Recognition",
    description: "Our artisans received UNESCO recognition for preserving intangible cultural heritage through their masterful craftsmanship."
  },
  {
    year: "Present",
    title: "Digital Renaissance",
    description: "Bringing ancient craft to the modern world while staying true to our roots - the sacred soil, sustainable practices, and spiritual traditions."
  }
];

// Clay models data for the 3D showcase
const clayModels = [
  {
    name: "Traditional Water Pot",
    description: "Keeps water naturally cool through evaporative cooling. Made with river clay and hand-painted with natural pigments."
  },
  {
    name: "Ceremonial Oil Lamp",
    description: "Used in sacred rituals for centuries. The spiral patterns represent the eternal divine flame."
  },
  {
    name: "Modern Clay Planter",
    description: "Contemporary design with traditional craftsmanship. Perfect for indoor plants, allowing roots to breathe."
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
    
    // Create pottery - here we'll create a simple vase
    // In production, you'd load GLTF models of actual pottery
    const createVase = () => {
      const geometry = new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(0.5, 0),
          new THREE.Vector2(0.6, 0.5),
          new THREE.Vector2(0.75, 1),
          new THREE.Vector2(0.6, 1.5),
          new THREE.Vector2(0.8, 2),
          new THREE.Vector2(0.5, 2.5),
          new THREE.Vector2(0.45, 3),
          new THREE.Vector2(0, 3),
        ],
        30
      );
      
      // Clay material with subtle texture
      const texture = new THREE.TextureLoader().load('/textures/clay_normal.jpg');
      const material = new THREE.MeshStandardMaterial({
        color: 0xc1876b,
        roughness: 0.8,
        metalness: 0.1,
        normalMap: texture,
      });
      
      const vase = new THREE.Mesh(geometry, material);
      vase.rotation.z = Math.PI;
      scene.add(vase);
      
      return vase;
    };
    
    const vase = createVase();
    
    // Add some clay particles for a magical effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xd6a692,
      transparent: true,
      opacity: 0.8
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    // Controls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    
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
      
      vase.rotation.y += 0.003;
      particlesMesh.rotation.y -= 0.001;
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      scene.remove(vase);
      vase.geometry.dispose();
      vase.material.dispose();
      
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
        boxShadow: "0 5px 20px rgba(91, 58, 30, 0.2)",
        mb: 6 
      }} 
    />
  );
};

// Timeline Component
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
    <Box sx={{ position: "relative", my: 10, px: 2 }}>
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ 
          mb: 6, 
          color: "#5b3a1e", 
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
            bgcolor: "#d6a692"
          }
        }}
      >
        Our Journey Through Time
      </Typography>
      
      {/* Central line */}
      <Box sx={{ 
        position: "absolute", 
        left: "50%", 
        top: 80, 
        bottom: 0, 
        width: "4px", 
        bgcolor: "#d6a692",
        transform: "translateX(-50%)",
        zIndex: 0
      }}/>
      
      {timelineData.map((item, index) => (
        <Box 
          key={item.year}
          ref={el => itemRefs.current[index] = el}
          data-year={item.year}
          sx={{ 
            display: "flex", 
            justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
            position: "relative",
            mb: 8,
            opacity: visibleItems[item.year] ? 1 : 0,
            transform: visibleItems[item.year] 
              ? "translateY(0)" 
              : index % 2 === 0 
                ? "translateX(-50px)" 
                : "translateX(50px)",
            transition: "all 0.8s ease-out"
          }}
        >
          <Box sx={{ 
            width: { xs: "100%", md: "45%" },
            position: "relative",
            zIndex: 1
          }}>
            {/* Year bubble */}
            <Box sx={{
              position: "absolute",
              width: 70,
              height: 70,
              borderRadius: "50%",
              bgcolor: "#d6a692",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              [index % 2 === 0 ? "right" : "left"]: { xs: "50%", md: -35 },
              top: 15,
              transform: { xs: "translateX(50%)", md: "none" },
              boxShadow: "0 4px 12px rgba(91, 58, 30, 0.3)",
              zIndex: 2
            }}>
              <Typography sx={{ 
                color: "#fff", 
                fontWeight: 700,
                fontSize: "1rem" 
              }}>
                {item.year}
              </Typography>
            </Box>
            
            <Paper sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#fff3e6",
              boxShadow: "0 5px 15px rgba(91, 58, 30, 0.1)",
              ml: { xs: 0, md: index % 2 === 0 ? 0 : 5 },
              mr: { xs: 0, md: index % 2 === 0 ? 5 : 0 },
              position: "relative",
              "&:before": {
                content: '""',
                position: "absolute",
                top: 25,
                [index % 2 === 0 ? "right" : "left"]: { xs: "50%", md: -10 },
                transform: { 
                  xs: "translateX(50%) rotate(45deg)", 
                  md: "rotate(45deg)" 
                },
                width: 20,
                height: 20,
                backgroundColor: "#fff3e6",
                display: { xs: "none", md: "block" }
              }
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {item.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {item.description}
              </Typography>
            </Paper>
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
        background: "linear-gradient(to bottom right, #fffaf2, #fff0dc)",
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
            background: "rgba(91, 58, 30, 0.1)",
            zIndex: 1
          }
        }}
      >
        {/* Background Video or Image can be placed here */}
        <Box sx={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/images/clay-hands-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9)"
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
            Our Sacred Journey
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
            From Earth to Art - Preserving Ancient Tradition in Every Piece
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
          <Typography sx={{ color: "#fff", mb: 1 }}>Scroll to Discover</Typography>
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
              color: "#5b3a1e",
              mb: 3
            }}
          >
            About Our Pottery Journey
          </Typography>

          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 5, maxWidth: "800px", mx: "auto" }}
          >
            We're more than an e-commerce platform — we're a movement to revive the soul of traditional art and conscious living, connecting the ancient wisdom of pottery with modern needs.
          </Typography>
        </ScrollAnimation>

        {/* 3D Pottery Showcase */}
        <ScrollAnimation delay={0.2}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 600,
              color: "#5b3a1e",
              mb: 4
            }}
          >
            Experience Our Creations
          </Typography>
          <PotteryShowcase />
        </ScrollAnimation>

        {/* OUR ROOTS */}
        <ScrollAnimation delay={0.3}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 5, 
              borderRadius: 4, 
              backgroundColor: "#fff8ef", 
              mb: 6,
              backgroundImage: "url('/images/pottery-pattern-bg.svg')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right bottom",
              backgroundSize: "300px"
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Deep Roots in Sacred Soil
            </Typography>
            <Typography sx={{ maxWidth: "80%" }}>
              Our story begins with earth – the humble clay from Indian rivers. Clay is not just a material to us; it's our connection to the ancestral wisdom. From this sacred soil, shaped by time and touched by faith, our artisans create vessels that carry more than water – they carry tradition. Each piece carries the vibration of tradition, the rhythm of our ancestors, and the pulse of sustainable living. In a world of mass production, we stand for mindful creation.
            </Typography>
          </Paper>
        </ScrollAnimation>

        {/* Timeline Journey */}
        <Timeline />

        <Grid container spacing={5}>
          {/* ARTISAN SPOTLIGHT */}
          <Grid item xs={12} md={6}>
            <ScrollAnimation delay={0.4}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 4, 
                  backgroundColor: "#fff3e6", 
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
                  bgcolor: "#d6a692",
                  borderBottomLeftRadius: "100%",
                  opacity: 0.3,
                  zIndex: 0
                }}/>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, position: "relative", zIndex: 1 }}>
                  Artisan Spotlight
                </Typography>
                <Typography sx={{ position: "relative", zIndex: 1 }}>
                  Every artisan we work with is a storyteller, a keeper of sacred design. Their fingers trace generations of art into every curve, ensuring no two pieces are ever the same. When you bring our pottery home, you're not just buying a product – you're preserving a legacy and supporting families who have maintained these traditions against the tide of industrialization.
                </Typography>
              </Paper>
            </ScrollAnimation>
          </Grid>

          {/* ENVIRONMENTAL ETHOS */}
          <Grid item xs={12} md={6}>
            <ScrollAnimation delay={0.5}>
              <Paper 
                elevation={4} 
                sx={{ 
                  p: 4, 
                  backgroundColor: "#fff3e6", 
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
                  bgcolor: "#d6a692",
                  borderTopRightRadius: "100%",
                  opacity: 0.3,
                  zIndex: 0
                }}/>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, position: "relative", zIndex: 1 }}>
                  Environmentally Devoted
                </Typography>
                <Typography sx={{ position: "relative", zIndex: 1 }}>
                  We use natural clay and water-based paints. Our firing techniques have been optimized to use minimal fuel while achieving the perfect finish. Our packaging is biodegradable, made from recycled paper and plant fibers. Every piece returns to the earth, leaving no trace of harm. Our vision is a plastic-free, spiritually aware future where commerce respects the Earth and creators.
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
                  backgroundColor: "#f7e6d5", 
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
                  bgcolor: "#d6a692",
                  borderRadius: "50%",
                  opacity: 0.15,
                  zIndex: 0
                }}/>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, position: "relative", zIndex: 1 }}>
                  Community Impact
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ color: "#a0522d", fontWeight: 700 }}>500+</Typography>
                      <Typography variant="body1">Artisan Families Supported</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ color: "#a0522d", fontWeight: 700 }}>12</Typography>
                      <Typography variant="body1">Rural Villages Revitalized</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h2" sx={{ color: "#a0522d", fontWeight: 700 }}>40%</Typography>
                      <Typography variant="body1">Women Artisan Employment</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </ScrollAnimation>
          </Grid>
          
          {/* CUSTOMER VOICES */}
          <Grid item xs={12}>
            <ScrollAnimation delay={0.7}>
              <Typography variant="h4" align="center" sx={{ fontWeight: 600, color: "#5b3a1e", mb: 4, mt: 2 }}>
                Voices From Our Community
              </Typography>
              <Grid container spacing={3}>
                {[
                  {
                    name: "Priya M.",
                    quote: "These clay pots have transformed my kitchen. Not only are they beautiful, but the food tastes so much better when cooked in clay. I can feel the connection to tradition with every meal.",
                    location: "Mumbai"
                  },
                  {
                    name: "Thomas R.",
                    quote: "I've been collecting artisanal pottery for years, and these pieces are truly special. The natural imperfections tell a story, and I love knowing exactly who made my tea set.",
                    location: "London"
                  },
                  {
                    name: "Aisha K.",
                    quote: "As someone trying to live more sustainably, finding these plastic-free, natural clay products has been a blessing. They're beautiful, functional, and I know I'm supporting real craftspeople.",
                    location: "Bengaluru"
                  }
                ].map((testimonial, i) => (
                  <Grid item xs={12} md={4} key={testimonial.name}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        height: "100%",
                        bgcolor: "#fff",
                        boxShadow: "0 4px 15px rgba(91, 58, 30, 0.08)",
                        animation: isVisible => isVisible ? `${rotateIn} 0.6s ease-out ${0.3 + i * 0.2}s forwards` : "none",
                        opacity: 0,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box sx={{ 
                        mb: 2, 
                        color: "#d6a692", 
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
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "#5b3a1e" }}>
              Step into the World of Clay, Culture, and Connection
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: "700px", mx: "auto" }}>
              Bring a piece of this ancient tradition into your home. Each purchase supports artisan communities and sustainable practices.
            </Typography>
            <Button
              variant="contained"
              href="/products"
              sx={{
                backgroundColor: "#a0522d",
                "&:hover": { backgroundColor: "#8b4513" },
                px: 5,
                py: 1.8,
                fontSize: "1.1rem",
                borderRadius: 8,
                boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
                transition: "transform 0.3s ease",
                "&:hover": {
                  backgroundColor: "#8b4513",
                  transform: "translateY(-3px)",
                  boxShadow: "2px 5px 12px rgba(0,0,0,0.3)",
                }
              }}
            >
              Explore Our Collections
            </Button>
          </Box>
        </ScrollAnimation>
        
        {/* Our Philosophy */}
        <ScrollAnimation delay={0.9}>
          <Box sx={{ my: 8, px: 2 }}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 600, color: "#5b3a1e", mb: 5 }}>
              Our Philosophy
            </Typography>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  position: "relative", 
                  bgcolor: "#f5e3d0", 
                  height: "100%", 
                  minHeight: 400, 
                  borderRadius: 4,
                  overflow: "hidden"
                }}>
                  {/* This would be an image in production */}
                  <Box sx={{ 
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: "url('/images/pottery-making.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}/>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "#5b3a1e" }}>
                    The Dance Between Tradition and Innovation
                  </Typography>
                  <Typography variant="body1" paragraph>
                    At the heart of our practice is a delicate balance. We honor traditions that span millennia while embracing techniques that make this ancient art form relevant for contemporary living.
                  </Typography>
                  <Typography variant="body1" paragraph>
                    For us, pottery is more than craft—it's meditation. Each piece begins with centering the clay, just as the potter must center themselves. The wheel turns, hands shape, and in this sacred dance between human and earth, something authentic emerges.
                  </Typography>
                  <Typography variant="body1">
                    We believe beautiful, handcrafted objects bring mindfulness to everyday moments. A morning tea ritual becomes deeper when drinking from a cup made with intention and care. Cooking becomes more connected when done in vessels formed from the very earth that nourishes us.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </ScrollAnimation>
        
        {/* Workshop Experience */}
        <ScrollAnimation delay={1.0}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4, 
              backgroundColor: "#fff8ef", 
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
              bgcolor: "#d6a692",
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
              bgcolor: "#d6a692",
              borderRadius: "50%",
              opacity: 0.2,
              zIndex: 0
            }}/>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, position: "relative", zIndex: 1 }}>
              Experience The Craft Firsthand
            </Typography>
            <Typography sx={{ mb: 4, position: "relative", zIndex: 1 }}>
              Visit our workshops in Jaipur and Delhi to witness the magic of pottery-making in person. Feel the clay between your fingers, learn from master artisans, and create your own piece to take home.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#a0522d", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    {/* Icon would go here - using placeholder */}
                    <span role="img" aria-label="pottery wheel">🏺</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Wheel Throwing
                  </Typography>
                  <Typography variant="body2">
                    Learn the basics of centering clay and forming vessels on the potter's wheel.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#a0522d", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="hand building">✋</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Hand Building
                  </Typography>
                  <Typography variant="body2">
                    Discover traditional pinch, coil, and slab techniques to create unique forms.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#a0522d", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="glazing">🎨</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Natural Glazing
                  </Typography>
                  <Typography variant="body2">
                    Explore traditional plant-based glazes and painting techniques.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ 
                    fontSize: "3rem", 
                    color: "#a0522d", 
                    mb: 1,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    <span role="img" aria-label="firing">🔥</span>
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Firing Ceremonies
                  </Typography>
                  <Typography variant="body2">
                    Witness traditional firing methods that have remained unchanged for centuries.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="outlined"
                href="/workshops"
                sx={{
                  color: "#a0522d",
                  borderColor: "#a0522d",
                  "&:hover": { 
                    borderColor: "#8b4513",
                    backgroundColor: "rgba(160, 82, 45, 0.05)" 
                  },
                  px: 4,
                  py: 1,
                  borderRadius: 8
                }}
              >
                Book a Workshop
              </Button>
            </Box>
          </Paper>
        </ScrollAnimation>
        
        {/* Map with Locations */}
        <ScrollAnimation delay={1.1}>
          <Typography variant="h4" align="center" sx={{ fontWeight: 600, color: "#5b3a1e", mb: 4 }}>
            Find Us Across India
          </Typography>
          <Box 
            sx={{ 
              width: "100%", 
              height: "50vh", 
              bgcolor: "#f5e3d0", 
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
              mb: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {/* This would be replaced with an actual map component */}
            <Typography variant="h6" sx={{ color: "#a0522d" }}>
              Interactive Map of our Workshops & Stores
            </Typography>
            
            {/* Location markers - these would be positioned on the actual map */}
            {[
              { name: "Delhi Studio", position: { top: "30%", left: "40%" } },
              { name: "Jaipur Workshop", position: { top: "50%", left: "30%" } },
              { name: "Mumbai Gallery", position: { top: "70%", left: "20%" } },
              { name: "Varanasi Artisan Center", position: { top: "40%", left: "60%" } },
              { name: "Kolkata Store", position: { top: "50%", left: "70%" } }
            ].map((location) => (
              <Box
                key={location.name}
                sx={{
                  position: "absolute",
                  top: location.position.top,
                  left: location.position.left,
                  width: "12px",
                  height: "12px",
                  bgcolor: "#a0522d",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  "&:before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "24px",
                    height: "24px",
                    bgcolor: "rgba(160, 82, 45, 0.3)",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: "pulse 2s infinite"
                  },
                  "@keyframes pulse": {
                    "0%": {
                      transform: "translate(-50%, -50%) scale(1)",
                      opacity: 1
                    },
                    "100%": {
                      transform: "translate(-50%, -50%) scale(2)",
                      opacity: 0
                    }
                  }
                }}
              />
            ))}
          </Box>
        </ScrollAnimation>
      </Container>
      
    </Box>
  );
};

export default About;