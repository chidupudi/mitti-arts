// ProductInfoSection.jsx - UPDATED WITH TERMS BELOW DESCRIPTION AND REMOVED MODAL
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
  Divider,
  InputNumber,
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
  PlusOutlined,
  MinusOutlined,
  ThunderboltOutlined,
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

// NEW: Discount calculation helper for Ganesh products
const calculateGaneshDiscount = (originalPrice) => {
  const discountPercentage = 15; // 15% off for Ganesh products
  const discountAmount = Math.round(originalPrice * discountPercentage / 100);
  const discountedPrice = originalPrice - discountAmount;
  
  return {
    originalPrice,
    discountedPrice,
    discountPercentage,
    discountAmount,
    hasDiscount: true
  };
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
  regularButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: '8px',
    fontWeight: 600,
    height: '48px',
    fontSize: '16px',
    color: 'white',
  },
  // NEW: Updated price container styles for discount display
  ganeshPriceContainer: {
    background: `linear-gradient(135deg, ${colors.ganesh}12 0%, #FF8A6512 100%)`,
    borderRadius: '12px',
    padding: '20px',
    border: `1px solid ${colors.ganesh}20`,
  },
  regularPriceContainer: {
    background: `linear-gradient(135deg, ${colors.primary}12 0%, ${colors.primaryLight}12 100%)`,
    borderRadius: '12px',
    padding: '20px',
    border: `1px solid ${colors.primary}20`,
  },
  // NEW: Terms section styles
  termsSection: {
    background: `linear-gradient(135deg, ${colors.ganesh}08 0%, rgba(255,255,255,0.8) 100%)`,
    borderRadius: '12px',
    border: `2px solid ${colors.ganesh}20`,
    padding: '24px',
    marginTop: '24px',
  },
};

// ENHANCED: Updated function to handle introductory text properly (unchanged)
const formatDescriptionWithIntro = (description) => {
  if (!description || typeof description !== 'string') {
    return { introduction: '', points: [] };
  }

  let cleanedDescription = description.trim();
  cleanedDescription = cleanedDescription.replace(/^(description:|about:|features:|details:)/i, '').trim();
  
  let introduction = '';
  let pointsText = cleanedDescription;
  
  const introMatch = cleanedDescription.match(/^(.*?[:\.])\s*[\n\r]*(.*)$/s);
  
  if (introMatch) {
    const potentialIntro = introMatch[1].trim();
    const remainingText = introMatch[2].trim();
    
    const introKeywords = ['offers', 'curated', 'includes', 'features', 'contains', 'provides', 'presents', 'kit', 'celebration'];
    const looksLikeIntro = introKeywords.some(keyword => 
      potentialIntro.toLowerCase().includes(keyword)
    ) && potentialIntro.endsWith(':');
    
    if (looksLikeIntro && remainingText.length > 0) {
      introduction = potentialIntro;
      pointsText = remainingText;
    }
  }
  
  let points = [];
  
  if (pointsText.includes('\n')) {
    points = pointsText
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 5)
      .map(point => point.replace(/^[-•*\d+\.\)\]]\s*/, '').trim())
      .filter(point => point.length > 0);
  }
  
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
  
  if (points.length === 0) {
    points = [pointsText];
  }
  
  points = points
    .map(point => {
      let cleaned = point.trim();
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      if (cleaned && !cleaned.match(/[.!?]$/)) {
        cleaned += '.';
      }
      return cleaned;
    })
    .filter(point => point.length > 3);

  return { introduction, points };
};

// COMMENTED OUT: Terms & Conditions Modal Component
/*
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
*/

// NEW: Terms & Conditions Section Component (to be displayed below description)
const TermsSection = memo(({ product }) => {
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

  if (!product.isGaneshIdol) return null;

  return (
    <div style={customStyles.termsSection}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        color: colors.ganesh,
        fontSize: '18px',
        fontWeight: 600
      }}>
        <FileTextOutlined style={{ fontSize: '20px' }} />
        Important: Ganesh Idol Terms & Conditions
      </div>

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
  );
});

// Pooja Kit Modal Component (unchanged for brevity - same as before)
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

// MAIN PRODUCT INFO COMPONENT - UPDATED WITH TERMS SECTION AND REMOVED MODAL
const ProductInfo = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  // COMMENTED OUT: Terms modal state
  // const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [poojaKitModalOpen, setPoojaKitModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  // NEW: Calculate discount for Ganesh products
  const priceInfo = useMemo(() => {
    if (product.isGaneshIdol) {
      return calculateGaneshDiscount(product.price);
    }
    // For regular products, use existing logic
    return {
      originalPrice: product.originalPrice || null,
      discountedPrice: product.price,
      discountPercentage: product.discount || 0,
      discountAmount: product.originalPrice ? (product.originalPrice - product.price) : 0,
      hasDiscount: product.originalPrice && product.originalPrice > product.price
    };
  }, [product.price, product.originalPrice, product.discount, product.isGaneshIdol]);

  // Format description with proper introduction handling
  const formattedDescription = useMemo(() => {
    if (product.description && product.description.trim()) {
      const { introduction, points } = formatDescriptionWithIntro(product.description);
      if (points.length > 0 || introduction) {
        return { introduction, points };
      }
    }

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

    return {
      introduction: '',
      points: [
        'Premium quality product crafted with attention to detail using traditional methods.',
        'Each piece is carefully made to ensure durability and aesthetic appeal.',
        'Natural variations in color and texture make each piece unique and special.'
      ]
    };
  }, [product.description, product.isGaneshIdol]);

  // Stock status check
  const isOutOfStock = !product.isGaneshIdol && product.stock === 0;
  const isLowStock = !product.isGaneshIdol && product.stock > 0 && product.stock < 10;

  // Handle quantity changes for regular products
  const handleQuantityChange = (value) => {
    if (value >= 1 && value <= (product.stock || 999)) {
      setQuantity(value);
    }
  };

  // Main component JSX
  return (
    <>
      <Card style={customStyles.productInfoCard} bodyStyle={{ padding: isMobile ? '20px' : '32px', height: 'fit-content' }}>
        
        {/* 1. Breadcrumb (Desktop only) */}
        {!isMobile && (
          <Breadcrumb style={{ marginBottom: '24px' }}>
            <Breadcrumb.Item>
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <AppstoreOutlined />
              <span>Products</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {product.isGaneshIdol ? 'Ganesh Idols' : (product.category || 'Clay Products')}
            </Breadcrumb.Item>
          </Breadcrumb>
        )}

        {/* 2. Product Title */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={isMobile ? 3 : 2} style={{
            marginBottom: '12px',
            color: colors.text,
            fontSize: isMobile ? '24px' : '32px',
            lineHeight: 1.3
          }}>
            {product.name}
          </Title>

          <Space wrap size="middle">
            {product.isGaneshIdol ? (
              <>
                
                <Tag
                  icon={<EnvironmentOutlined />}
                  color="#4CAF50"
                  style={{
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Eco-Friendly
                </Tag>
                {/* NEW: Discount Badge for Ganesh Idols */}
                <Tag
                  style={{
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#E91E63',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  15% OFF Limited Time!
                </Tag>
              </>
            ) : (
              <>
                {product.isFeatured && (
                  <Tag
                    icon={<StarFilled />}
                    color={colors.primary}
                    style={{
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    Featured
                  </Tag>
                )}
                {product.hyderabadOnly && (
                  <Tag
                    icon={<EnvironmentOutlined />}
                    color="#9C27B0"
                    style={{
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    Hyderabad Only
                  </Tag>
                )}
              </>
            )}
          </Space>
        </div>

        {/* 3. Rating and Reviews */}
        <Space wrap style={{ marginBottom: '24px' }}>
          <Rate
            value={product.rating}
            allowHalf
            disabled
            character={<StarFilled />}
            style={{ 
              color: product.isGaneshIdol ? colors.ganesh : colors.primary,
              fontSize: '18px'
            }}
          />
          <Text style={{ fontSize: '16px', fontWeight: 500 }}>
            {product.rating} ({product.reviews} reviews)
          </Text>
          {product.code && (
            <Tag 
              color={product.isGaneshIdol ? colors.ganesh : colors.primary} 
              style={{ fontWeight: 600, fontSize: '12px' }}
            >
              {product.code}
            </Tag>
          )}
        </Space>

        {/* 4. NEW: Updated Price Section with Discount Logic */}
        <div style={{
          ...(product.isGaneshIdol ? customStyles.ganeshPriceContainer : customStyles.regularPriceContainer),
          marginBottom: '24px',
        }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space direction="vertical" size="small">
                {/* Main Price Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Current/Discounted Price */}
                  <Title 
                    level={1} 
                    style={{ 
                      margin: 0,
                      color: product.isGaneshIdol ? colors.ganesh : colors.primary,
                      fontSize: isMobile ? '28px' : '36px',
                    }}
                  >
                    ₹{priceInfo.discountedPrice.toLocaleString()}
                  </Title>
                  
                  {/* Original Price (if there's a discount) */}
                  {priceInfo.hasDiscount && priceInfo.originalPrice && (
                    <Text 
                      delete 
                      type="secondary" 
                      style={{ 
                        fontSize: isMobile ? '18px' : '22px',
                        color: colors.textSecondary
                      }}
                    >
                      ₹{priceInfo.originalPrice.toLocaleString()}
                    </Text>
                  )}
                  
                  {/* Discount Badge */}
                  {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 && (
                    <Tag 
                      color="error" 
                      style={{ 
                        fontSize: isMobile ? '12px' : '14px', 
                        fontWeight: 600,
                        padding: '4px 8px'
                      }}
                    >
                      {priceInfo.discountPercentage}% OFF
                    </Tag>
                  )}
                </div>
                
                {/* Savings Amount (if there's a discount) */}
                {priceInfo.hasDiscount && priceInfo.discountAmount > 0 && (
                  <Text 
                    style={{ 
                      fontSize: isMobile ? '14px' : '16px',
                      color: colors.success,
                      fontWeight: 600,
                      display: 'block'
                    }}
                  >
                    You save ₹{priceInfo.discountAmount.toLocaleString()}!
                  </Text>
                )}
                
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  {product.isGaneshIdol 
                    ? 'All-Inclusive with Pooja Kit' 
                    : (product.hyderabadOnly ? 'Hyderabad Delivery Only' : 'Pan India Delivery')
                  }
                </Text>
              </Space>
            </Col>

            {/* Action Icons (Desktop) */}
            {!isMobile && (
              <Col>
                <Space size="middle">
                  {product.isGaneshIdol && (
                    <>
                      {/* Animated Gift Icon */}
                      <Tooltip title="Complete Pooja Kit Included! Click to see what's inside 🎁">
                        <Button
                          type="text"
                          className="gift-icon-animated"
                          icon={<GiftOutlined />}
                          onClick={() => setPoojaKitModalOpen(true)}
                          style={{
                            color: colors.ganesh,
                            fontSize: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            border: `2px solid ${colors.ganesh}30`,
                            backgroundColor: `${colors.ganesh}08`,
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </Tooltip>

                      {/* COMMENTED OUT: T&C Icon */}
                      {/*
                      <Tooltip title="Important Ganesh Idol Terms">
                        <Button
                          type="text"
                          icon={<WarningOutlined />}
                          onClick={() => setTermsModalOpen(true)}
                          style={{
                            color: colors.ganesh,
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            border: `2px solid ${colors.ganesh}30`,
                            backgroundColor: `${colors.ganesh}08`,
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </Tooltip>
                      */}
                    </>
                  )}
                </Space>
              </Col>
            )}
          </Row>

          {/* Stock Status for Regular Products */}
          {!product.isGaneshIdol && (
            <div style={{ marginTop: '12px' }}>
              {isOutOfStock ? (
                <Tag color="error" icon={<WarningOutlined />} style={{ fontSize: '14px' }}>
                  Out of Stock
                </Tag>
              ) : isLowStock ? (
                <Tag color="warning" icon={<WarningOutlined />} style={{ fontSize: '14px' }}>
                  Only {product.stock} left!
                </Tag>
              ) : (
                <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: '14px' }}>
                  In Stock
                </Tag>
              )}
            </div>
          )}
        </div>

        {/* 5. Product Description */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ color: colors.text, marginBottom: '16px' }}>
            {product.isGaneshIdol ? 'About This Sacred Ganesh Idol' : 'Product Details'}
          </Title>

          {/* Display introduction text (if any) */}
          {formattedDescription.introduction && (
            <Paragraph style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: colors.text,
              marginBottom: '20px',
              fontWeight: 500,
              background: product.isGaneshIdol ? `${colors.ganesh}08` : `${colors.primary}08`,
              padding: '16px 20px',
              borderRadius: '12px',
              border: `1px solid ${product.isGaneshIdol ? colors.ganesh + '20' : colors.primary + '20'}`,
            }}>
              {formattedDescription.introduction}
            </Paragraph>
          )}

          {/* Display bullet points */}
          {formattedDescription.points.length > 0 && (
            <List
              size="middle"
              dataSource={formattedDescription.points.slice(0, isMobile ? 3 : 5)}
              renderItem={(point, index) => (
                <List.Item style={{
                  padding: '8px 0',
                  border: 'none',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                    <CheckCircleOutlined style={{
                      color: product.isGaneshIdol ? colors.ganesh : colors.success,
                      fontSize: '16px',
                      marginTop: '4px',
                      flexShrink: 0
                    }} />
                    <Text style={{
                      fontSize: '15px',
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

        {/* 6. Quantity Selector (Regular Products Only) */}
        {!product.isGaneshIdol && !isOutOfStock && (
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '16px' }}>
              Quantity
            </Text>
            <Space align="center">
              <Button
                icon={<MinusOutlined />}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  borderRadius: '8px',
                  width: 40,
                  height: 40,
                }}
              />
              
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={handleQuantityChange}
                style={{
                  width: 80,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              />
              
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  borderRadius: '8px',
                  width: 40,
                  height: 40,
                }}
              />
              
              <Text type="secondary" style={{ marginLeft: '12px' }}>
                Max: {product.stock}
              </Text>
            </Space>
          </div>
        )}

        {/* 7. Action Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <Row gutter={[12, 12]}>
            {product.isGaneshIdol ? (
              <>
                {/* Show Interest Button for Ganesh Idols */}
                <Col xs={24} sm={16}>
                  <Button
                    type="primary"
                    icon={<GiftOutlined />}
                    onClick={() => onAddToCart(product, 1)}
                    block
                    style={customStyles.ganeshButton}
                  >
                    Show Interest
                  </Button>
                </Col>
                
                {/* Contact Button */}
                <Col xs={24} sm={8}>
                  <Button
                    icon={<PhoneOutlined />}
                    onClick={() => window.location.href = '/contactus'}
                    block
                    style={{
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      borderRadius: '8px',
                      fontWeight: 600,
                      height: '48px',
                      fontSize: '16px',
                    }}
                  >
                    Contact
                  </Button>
                </Col>
              </>
            ) : (
              <>
                {/* Add to Cart Button for Regular Products */}
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => onAddToCart(product, quantity)}
                    disabled={isOutOfStock}
                    block
                    style={customStyles.regularButton}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </Col>
                
                {/* Buy Now Button */}
                <Col xs={24} sm={8}>
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => onBuyNow(product, quantity)}
                    disabled={isOutOfStock}
                    block
                    style={{
                      background: `linear-gradient(135deg, ${colors.success} 0%, #4CAF50 100%)`,
                      borderColor: colors.success,
                      borderRadius: '8px',
                      fontWeight: 600,
                      height: '48px',
                      fontSize: '16px',
                      color: 'white',
                    }}
                  >
                    Buy Now
                  </Button>
                </Col>
                
                {/* Wishlist & Contact Row */}
                <Col xs={12} sm={2}>
                  <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <Button
                      icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                      onClick={() => onToggleWishlist(product)}
                      block
                      style={{
                        borderRadius: '8px',
                        height: '48px',
                        borderColor: isInWishlist ? colors.error : colors.divider,
                        color: isInWishlist ? colors.error : 'inherit',
                      }}
                    />
                  </Tooltip>
                </Col>
                
                <Col xs={12} sm={2}>
                  <Tooltip title="Contact us">
                    <Button
                      icon={<PhoneOutlined />}
                      onClick={() => window.location.href = '/contactus'}
                      block
                      style={{
                        borderRadius: '8px',
                        height: '48px',
                        borderColor: colors.secondary,
                        color: colors.secondary,
                      }}
                    />
                  </Tooltip>
                </Col>
              </>
            )}
          </Row>
        </div>

        {/* 8. NEW: Special Discount Alert for Ganesh Products */}
        {product.isGaneshIdol && (
          <Alert
            message="🎉 Limited Time Offer - 15% OFF!"
            description={
              <div style={{ marginTop: '8px' }}>
                <Text style={{ fontWeight: 600, color: colors.ganesh }}>
                  Save ₹{priceInfo.discountAmount.toLocaleString()} on this beautiful Ganesh idol!
                </Text>
                <br />
                <Text style={{ fontSize: '13px', color: colors.textSecondary }}>
                  This special discount is available for a limited time only. 
                  Book now to secure your sacred Ganesh idol at this special price.
                </Text>
              </div>
            }
            type="success"
            showIcon
            style={{
              backgroundColor: `${colors.ganesh}10`,
              border: `1px solid ${colors.ganesh}30`,
              borderRadius: '8px',
              marginBottom: '24px'
            }}
          />
        )}

        {/* Rest of the component remains the same... Gift Kit Information, Important Information, etc. */}
        
      </Card>

      {/* NEW: Terms & Conditions Section (displayed below description for Ganesh products) */}
      <TermsSection product={product} />

      {/* COMMENTED OUT: Terms & Conditions Modal */}
      {/*
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        product={product}
      />
      */}

      {/* Pooja Kit Modal */}
      <PoojaKitModal
        open={poojaKitModalOpen}
        onClose={() => setPoojaKitModalOpen(false)}
        product={product}
      />
    </>
  );
});

// Simple Mobile Actions Component - UPDATED with Discount
const MobileActions = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('cart');

  // NEW: Calculate discount for mobile display
  const priceInfo = useMemo(() => {
    if (product.isGaneshIdol) {
      return calculateGaneshDiscount(product.price);
    }
    return {
      originalPrice: product.originalPrice || null,
      discountedPrice: product.price,
      discountPercentage: product.discount || 0,
      discountAmount: product.originalPrice ? (product.originalPrice - product.price) : 0,
      hasDiscount: product.originalPrice && product.originalPrice > product.price
    };
  }, [product.price, product.originalPrice, product.discount, product.isGaneshIdol]);

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
        padding: '12px 16px',
        borderTop: `1px solid ${colors.divider}`,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
        zIndex: 1000,
      }}>
        {/* Single Row Layout: Price + Button + Phone */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
        }}>
          
          {/* NEW: Updated Price Display with Discount */}
          <div style={{ minWidth: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Text 
                strong 
                style={{ 
                  fontSize: '18px', 
                  color: product.isGaneshIdol ? colors.ganesh : colors.primary,
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                ₹{priceInfo.discountedPrice.toLocaleString()}
              </Text>
              
              {/* Original Price (strikethrough) for mobile */}
              {priceInfo.hasDiscount && priceInfo.originalPrice && (
                <Text 
                  delete 
                  style={{ 
                    fontSize: '14px',
                    color: colors.textSecondary,
                    whiteSpace: 'nowrap'
                  }}
                >
                  ₹{priceInfo.originalPrice.toLocaleString()}
                </Text>
              )}
            </div>
            
            {/* Discount badge for mobile */}
            {priceInfo.hasDiscount && priceInfo.discountPercentage > 0 && (
              <Text style={{ 
                fontSize: '11px', 
                color: '#E91E63',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {priceInfo.discountPercentage}% OFF
              </Text>
            )}
          </div>

          {/* Main Action Button */}
          {product.isGaneshIdol ? (
            <Button
              type="primary"
              size="middle"
              icon={<GiftOutlined />}
              onClick={handleAddToCart}
              style={{
                background: `linear-gradient(135deg, ${colors.ganesh} 0%, #FFB74D 100%)`,
                borderColor: colors.ganesh,
                flex: 1,
                height: '44px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Show Interest
            </Button>
          ) : (
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
                height: '44px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
          
          {/* Phone Button */}
          <Button
            size="middle"
            icon={<PhoneOutlined />}
            onClick={() => window.location.href = '/contactus'}
            style={{
              borderColor: colors.secondary,
              color: colors.secondary,
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0
            }}
          />
        </div>
      </div>

      {/* Action Modal - UPDATED with Discount Info */}
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
              
              {/* NEW: Updated Modal Price Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <Title level={4} style={{ margin: 0, color: product.isGaneshIdol ? colors.ganesh : colors.primary }}>
                  ₹{priceInfo.discountedPrice.toLocaleString()}
                </Title>
                
                {priceInfo.hasDiscount && priceInfo.originalPrice && (
                  <>
                    <Text delete type="secondary" style={{ fontSize: '14px' }}>
                      ₹{priceInfo.originalPrice.toLocaleString()}
                    </Text>
                    <Tag color="error" size="small">
                      {priceInfo.discountPercentage}% OFF
                    </Tag>
                  </>
                )}
              </div>
              
              {/* Savings info */}
              {priceInfo.hasDiscount && priceInfo.discountAmount > 0 && (
                <Text style={{ color: colors.success, fontSize: '12px', fontWeight: 600 }}>
                  You save ₹{priceInfo.discountAmount.toLocaleString()}!
                </Text>
              )}
            </div>
          </Space>

          {!product.isGaneshIdol && (
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>Select Quantity</Text>
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
                Total: ₹{(priceInfo.discountedPrice * quantity).toLocaleString()}
              </Text>
              <Text type="secondary">{quantity} × ₹{priceInfo.discountedPrice.toLocaleString()}</Text>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
});

// ServiceFeatures Component (unchanged)
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

// Set display names
ProductInfo.displayName = 'ProductInfo';
// COMMENTED OUT: TermsModal.displayName = 'TermsModal';
TermsSection.displayName = 'TermsSection';
PoojaKitModal.displayName = 'PoojaKitModal';
MobileActions.displayName = 'MobileActions';
ServiceFeatures.displayName = 'ServiceFeatures';

export default ProductInfo;
export { MobileActions, ServiceFeatures, calculateGaneshDiscount };