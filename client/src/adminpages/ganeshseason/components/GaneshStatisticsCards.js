// Updated GaneshStatisticsCards.js with ImageKit utilities
import React from 'react';
import { Row, Col, Card, Typography, Avatar, Statistic } from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  ToolOutlined,
  EyeInvisibleOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  PictureOutlined,
  WarningOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const GaneshStatisticsCards = ({ statistics }) => {
  // Extract statistics with fallbacks to prevent errors if data is not loaded
  const { 
    totalIdols = 0, 
    hiddenIdols = 0, 
    traditionalIdols = 0, 
    modernIdols = 0, 
    premiumIdols = 0, 
    customizableIdols = 0, 
    averagePrice = 0,
    priceRange = { min: 0, max: 0 },
    // Add media statistics
    totalImages = 0,
    totalVideos = 0,
    idolsWithVideos = 0,
    idolsWithoutMedia = 0
  } = statistics || {};

  // Calculate media statistics if not provided
  const mediaStats = React.useMemo(() => {
    if (statistics?.ganeshIdols) {
      const idols = statistics.ganeshIdols;
      let totalImgs = 0;
      let totalVids = 0;
      let idolsWithVids = 0;
      let idolsWithoutMed = 0;

      idols.forEach(idol => {
        const images = idol.images || [];
        // Use local logic to count images and videos
        const imageCount = (images || []).filter(img => img && typeof img === 'string').length;
        const videoCount = (idol.videos || []).filter(vid => vid && typeof vid === 'object').length;
        
        totalImgs += imageCount;
        totalVids += videoCount;
        
        if (videoCount > 0) idolsWithVids++;
        if (imageCount === 0 && videoCount === 0) idolsWithoutMed++;
      });

      return {
        totalImages: totalImgs,
        totalVideos: totalVids,
        idolsWithVideos: idolsWithVids,
        idolsWithoutMedia: idolsWithoutMed
      };
    }
    
    return {
      totalImages,
      totalVideos,
      idolsWithVideos,
      idolsWithoutMedia
    };
  }, [statistics, totalImages, totalVideos, idolsWithVideos, idolsWithoutMedia]);

  // Updated statsData array with media statistics
  const statsData = [
    {
      title: 'Total Ganesh Idols',
      value: totalIdols,
      subtitle: 'In inventory',
      icon: <ShopOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
      change: totalIdols > 0 ? '+12%' : '0%',
      changeType: 'increase'
    },
    {
      title: 'Total Images',
      value: mediaStats.totalImages,
      subtitle: `Across ${totalIdols} idols`,
      icon: <PictureOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
      change: `${mediaStats.totalImages > 0 ? Math.round(mediaStats.totalImages / Math.max(totalIdols, 1) * 10) / 10 : 0} avg/idol`,
      changeType: 'neutral'
    },
    {
      title: 'Total Videos',
      value: mediaStats.totalVideos,
      subtitle: `${mediaStats.idolsWithVideos} idols have videos`,
      icon: <FireOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)',
      change: `${Math.round((mediaStats.idolsWithVideos / Math.max(totalIdols, 1)) * 100)}% with videos`,
      changeType: mediaStats.totalVideos > 0 ? 'increase' : 'neutral'
    },
    {
      title: 'Average Price',
      value: `₹${averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtitle: 'Per idol',
      icon: <DollarOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
      change: '₹15k avg',
      changeType: 'neutral'
    },
    {
      title: 'Traditional Idols',
      value: traditionalIdols,
      subtitle: 'Classic designs',
      icon: <CrownOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)',
      change: `${Math.round((traditionalIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Modern Idols',
      value: modernIdols,
      subtitle: 'Contemporary style',
      icon: <StarOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
      change: `${Math.round((modernIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Premium Idols',
      value: premiumIdols,
      subtitle: 'High-end collection',
      icon: <TrophyOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)',
      change: `${Math.round((premiumIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Customizable',
      value: customizableIdols,
      subtitle: 'Can be customized',
      icon: <ToolOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
      change: `${Math.round((customizableIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'increase'
    },
  ];

  // Add new media-specific statistics section
  const mediaStatistics = [
    {
      title: 'Media Coverage',
      value: `${totalIdols - mediaStats.idolsWithoutMedia}/${totalIdols}`,
      subtitle: 'Idols with media',
      icon: <PictureOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      change: `${Math.round(((totalIdols - mediaStats.idolsWithoutMedia) / Math.max(totalIdols, 1)) * 100)}% coverage`,
      changeType: 'increase'
    },
    {
      title: 'Video Enhanced',
      value: mediaStats.idolsWithVideos,
      subtitle: 'Idols with videos',
      icon: <FireOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
      change: `${Math.round((mediaStats.idolsWithVideos / Math.max(totalIdols, 1)) * 100)}% enhanced`,
      changeType: mediaStats.idolsWithVideos > 0 ? 'increase' : 'neutral'
    },
    {
      title: 'Avg Media/Idol',
      value: `${totalIdols > 0 ? Math.round(((mediaStats.totalImages + mediaStats.totalVideos) / totalIdols) * 10) / 10 : 0}`,
      subtitle: 'Images + Videos',
      icon: <StarOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)',
      change: `Max 8 per idol`,
      changeType: 'neutral'
    },
    {
      title: 'Missing Media',
      value: mediaStats.idolsWithoutMedia,
      subtitle: 'Need media upload',
      icon: <WarningOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
      change: mediaStats.idolsWithoutMedia > 0 ? 'Needs attention' : 'All covered',
      changeType: mediaStats.idolsWithoutMedia > 0 ? 'decrease' : 'increase'
    }
  ];

  // Business stats remain the same
  const ganeshBusinessStats = [
    {
      title: 'Active Leads',
      value: 24,
      subtitle: 'Customers interested',
      icon: <TeamOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
      change: '+5 today',
      changeType: 'increase'
    },
    {
      title: 'Orders Placed',
      value: 12,
      subtitle: 'With advance paid',
      icon: <ShoppingCartOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      change: '₹84k total',
      changeType: 'increase'
    },
    {
      title: 'Conversion Rate',
      value: '50%',
      subtitle: 'Leads to orders',
      icon: <TrophyOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
      change: '+8% this week',
      changeType: 'increase'
    },
    {
      title: 'Avg Order Value',
      value: '₹18,500',
      subtitle: 'Per completed order',
      icon: <StarOutlined style={{ fontSize: '32px' }} />,
      bgColor: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)',
      change: '+₹2k vs last year',
      changeType: 'increase'
    }
  ];

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'increase': return '↗';
      case 'decrease': return '↘';
      default: return '→';
    }
  };

  // Reusable StatCard component with your custom styling
  const StatCard = ({ stat }) => (
    <Card
      style={{
        background: stat.bgColor,
        color: 'white',
        height: '100%', // Ensure all cards in a row have the same height
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
      bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(40px, -40px)',
        }}
      />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1, flexGrow: 1 }}>
        <div style={{ flex: 1 }}>
          <Title 
            level={2} 
            style={{ 
              color: 'white', 
              margin: 0, 
              fontWeight: 'bold',
              fontSize: '28px',
              lineHeight: '1.2',
              marginBottom: '4px'
            }}
          >
            {stat.value}
          </Title>
          <Text style={{ color: 'white', fontSize: '15px', opacity: 0.95, display: 'block', marginBottom: '2px', fontWeight: '500' }}>
            {stat.title}
          </Text>
          <Text style={{ color: 'white', fontSize: '12px', opacity: 0.8, display: 'block' }}>
            {stat.subtitle}
          </Text>
        </div>
        <Avatar
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
          icon={stat.icon}
        />
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '8px', position: 'relative', zIndex: 1 }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '600' }}>
          {getChangeIcon(stat.changeType)} {stat.change}
        </span>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Ganesh Inventory Statistics Section */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#FF8F00', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShopOutlined /> Ganesh Idol Inventory
        </Title>
        <Row gutter={[24, 24]}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={index}>
              <StatCard stat={stat} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Media Statistics Section */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#E91E63', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PictureOutlined /> Media & Content Statistics
        </Title>
        <Row gutter={[24, 24]}>
          {mediaStatistics.map((stat, index) => (
            <Col xs={24} sm={12} md={12} lg={6} xl={6} key={index}>
              <StatCard stat={stat} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Business Performance Statistics Section */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#FF5722', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined /> Ganesh Season Business
        </Title>
        <Row gutter={[24, 24]}>
          {ganeshBusinessStats.map((stat, index) => (
            <Col xs={24} sm={12} md={12} lg={6} xl={6} key={index}>
              <StatCard stat={stat} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Quick Insights Section */}
      <Card 
        style={{ 
          marginTop: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          border: '2px solid #FFB74D'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Title level={5} style={{ margin: 0, marginBottom: '16px', color: '#E65100' }}>
          🕉️ Ganesh Season Insights
        </Title>
        <Row gutter={[16, 24]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Most Popular Category"
              value={traditionalIdols >= modernIdols && traditionalIdols >= premiumIdols ? 'Traditional' : 
                      modernIdols >= premiumIdols ? 'Modern' : 'Premium'}
              valueStyle={{ color: '#FF8F00', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Customization Rate"
              value={Math.round((customizableIdols / Math.max(totalIdols, 1)) * 100)}
              suffix="%"
              valueStyle={{ color: '#0277BD', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Inventory Status"
              value={totalIdols > 0 ? 'Ready for Season' : 'Setup Required'}
              valueStyle={{ 
                color: totalIdols > 0 ? '#4CAF50' : '#FF5722', 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GaneshStatisticsCards;