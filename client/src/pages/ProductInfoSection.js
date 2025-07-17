// ProductInfoSection.jsx - MOBILE SIMPLIFIED VERSION FOR GANESH IDOLS
import React, { useState, useMemo, memo, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Rate,
  Tag,
  Space,
  List,
  Modal,
  Breadcrumb,
  Alert,
  Tooltip,
  Grid,
  Avatar,
  Row,
  Col,
} from 'antd';

import {
  HomeOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  StarFilled,
  EnvironmentOutlined,
  GiftOutlined,
  PhoneOutlined,
  CrownOutlined,
  FireOutlined,
  StarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

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
  productInfoCard: {
    borderRadius: '16px',
    border: `1px solid ${colors.divider}`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${colors.backgroundLight}20 100%)`,
    boxShadow: `0 8px 32px ${colors.primary}15`,
  },
  ganeshButton: {
    background: `linear-gradient(135deg, ${colors.ganesh} 0%, #FF8A65 100%)`,
    borderColor: colors.ganesh,
    borderRadius: '8px',
    fontWeight: 600,
    height: '48px',
    fontSize: '16px',
    color: 'white',
  },
  priceContainer: {
    background: `linear-gradient(135deg, ${colors.ganesh}12 0%, #FF8A6512 100%)`,
    borderRadius: '12px',
    padding: '20px',
    border: `1px solid ${colors.ganesh}20`,
  },
};

// ENHANCED: Updated function to handle introductory text properly
const formatDescriptionWithIntro = (description) => {
  if (!description || typeof description !== 'string') {
    return { introduction: '', points: [] };
  }

  // Clean up the description
  let cleanedDescription = description.trim();
  
  // Remove common prefixes that might not be useful
  cleanedDescription = cleanedDescription.replace(/^(description:|about:|features:|details:)/i, '').trim();
  
  let introduction = '';
  let pointsText = cleanedDescription;
  
  // Check for introductory text ending with ":" followed by content
  const introMatch = cleanedDescription.match(/^(.*?[:\.])\s*[\n\r]*(.*)$/s);
  
  if (introMatch) {
    const potentialIntro = introMatch[1].trim();
    const remainingText = introMatch[2].trim();
    
    // Check if this looks like an introduction (contains certain keywords and ends with :)
    const introKeywords = ['offers', 'curated', 'includes', 'features', 'contains', 'provides', 'presents', 'kit', 'celebration'];
    const looksLikeIntro = introKeywords.some(keyword => 
      potentialIntro.toLowerCase().includes(keyword)
    ) && potentialIntro.endsWith(':');
    
    if (looksLikeIntro && remainingText.length > 0) {
      introduction = potentialIntro;
      pointsText = remainingText;
    }
  }
  
  // Now process the points text
  let points = [];
  
  // Method 1: Split by line breaks first (most reliable)
  if (pointsText.includes('\n')) {
    points = pointsText
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 5)
      .map(point => point.replace(/^[-•*\d+\.\)\]]\s*/, '').trim())
      .filter(point => point.length > 0);
  }
  
  // Method 2: If no line breaks, try splitting by periods
  if (points.length <= 1) {
    points = pointsText
      .split(/\.\s+/)
      .map(point => point.trim())
      .filter(point => point.length > 10)
      .map(point => {
        let cleaned = point.replace(/^[-•*\d+\.\)\]]\s*/, '').trim();
        if (cleaned && !cleaned.match(/[.!?]$/)) {
          cleaned += '.';
        }
        return cleaned;
      })
      .filter(point => point.length > 5);
  }
  
  // Method 3: If still no good split, try semicolons or commas for longer text
  if (points.length <= 1 && pointsText.length > 100) {
    const delimiters = [';', ','];
    for (const delimiter of delimiters) {
      if (pointsText.includes(delimiter)) {
        points = pointsText
          .split(delimiter)
          .map(point => point.trim())
          .filter(point => point.length > 15)
          .map(point => {
            let cleaned = point.replace(/^[-•*\d+\.\)\]]\s*/, '').trim();
            if (cleaned && !cleaned.match(/[.!?]$/)) {
              cleaned += '.';
            }
            return cleaned;
          })
          .filter(point => point.length > 5);
        
        if (points.length > 1) break;
      }
    }
  }
  
  // If all methods fail, use the original text as a single point
  if (points.length === 0) {
    points = [pointsText];
  }
  
  // Final cleanup: ensure each point is properly formatted
  points = points
    .map(point => {
      let cleaned = point.trim();
      // Capitalize first letter
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      // Ensure proper ending
      if (cleaned && !cleaned.match(/[.!?]$/)) {
        cleaned += '.';
      }
      return cleaned;
    })
    .filter(point => point.length > 3);

  return { introduction, points };
};

// Terms & Conditions Modal Component
const TermsModal = memo(({ open, onClose, product }) => {
  const ganeshTerms = [
    {
      title: "🕉️ HANDCRAFTED UNIQUENESS",
      points: [
        "Each Ganesh idol is handcrafted by skilled artisans - small variations in eyes, bindi, and details make each piece unique.",
        "Made from pure Ganga clay - minimal hairline cracks are natural characteristics, not defects.",
        "Size may vary by 1-2 inches due to natural clay properties and drying conditions."
      ]
    },
    {
      title: "🚚 DELIVERY & HANDLING",
      points: [
        "Handle with care - Never lift by hands or trunk, always support the main body.",
        "For idols 3+ feet: You must arrange 3-4 people to assist our delivery team.",
        "Delivery: Monday-Sunday, 11 AM to 11 PM. Large idols need scheduled delivery."
      ]
    },
    {
      title: "⏰ CANCELLATION POLICY",
      points: [
        "24-hour window: Full refund if cancelled within 24 hours of booking.",
        "After 24 hours: No cancellations or refunds due to custom production start.",
        "Please confirm all requirements before ordering."
      ]
    }
  ];

  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: colors.ganesh,
          fontSize: '18px',
          fontWeight: 600
        }}>
          <FileTextOutlined style={{ fontSize: '20px' }} />
          Important: Ganesh Idol Terms
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={onClose}
          style={{
            backgroundColor: colors.ganesh,
            borderColor: colors.ganesh,
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          I Understand
        </Button>
      ]}
      width={700}
      centered
      styles={{
        content: {
          borderRadius: '16px',
          maxHeight: '80vh',
          overflow: 'hidden'
        },
        header: {
          borderRadius: '16px 16px 0 0',
          backgroundColor: `${colors.ganesh}08`,
          borderBottom: `2px solid ${colors.ganesh}20`
        },
        body: {
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '0'
        }
      }}
    >
      <div style={{
        padding: '24px',
        background: `linear-gradient(135deg, ${colors.ganesh}05 0%, rgba(255,255,255,0.8) 100%)`
      }}>
        {/* Important Notice */}
        <Alert
          message="Please Read Before Ordering"
          description="Custom Ganesh idols have specific terms due to their handcrafted nature and delivery requirements."
          type="warning"
          showIcon
          style={{
            marginBottom: '20px',
            backgroundColor: `${colors.warning}10`,
            border: `1px solid ${colors.warning}30`
          }}
        />

        {/* Terms Content */}
        {ganeshTerms.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '20px' }}>
            <Title level={5} style={{
              color: colors.ganesh,
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: 600
            }}>
              {section.title}
            </Title>
            <List
              size="small"
              dataSource={section.points}
              renderItem={(point, index) => (
                <List.Item style={{
                  padding: '6px 0',
                  border: 'none',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                    <CheckCircleOutlined style={{
                      color: colors.ganesh,
                      fontSize: '14px',
                      marginTop: '2px',
                      flexShrink: 0
                    }} />

                    <Text style={{
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: colors.text,
                      flex: 1
                    }}>
                      {point}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        ))}

        {/* Contact Info */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: `${colors.ganesh}08`,
          border: `1px solid ${colors.ganesh}20`,
          textAlign: 'center'
        }}>
          <Text strong style={{
            display: 'block',
            marginBottom: '8px',
            color: colors.text,
            fontSize: '15px'
          }}>
            Questions? Contact us:
          </Text>
          <Text style={{
            color: colors.ganesh,
            fontWeight: 600
          }}>
            📞 +91-7382150250 | ✉️ mittiarts0@gmail.com
          </Text>
        </div>
      </div>
    </Modal>
  );
});

// NEW: Pooja Kit Modal Component
const PoojaKitModal = memo(({ open, onClose, product }) => {
  const poojaKitContents = [
    {
      item: 'Farmer-Sourced Organic Kumkum',
      description: 'Pure, vibrant kumkum sourced directly from farmers, free from artificial additives',
      icon: <FireOutlined style={{ color: colors.ganesh }} />,
      benefit: 'Authentic spiritual experience'
    },
    {
      item: 'Farmer-Sourced Organic Haldi',
      description: 'Premium quality turmeric powder for authentic traditional rituals',
      icon: <StarFilled style={{ color: '#FFD700' }} />,
      benefit: 'Pure and natural ingredients'
    },
    {
      item: 'Natural Vibudhi',
      description: 'Genuine, unadulterated sacred ash for spiritual offerings',
      icon: <StarOutlined style={{ color: colors.textSecondary }} />,
      benefit: 'Traditional sacred preparations'
    },
    {
      item: 'Handloom Ikkath Dhoti & Kanduva',
      description: "Exquisite handmade fabrics celebrating India's rich weaving heritage",
      icon: <CrownOutlined style={{ color: colors.secondary }} />,
      benefit: 'Supporting traditional crafts'
    },
    {
      item: 'Special Plant Sapling',
      description: 'A carefully chosen plant for your eco-friendly Visarjan ceremony',
      icon: <EnvironmentOutlined style={{ color: colors.eco }} />,
      benefit: 'Environmental stewardship'
    },
  ];

  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: colors.ganesh,
          fontSize: '18px',
          fontWeight: 600
        }}>
          <GiftOutlined style={{ fontSize: '20px' }} />
          Complete Pooja Kit Included
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={onClose}
          style={{
            backgroundColor: colors.ganesh,
            borderColor: colors.ganesh,
            borderRadius: '8px',
            fontWeight: 600
          }}
        >
          Thank You! 🙏
        </Button>
      ]}
      width={800}
      centered
      styles={{
        content: {
          borderRadius: '16px',
          maxHeight: '85vh',
          overflow: 'hidden'
        },
        header: {
          borderRadius: '16px 16px 0 0',
          backgroundColor: `${colors.ganesh}08`,
          borderBottom: `2px solid ${colors.ganesh}20`
        },
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '0'
        }
      }}
    >
      <div style={{
        padding: '24px',
        background: `linear-gradient(135deg, ${colors.ganesh}05 0%, rgba(255,255,255,0.8) 100%)`
      }}>
        {/* Header Message */}
        <Alert
          message="🎁 Thoughtfully Curated for Your Sacred Celebration"
          description="Every Ganesh idol comes with a complete Pooja kit, reflecting our commitment to natural and sustainable living, ensuring your celebration is both authentic and pure."
          type="success"
          showIcon
          style={{
            marginBottom: '24px',
            backgroundColor: `${colors.ganesh}10`,
            border: `1px solid ${colors.ganesh}30`
          }}
        />

        {/* Pooja Kit Items */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {poojaKitContents.map((item, index) => (
            <Col xs={24} md={12} key={index}>
              <Card
                size="small"
                style={{
                  borderRadius: '12px',
                  height: '100%',
                  border: `1px solid ${colors.ganesh}20`,
                  backgroundColor: `${colors.ganesh}03`,
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: '16px' }}
                hoverable
              >
                <Space align="start" style={{ width: '100%' }}>
                  <Avatar
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      flexShrink: 0
                    }}
                    icon={item.icon}
                    size={32}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{
                      fontSize: '15px',
                      color: colors.text,
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {item.item}
                    </Text>
                    <Text style={{
                      fontSize: '13px',
                      color: colors.textSecondary,
                      display: 'block',
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {item.description}
                    </Text>
                    <Tag
                      size="small"
                      style={{
                        backgroundColor: `${colors.ganesh}15`,
                        color: colors.ganesh,
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      ✨ {item.benefit}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Special Highlight */}
        <Card
          style={{
            borderRadius: '12px',
            backgroundColor: `${colors.eco}08`,
            border: `2px solid ${colors.eco}30`,
            marginBottom: '20px'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <EnvironmentOutlined style={{
              fontSize: '32px',
              color: colors.eco,
              marginBottom: '12px',
              display: 'block'
            }} />
            <Title level={4} style={{
              color: colors.eco,
              marginBottom: '12px',
              fontSize: '18px'
            }}>
              🌱 Eco-Friendly Visarjan Solution
            </Title>
            <Text style={{
              fontSize: '14px',
              color: colors.textSecondary,
              lineHeight: '1.5',
              display: 'block'
            }}>
              Our plant sapling enables you to perform an environmentally conscious Visarjan ceremony at home.
              Transform your celebration into an act of environmental stewardship while maintaining all spiritual significance.
            </Text>
          </div>
        </Card>

        {/* Value Proposition */}
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: `${colors.ganesh}08`,
          border: `1px solid ${colors.ganesh}20`,
          textAlign: 'center'
        }}>
          <Text strong style={{
            display: 'block',
            marginBottom: '8px',
            color: colors.text,
            fontSize: '16px'
          }}>
            🙏 Complete Spiritual Experience Included
          </Text>
          <Text style={{
            color: colors.textSecondary,
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            No need to source materials separately - everything you need for an authentic,
            eco-friendly Ganesh Chaturthi celebration is thoughtfully included with your idol.
          </Text>
        </div>
      </div>
    </Modal>
  );
});

// MOBILE SIMPLIFIED Main Product Info Component
const ProductInfo = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [poojaKitModalOpen, setPoojaKitModalOpen] = useState(false);
  const screens = useBreakpoint();

  // UPDATED: Use new function to format description with proper introduction handling
  const formattedDescription = useMemo(() => {
    // Always try to use the original product description first
    if (product.description && product.description.trim()) {
      const { introduction, points } = formatDescriptionWithIntro(product.description);
      if (points.length > 0 || introduction) {
        return { introduction, points };
      }
    }

    // If Ganesh idol and no description, provide default
    if (product.isGaneshIdol) {
      return {
        introduction: '',
        points: [
          'Beautifully handcrafted Ganesh idol made by skilled artisans using traditional techniques.',
          'Made from sacred Ganga Clay sourced from the holy Ganges river.',
          'Each idol is unique and can be customized according to your preferences.',
          'Includes complete Pooja kit with organic materials for authentic celebration.',
          'Eco-friendly Visarjan solution with plant sapling for responsible celebration.'
        ]
      };
    }

    // Default points for regular products when no description
    return {
      introduction: '',
      points: [
        'Premium quality product crafted with attention to detail using traditional methods.',
        'Each piece is carefully made to ensure durability and aesthetic appeal.',
        'Natural variations in color and texture make each piece unique and special.'
      ]
    };
  }, [product.description, product.isGaneshIdol]);

  // Show simplified view for mobile Ganesh idols
  if (screens.xs && product.isGaneshIdol) {
    return (
      <>
        {/* CSS for Gift Animation */}
        <style>
          {`
            @keyframes giftPulse {
              0% { 
                transform: scale(1) rotate(0deg); 
                filter: hue-rotate(0deg);
              }
              25% { 
                transform: scale(1.1) rotate(-5deg); 
                filter: hue-rotate(10deg);
              }
              50% { 
                transform: scale(1.2) rotate(0deg); 
                filter: hue-rotate(20deg);
              }
              75% { 
                transform: scale(1.1) rotate(5deg); 
                filter: hue-rotate(10deg);
              }
              100% { 
                transform: scale(1) rotate(0deg); 
                filter: hue-rotate(0deg);
              }
            }

            @keyframes giftOpen {
              0% { 
                transform: scale(1); 
                filter: brightness(1);
              }
              50% { 
                transform: scale(1.3) rotateY(15deg); 
                filter: brightness(1.2) drop-shadow(0 0 10px ${colors.ganesh}50);
              }
              100% { 
                transform: scale(1); 
                filter: brightness(1);
              }
            }

            .gift-icon-animated {
              animation: giftPulse 2s ease-in-out infinite;
              transition: all 0.3s ease;
            }

            .gift-icon-animated:hover {
              animation: giftOpen 0.6s ease-in-out;
              color: ${colors.ganesh} !important;
            }

            .gift-icon-animated:active {
              transform: scale(0.9);
            }
          `}
        </style>

        <Card style={customStyles.productInfoCard} bodyStyle={{ padding: '20px', height: 'fit-content' }}>
          
          {/* 1. Product Title */}
          <div style={{ marginBottom: '16px' }}>
            <Title level={3} style={{
              marginBottom: '8px',
              color: colors.text,
              fontSize: '24px',
            }}>
              {product.name}
            </Title>

            <Space wrap>
              <Tag
                icon={<GiftOutlined />}
                color="#FF6B35"
                style={{
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                Custom Made
              </Tag>
              <Tag
                icon={<EnvironmentOutlined />}
                color="#4CAF50"
                style={{
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                Eco-Friendly
              </Tag>
            </Space>
          </div>

          {/* Rating and Reviews */}
          <Space wrap style={{ marginBottom: '16px' }}>
            <Rate
              value={product.rating}
              allowHalf
              disabled
              character={<StarFilled />}
              style={{ color: colors.ganesh }}
            />
            <Text type="secondary">
              {product.rating} ({product.reviews} reviews)
            </Text>
            {product.code && (
              <Tag color={colors.ganesh} style={{ fontWeight: 600 }}>
                {product.code}
              </Tag>
            )}
          </Space>

          {/* 2. Price Section with T&C and Gift Icons */}
          <div style={{
            ...customStyles.priceContainer,
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Space wrap align="baseline">
                <Title level={2} style={{
                  margin: 0,
                  color: colors.ganesh,
                  fontSize: '28px',
                }}>
                  ₹{product.price?.toLocaleString()}
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  All-Inclusive with Pooja Kit
                </Text>
              </Space>

              {/* Icons Row - T&C and Gift */}
              <Space size="small">
                {/* Animated Gift Icon */}
                <Tooltip title="Complete Pooja Kit Included! Click to see what's inside 🎁">
                  <Button
                    type="text"
                    className="gift-icon-animated"
                    icon={<GiftOutlined />}
                    onClick={() => setPoojaKitModalOpen(true)}
                    style={{
                      color: colors.ganesh,
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.ganesh}30`,
                      backgroundColor: `${colors.ganesh}08`,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Tooltip>

                {/* T&C Icon */}
                <Tooltip title="Important Ganesh Idol Terms">
                  <Button
                    type="text"
                    icon={<WarningOutlined />}
                    onClick={() => setTermsModalOpen(true)}
                    style={{
                      color: colors.ganesh,
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.ganesh}30`,
                      backgroundColor: `${colors.ganesh}08`,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Tooltip>
              </Space>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Made with Pure Ganga Clay • Supporting Local Artisans • Eco-Friendly Celebration
            </Text>
          </div>

          {/* 3. Product Description with Proper Introduction and Bullet Points */}
          <div style={{ marginBottom: '20px' }}>
            <Title level={5} style={{ color: colors.text, marginBottom: '12px' }}>
              About This Sacred Ganesh Idol
            </Title>

            {/* Display introduction text (if any) */}
            {formattedDescription.introduction && (
              <Paragraph style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: colors.text,
                marginBottom: '16px',
                fontWeight: 500,
                background: `${colors.ganesh}08`,
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${colors.ganesh}20`,
              }}>
                {formattedDescription.introduction}
              </Paragraph>
            )}

            {/* Display bullet points */}
            {formattedDescription.points.length > 0 && (
              <List
                size="small"
                dataSource={formattedDescription.points}
                renderItem={(point, index) => (
                  <List.Item style={{
                    padding: '6px 0',
                    border: 'none',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                      <CheckCircleOutlined style={{
                        color: colors.ganesh,
                        fontSize: '14px',
                        marginTop: '2px',
                        flexShrink: 0
                      }} />
                      <Text style={{
                        fontSize: '13px',
                        lineHeight: '1.6',
                        color: colors.text,
                        flex: 1
                      }}>
                        {point}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>

          {/* 4. Gift Kit Information */}
          <Card style={{
            borderRadius: '12px',
            border: `2px solid ${colors.ganesh}30`,
            background: `linear-gradient(135deg, ${colors.ganesh}08 0%, #FFE0B2 100%)`,
            marginBottom: '20px'
          }} bodyStyle={{ padding: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <GiftOutlined style={{ fontSize: '24px', color: colors.ganesh, marginBottom: '8px' }} />
              <Title level={5} style={{ margin: 0, color: colors.ganesh, fontSize: '16px' }}>
                Complete Pooja Kit Included 🙏
              </Title>
            </div>

            <Row gutter={[8, 8]}>
              {[
                { icon: <FireOutlined />, title: 'Organic Kumkum & Haldi', desc: 'Pure farmer-sourced' },
                { icon: <StarOutlined />, title: 'Natural Vibudhi', desc: 'Sacred ash preparation' },
                { icon: <CrownOutlined />, title: 'Handloom Fabrics', desc: 'Ikkath Dhoti & Kanduva' },
                { icon: <EnvironmentOutlined />, title: 'Plant Sapling', desc: 'For eco-friendly Visarjan' },
              ].map((item, index) => (
                <Col xs={12} key={index}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.6)'
                  }}>
                    <div style={{ color: index === 3 ? colors.eco : colors.ganesh, fontSize: '14px' }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: 'block', fontSize: '11px', color: colors.text }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: '10px', color: colors.textSecondary }}>
                        {item.desc}
                      </Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            <Button
              type="link"
              onClick={() => setPoojaKitModalOpen(true)}
              style={{
                color: colors.ganesh,
                fontWeight: 600,
                padding: '0',
                marginTop: '8px',
                fontSize: '12px'
              }}
            >
              View Complete Kit Details →
            </Button>
          </Card>

          {/* 5. Terms and Conditions */}
          <Alert
            message="Important Terms & Conditions"
            description={
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ fontSize: '12px' }}>Please read before ordering:</Text>
                </div>
                <List
                  size="small"
                  dataSource={[
                    "Each idol is handcrafted - small variations are natural",
                    "24-hour cancellation window for full refund",
                    "Custom made to order - no returns after 24 hours",
                    "Handle with care during delivery and celebration"
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '2px 0', border: 'none' }}>
                      <Text style={{ fontSize: '11px', color: colors.textSecondary }}>
                        • {item}
                      </Text>
                    </List.Item>
                  )}
                />
                <Button
                  type="link"
                  onClick={() => setTermsModalOpen(true)}
                  style={{
                    color: colors.ganesh,
                    fontWeight: 600,
                    padding: '0',
                    marginTop: '4px',
                    fontSize: '11px'
                  }}
                >
                  Read Full Terms & Conditions →
                </Button>
              </div>
            }
            type="warning"
            showIcon
            style={{
              backgroundColor: `${colors.warning}10`,
              border: `1px solid ${colors.warning}30`,
              borderRadius: '8px',
            }}
          />

        </Card>

        {/* Terms & Conditions Modal */}
        <TermsModal
          open={termsModalOpen}
          onClose={() => setTermsModalOpen(false)}
          product={product}
        />

        {/* Pooja Kit Modal */}
        <PoojaKitModal
          open={poojaKitModalOpen}
          onClose={() => setPoojaKitModalOpen(false)}
          product={product}
        />
      </>
    );
  }

  // FOR NON-MOBILE OR NON-GANESH PRODUCTS, RETURN THE FULL COMPONENT
  // TODO: Add the full component code here when needed
  return (
    <Card style={customStyles.productInfoCard} bodyStyle={{ padding: '24px', height: 'fit-content' }}>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Full Product Info Component
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: '14px' }}>
          (Desktop/Tablet view or Regular Products)
        </Text>
      </div>
    </Card>
  );
});

// Enhanced Mobile Actions Component - Fixed and Simplified
const MobileActions = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('cart');

  const handleAddToCart = () => {
    if (!product.isGaneshIdol && product.stock === 0) return;
    setActionType('cart');
    setModalVisible(true);
  };

  const handleBuyNow = () => {
    if (!product.isGaneshIdol && product.stock === 0) return;
    setActionType('buy');
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (actionType === 'cart') {
      onAddToCart(product, quantity);
    } else {
      onBuyNow(product, quantity);
    }
    setModalVisible(false);
    setQuantity(1);
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        padding: '12px 16px', // Reduced padding
        borderTop: `1px solid ${colors.divider}`, // Thinner border
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)', // Smaller shadow
        zIndex: 1000,
      }}>
        {/* Single Row Actions - Simplified */}
        <Space size="small" style={{ width: '100%', justifyContent: 'center' }}>
          {product.isGaneshIdol ? (
            <>
              {/* Show Interest Button - Smaller */}
              <Button
                type="primary"
                size="middle" // Changed from large to middle
                icon={<GiftOutlined />}
                onClick={handleAddToCart}
                style={{
                  background: `linear-gradient(135deg, ${colors.ganesh} 0%, #FFB74D 100%)`,
                  borderColor: colors.ganesh,
                  flex: 1,
                  height: '40px', // Reduced from 52px to 40px
                  borderRadius: '8px', // Smaller border radius
                  fontWeight: 600,
                  fontSize: '14px', // Reduced from 16px to 14px
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Show Interest
              </Button>
              
              {/* Phone Icon Button - Smaller */}
              <Button
                size="middle" // Changed from large to middle
                icon={<PhoneOutlined />}
                onClick={() => window.location.href = '/contactus'}
                style={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  width: '40px', // Reduced from 52px to 40px
                  height: '40px', // Reduced from 52px to 40px
                  borderRadius: '8px', // Smaller border radius
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px', // Icon size
                }}
              />
            </>
          ) : (
            <>
              {/* Regular Product Actions - Smaller */}
              <Button
                type="primary"
                size="middle"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  flex: 1,
                  height: '40px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <Button
                size="middle"
                icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                onClick={() => onToggleWishlist(product)}
                style={{
                  borderColor: colors.divider,
                  color: isInWishlist ? colors.error : colors.textSecondary,
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  marginLeft: '6px',
                }}
              />
              
              <Button
                size="middle"
                icon={<PhoneOutlined />}
                onClick={() => window.location.href = '/contactus'}
                style={{
                  borderColor: colors.secondary,
                  color: colors.secondary,
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  marginLeft: '6px',
                }}
              />
            </>
          )}
        </Space>
      </div>

      {/* Action Modal - FIXED */}
      <Modal
        title={product.isGaneshIdol
          ? 'Show Interest in Ganesh Idol'
          : (actionType === 'cart' ? 'Add to Cart' : 'Buy Now')
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={confirmAction}
            style={product.isGaneshIdol ? customStyles.ganeshButton : { backgroundColor: colors.primary, borderColor: colors.primary }}
          >
            {product.isGaneshIdol
              ? '🕉️ Show Interest'
              : (actionType === 'cart' ? 'Add to Cart' : 'Buy Now')
            }
          </Button>,
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle" style={{ width: '100%' }}>
            <Avatar
              src={product.images?.[0] || product.imgUrl}
              size={64}
              shape="square"
              style={{ borderRadius: '12px' }}
            />
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px' }}>
                {product.name}
              </Text>
              <Title level={4} style={{ margin: '8px 0 0 0', color: product.isGaneshIdol ? colors.ganesh : colors.primary }}>
                ₹{product.price.toLocaleString()}
              </Title>
            </div>
          </Space>

          {!product.isGaneshIdol && (
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>Select Quantity</Text>
              {/* Simple quantity selector for modal */}
              <Space>
                <Button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <Text style={{ padding: '0 16px', fontWeight: 600 }}>{quantity}</Text>
                <Button onClick={() => setQuantity(quantity + 1)}>+</Button>
              </Space>
            </div>
          )}

          {!product.isGaneshIdol && (
            <div style={{
              background: `${colors.primary}08`,
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text strong style={{ fontSize: '18px', color: colors.primary }}>
                Total: ₹{(product.price * quantity).toLocaleString()}
              </Text>
              <Text type="secondary">{quantity} × ₹{product.price.toLocaleString()}</Text>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
});

// Enhanced Service Features Component - Simplified for mobile
const ServiceFeatures = memo(({ product }) => {
  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Title level={4} style={{ color: colors.text }}>
          {product.isGaneshIdol ? '🕉️ Our Sacred Promise' : '🛡️ Why Choose Us?'}
        </Title>
        <Text type="secondary">
          {product.isGaneshIdol
            ? 'Committed to authentic, eco-friendly, and spiritually enriching Ganesh Chaturthi experience.'
            : 'Committed to providing exceptional quality products and outstanding customer service.'
          }
        </Text>
      </div>
    </div>
  );
});

// Product Description Component - Simplified
const ProductDescription = memo(({ product }) => {
  return (
    <div style={{ marginTop: '32px' }}>
      <Card style={customStyles.productInfoCard}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4} style={{ color: colors.text }}>
            {product.isGaneshIdol ? '🕉️ About This Sacred Ganesh Idol' : '📋 Product Information'}
          </Title>
          <Text type="secondary">
            {product.description || 'Premium quality handcrafted product made with traditional techniques.'}
          </Text>
        </div>
      </Card>
    </div>
  );
});

// Set display names
ProductInfo.displayName = 'ProductInfo';
TermsModal.displayName = 'TermsModal';
PoojaKitModal.displayName = 'PoojaKitModal';
MobileActions.displayName = 'MobileActions';
ServiceFeatures.displayName = 'ServiceFeatures';
ProductDescription.displayName = 'ProductDescription';

export default ProductInfo;
export { MobileActions, ServiceFeatures, ProductDescription };