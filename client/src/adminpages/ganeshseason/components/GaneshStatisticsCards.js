// client/src/adminpages/ganeshseason/components/GaneshStatisticsCards.js
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
} from '@ant-design/icons';

const { Title, Text } = Typography;

const GaneshStatisticsCards = ({ statistics }) => {
  // Extract statistics with fallbacks
  const { 
    totalIdols = 0, 
    hiddenIdols = 0, 
    traditionalIdols = 0, 
    modernIdols = 0, 
    premiumIdols = 0, 
    customizableIdols = 0, 
    averagePrice = 0,
    priceRange = { min: 0, max: 0 }
  } = statistics;

  const statsData = [
    {
      title: 'Total Ganesh Idols',
      value: totalIdols,
      subtitle: 'In inventory',
      icon: <ShopOutlined style={{ fontSize: '32px' }} />,
      color: '#FF8F00',
      bgColor: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
      change: totalIdols > 0 ? '+12%' : '0%',
      changeType: 'increase'
    },
    {
      title: 'Average Price',
      value: `₹${averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtitle: 'Per idol',
      icon: <DollarOutlined style={{ fontSize: '32px' }} />,
      color: '#6B7821',
      bgColor: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
      change: '₹15k avg',
      changeType: 'neutral'
    },
    {
      title: 'Traditional Idols',
      value: traditionalIdols,
      subtitle: 'Classic designs',
      icon: <CrownOutlined style={{ fontSize: '32px' }} />,
      color: '#8E24AA',
      bgColor: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)',
      change: `${Math.round((traditionalIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Modern Idols',
      value: modernIdols,
      subtitle: 'Contemporary style',
      icon: <StarOutlined style={{ fontSize: '32px' }} />,
      color: '#1976D2',
      bgColor: 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)',
      change: `${Math.round((modernIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Premium Idols',
      value: premiumIdols,
      subtitle: 'High-end collection',
      icon: <TrophyOutlined style={{ fontSize: '32px' }} />,
      color: '#D32F2F',
      bgColor: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)',
      change: `${Math.round((premiumIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Customizable',
      value: customizableIdols,
      subtitle: 'Can be customized',
      icon: <ToolOutlined style={{ fontSize: '32px' }} />,
      color: '#0277BD',
      bgColor: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
      change: `${Math.round((customizableIdols / Math.max(totalIdols, 1)) * 100)}%`,
      changeType: 'increase'
    },
    {
      title: 'Price Range',
      value: `₹${priceRange.min.toLocaleString()}-${priceRange.max.toLocaleString()}`,
      subtitle: 'Min - Max pricing',
      icon: <FireOutlined style={{ fontSize: '32px' }} />,
      color: '#795548',
      bgColor: 'linear-gradient(135deg, #795548 0%, #A1887F 100%)',
      change: 'Range',
      changeType: 'neutral'
    },
    {
      title: 'Hidden Idols',
      value: hiddenIdols,
      subtitle: 'Not visible to customers',
      icon: <EyeInvisibleOutlined style={{ fontSize: '32px' }} />,
      color: '#616161',
      bgColor: 'linear-gradient(135deg, #616161 0%, #9E9E9E 100%)',
      change: hiddenIdols > 0 ? 'Active' : 'None',
      changeType: hiddenIdols > 0 ? 'decrease' : 'neutral'
    },
  ];

  // Additional statistics for leads and orders (these would come from API/database)
  const ganeshBusinessStats = [
    {
      title: 'Active Leads',
      value: 24,
      subtitle: 'Customers interested',
      icon: <TeamOutlined style={{ fontSize: '32px' }} />,
      color: '#FF5722',
      bgColor: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
      change: '+5 today',
      changeType: 'increase'
    },
    {
      title: 'Orders Placed',
      value: 12,
      subtitle: 'With advance paid',
      icon: <ShoppingCartOutlined style={{ fontSize: '32px' }} />,
      color: '#4CAF50',
      bgColor: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
      change: '₹84k total',
      changeType: 'increase'
    },
    {
      title: 'Conversion Rate',
      value: '50%',
      subtitle: 'Leads to orders',
      icon: <TrophyOutlined style={{ fontSize: '32px' }} />,
      color: '#E91E63',
      bgColor: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
      change: '+8% this week',
      changeType: 'increase'
    },
    {
      title: 'Avg Order Value',
      value: '₹18,500',
      subtitle: 'Per completed order',
      icon: <StarOutlined style={{ fontSize: '32px' }} />,
      color: '#9C27B0',
      bgColor: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)',
      change: '+₹2k from last year',
      changeType: 'increase'
    }
  ];

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'increase': return '#4CAF50';
      case 'decrease': return '#F44336';
      default: return '#757575';
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'increase': return '↗';
      case 'decrease': return '↘';
      default: return '→';
    }
  };

  const StatCard = ({ stat }) => (
    <Card
      style={{
        background: stat.bgColor,
        color: 'white',
        minHeight: '160px',
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
      bodyStyle={{ padding: '24px' }}
    >
      {/* Decorative circle */}
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
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
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
          <Text 
            style={{ 
              color: 'white', 
              fontSize: '15px',
              opacity: 0.95,
              display: 'block',
              marginBottom: '2px',
              fontWeight: '500'
            }}
          >
            {stat.title}
          </Text>
          <Text 
            style={{ 
              color: 'white', 
              fontSize: '12px',
              opacity: 0.8,
              display: 'block'
            }}
          >
            {stat.subtitle}
          </Text>
          
          {/* Change indicator */}
          <div style={{ 
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {getChangeIcon(stat.changeType)} {stat.change}
            </span>
          </div>
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
            backdropFilter: 'blur(10px)'
          }}
          icon={stat.icon}
        />
      </div>
    </Card>
  );

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Ganesh Inventory Statistics */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px', color: '#FF8F00', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShopOutlined /> Ganesh Idol Inventory
        </Title>
        <Row gutter={[16, 16]}>
          {statsData.map((stat, index) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={3} key={index}>
              <StatCard stat={stat} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Business Performance Statistics */}
      <div>
        <Title level={4} style={{ marginBottom: '16px', color: '#FF5722', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined /> Ganesh Season Business
        </Title>
        <Row gutter={[16, 16]}>
          {ganeshBusinessStats.map((stat, index) => (
            <Col xs={24} sm={12} md={6} lg={6} xl={6} key={index}>
              <StatCard stat={stat} />
            </Col>
          ))}
        </Row>
      </div>

      {/* Quick Insights */}
      <Card 
        style={{ 
          marginTop: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
          border: '2px solid #FFB74D'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Title level={5} style={{ margin: 0, marginBottom: '12px', color: '#E65100' }}>
          🕉️ Ganesh Season Insights
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Most Popular Category"
              value={traditionalIdols >= modernIdols && traditionalIdols >= premiumIdols ? 'Traditional' : 
                     modernIdols >= premiumIdols ? 'Modern' : 'Premium'}
              valueStyle={{ color: '#FF8F00', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Customization Rate"
              value={Math.round((customizableIdols / Math.max(totalIdols, 1)) * 100)}
              suffix="%"
              valueStyle={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Inventory Status"
              value={totalIdols > 0 ? 'Ready' : 'Setup Required'}
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