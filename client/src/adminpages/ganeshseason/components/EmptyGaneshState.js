// client/src/adminpages/ganeshseason/components/EmptyGaneshState.js
import React from 'react';
import { Card, Typography, Button, Empty, Space, Alert, Row, Col } from 'antd';
import { 
  PlusOutlined, 
  HomeOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const EmptyGaneshState = ({ searchTerm, onAddIdol }) => {
  const suggestions = [
    {
      icon: <CrownOutlined style={{ color: '#8E24AA' }} />,
      title: 'Traditional Ganesha',
      description: 'Classic designs with authentic clay finish',
      priceRange: '₹8,000 - ₹15,000'
    },
    {
      icon: <StarOutlined style={{ color: '#1976D2' }} />,
      title: 'Modern Eco-Friendly',
      description: 'Contemporary designs with eco-friendly materials',
      priceRange: '₹10,000 - ₹20,000'
    },
    {
      icon: <FireOutlined style={{ color: '#D32F2F' }} />,
      title: 'Premium Collection',
      description: 'Artistic masterpieces with intricate details',
      priceRange: '₹18,000 - ₹31,000'
    }
  ];

  if (searchTerm) {
    // When search returns no results
    return (
      <Card 
        style={{ 
          textAlign: 'center',
          borderRadius: '16px',
          border: '2px dashed #FFB74D',
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 100%)',
          padding: '48px 24px',
        }}
      >
        <Empty
          image={<TempleBuddhistOutlined style={{ fontSize: '80px', color: '#FF8F00' }} />}
          imageStyle={{ height: 100 }}
          description={
            <div>
              <Title level={3} style={{ color: '#E65100', marginBottom: '8px' }}>
                🔍 No Ganesh Idols Found
              </Title>
              <Text style={{ fontSize: '16px', color: '#FF6F00' }}>
                No idols match your search for "{searchTerm}"
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Try adjusting your search criteria or browse all available idols.
              </Text>
            </div>
          }
        >
          <Space>
            <Button
              type="primary"
              size="large"
              style={{
                background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
              }}
              onClick={() => window.location.reload()}
            >
              Clear Search
            </Button>
            <Button
              type="default"
              size="large"
              icon={<PlusOutlined />}
              onClick={onAddIdol}
              style={{
                borderColor: '#FF8F00',
                color: '#FF8F00',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              Add New Idol
            </Button>
          </Space>
        </Empty>
      </Card>
    );
  }

  // When no idols exist at all
  return (
    <div style={{ padding: '24px 0' }}>
      {/* Main Empty State */}
      <Card 
        style={{ 
          textAlign: 'center',
          borderRadius: '16px',
          border: '2px dashed #FFB74D',
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 100%)',
          padding: '64px 24px',
          marginBottom: '24px'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
          borderRadius: '50%',
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: '0 8px 32px rgba(255, 143, 0, 0.3)'
        }}>
          <TempleBuddhistOutlined style={{ fontSize: '64px', color: 'white' }} />
        </div>

        <Title level={2} style={{ color: '#E65100', marginBottom: '16px' }}>
          🕉️ Welcome to Ganesh Season!
        </Title>
        
        <Paragraph style={{ fontSize: '18px', color: '#FF6F00', marginBottom: '8px' }}>
          Ready to start your Ganesh idol inventory?
        </Paragraph>
        
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>
          Create your first Ganesh idol listing to begin accepting customer leads and managing advance payments. 
          Build a beautiful collection that customers can browse and request quotes for.
        </Paragraph>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onAddIdol}
          style={{
            background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
            border: 'none',
            borderRadius: '12px',
            height: '48px',
            padding: '0 32px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(255, 143, 0, 0.3)'
          }}
        >
          🕉️ Add Your First Ganesh Idol
        </Button>
      </Card>

      {/* Getting Started Guide */}
      <Card
        title={
          <Space>
            <BulbOutlined style={{ color: '#FF8F00' }} />
            <span style={{ color: '#E65100' }}>Getting Started with Ganesh Season</span>
          </Space>
        }
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          borderColor: '#FFE0B2'
        }}
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Alert
              message="How Ganesh Season Works"
              description={
                <div>
                  <p><strong>1. Lead Capture:</strong> Customers browse idols and submit interest forms (no payment required)</p>
                  <p><strong>2. Admin Contact:</strong> You contact customers to discuss customization and finalize pricing</p>
                  <p><strong>3. Advance Payment:</strong> Customer pays advance amount based on price bracket</p>
                  <p><strong>4. Order Management:</strong> Track orders from advance payment to delivery</p>
                </div>
              }
              type="info"
              style={{ marginBottom: '16px' }}
              icon={<InfoCircleOutlined />}
            />
          </Col>
        </Row>

        <div style={{ marginTop: '16px' }}>
          <Title level={5} style={{ color: '#E65100', marginBottom: '16px' }}>
            💡 Suggested Idol Categories to Add:
          </Title>
          
          <Row gutter={[16, 16]}>
            {suggestions.map((suggestion, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                    border: '1px solid #FFE0B2',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    {suggestion.icon}
                    <Text strong style={{ marginLeft: '8px', color: '#E65100' }}>
                      {suggestion.title}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    {suggestion.description}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#4CAF50', fontWeight: 'bold' }}>
                    {suggestion.priceRange}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card>

      {/* Quick Tips */}
      <Card
        title={
          <span style={{ color: '#E65100' }}>💰 Advance Payment Brackets</span>
        }
        style={{ 
          borderRadius: '12px',
          borderColor: '#FFE0B2'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ background: '#E8F5E8', border: '1px solid #C8E6C9' }}>
              <Text strong style={{ color: '#2E7D32' }}>₹8k - ₹10k Range</Text>
              <br />
              <Text style={{ fontSize: '12px', color: '#388E3C' }}>₹2,000 Advance</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ background: '#FFF3E0', border: '1px solid #FFE0B2' }}>
              <Text strong style={{ color: '#E65100' }}>₹10k - ₹15k Range</Text>
              <br />
              <Text style={{ fontSize: '12px', color: '#FF8F00' }}>₹2,500 Advance</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" style={{ background: '#FCE4EC', border: '1px solid #F8BBD9' }}>
              <Text strong style={{ color: '#C2185B' }}>Above ₹15k</Text>
              <br />
              <Text style={{ fontSize: '12px', color: '#AD1457' }}>₹3,000 Advance</Text>
            </Card>
          </Col>
        </Row>
        
        <Alert
          message="Advance amounts are automatically calculated based on your price ranges"
          type="success"
          style={{ marginTop: '16px' }}
          showIcon
        />
      </Card>
    </div>
  );
};

export default EmptyGaneshState;