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

// Ganesh Idol Card Component
export const GaneshIdolCard = memo(({ 
  idol, 
  onShowInterest,
  onProductClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(idol.imgUrl || 'https://via.placeholder.com/300x220/FF8F00/FFFFFF?text=Ganesh+Idol');
  
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
          fontWeight: 'bold'
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
            fontWeight: 'bold'
          }}
        >
          Customizable
        </Tag>
      )}

      <div style={{ position: 'relative' }}>
        <img
          src={imageSrc}
          alt={idol.name}
          style={{
            width: '100%',
            height: '220px',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageSrc('https://via.placeholder.com/300x220/FF8F00/FFFFFF?text=Ganesh+Idol')}
        />
      </div>

      <div style={{ padding: '16px' }}>
        <Title 
          level={5} 
          ellipsis={{ rows: 1 }}
          style={{ 
            marginBottom: '8px',
            fontSize: '16px',
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
            fontSize: '13px',
            height: '36px'
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
              fontSize: '18px'
            }}
          >
            ₹{price.toLocaleString()}
          </Title>
          <Text 
            type="secondary" 
            style={{ fontSize: '12px' }}
          >
            Advance: ₹{Math.round(price * (idol.advancePercentage || 25) / 100).toLocaleString()} ({idol.advancePercentage || 25}%)
          </Text>
        </div>

        {/* Specifications */}
        <Space wrap size="small" style={{ marginBottom: '12px' }}>
          {idol.height && (
            <Tag size="small" style={{ fontSize: '10px', color: terracottaColors.textSecondary }}>
              📏 {idol.height}
            </Tag>
          )}
          {idol.weight && (
            <Tag size="small" style={{ fontSize: '10px', color: terracottaColors.textSecondary }}>
              ⚖️ {idol.weight}
            </Tag>
          )}
          {idol.color && (
            <Tag size="small" style={{ fontSize: '10px', color: terracottaColors.textSecondary }}>
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
            <CalendarOutlined style={{ fontSize: '12px', color: terracottaColors.success }} />
            <Text style={{ fontSize: '12px', color: terracottaColors.success, fontWeight: 600 }}>
              Ready in {idol.estimatedDays} days
            </Text>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{ 
        padding: '16px', 
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
            height: '40px',
            fontWeight: 600,
            fontSize: '14px',
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
            fontSize: '11px',
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

// Pottery "Coming Soon" Card Component
export const PotteryComingSoonCard = memo(({ onClick }) => {
  const screens = useBreakpoint();
  
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
          width: '100px',
          textAlign: 'center',
          padding: '4px 0',
          fontSize: '10px',
          fontWeight: 700,
          color: 'white',
          backgroundColor: terracottaColors.ganesh,
          zIndex: 2,
          letterSpacing: '0.5px',
        }}>
          COMING SOON
        </div>
        
        {/* Placeholder image for pottery */}
        <div
          style={{
            width: '100%',
            height: '220px',
            background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center', color: terracottaColors.warning }}>
            <TrophyOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              🏺 All Pottery Items
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Title 
          level={5} 
          style={{ 
            marginBottom: '8px',
            color: terracottaColors.warning,
            fontSize: '16px',
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
            fontSize: '14px'
          }}
        >
          All pottery items will be available after Ganesh festival
        </Text>

        {/* Features of pottery */}
        <div style={{ marginBottom: '16px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text style={{ fontSize: '12px', color: terracottaColors.textSecondary }}>
              ✨ Handcrafted Clay Products
            </Text>
            <Text style={{ fontSize: '12px', color: terracottaColors.textSecondary }}>
              🌿 Eco-friendly & Natural
            </Text>
            <Text style={{ fontSize: '12px', color: terracottaColors.textSecondary }}>
              🏠 Traditional Cookware
            </Text>
          </Space>
        </div>

        <Alert
          message="Festive Season Notice"
          description="During Ganesh season, we focus on crafting beautiful Ganesh idols. Our pottery collection will return soon!"
          type="info"
          showIcon
          style={{
            fontSize: '12px',
            marginBottom: '16px',
            backgroundColor: `${terracottaColors.ganesh}10`,
            border: `1px solid ${terracottaColors.ganesh}30`,
          }}
        />
      </div>

      {/* Action Button */}
      <div style={{ 
        padding: '16px', 
        paddingTop: 0,
      }}>
        <Button
          type="primary"
          icon={<NotificationOutlined />}
          block
          style={{
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            fontSize: '14px',
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
            fontSize: '11px',
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