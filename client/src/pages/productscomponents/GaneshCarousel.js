// pages/productscomponents/GaneshCarousel.js
import React, { memo } from 'react';
import { Carousel, Card } from 'antd';

// Terracotta colors
const terracottaColors = {
  primary: '#D2691E',
  primaryLight: '#E8A857',
  primaryDark: '#A0522D',
  secondary: '#CD853F',
  accent: '#F4A460',
  background: '#FDFCFA',
  backgroundLight: '#FFEEE6',
  text: '#2C1810',
  textSecondary: '#6B4423',
  divider: '#E8D5C4',
  success: '#8BC34A',
  warning: '#FF9800',
  error: '#F44336',
  ganesh: '#FF8F00',
};

// Carousel slides configuration
const carouselSlides = [
  {
    type: 'pottery',
    image: 'https://res.cloudinary.com/dca26n68n/image/upload/v1752423554/WhatsApp_Image_2025-07-13_at_13.36.04_5cdf4b7c_ucnech.jpg',
    title: '🏺 All Pottery Collection',
    subtitle: 'Coming Soon After Ganesh Festival',
    description: 'Handcrafted clay products, eco-friendly cookware',
    redirectTo: '/contact'
  },
  {
    type: 'ganesh',
    image: 'YOUR_GANESH_URL_2', // Replace with your Ganesh image URL
    title: '🕉️ Ganesh Festival Collection',
    subtitle: 'Handcrafted with Love & Devotion'
  },
  {
    type: 'ganesh',
    image: 'YOUR_GANESH_URL_3', // Replace with your Ganesh image URL
    title: '🕉️ Traditional & Modern Designs',
    subtitle: 'Choose from Various Styles'
  },
  {
    type: 'ganesh',
    image: 'YOUR_GANESH_URL_4', // Replace with your Ganesh image URL
    title: '🕉️ Eco-Friendly Clay Idols',
    subtitle: 'Customizable to Your Preference'
  }
];

const GaneshCarousel = memo(({ isMobile, onPotteryClick }) => {
  // Calculate carousel height - 35% of viewport height
  const carouselHeight = isMobile ? '35vh' : '40vh';
  
  const handleSlideClick = (slide) => {
    if (slide.type === 'pottery' && onPotteryClick) {
      onPotteryClick();
    }
  };
  
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    arrows: !isMobile, // Hide arrows on mobile for better UX
  };

  const customCarouselStyles = `
    .ganesh-carousel .ant-carousel .ant-carousel-dots {
      bottom: 16px;
    }
    
    .ganesh-carousel .ant-carousel .ant-carousel-dots li button {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      border: 2px solid ${terracottaColors.ganesh};
    }
    
    .ganesh-carousel .ant-carousel .ant-carousel-dots li.ant-carousel-dot-active button {
      background: ${terracottaColors.ganesh};
    }
    
    .ganesh-carousel .ant-carousel .ant-carousel-dots li:hover button {
      background: ${terracottaColors.ganesh};
    }
    
    .ganesh-carousel-item {
      position: relative;
      height: ${carouselHeight};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(255, 143, 0, 0.2);
    }
    
    .ganesh-carousel-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      color: white;
      padding: 24px;
      text-align: center;
    }
    
    .ganesh-carousel-title {
      font-size: ${isMobile ? '18px' : '24px'};
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .ganesh-carousel-subtitle {
      font-size: ${isMobile ? '14px' : '16px'};
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customCarouselStyles }} />
      
      <div className="ganesh-carousel" style={{ marginBottom: '24px' }}>
        <Carousel {...carouselSettings}>
          {carouselSlides.map((slide, index) => (
            <div key={index}>
              <div 
                className="ganesh-carousel-item"
                onClick={() => handleSlideClick(slide)}
                style={{ 
                  cursor: slide.type === 'pottery' ? 'pointer' : 'default' 
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  onError={(e) => {
                    e.target.src = slide.type === 'pottery' 
                      ? 'https://via.placeholder.com/800x400/FF9800/FFFFFF?text=Pottery+Collection'
                      : 'https://via.placeholder.com/800x400/FF8F00/FFFFFF?text=Ganesh+Festival';
                  }}
                />
                <div className="ganesh-carousel-overlay">
                  <div className="ganesh-carousel-title">
                    {slide.title}
                  </div>
                  <div className="ganesh-carousel-subtitle">
                    {slide.subtitle}
                  </div>
                  {slide.description && (
                    <div style={{ 
                      fontSize: isMobile ? '12px' : '14px',
                      marginTop: '4px',
                      opacity: 0.8
                    }}>
                      {slide.description}
                    </div>
                  )}
                  {slide.type === 'pottery' && (
                    <div style={{ 
                      marginTop: '8px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      Click to Contact Us
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
});

GaneshCarousel.displayName = 'GaneshCarousel';

export default GaneshCarousel;