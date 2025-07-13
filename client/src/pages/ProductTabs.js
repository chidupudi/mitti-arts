// ProductTabs.jsx - Enhanced with Ganesh Idol Features and Formatted Descriptions
import React, { memo, useMemo } from 'react';
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
  Tag,
  Divider,
} from 'antd';
import {
  StarFilled,
  HeartOutlined,
  ReconciliationOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  CrownOutlined,
  StarOutlined,
  PhoneOutlined,
  SafetyOutlined,
  DeliveredProcedureOutlined,
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
  ganesh: '#FF6B35',
  eco: '#4CAF50',
};

// Custom styles
const customStyles = {
  tabsContainer: {
    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${colors.backgroundLight}20 100%)`,
    border: `1px solid ${colors.divider}`,
    borderRadius: '12px',
  },
};

// UPDATED: Helper function to format description into bullet points
const formatDescriptionAsPoints = (description) => {
  if (!description) return [];
  
  // Split by common delimiters like periods, semicolons, or line breaks
  const points = description
    .split(/[.;]|\n/)
    .map(point => point.trim())
    .filter(point => point.length > 10) // Filter out very short segments
    .map(point => {
      // Remove leading dashes or bullets if they exist
      return point.replace(/^[-•*]\s*/, '').trim();
    })
    .filter(point => point.length > 0);
  
  // If we get very few points, try splitting by commas for shorter segments
  if (points.length <= 2) {
    const alternativePoints = description
      .split(/,|\n/)
      .map(point => point.trim())
      .filter(point => point.length > 5)
      .map(point => point.replace(/^[-•*]\s*/, '').trim())
      .filter(point => point.length > 0);
    
    return alternativePoints.length > points.length ? alternativePoints : points;
  }
  
  return points;
};

// Product Tabs Component
const ProductTabs = memo(({ product }) => {
  // Enhanced specifications for Ganesh idols
  const specifications = product.isGaneshIdol ? [
    { label: 'Material', value: 'Pure Ganga Clay (Sacred & Eco-friendly)' },
    { label: 'Height', value: product?.height || 'Customizable (6" to 36")' },
    { label: 'Weight', value: product?.weight || 'Varies by size' },
    { label: 'Color', value: product?.color || 'Traditional Natural' },
    { label: 'Finishing', value: 'Hand-painted with natural colors' },
    { label: 'Customization', value: 'Available (Height, design, features)' },
    { label: 'Artisan Support', value: 'Supporting local craftsmen communities' },
    { label: 'Heritage', value: 'Traditional techniques passed down generations' },
    { label: 'Pooja Kit', value: 'Complete organic kit included' },
    { label: 'Eco Solution', value: 'Plant sapling for Visarjan' },
  ] : [
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
      review: product.isGaneshIdol 
        ? 'Absolutely beautiful Ganesh idol! The Pooja kit was thoughtfully curated and the eco-friendly approach is commendable. Our family loved the traditional handloom fabrics.' 
        : 'Absolutely love this product! The quality is exceptional and it looks beautiful in my kitchen. Highly recommended!',
    },
    {
      name: 'Rajesh Kumar',
      rating: 5,
      date: '1 month ago',
      review: product.isGaneshIdol
        ? 'Amazing craftsmanship! The artisans really put their heart into this. The plant sapling idea for Visarjan is brilliant - finally a way to celebrate without polluting our waters.'
        : 'Good quality product. Fast delivery and well packaged. Worth the price.',
    },
    {
      name: 'Anita Patel',
      rating: 5,
      date: '2 months ago',
      review: product.isGaneshIdol
        ? 'The attention to detail is remarkable. The organic Kumkum and Haldi made our Pooja even more special. Highly recommend for those who want an authentic, eco-friendly celebration.'
        : 'Traditional craftsmanship at its finest. The attention to detail is remarkable.',
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

  // Ganesh Idol specific features
  const ganeshIdolBenefits = [
    {
      title: 'Sacred Ganga Clay',
      description: 'Made from pure Ganga clay sourced from the sacred Ganges, maintaining spiritual authenticity and divine connection.',
      icon: <StarOutlined style={{ color: colors.ganesh }} />,
    },
    {
      title: 'Supporting Local Artisans',
      description: 'Each purchase directly supports skilled craftsmen and their families, preserving traditional Indian heritage arts.',
      icon: <CrownOutlined style={{ color: colors.ganesh }} />,
    },
    {
      title: 'Complete Pooja Experience',
      description: 'Thoughtfully curated Pooja kit with organic materials for a pure and sacred celebration.',
      icon: <GiftOutlined style={{ color: colors.ganesh }} />,
    },
    {
      title: 'Eco-Friendly Celebration',
      description: 'Revolutionary Visarjan solution that protects our water bodies while creating new life.',
      icon: <EnvironmentOutlined style={{ color: colors.eco }} />,
    },
  ];

  const poojaKitContents = [
    {
      item: 'Farmer-Sourced Organic Kumkum',
      description: 'Pure, vibrant kumkum sourced directly from farmers, free from artificial additives',
      icon: <FireOutlined style={{ color: colors.ganesh }} />,
    },
    {
      item: 'Farmer-Sourced Organic Haldi',
      description: 'Premium quality turmeric powder for authentic traditional rituals',
      icon: <StarFilled style={{ color: '#FFD700' }} />,
    },
    {
      item: 'Natural Vibudhi',
      description: 'Genuine, unadulterated sacred ash for spiritual offerings',
      icon: <StarOutlined style={{ color: colors.textSecondary }} />,
    },
    {
      item: 'Handloom Ikkath Dhoti & Kanduva',
      description: 'Exquisite handmade fabrics celebrating India\'s rich weaving heritage',
      icon: <CrownOutlined style={{ color: colors.secondary }} />,
    },
    {
      item: 'Special Plant Sapling',
      description: 'A carefully chosen plant for your eco-friendly Visarjan ceremony',
      icon: <EnvironmentOutlined style={{ color: colors.eco }} />,
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

  const ganeshVisarjanSteps = [
    {
      title: 'Prepare the Sacred Space',
      content: 'Choose a clean area in your colony, apartment complex, or garden where you can perform the ceremony with dignity and devotion.',
    },
    {
      title: 'Dissolve with Devotion',
      content: 'Our Ganga Clay idols are specially designed to dissolve easily in water. Use minimal water and perform the ceremony with traditional mantras and prayers.',
    },
    {
      title: 'Collect the Sacred Clay',
      content: 'Once dissolved, collect the clay water mixture. This sacred clay is now ready to nurture new life.',
    },
    {
      title: 'Plant New Life',
      content: 'Use the clay mixture as fertile soil for planting the special sapling we provide. Watch as your devotion grows into a living testament of faith.',
    },
    {
      title: 'Nurture & Remember',
      content: 'Care for your plant as it grows, creating a lasting, beautiful memory of your Ganesh Chaturthi celebration.',
    },
  ];

  // UPDATED: Format description as bullet points
  const formattedDescriptionPoints = useMemo(() => {
    if (product.isGaneshIdol) {
      return [
        'Experience the divine presence of Lord Ganesha with our beautifully handcrafted idols made from sacred Ganga Clay',
        'Each piece represents the perfect harmony of traditional craftsmanship, spiritual authenticity, and environmental consciousness',
        'Our skilled artisans, who have perfected their techniques over generations, create each idol with love and devotion using pure Ganga Clay sourced from the sacred Ganges',
        'By choosing our idols, you\'re not just bringing home a beautiful deity, but also supporting local artisan communities and preserving traditional Indian heritage crafts',
        'Every idol comes with a complete Pooja kit, reflecting our commitment to natural and sustainable living, ensuring your celebration is both authentic and pure'
      ];
    }

    if (product.description) {
      const points = formatDescriptionAsPoints(product.description);
      return points.length > 0 ? points : [product.description];
    }

    return [
      `The ${product.name} represents the perfect blend of traditional craftsmanship and modern design`,
      'Each piece is carefully handcrafted by skilled artisans who have perfected their techniques over generations',
      'Made from premium quality materials, this product ensures durability while maintaining aesthetic appeal',
      'The natural variations in color and texture make each piece unique, adding character to your collection',
      'Whether you\'re looking to enhance your daily routine or searching for the perfect gift, this product combines functionality with timeless beauty that will be appreciated for years to come'
    ];
  }, [product.description, product.isGaneshIdol, product.name]);

  return (
    <Card style={{ ...customStyles.tabsContainer, marginTop: '48px' }}>
      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="Description" key="1">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>
              {product.isGaneshIdol ? 'Sacred Ganesh Idol with Complete Celebration Kit' : 'Product Description'}
            </Title>
            
            {product.isGaneshIdol ? (
              // Ganesh Idol Description
              <>
                {/* UPDATED: Display description as formatted bullet points */}
                <div style={{ marginBottom: '24px' }}>
                  <List
                    size="small"
                    dataSource={formattedDescriptionPoints}
                    renderItem={(point, index) => (
                      <List.Item style={{ 
                        padding: '8px 0', 
                        border: 'none',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                          <CheckCircleOutlined style={{ 
                            color: colors.ganesh,
                            fontSize: '16px',
                            marginTop: '4px',
                            flexShrink: 0
                          }} />
                          <Text style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.8',
                            color: colors.text,
                            flex: 1,
                            textAlign: 'justify'
                          }}>
                            {point}
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>

                {/* Complete Pooja Kit Section */}
                <Title level={4} style={{ color: colors.ganesh, marginBottom: '20px' }}>
                  🙏 Complete Pooja Kit Included
                </Title>
                
                <Alert
                  message="Thoughtfully Curated for Your Sacred Celebration"
                  description="Every idol comes with a complete Pooja kit, reflecting our commitment to natural and sustainable living, ensuring your celebration is both authentic and pure."
                  type="info"
                  icon={<GiftOutlined />}
                  showIcon
                  style={{
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: `${colors.ganesh}08`,
                    border: `1px solid ${colors.ganesh}30`,
                  }}
                />

                <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                  {poojaKitContents.map((item, index) => (
                    <Col xs={24} md={12} key={index}>
                      <Card 
                        size="small"
                        style={{ 
                          borderRadius: '8px', 
                          height: '100%',
                          border: `1px solid ${colors.ganesh}20`,
                          backgroundColor: `${colors.ganesh}05`,
                        }}
                        bodyStyle={{ padding: '16px' }}
                      >
                        <Space align="start">
                          <Avatar
                            style={{ 
                              backgroundColor: 'transparent',
                              border: 'none',
                            }}
                            icon={item.icon}
                            size={32}
                          />
                          <div>
                            <Text strong style={{ fontSize: '15px', color: colors.text, display: 'block' }}>
                              {item.item}
                            </Text>
                            <Text style={{ fontSize: '13px', color: colors.textSecondary }}>
                              {item.description}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Greener Visarjan Section */}
                <Title level={4} style={{ color: colors.eco, marginBottom: '20px' }}>
                  🌱 A Greener Visarjan: Nurturing Nature, Not Polluting It
                </Title>
                
                <Alert
                  message="Revolutionary Eco-Friendly Celebration"
                  description="Join us in transforming the traditional Visarjan into an act of environmental stewardship while maintaining all spiritual significance."
                  type="success"
                  icon={<EnvironmentOutlined />}
                  showIcon
                  style={{
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: `${colors.eco}08`,
                    border: `1px solid ${colors.eco}30`,
                  }}
                />

                <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Traditionally, Ganesh idols are immersed in lakes and ponds. However, with increasing water pollution, 
                  this act of devotion often contributes to environmental degradation. We propose a meaningful alternative 
                  that honors both tradition and Mother Earth.
                </Paragraph>

                <Card 
                  style={{ 
                    marginBottom: '24px',
                    borderRadius: '12px',
                    border: `2px solid ${colors.eco}30`,
                    backgroundColor: `${colors.eco}05`,
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <Title level={5} style={{ color: colors.eco, marginBottom: '16px' }}>
                    🌿 Benefits of Our Eco-Friendly Approach:
                  </Title>
                  <List
                    dataSource={[
                      'A pure and heartfelt Pooja experience',
                      'Zero contribution to water pollution',
                      'Growth of new life - a living testament to your faith',
                      'A lasting, beautiful memory of your Ganesh Chaturthi',
                      'Supporting environmental conservation',
                      'Teaching children about responsible celebration',
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ 
                        border: 'none', 
                        padding: '8px 0',
                        display: 'flex',
                        alignItems: 'flex-start',
                        textAlign: 'left'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          width: '100%',
                          gap: '8px'
                        }}>
                          <CheckCircleOutlined style={{ 
                            color: colors.eco, 
                            fontSize: '16px',
                            marginTop: '2px',
                            flexShrink: 0
                          }} />
                          <Text style={{ 
                            fontSize: '14px', 
                            lineHeight: '1.5',
                            textAlign: 'left',
                            flex: 1
                          }}>
                            {item}
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>

                {/* Why Choose Our Ganesh Idols */}
                <Title level={4} style={{ color: colors.text, marginTop: '32px', marginBottom: '24px' }}>
                  Why Choose Our Sacred Ganesh Idols?
                </Title>
                
                <Row gutter={[24, 24]}>
                  {ganeshIdolBenefits.map((benefit, index) => (
                    <Col xs={24} md={12} key={index}>
                      <Card 
                        style={{ 
                          borderRadius: '12px', 
                          height: '100%',
                          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.08)',
                          border: `1px solid ${colors.ganesh}20`,
                        }}
                        bodyStyle={{ padding: '20px' }}
                      >
                        <Space align="start">
                          <Avatar
                            style={{ 
                              backgroundColor: `${colors.ganesh}10`, 
                              color: colors.ganesh,
                              border: `2px solid ${colors.ganesh}30`,
                            }}
                            icon={benefit.icon}
                            size={48}
                          />
                          <div>
                            <Text strong style={{ fontSize: 16, color: colors.ganesh, display: 'block' }}>
                              {benefit.title}
                            </Text>
                            <Text style={{ fontSize: 14, lineHeight: '1.5' }}>
                              {benefit.description}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              // Regular Product Description
              <>
                {/* UPDATED: Display description as formatted bullet points */}
                <div style={{ marginBottom: '24px' }}>
                  <List
                    size="small"
                    dataSource={formattedDescriptionPoints}
                    renderItem={(point, index) => (
                      <List.Item style={{ 
                        padding: '8px 0', 
                        border: 'none',
                        alignItems: 'flex-start'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                          <CheckCircleOutlined style={{ 
                            color: colors.success,
                            fontSize: '16px',
                            marginTop: '4px',
                            flexShrink: 0
                          }} />
                          <Text style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.8',
                            color: colors.text,
                            flex: 1,
                            textAlign: 'justify'
                          }}>
                            {point}
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
                
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
              </>
            )}
            
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
            <Title level={3} style={{ color: colors.text }}>
              {product.isGaneshIdol ? 'Ganesh Idol Specifications' : 'Product Specifications'}
            </Title>
            
            {product.isGaneshIdol && (
              <Alert
                message="Custom Made to Order"
                description="Each Ganesh idol is uniquely handcrafted according to your preferences. Specifications can be customized during the ordering process."
                type="info"
                icon={<CrownOutlined />}
                showIcon
                style={{
                  marginBottom: '24px',
                  borderRadius: '8px',
                  backgroundColor: `${colors.ganesh}08`,
                  border: `1px solid ${colors.ganesh}30`,
                }}
              />
            )}
            
            <Row gutter={[16, 16]}>
              {specifications.map((spec, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    size="small"
                    style={{
                      border: `1px solid ${product.isGaneshIdol ? `${colors.ganesh}30` : colors.divider}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: product.isGaneshIdol ? `${colors.ganesh}05` : 'inherit',
                      ...(spec.label === 'Delivery' && product.hyderabadOnly ? {
                        borderColor: '#9C27B030',
                        backgroundColor: '#9C27B008',
                      } : {}),
                    }}
                    bodyStyle={{ padding: '16px' }}
                    hoverable
                  >
                    <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                      {spec.label}
                    </Text>
                    <Text strong style={{ 
                      color: product.isGaneshIdol ? colors.ganesh : colors.text 
                    }}>
                      {spec.value}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {product.isGaneshIdol && (
              <>
                <Divider />
                <Title level={4} style={{ color: colors.ganesh, marginBottom: '16px' }}>
                  Complete Pooja Kit Contents
                </Title>
                <Row gutter={[12, 12]}>
                  {poojaKitContents.map((item, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <Card
                        size="small"
                        style={{
                          border: `1px solid ${colors.ganesh}20`,
                          borderRadius: '6px',
                          backgroundColor: `${colors.ganesh}03`,
                        }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <Space size="small">
                          {item.icon}
                          <Text strong style={{ fontSize: '14px' }}>{item.item}</Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </div>
        </TabPane>

        <TabPane tab="Reviews" key="3">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Customer Reviews</Title>
            
            {/* Review Summary */}
            <Card
              style={{
                background: product.isGaneshIdol ? `${colors.ganesh}08` : `${colors.primary}08`,
                border: `1px solid ${product.isGaneshIdol ? `${colors.ganesh}20` : `${colors.primary}20`}`,
                borderRadius: '12px',
                marginBottom: '24px',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Title level={1} style={{ 
                    margin: 0, 
                    color: product.isGaneshIdol ? colors.ganesh : colors.primary, 
                    fontSize: '48px' 
                  }}>
                    {product.rating}
                  </Title>
                  <Rate
                    value={product.rating}
                    allowHalf
                    disabled
                    style={{ color: product.isGaneshIdol ? colors.ganesh : colors.primary, marginBottom: '8px' }}
                  />
                  <Text type="secondary">Based on {product.reviews} reviews</Text>
                  {product.isGaneshIdol && (
                    <div style={{ marginTop: '8px' }}>
                      <Tag color={colors.ganesh} icon={<GiftOutlined />}>Custom Made</Tag>
                      <Tag color={colors.eco} icon={<EnvironmentOutlined />}>Eco-Friendly</Tag>
                    </div>
                  )}
                </Col>
                
                <Col xs={24} sm={16}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = Math.random() * 80 + 10;
                    const count = Math.floor(Math.random() * 50 + 10);
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <Text style={{ minWidth: '20px' }}>{stars}</Text>
                        <StarFilled style={{ 
                          fontSize: '16px', 
                          color: product.isGaneshIdol ? colors.ganesh : colors.primary, 
                          margin: '0 8px' 
                        }} />
                        <Progress
                          percent={percentage}
                          size="small"
                          strokeColor={product.isGaneshIdol ? colors.ganesh : colors.primary}
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
                          style={{ 
                            backgroundColor: product.isGaneshIdol ? colors.ganesh : colors.primary, 
                            fontSize: '18px', 
                            fontWeight: 600 
                          }}
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
                              style={{ color: product.isGaneshIdol ? colors.ganesh : colors.primary }}
                            />
                            <Text type="secondary">{review.date}</Text>
                            {product.isGaneshIdol && (
                              <Tag size="small" color={colors.ganesh}>Verified Ganesh Customer</Tag>
                            )}
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
                borderColor: product.isGaneshIdol ? colors.ganesh : colors.primary,
                color: product.isGaneshIdol ? colors.ganesh : colors.primary,
                borderRadius: '8px',
                fontWeight: 600,
                height: '40px',
              }}
            >
              Write a Review
            </Button>
          </div>
        </TabPane>

        <TabPane tab={product.isGaneshIdol ? "Visarjan Guide" : "Care Guide"} key="4">
          <div style={{ padding: '24px' }}>
            {product.isGaneshIdol ? (
              // Ganesh Idol Visarjan Guide
              <>
                <Title level={3} style={{ color: colors.ganesh, marginBottom: '24px', textAlign: 'center' }}>
                  🌱 Eco-Friendly Visarjan Guide: A Sacred Act of Environmental Love
                </Title>
                
                <Alert
                  message="Revolutionary Approach to Traditional Visarjan"
                  description="Transform your Ganesh Visarjan into an act of environmental stewardship while maintaining all spiritual significance and creating lasting memories."
                  type="success"
                  icon={<EnvironmentOutlined />}
                  showIcon
                  style={{ 
                    marginBottom: '32px',
                    borderRadius: '8px',
                    backgroundColor: `${colors.eco}08`,
                    border: `1px solid ${colors.eco}30`,
                  }}
                />
                
                <Title level={4} style={{ color: colors.ganesh, marginBottom: '24px' }}>
                  🕉️ Step-by-Step Eco-Friendly Visarjan Process
                </Title>
                
                <List
                  itemLayout="vertical"
                  dataSource={ganeshVisarjanSteps}
                  style={{ 
                    marginBottom: '32px', 
                    border: `2px solid ${colors.eco}30`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: `${colors.eco}05`,
                  }}
                  renderItem={(item, index) => (
                    <List.Item style={{ 
                      padding: '20px', 
                      borderBottom: index < ganeshVisarjanSteps.length - 1 ? `1px solid ${colors.eco}20` : 'none' 
                    }}>
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <Space align="center">
                          <Avatar 
                            style={{ 
                              backgroundColor: colors.eco, 
                              color: 'white',
                              border: `2px solid ${colors.eco}`,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Text strong style={{ fontSize: '18px', color: colors.ganesh }}>
                            {item.title}
                          </Text>
                        </Space>
                        <div style={{ marginLeft: '48px' }}>
                          <Paragraph style={{ fontSize: '15px', lineHeight: '1.6' }}>
                            {item.content}
                          </Paragraph>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                />

                <Card
                  style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    backgroundColor: `${colors.ganesh}08`,
                    border: `2px solid ${colors.ganesh}30`,
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Title level={4} style={{ color: colors.ganesh, marginBottom: '16px' }}>
                    🌿 Environmental Impact & Benefits
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: colors.eco }} />
                          <Text strong>Zero Water Pollution</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: colors.eco }} />
                          <Text strong>Creates New Life</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: colors.eco }} />
                          <Text strong>Lasting Memories</Text>
                        </div>
                      </Space>
                    </Col>
                    <Col xs={24} md={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: colors.eco }} />
                          <Text strong>Pure Spiritual Experience</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: colors.eco }} />
                          <Text strong>Community Engagement</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: colors.eco }} />
                          <Text strong>Educational Value</Text>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                <Alert
                  message="Important Care Instructions"
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <p style={{ margin: '4px 0' }}>• Handle your Ganesh idol with care and devotion during the celebration period</p>
                      <p style={{ margin: '4px 0' }}>• Keep the idol in a clean, dry place during the festival</p>
                      <p style={{ margin: '4px 0' }}>• The Ganga Clay is designed to dissolve easily - avoid exposure to excessive moisture before Visarjan</p>
                      <p style={{ margin: '4px 0' }}>• Use the provided organic materials from the Pooja kit for the most authentic experience</p>
                      <p style={{ margin: '4px 0' }}>• Each idol supports local artisan communities - thank you for preserving traditional crafts</p>
                      <p style={{ margin: '4px 0' }}>• Contact our support team if you need guidance on the Visarjan process</p>
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
              </>
            ) : (
              // Regular Product Care Guide
              <>
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
              </>
            )}
            
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
              {product.isGaneshIdol 
                ? "May this eco-friendly celebration bring you joy, spiritual fulfillment, and the satisfaction of contributing to a healthier planet. Ganpati Bappa Morya! 🙏🌱"
                : "By following these simple, natural cleaning methods, your clay pot will remain a cherished and effective cooking companion for many years to come! Enjoy healthier, more flavorful meals with ease."
              }
            </Paragraph>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
});

ProductTabs.displayName = 'ProductTabs';

export default ProductTabs;