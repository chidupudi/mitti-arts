// ProductTabs.jsx
import React, { memo } from 'react';
import {
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  List,
  Avatar,
  Rate,
  Button,
  Alert,
  Progress,
  Space,
} from 'antd';
import {
  StarFilled,
  HeartOutlined,
  ReconciliationOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Terracotta theme colors
const colors = {
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
};

// Custom styles
const customStyles = {
  tabsContainer: {
    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${colors.backgroundLight}20 100%)`,
    border: `1px solid ${colors.divider}`,
    borderRadius: '12px',
  },
};

// Product Tabs Component
const ProductTabs = memo(({ product }) => {
  const specifications = [
    { label: 'Material', value: product?.material || 'Premium Natural Clay' },
    { label: 'Dimensions', value: product?.dimensions || 'Standard Size' },
    { label: 'Weight', value: product?.weight || 'Standard Weight' },
    { label: 'Color', value: product?.color || 'Natural Terracotta' },
    { label: 'Origin', value: 'Handmade in India' },
    { label: 'Care', value: 'Hand wash recommended' },
  ];

  const reviews = [
    {
      name: 'Priya Sharma',
      rating: 5,
      date: '2 weeks ago',
      review: 'Absolutely love this product! The quality is exceptional and it looks beautiful in my kitchen. Highly recommended!',
    },
    {
      name: 'Rajesh Kumar',
      rating: 4,
      date: '1 month ago',
      review: 'Good quality product. Fast delivery and well packaged. Worth the price.',
    },
    {
      name: 'Anita Patel',
      rating: 5,
      date: '2 months ago',
      review: 'Traditional craftsmanship at its finest. The attention to detail is remarkable.',
    },
  ];

  const whyClayPots = [
    {
      title: 'Amazing Flavor',
      description: 'Locks in moisture and aromas for incredibly delicious, never-dry food.',
      icon: <FireOutlined style={{ color: '#D2691E' }} />,
    },
    {
      title: 'Naturally Healthy',
      description: 'Cooks with less oil, preserves nutrients, and balances food pH.',
      icon: <HeartOutlined style={{ color: '#D2691E' }} />,
    },
    {
      title: 'Eco-Friendly & Efficient',
      description: 'Sustainable choice that saves energy and lasts for years.',
      icon: <ReconciliationOutlined style={{ color: '#D2691E' }} />,
    },
    {
      title: 'Mindful Cooking',
      description: 'Connects you to ancient traditions and encourages slow, wholesome meals.',
      icon: <ClockCircleOutlined style={{ color: '#D2691E' }} />,
    },
  ];

  const cleaningSteps = [
    {
      title: 'Rinse & Soak',
      content: 'After cooking, let your pot cool completely. Scrape out any food residue. Then, rinse it thoroughly with plain water. For stuck-on bits, you can soak it in water for 15-20 minutes to loosen them.'
    },
    {
      title: 'Choose Your Natural Scrubber',
      content: (
        <>
          <Paragraph><strong>Coconut Scrubber:</strong> This is your best friend! A natural coconut fiber scrubber is gentle yet effective. It cleans without scratching and actually helps to keep the pot's surface smooth over time.</Paragraph>
          <Paragraph><strong>Avoid:</strong> Metal scrubbers or harsh abrasive pads – these can damage the clay.</Paragraph>
        </>
      )
    },
    {
      title: 'Your Natural Cleaning Powder Powerhouses',
      content: (
        <>
          <Paragraph><strong>Rice Flour or Gram Flour (Besan):</strong> These are fantastic everyday cleaners! Simply sprinkle a generous amount onto the wet pot and scrub gently with your coconut scrubber. They absorb oils and residue beautifully.</Paragraph>
          <Paragraph><strong>Baking Soda:</strong> For a deeper clean or tougher spots, baking soda is excellent. Make a paste with a little water and scrub. It's great for neutralizing odors too!</Paragraph>
          <Paragraph><strong>Ash Powder (The Traditional Secret!):</strong> If you have access to clean wood ash (like from a bonfire or wood-burning stove), it's truly the best! Ash is a natural abrasive and degreaser. Sprinkle it on, scrub, and watch your pot sparkle!</Paragraph>
        </>
      )
    },
    {
      title: 'Rinse Thoroughly',
      content: 'After scrubbing, rinse your pot very thoroughly under running water. Make sure no cleaning powder residue remains.'
    }
  ];

  const mouldSteps = [
    'Scrub with a Coconut Scrubber: Give the mouldy areas a good scrub with your natural coconut scrubber.',
    'Baking Soda Power: Make a paste with baking soda and water and scrub the mouldy spots vigorously. The baking soda will help lift the mould and neutralize any odors.',
    'Sunlight (Nature\'s Sterilizer): After cleaning, let your pot dry completely in direct sunlight for a few hours. Sunlight is a natural disinfectant and will help kill any remaining mould spores.'
  ];

  const storingSteps = [
    'Air Dry Completely: This is crucial! Always let your clay pot air dry completely before storing it. Never store it damp, as this can lead to mould growth.',
    'Good Airflow: Store your pot in a well-ventilated area. You can even leave the lid slightly ajar if storing with the lid on, to ensure airflow.'
  ];

  return (
    <Card style={{ ...customStyles.tabsContainer, marginTop: '48px' }}>
      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="Description" key="1">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Product Description</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
              {product.description || `The ${product.name} represents the perfect blend of traditional craftsmanship and modern design. Each piece is carefully handcrafted by skilled artisans who have perfected their techniques over generations.`}
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
              Made from premium quality materials, this product ensures durability while maintaining aesthetic appeal. The natural variations in color and texture make each piece unique, adding character to your collection.
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Whether you're looking to enhance your daily routine or searching for the perfect gift, this product combines functionality with timeless beauty that will be appreciated for years to come.
            </Paragraph>
            
            {/* Why Choose Clay Pots Section */}
            <Title level={3} style={{ color: colors.text, marginTop: '32px', marginBottom: '24px' }}>
              Why Choose Clay Pots?
            </Title>
            
            <Row gutter={[24, 24]}>
              {whyClayPots.map((benefit, index) => (
                <Col xs={24} md={12} key={index}>
                  <Card 
                    style={{ 
                      borderRadius: '12px', 
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(210, 105, 30, 0.08)'
                    }}
                  >
                    <Space align="start">
                      <Avatar
                        style={{ 
                          backgroundColor: 'rgba(210, 105, 30, 0.1)', 
                          color: '#D2691E',
                        }}
                        icon={benefit.icon}
                        size={48}
                      />
                      <div>
                        <Text strong style={{ fontSize: 18, color: '#A0522D', display: 'block' }}>
                          {benefit.title}
                        </Text>
                        <Text style={{ fontSize: 15 }}>
                          {benefit.description}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* Add Hyderabad-only information in description if applicable */}
            {product.hyderabadOnly && (
              <Alert
                message="Delivery Information"
                description="This product is available for delivery only within Hyderabad city limits. Please ensure your shipping address is within Hyderabad before placing an order."
                type="info"
                icon={<EnvironmentOutlined />}
                showIcon
                style={{
                  marginTop: '24px',
                  borderRadius: '8px',
                  backgroundColor: '#9C27B010',
                  border: '1px solid #9C27B030',
                  color: '#9C27B0',
                }}
              />
            )}
          </div>
        </TabPane>

        <TabPane tab="Specifications" key="2">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Product Specifications</Title>
            <Row gutter={[16, 16]}>
              {specifications.map((spec, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    size="small"
                    style={{
                      border: `1px solid ${spec.label === 'Delivery' && product.hyderabadOnly ? '#9C27B030' : colors.divider}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: spec.label === 'Delivery' && product.hyderabadOnly ? '#9C27B008' : 'inherit',
                    }}
                    bodyStyle={{ padding: '16px' }}
                    hoverable
                  >
                    <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                      {spec.label}
                    </Text>
                    <Text strong>{spec.value}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </TabPane>

        <TabPane tab="Reviews" key="3">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Customer Reviews</Title>
            
            {/* Review Summary */}
            <Card
              style={{
                background: `${colors.primary}08`,
                border: `1px solid ${colors.primary}20`,
                borderRadius: '12px',
                marginBottom: '24px',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Title level={1} style={{ margin: 0, color: colors.primary, fontSize: '48px' }}>
                    {product.rating}
                  </Title>
                  <Rate
                    value={product.rating}
                    allowHalf
                    disabled
                    style={{ color: colors.primary, marginBottom: '8px' }}
                  />
                  <Text type="secondary">Based on {product.reviews} reviews</Text>
                </Col>
                
                <Col xs={24} sm={16}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = Math.random() * 80 + 10;
                    const count = Math.floor(Math.random() * 50 + 10);
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <Text style={{ minWidth: '20px' }}>{stars}</Text>
                        <StarFilled style={{ fontSize: '16px', color: colors.primary, margin: '0 8px' }} />
                        <Progress
                          percent={percentage}
                          size="small"
                          strokeColor={colors.primary}
                          style={{ flex: 1, margin: '0 8px' }}
                          showInfo={false}
                        />
                        <Text type="secondary" style={{ minWidth: '30px' }}>{count}</Text>
                      </div>
                    );
                  })}
                </Col>
              </Row>
            </Card>

            {/* Individual Reviews */}
            <List
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item>
                  <Card
                    style={{
                      width: '100%',
                      border: `1px solid ${colors.divider}`,
                      borderRadius: '8px',
                      marginBottom: '16px',
                    }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={50}
                          style={{ backgroundColor: colors.primary, fontSize: '18px', fontWeight: 600 }}
                        >
                          {review.name.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Space direction="vertical" size={4}>
                          <Text strong style={{ fontSize: '16px' }}>{review.name}</Text>
                          <Space>
                            <Rate
                              value={review.rating}
                              disabled
                              size="small"
                              style={{ color: colors.primary }}
                            />
                            <Text type="secondary">{review.date}</Text>
                          </Space>
                        </Space>
                      }
                      description={
                        <Paragraph style={{ marginTop: '12px', fontSize: '15px', lineHeight: '1.6' }}>
                          {review.review}
                        </Paragraph>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />

            <Button
              type="default"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: '8px',
                fontWeight: 600,
                height: '40px',
              }}
            >
              Write a Review
            </Button>
          </div>
        </TabPane>

        <TabPane tab="Care Guide" key="4">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text, marginBottom: '24px', textAlign: 'center' }}>
              Caring for Your Clay Pot: Simple Steps for Years of Delicious Meals!
            </Title>
            
            {/* No Soap Warning */}
            <Alert
              message="Important Note: No Soap! 🚫"
              description="Clay is porous, meaning it can absorb liquids – including dish soap! Using soap will make your food taste like soap, and nobody wants that! We'll stick to natural cleaners to keep your pot pure."
              type="warning"
              showIcon
              style={{ 
                marginBottom: '32px',
                borderRadius: '8px',
              }}
            />
            
            <Title level={4} style={{ color: '#D2691E', marginBottom: '24px' }}>
              Cleaning Your Clay Pot: Easy & Natural!
            </Title>
            
            <List
              itemLayout="vertical"
              dataSource={cleaningSteps}
              style={{ 
                marginBottom: '32px', 
                border: '1px solid #E8D5C4',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '16px', borderBottom: index < cleaningSteps.length - 1 ? '1px solid #E8D5C4' : 'none' }}>
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Space align="center">
                      <Avatar style={{ backgroundColor: '#D2691E', color: 'white' }}>{index + 1}</Avatar>
                      <Text strong style={{ fontSize: '17px' }}>{item.title}</Text>
                    </Space>
                    <div style={{ marginLeft: '40px' }}>
                      {item.content}
                    </div>
                  </Space>
                </List.Item>
              )}
            />

            {/* Dealing with Mould Section */}
            <Card
              style={{
                marginBottom: '24px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 69, 19, 0.05)',
                border: '1px solid rgba(139, 69, 19, 0.1)',
              }}
            >
              <Title level={4} style={{ color: '#D2691E' }}>
                Dealing with Mould (It Happens!)
              </Title>
              <Paragraph>
                If you notice any mould (usually from storing a damp pot), don't worry! It's easy to fix:
              </Paragraph>
              <List
                dataSource={mouldSteps}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ color: '#D2691E' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            {/* Drying & Storing Section */}
            <Card 
              style={{ 
                marginBottom: '24px',
                borderRadius: '8px',
                backgroundColor: 'rgba(210, 105, 30, 0.05)',
                border: '1px solid rgba(210, 105, 30, 0.1)',
              }}
            >
              <Title level={4} style={{ color: '#D2691E' }}>
                Drying & Storing Your Pot
              </Title>
              <List
                dataSource={storingSteps}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ color: '#D2691E' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            <Alert
              message="Important Notes"
              description={
                <div style={{ marginTop: '8px' }}>
                  <p style={{ margin: '4px 0' }}>• This is a handcrafted product, so slight variations in size, color, and texture are natural and add to its unique charm.</p>
                  <p style={{ margin: '4px 0' }}>• Avoid using in microwave or dishwasher</p>
                  <p style={{ margin: '4px 0' }}>• For first use, rinse with water and let it air dry completely.</p>
                  <p style={{ margin: '4px 0' }}>• Contact our support team if you have any questions about care and maintenance.</p>
                </div>
              }
              type="warning"
              showIcon
              style={{
                marginTop: '24px',
                borderRadius: '8px',
                backgroundColor: `${colors.warning}10`,
                border: `1px solid ${colors.warning}30`,
              }}
            />
            
            {/* Add Hyderabad-only delivery info */}
            {product.hyderabadOnly && (
              <Alert
                message="Delivery Information"
                description="This product is available for delivery only within Hyderabad city limits. Please ensure your delivery address is within Hyderabad before placing an order."
                type="info"
                icon={<EnvironmentOutlined />}
                showIcon
                style={{
                  marginTop: '24px',
                  borderRadius: '8px',
                  backgroundColor: '#9C27B010',
                  border: '1px solid #9C27B030',
                  color: '#9C27B0',
                }}
              />
            )}
            
            <Paragraph style={{ marginTop: '24px', textAlign: 'center', fontStyle: 'italic' }}>
              By following these simple, natural cleaning methods, your clay pot will remain a cherished and effective cooking companion for many years to come! Enjoy healthier, more flavorful meals with ease.
            </Paragraph>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
});

ProductTabs.displayName = 'ProductTabs';

export default ProductTabs;