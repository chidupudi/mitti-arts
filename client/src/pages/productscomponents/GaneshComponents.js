// pages/productscomponents/GaneshComponents.js
import React, { useState, memo } from 'react';
import {
  Typography,
  Card,
  Button,
  Tag,
  Space,
  Alert,
  Grid,
} from 'antd';
import {
  GiftOutlined,
  CalendarOutlined,
  TrophyOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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

// Ganesh Idol Card Component with Mobile-Responsive Image Height
export const GaneshIdolCard = memo(({ 
  idol, 
  onShowInterest,
  onProductClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(idol.imgUrl || 'https://via.placeholder.com/300x220/FF8F00/FFFFFF?text=Ganesh+Idol');
  const screens = useBreakpoint();
  
  // Responsive image height - increased for mobile
  const getImageHeight = () => {
    if (!screens.xs) return '280px'; // Large screens
    if (!screens.sm) return '320px'; // Mobile screens (< 576px) - increased height
    if (!screens.md) return '280px'; // Small screens (576px - 768px)
    return '220px'; // Default for larger screens
  };

  const imageHeight = getImageHeight();
  const isMobile = !screens.sm;
  
  const price = idol.price || 15000;
  const advanceAmount = Math.round(price * (idol.advancePercentage || 25) / 100);

  const handleCardClick = (e) => {
    if (e.target.closest('.ant-btn') || 
        e.target.closest('.ant-rate') ||
        e.target.closest('[role="button"]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    e.preventDefault();
    onProductClick(idol.id);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'traditional': return '🏛️';
      case 'modern': return '⭐';
      case 'premium': return '👑';
      default: return '🕉️';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'traditional': return '#8E24AA';
      case 'modern': return '#1976D2';
      case 'premium': return '#D32F2F';
      default: return terracottaColors.ganesh;
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={{
        height: '100%',
        borderRadius: '12px',
        border: `1px solid ${terracottaColors.ganesh}30`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      bodyStyle={{ padding: 0 }}
      className="ganesh-idol-card"
    >
      {/* Category Badge */}
      <Tag
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          backgroundColor: getCategoryColor(idol.category),
          color: 'white',
          border: 'none',
          fontWeight: 'bold',
          fontSize: isMobile ? '11px' : '12px',
        }}
      >
        {getCategoryIcon(idol.category)} {idol.category}
      </Tag>

      {/* Customizable Badge */}
      {idol.customizable && (
        <Tag
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 2,
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            fontSize: isMobile ? '10px' : '12px',
          }}
        >
          Customizable
        </Tag>
      )}

      {/* Image Container with Responsive Height */}
      <div style={{ position: 'relative' }}>
        <img
          src={imageSrc}
          alt={idol.name}
          style={{
            width: '100%',
            height: imageHeight, // Dynamic height based on screen size
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageSrc('https://via.placeholder.com/300x320/FF8F00/FFFFFF?text=Ganesh+Idol')}
        />
      </div>

      <div style={{ padding: isMobile ? '12px' : '16px' }}>
        <Title 
          level={5} 
          ellipsis={{ rows: 1 }}
          style={{ 
            marginBottom: '8px',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: 1.3,
            color: terracottaColors.text
          }}
        >
          🕉️ {idol.name}
        </Title>

        {/* Description */}
        <Text 
          type="secondary" 
          ellipsis={{ rows: 2 }}
          style={{ 
            display: 'block',
            marginBottom: '12px',
            fontSize: isMobile ? '12px' : '13px',
            height: isMobile ? '32px' : '36px'
          }}
        >
          {idol.description || 'Beautiful handcrafted Ganesh idol for your festivities'}
        </Text>

        {/* Price Range */}
        <div style={{ marginBottom: '12px' }}>
          <Title 
            level={5} 
            style={{ 
              margin: 0,
              color: terracottaColors.ganesh,
              fontSize: isMobile ? '16px' : '18px'
            }}
          >
            ₹{price.toLocaleString()}
          </Title>
          <Text 
            type="secondary" 
            style={{ fontSize: isMobile ? '11px' : '12px' }}
          >
            Advance: ₹{Math.round(price * (idol.advancePercentage || 25) / 100).toLocaleString()} ({idol.advancePercentage || 25}%)
          </Text>
        </div>

        {/* Specifications */}
        <Space wrap size="small" style={{ marginBottom: '12px' }}>
          {idol.height && (
            <Tag size="small" style={{ fontSize: isMobile ? '9px' : '10px', color: terracottaColors.textSecondary }}>
              📏 {idol.height}
            </Tag>
          )}
          {idol.weight && (
            <Tag size="small" style={{ fontSize: isMobile ? '9px' : '10px', color: terracottaColors.textSecondary }}>
              ⚖️ {idol.weight}
            </Tag>
          )}
          {idol.color && (
            <Tag size="small" style={{ fontSize: isMobile ? '9px' : '10px', color: terracottaColors.textSecondary }}>
              🎨 {idol.color}
            </Tag>
          )}
        </Space>

        {/* Estimated Time */}
        {idol.estimatedDays && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginBottom: '12px'
          }}>
            <CalendarOutlined style={{ fontSize: isMobile ? '11px' : '12px', color: terracottaColors.success }} />
            <Text style={{ fontSize: isMobile ? '11px' : '12px', color: terracottaColors.success, fontWeight: 600 }}>
              Ready in {idol.estimatedDays} days
            </Text>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{ 
        padding: isMobile ? '12px' : '16px', 
        paddingTop: 0,
      }}>
        <Button
          type="primary"
          icon={<GiftOutlined />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShowInterest(idol);
          }}
          block
          style={{
            borderRadius: '8px',
            height: isMobile ? '36px' : '40px',
            fontWeight: 600,
            fontSize: isMobile ? '13px' : '14px',
            background: `linear-gradient(135deg, ${terracottaColors.ganesh} 0%, #FFB74D 100%)`,
            borderColor: terracottaColors.ganesh,
          }}
        >
          Show Interest
        </Button>
        
        <Text 
          style={{ 
            display: 'block',
            textAlign: 'center',
            marginTop: '8px',
            fontSize: isMobile ? '10px' : '11px',
            color: terracottaColors.textSecondary
          }}
        >
          Our team will contact you for customization
        </Text>
      </div>
    </Card>
  );
});

GaneshIdolCard.displayName = 'GaneshIdolCard';

// Pottery "Coming Soon" Card Component with Custom Image Support
export const PotteryComingSoonCard = memo(({ onClick, customPotteryImage }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  
  // Use custom image if provided, otherwise use gradient background
  const useCustomImage = customPotteryImage && customPotteryImage.trim() !== '';
  
  // Responsive image height - increased for mobile (same as Ganesh cards)
  const getImageHeight = () => {
    if (!screens.xs) return '280px'; // Large screens
    if (!screens.sm) return '320px'; // Mobile screens (< 576px) - increased height
    if (!screens.md) return '280px'; // Small screens (576px - 768px)
    return '220px'; // Default for larger screens
  };

  const imageHeight = getImageHeight();
  
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        height: '100%',
        borderRadius: '12px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 224, 178, 0.2) 100%)',
        border: `2px dashed ${terracottaColors.warning}`,
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{ padding: 0 }}
      className="pottery-unavailable-card"
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '-25px',
          transform: 'rotate(35deg)',
          width: isMobile ? '90px' : '100px',
          textAlign: 'center',
          padding: '4px 0',
          fontSize: isMobile ? '9px' : '10px',
          fontWeight: 700,
          color: 'white',
          backgroundColor: terracottaColors.ganesh,
          zIndex: 2,
          letterSpacing: '0.5px',
        }}>
          COMING SOON
        </div>
        
        {/* Custom Image or Placeholder */}
        {useCustomImage ? (
          <img
            src={customPotteryImage}
            alt="Pottery Collection Coming Soon"
            style={{
              width: '100%',
              height: imageHeight, // Dynamic height based on screen size
              objectFit: 'cover',
              borderRadius: '8px',
            }}
            onError={(e) => {
              // Fallback to gradient if custom image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback gradient background (shown when no custom image or image fails) */}
        <div
          style={{
            width: '100%',
            height: imageHeight, // Dynamic height based on screen size
            background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
            display: useCustomImage ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center', color: terracottaColors.warning }}>
            <TrophyOutlined style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: '16px' }} />
            <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>
              🏺 All Pottery Items
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '12px' : '16px' }}>
        <Title 
          level={5} 
          style={{ 
            marginBottom: '8px',
            color: terracottaColors.warning,
            fontSize: isMobile ? '14px' : '16px',
            textAlign: 'center'
          }}
        >
          🎉 Pottery Collection Coming Soon!
        </Title>

        <Text 
          type="secondary" 
          style={{ 
            display: 'block', 
            textAlign: 'center',
            marginBottom: '16px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          All pottery items will be available after Ganesh festival
        </Text>

        {/* Features of pottery */}
        <div style={{ marginBottom: '16px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text style={{ fontSize: isMobile ? '11px' : '12px', color: terracottaColors.textSecondary }}>
              ✨ Handcrafted Clay Products
            </Text>
            <Text style={{ fontSize: isMobile ? '11px' : '12px', color: terracottaColors.textSecondary }}>
              🌿 Eco-friendly & Natural
            </Text>
            <Text style={{ fontSize: isMobile ? '11px' : '12px', color: terracottaColors.textSecondary }}>
              🏠 Traditional Cookware
            </Text>
          </Space>
        </div>

        
      </div>

      {/* Action Button */}
      <div style={{ 
        padding: isMobile ? '12px' : '16px', 
        paddingTop: 0,
      }}>
        <Button
          type="primary"
          icon={<NotificationOutlined />}
          block
          style={{
            borderRadius: '8px',
            height: isMobile ? '36px' : '40px',
            fontWeight: 600,
            fontSize: isMobile ? '13px' : '14px',
            background: `linear-gradient(135deg, ${terracottaColors.warning} 0%, #FFA726 100%)`,
            borderColor: terracottaColors.warning,
          }}
        >
          Click to Pre-book Pottery
        </Button>
        
        <Text 
          style={{ 
            display: 'block',
            textAlign: 'center',
            marginTop: '8px',
            fontSize: isMobile ? '10px' : '11px',
            color: terracottaColors.textSecondary
          }}
        >
          Get notified when pottery returns!
        </Text>
      </div>
    </Card>
  );
});

PotteryComingSoonCard.displayName = 'PotteryComingSoonCard';

export default {
  GaneshIdolCard,
  PotteryComingSoonCard
};

export { terracottaColors };