import React from 'react';
import { Row, Col, Card, Typography, Avatar } from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  WarningOutlined,
  EyeInvisibleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const StatisticsCards = ({ statistics }) => {
  // Extract statistics including hyderabadOnlyProducts with fallback to 0
  const { totalProducts, totalValue, lowStockProducts, hiddenProducts, hyderabadOnlyProducts = 0 } = statistics;

  const statsData = [
    {
      title: 'Total Products',
      value: totalProducts,
      subtitle: 'In inventory',
      icon: <ShopOutlined style={{ fontSize: '32px' }} />,
      color: '#D2691E',
      bgColor: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)'
    },
    {
      title: 'Total Value',
      value: `₹${totalValue.toLocaleString()}`,
      subtitle: 'Inventory worth',
      icon: <DollarOutlined style={{ fontSize: '32px' }} />,
      color: '#6B7821',
      bgColor: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)'
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts,
      subtitle: 'Need attention',
      icon: <WarningOutlined style={{ fontSize: '32px' }} />,
      color: '#FF8F00',
      bgColor: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)'
    },
    {
      title: 'Hidden Products',
      value: hiddenProducts,
      subtitle: 'Not visible to customers',
      icon: <EyeInvisibleOutlined style={{ fontSize: '32px' }} />,
      color: '#0277BD',
      bgColor: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)'
    },
    {
      title: 'Hyderabad Only',
      value: hyderabadOnlyProducts,
      subtitle: 'Location restricted',
      icon: <EnvironmentOutlined style={{ fontSize: '32px' }} />,
      color: '#8E24AA',
      bgColor: 'linear-gradient(135deg, #8E24AA 0%, #BA68C8 100%)'
    }
  ];

  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
      {statsData.map((stat, index) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
          <Card
            style={{
              background: stat.bgColor,
              color: 'white',
              minHeight: '140px',
              position: 'relative',
              overflow: 'hidden',
              border: 'none',
              borderRadius: '12px',
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  width: '64px',
                  height: '64px',
                  marginRight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                icon={stat.icon}
              />
              <div>
                <Title 
                  level={2} 
                  style={{ 
                    color: 'white', 
                    margin: 0, 
                    fontWeight: 'bold',
                    fontSize: '32px',
                    lineHeight: '1.2'
                  }}
                >
                  {stat.value}
                </Title>
                <Text 
                  style={{ 
                    color: 'white', 
                    fontSize: '16px',
                    opacity: 0.9,
                    display: 'block'
                  }}
                >
                  {stat.title}
                </Text>
                <Text 
                  style={{ 
                    color: 'white', 
                    fontSize: '12px',
                    opacity: 0.7,
                    display: 'block'
                  }}
                >
                  {stat.subtitle}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticsCards;