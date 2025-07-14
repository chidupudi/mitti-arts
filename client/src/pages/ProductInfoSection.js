// ProductInfoSection.jsx - FIXED VERSION WITH ORIGINAL DESCRIPTIONS
import React, { useState, useMemo, memo, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Rate,
  Tag,
  Space,
  InputNumber,
  List,
  Divider,
  Modal,
  Breadcrumb,
  Alert,
  Tooltip,
  Grid,
  Affix,
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
  PlusOutlined,
  MinusOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  StarFilled,
  EnvironmentOutlined,
  TruckOutlined,
  UndoOutlined,
  SecurityScanOutlined,
  GiftOutlined,
  PhoneOutlined,
  CrownOutlined,
  FireOutlined,
  StarOutlined,
  FileTextOutlined,
  CloseOutlined,
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: '8px',
    fontWeight: 600,
    height: '48px',
    fontSize: '16px',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    borderRadius: '8px',
    fontWeight: 600,
    height: '48px',
    fontSize: '16px',
  },
  buyNowButton: {
    background: `linear-gradient(135deg, ${colors.success} 0%, #4CAF50 100%)`,
    borderColor: colors.success,
    borderRadius: '8px',
    fontWeight: 600,
    height: '48px',
    fontSize: '16px',
    color: 'white',
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
    background: `linear-gradient(135deg, ${colors.primary}12 0%, ${colors.secondary}12 100%)`,
    borderRadius: '12px',
    padding: '20px',
    border: `1px solid ${colors.primary}20`,
  },
  quantitySelector: {
    borderRadius: '8px',
    border: `2px solid ${colors.divider}`,
  },
  featureCard: {
    borderRadius: '12px',
    border: `1px solid ${colors.divider}`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${colors.backgroundLight}20 100%)`,
    transition: 'all 0.3s ease',
  },
};

// IMPROVED: Enhanced function to format description into bullet points
const formatDescriptionAsPoints = (description) => {
  if (!description || typeof description !== 'string') return [];

  // First, clean up the description
  let cleanedDescription = description.trim();
  
  // Remove common prefixes that might not be useful
  cleanedDescription = cleanedDescription.replace(/^(description:|about:|features:|details:)/i, '').trim();
  
  // Try different splitting methods
  let points = [];
  
  // Method 1: Split by line breaks first (most reliable)
  if (cleanedDescription.includes('\n')) {
    points = cleanedDescription
      .split('\n')
      .map(point => point.trim())
      .filter(point => point.length > 5)
      .map(point => point.replace(/^[-•*\d+\.\)\]]\s*/, '').trim())
      .filter(point => point.length > 0);
  }
  
  // Method 2: If no line breaks, try splitting by periods
  if (points.length <= 1) {
    points = cleanedDescription
      .split(/\.\s+/)
      .map(point => point.trim())
      .filter(point => point.length > 10)
      .map(point => {
        // Remove leading bullets or numbers
        let cleaned = point.replace(/^[-•*\d+\.\)\]]\s*/, '').trim();
        // Ensure it ends properly
        if (cleaned && !cleaned.match(/[.!?]$/)) {
          cleaned += '.';
        }
        return cleaned;
      })
      .filter(point => point.length > 5);
  }
  
  // Method 3: If still no good split, try semicolons or commas for longer text
  if (points.length <= 1 && cleanedDescription.length > 100) {
    const delimiters = [';', ','];
    for (const delimiter of delimiters) {
      if (cleanedDescription.includes(delimiter)) {
        points = cleanedDescription
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
  
  // Method 4: If we still have just one long point, try to break it into logical chunks
  if (points.length <= 1 && cleanedDescription.length > 50) {
    // Look for common sentence starters or phrases that indicate new points
    const sentenceStarters = [
      /\b(Made from|Created with|Features|Includes|Perfect for|Ideal for|Great for|Excellent|Handcrafted|Traditional|Each|This)/gi
    ];
    
    let workingText = cleanedDescription;
    for (const regex of sentenceStarters) {
      const matches = [...workingText.matchAll(regex)];
      if (matches.length > 1) {
        // Split at these points
        const splitPoints = matches.map(match => match.index).slice(1);
        let currentIndex = 0;
        points = [];
        
        splitPoints.forEach(splitIndex => {
          const chunk = workingText.substring(currentIndex, splitIndex).trim();
          if (chunk.length > 10) {
            points.push(chunk.replace(/^[-•*\d+\.\)\]]\s*/, '').trim());
          }
          currentIndex = splitIndex;
        });
        
        // Add the last chunk
        const lastChunk = workingText.substring(currentIndex).trim();
        if (lastChunk.length > 10) {
          points.push(lastChunk.replace(/^[-•*\d+\.\)\]]\s*/, '').trim());
        }
        
        if (points.length > 1) break;
      }
    }
  }
  
  // If all methods fail, return the original text as a single point
  if (points.length === 0) {
    points = [cleanedDescription];
  }
  
  // Final cleanup: ensure each point is properly formatted
  return points
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
};

// Quantity Selector Component
const QuantitySelector = memo(({ value, onChange, max, disabled }) => {
  return (
    <Space.Compact style={customStyles.quantitySelector}>
      <Button
        icon={<MinusOutlined />}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        style={{ borderRadius: '8px 0 0 8px' }}
      />
      <InputNumber
        value={value}
        onChange={(val) => onChange(val || 1)}
        min={1}
        max={max}
        controls={false}
        style={{
          width: '60px',
          textAlign: 'center',
          borderRadius: 0,
          fontWeight: 600,
        }}
        disabled={disabled}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        style={{ borderRadius: '0 8px 8px 0' }}
      />
    </Space.Compact>
  );
});

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

  const regularTerms = [
    {
      title: "🎨 PRODUCT INFORMATION",
      points: [
        "All products are handmade - natural variations in size, color, and texture are expected.",
        "Made using traditional techniques with authentic materials.",
        "Product descriptions and prices may change without notice."
      ]
    },
    {
      title: "🚚 DELIVERY TERMS",
      points: [
        "Delivery within 3-5 days after order confirmation.",
        "Delivery hours: Monday-Sunday, 11 AM to 11 PM.",
        "Free delivery available for orders above certain value."
      ]
    },
    {
      title: "💰 REFUND POLICY",
      points: [
        "Refunds available for incorrect, missing, or poor-quality items only.",
        "Refund requests must be made within 24 hours of delivery.",
        "No returns due to handcrafted nature - all sales final."
      ]
    }
  ];

  const termsToShow = product?.isGaneshIdol ? ganeshTerms : regularTerms;

  return (
    <Modal
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: product?.isGaneshIdol ? colors.ganesh : colors.primary,
          fontSize: '18px',
          fontWeight: 600
        }}>
          <FileTextOutlined style={{ fontSize: '20px' }} />
          {product?.isGaneshIdol ? 'Important: Ganesh Idol Terms' : 'Important Terms'}
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
            backgroundColor: product?.isGaneshIdol ? colors.ganesh : colors.primary,
            borderColor: product?.isGaneshIdol ? colors.ganesh : colors.primary,
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
          backgroundColor: product?.isGaneshIdol ? `${colors.ganesh}08` : `${colors.primary}08`,
          borderBottom: `2px solid ${product?.isGaneshIdol ? colors.ganesh : colors.primary}20`
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
        background: `linear-gradient(135deg, ${product?.isGaneshIdol ? colors.ganesh : colors.primary}05 0%, rgba(255,255,255,0.8) 100%)`
      }}>
        {/* Important Notice */}
        <Alert
          message="Please Read Before Ordering"
          description={product?.isGaneshIdol
            ? "Custom Ganesh idols have specific terms due to their handcrafted nature and delivery requirements."
            : "Important information about our handcrafted products and policies."
          }
          type="warning"
          showIcon
          style={{
            marginBottom: '20px',
            backgroundColor: `${colors.warning}10`,
            border: `1px solid ${colors.warning}30`
          }}
        />

        {/* Terms Content */}
        {termsToShow.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '20px' }}>
            <Title level={5} style={{
              color: product?.isGaneshIdol ? colors.ganesh : colors.primary,
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
                      color: product?.isGaneshIdol ? colors.ganesh : colors.success,
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
          backgroundColor: product?.isGaneshIdol ? `${colors.ganesh}08` : `${colors.primary}08`,
          border: `1px solid ${product?.isGaneshIdol ? colors.ganesh : colors.primary}20`,
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
            color: product?.isGaneshIdol ? colors.ganesh : colors.primary,
            fontWeight: 600
          }}>
            📞 +91-7382150250 | ✉️ mittiarts0@gmail.com
          </Text>
        </div>
      </div>
    </Modal>
  );
});

// Compact Pooja Kit Display Component
const PoojaKitDisplay = memo(() => {
  const poojaKitItems = [
    { icon: <FireOutlined />, title: 'Organic Kumkum & Haldi', desc: 'Pure farmer-sourced materials' },
    { icon: <StarOutlined />, title: 'Natural Vibudhi', desc: 'Traditional sacred ash preparation' },
    { icon: <CrownOutlined />, title: 'Handloom Fabrics', desc: 'Ikkath Dhoti & Kanduva included' },
    { icon: <EnvironmentOutlined />, title: 'Plant Sapling', desc: 'For eco-friendly Visarjan' },
  ];

  return (
    <Card style={{
      borderRadius: '12px',
      border: `2px solid ${colors.ganesh}30`,
      background: `linear-gradient(135deg, ${colors.ganesh}08 0%, #FFE0B2 100%)`,
      height: '100%'
    }} bodyStyle={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <GiftOutlined style={{ fontSize: '32px', color: colors.ganesh, marginBottom: '8px' }} />
        <Title level={4} style={{ margin: 0, color: colors.ganesh }}>
          Complete Pooja Kit Included 🙏
        </Title>
      </div>

      <Row gutter={[12, 12]}>
        {poojaKitItems.map((item, index) => (
          <Col xs={24} sm={12} key={index}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.6)'
            }}>
              <div style={{ color: index === 3 ? colors.eco : colors.ganesh, fontSize: '16px' }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ display: 'block', fontSize: '12px', color: colors.text }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: '11px', color: colors.textSecondary }}>
                  {item.desc}
                </Text>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.8)',
        textAlign: 'center'
      }}>
        <Text style={{ fontSize: '13px', color: colors.textSecondary }}>
          Everything needed for authentic, eco-friendly celebration
        </Text>
      </div>
    </Card>
  );
});

// Compact Greener Visarjan Display Component
const GreenerVisarjanDisplay = memo(() => {
  const steps = [
    { icon: '🏠', title: 'Home Celebration', desc: 'Perform all rituals at home' },
    { icon: '💧', title: 'Water Dissolution', desc: 'Dissolve in container' },
    { icon: '🌱', title: 'Plant Sapling', desc: 'Use clay as fertilizer' },
    { icon: '🌳', title: 'Watch Grow', desc: 'Living symbol of faith' },
  ];

  const benefits = [
    'Pure heartfelt Pooja experience',
    'Zero water pollution contribution',
    'Growth of new life testament',
    'Lasting beautiful memory',
    'Environmental stewardship',
    'Teaching responsible celebration'
  ];

  return (
    <Card style={{
      borderRadius: '12px',
      border: `2px solid ${colors.eco}30`,
      background: `linear-gradient(135deg, ${colors.eco}08 0%, #E8F5E8 100%)`,
      height: '100%'
    }} bodyStyle={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <EnvironmentOutlined style={{ fontSize: '32px', color: colors.eco, marginBottom: '8px' }} />
        <Title level={4} style={{ margin: 0, color: colors.eco }}>
          A Greener Visarjan: Nurturing Nature 🌱
        </Title>
      </div>

      {/* Revolutionary Approach */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.8)',
          border: `1px solid ${colors.eco}20`
        }}>
          <Title level={5} style={{ margin: 0, marginBottom: '8px', color: colors.eco, fontSize: '14px' }}>
            🌍 Revolutionary Eco-Friendly Celebration
          </Title>
          <Text style={{ fontSize: '12px', color: colors.textSecondary, lineHeight: '1.4' }}>
            Transform traditional Visarjan into environmental stewardship while maintaining all spiritual significance.
          </Text>
        </div>
      </div>

      {/* 4-Step Process */}
      <div style={{ marginBottom: '16px' }}>
        <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: colors.text }}>
          Simple 4-Step Process:
        </Text>
        <Row gutter={[8, 8]}>
          {steps.map((step, index) => (
            <Col xs={12} sm={6} key={index}>
              <div style={{
                textAlign: 'center',
                padding: '8px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.6)',
                border: `1px solid ${colors.eco}15`
              }}>
                <div style={{ fontSize: '16px', marginBottom: '4px' }}>{step.icon}</div>
                <Text style={{ fontSize: '10px', fontWeight: 600, display: 'block', color: colors.text }}>
                  {step.title}
                </Text>
                <Text style={{ fontSize: '9px', color: colors.textSecondary }}>
                  {step.desc}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Benefits */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: colors.text }}>
          Benefits of Our Approach:
        </Text>
        <Row gutter={[8, 4]}>
          {benefits.map((benefit, index) => (
            <Col xs={12} key={index}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircleOutlined style={{ color: colors.eco, fontSize: '10px' }} />
                <Text style={{ fontSize: '10px', color: colors.textSecondary }}>{benefit}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
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

// Main Product Info Component - FIXED TO USE ORIGINAL DESCRIPTION
const ProductInfo = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [poojaKitModalOpen, setPoojaKitModalOpen] = useState(false);
  const screens = useBreakpoint();

  const { originalPrice, discount } = useMemo(() => {
    if (product.isGaneshIdol) {
      return { originalPrice: null, discount: 0 };
    }

    let discountRate = 0;
    if (product.price >= 1000) discountRate = 0.25;
    else if (product.price >= 500) discountRate = 0.20;
    else discountRate = 0.15;

    const original = Math.ceil(product.price / (1 - discountRate));
    const discountPercent = Math.round(((original - product.price) / original) * 100);

    return { originalPrice: original, discount: discountPercent };
  }, [product]);

  const stockStatus = useMemo(() => {
    if (product.isGaneshIdol) {
      return {
        status: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Custom Made to Order',
        color: colors.ganesh
      };
    }

    if (product.stock === 0) return { status: 'error', icon: <WarningOutlined />, text: 'Out of Stock', color: colors.error };
    if (product.stock <= 5) return { status: 'error', icon: <WarningOutlined />, text: `Only ${product.stock} left!`, color: colors.error };
    if (product.stock <= 10) return { status: 'warning', icon: <InfoCircleOutlined />, text: 'Few items left', color: colors.warning };
    return { status: 'success', icon: <CheckCircleOutlined />, text: 'In Stock', color: colors.success };
  }, [product]);

  // FIXED: Always use original description and format as bullet points
  const formattedDescriptionPoints = useMemo(() => {
    // Always try to use the original product description first
    if (product.description && product.description.trim()) {
      const points = formatDescriptionAsPoints(product.description);
      if (points.length > 0) {
        return points;
      }
    }

    // If Ganesh idol and no description, provide default points
    if (product.isGaneshIdol) {
      return [
        'Beautifully handcrafted Ganesh idol made by skilled artisans using traditional techniques.',
        'Made from sacred Ganga Clay sourced from the holy Ganges river.',
        'Each idol is unique and can be customized according to your preferences.',
        'Includes complete Pooja kit with organic materials for authentic celebration.',
        'Eco-friendly Visarjan solution with plant sapling for responsible celebration.'
      ];
    }

    // Default points for regular products when no description
    return [
      'Premium quality product crafted with attention to detail using traditional methods.',
      'Each piece is carefully made to ensure durability and aesthetic appeal.',
      'Natural variations in color and texture make each piece unique and special.'
    ];
  }, [product.description, product.isGaneshIdol]);

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

      <Card style={customStyles.productInfoCard} bodyStyle={{ padding: '24px', height: 'fit-content' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined /> Home
          </Breadcrumb.Item>
          <Breadcrumb.Item href={product.isGaneshIdol ? "/products" : "/products"}>
            <AppstoreOutlined /> {product.isGaneshIdol ? 'Ganesh Collection' : 'Products'}
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {product.name}
            {product.isGaneshIdol && (
              <Tag
                icon={<GiftOutlined />}
                color="#FF6B35"
                style={{ marginLeft: '8px', fontSize: '12px' }}
              >
                Custom Made
              </Tag>
            )}
            {product.hyderabadOnly && !product.isGaneshIdol && (
              <Tag
                icon={<EnvironmentOutlined />}
                color="#9C27B0"
                style={{ marginLeft: '8px', fontSize: '12px' }}
              >
                Hyderabad Only
              </Tag>
            )}
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Product Title */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{
            marginBottom: screens.xs ? '8px' : '0',
            marginRight: '8px',
            color: colors.text,
            fontSize: screens.xs ? '24px' : '32px',
          }}>
            {product.name}
          </Title>

          {product.isGaneshIdol && (
            <Space wrap>
              <Tag
                icon={<GiftOutlined />}
                color="#FF6B35"
                style={{
                  fontWeight: 600,
                  marginLeft: screens.xs ? '0' : '8px',
                  marginTop: screens.xs ? '8px' : '0',
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
                  marginTop: screens.xs ? '8px' : '0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                Eco-Friendly
              </Tag>
            </Space>
          )}

          {product.hyderabadOnly && !product.isGaneshIdol && (
            <Tag
              icon={<EnvironmentOutlined />}
              color="#9C27B0"
              style={{
                fontWeight: 600,
                marginLeft: screens.xs ? '0' : '8px',
                marginTop: screens.xs ? '8px' : '0',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              Hyderabad Only
            </Tag>
          )}
        </div>

        {/* Rating and Reviews */}
        <Space wrap style={{ marginBottom: '16px' }}>
          <Rate
            value={product.rating}
            allowHalf
            disabled
            character={<StarFilled />}
            style={{ color: product.isGaneshIdol ? colors.ganesh : colors.primary }}
          />
          <Text type="secondary">
            {product.rating} ({product.reviews} reviews)
          </Text>
          {product.code && (
            <Tag color={product.isGaneshIdol ? colors.ganesh : colors.primary} style={{ fontWeight: 600 }}>
              {product.code}
            </Tag>
          )}
        </Space>

        {/* Price Section with T&C and Gift Icons */}
        <div style={{
          ...customStyles.priceContainer,
          marginBottom: '20px',
          ...(product.isGaneshIdol && {
            background: `linear-gradient(135deg, ${colors.ganesh}12 0%, #FF8A6512 100%)`,
            border: `1px solid ${colors.ganesh}20`,
          })
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Space wrap align="baseline">
              <Title level={1} style={{
                margin: 0,
                color: product.isGaneshIdol ? colors.ganesh : colors.primary,
                fontSize: screens.xs ? '24px' : '32px',
              }}>
                ₹{product.price?.toLocaleString()}
              </Title>
              {product.isGaneshIdol ? (
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  All-Inclusive with Pooja Kit
                </Text>
              ) : (
                discount > 0 && (
                  <>
                    <Text delete type="secondary" style={{ fontSize: '18px' }}>
                      ₹{originalPrice.toLocaleString()}
                    </Text>
                    <Tag color="error" style={{ fontWeight: 600 }}>
                      {discount}% OFF
                    </Tag>
                  </>
                )
              )}
            </Space>

            {/* Icons Row - T&C and Gift */}
            <Space size="small">
              {/* Animated Gift Icon - Only for Ganesh Idols */}
              {product.isGaneshIdol && (
                <Tooltip title="Complete Pooja Kit Included! Click to see what's inside 🎁">
                  <Button
                    type="text"
                    className="gift-icon-animated"
                    icon={<GiftOutlined />}
                    onClick={() => setPoojaKitModalOpen(true)}
                    style={{
                      color: colors.ganesh,
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.ganesh}30`,
                      backgroundColor: `${colors.ganesh}08`,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = `${colors.ganesh}15`;
                      e.target.style.borderColor = `${colors.ganesh}60`;
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = `${colors.ganesh}08`;
                      e.target.style.borderColor = `${colors.ganesh}30`;
                      e.target.style.transform = 'scale(1)';
                    }}
                  />
                </Tooltip>
              )}

              {/* T&C Icon */}
              <Tooltip title={`Important ${product.isGaneshIdol ? 'Ganesh Idol' : ''} Terms`}>
                <Button
                  type="text"
                  icon={<WarningOutlined />}
                  onClick={() => setTermsModalOpen(true)}
                  style={{
                    color: product.isGaneshIdol ? colors.ganesh : colors.primary,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: `1px solid ${product.isGaneshIdol ? colors.ganesh : colors.primary}30`,
                    backgroundColor: `${product.isGaneshIdol ? colors.ganesh : colors.primary}08`,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = `${product.isGaneshIdol ? colors.ganesh : colors.primary}15`;
                    e.target.style.borderColor = `${product.isGaneshIdol ? colors.ganesh : colors.primary}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = `${product.isGaneshIdol ? colors.ganesh : colors.primary}08`;
                    e.target.style.borderColor = `${product.isGaneshIdol ? colors.ganesh : colors.primary}30`;
                  }}
                />
              </Tooltip>
            </Space>
          </div>
          <Text type="secondary">
            {product.isGaneshIdol
              ? `Made with Pure Ganga Clay • Supporting Local Artisans • Eco-Friendly Celebration`
              : product.hyderabadOnly
                ? 'Inclusive of all taxes • Available for delivery in Hyderabad only'
                : 'Inclusive of all taxes • Free shipping above ₹500'
            }
          </Text>
        </div>

        {/* FIXED: Product Description with Bullet Points - Using Original Description */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={5} style={{ color: colors.text, marginBottom: '12px' }}>
            {product.isGaneshIdol ? 'About This Sacred Ganesh Idol' : 'Product Description'}
          </Title>

          {/* Debug: Show if original description exists */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>
              Original Description: {product.description ? 'Available' : 'Not Available'}
            </div>
          )}

          {/* Display formatted description as bullet points */}
          <List
            size="small"
            dataSource={formattedDescriptionPoints}
            renderItem={(point, index) => (
              <List.Item style={{
                padding: '6px 0',
                border: 'none',
                alignItems: 'flex-start'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                  <CheckCircleOutlined style={{
                    color: product.isGaneshIdol ? colors.ganesh : colors.success,
                    fontSize: '14px',
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
                  <Text style={{
                    fontSize: '14px',
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
        </div>

        {/* Stock/Availability Status */}
        <Alert
          message={stockStatus.text}
          type={stockStatus.status}
          icon={stockStatus.icon}
          showIcon
          style={{
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: `${stockStatus.color}10`,
            border: `1px solid ${stockStatus.color}30`,
          }}
        />

        {/* Key Features List */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={5} style={{ color: colors.text, marginBottom: '12px' }}>
            {product.isGaneshIdol ? 'Key Features' : 'Highlights'}
          </Title>
          <List
            size="small"
            dataSource={product.isGaneshIdol ? [
              'Made from sacred Ganga Clay sourced from holy Ganges',
              'Handcrafted by expert artisans using traditional techniques',
              'Includes complimentary Pooja Kit with organic materials',
              'Eco-friendly Visarjan solution with plant sapling',
              'Supporting local artisan communities and heritage crafts',
            ] : [
              '100% authentic materials',
              'Handcrafted by skilled artisans',
              'Eco-friendly and sustainable',
              'Premium quality guarantee',
              product.hyderabadOnly ? 'Available for Hyderabad delivery only' : 'Free shipping above ₹500',
            ]}
            renderItem={item => (
              <List.Item style={{ padding: '4px 0', border: 'none' }}>
                <CheckCircleOutlined style={{
                  color: product.isGaneshIdol ? colors.ganesh : colors.success,
                  marginRight: '8px'
                }} />
                <Text style={{ fontSize: '14px' }}>{item}</Text>
              </List.Item>
            )}
          />
        </div>

        {/* Contact/Action Buttons Section */}
        <div style={{ marginTop: '24px' }}>
          {product.isGaneshIdol ? (
            // Ganesh Idol Actions
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<GiftOutlined />}
                onClick={() => onAddToCart(product, 1)}
                style={customStyles.ganeshButton}
                block
              >
                🕉️ Show Interest
              </Button>

              <Button
                size="large"
                icon={<PhoneOutlined />}
                onClick={() => window.location.href = '/contactus'}
                style={{
                  ...customStyles.ganeshButton,
                  background: `linear-gradient(135deg, ${colors.secondary} 0%, #D7CCC8 100%)`,
                  borderColor: colors.secondary,
                }}
                block
              >
                Contact for Customization
              </Button>

              <Text
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: colors.textSecondary,
                  fontStyle: 'italic'
                }}
              >
                Our team will contact you within 24 hours for customization details
              </Text>
            </Space>
          ) : (
            // Regular Product Actions
            <>
              {/* Quantity Selector for Regular Products */}
              {product.stock > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
                    Quantity
                  </Text>
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    max={product.stock}
                    disabled={product.stock === 0}
                  />
                </div>
              )}

              {/* Action Buttons for Regular Products */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Add to Cart and Wishlist Row */}
                <Space size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => onAddToCart(product, quantity)}
                    disabled={product.stock === 0}
                    style={{...customStyles.primaryButton, flex: 1}}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
                    <Button
                      size="large"
                      icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                      onClick={() => onToggleWishlist(product)}
                      style={{
                        borderColor: colors.divider,
                        color: isInWishlist ? colors.error : colors.textSecondary,
                        width: '60px',
                        height: '48px',
                        borderRadius: '8px',
                      }}
                    />
                  </Tooltip>
                </Space>

                {/* Buy Now Button */}
                <Button
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={() => onBuyNow(product, quantity)}
                  disabled={product.stock === 0}
                  style={customStyles.buyNowButton}
                  block
                >
                  Buy Now
                </Button>

                {/* Contact Button */}
                <Button
                  size="large"
                  icon={<PhoneOutlined />}
                  onClick={() => window.location.href = '/contactus'}
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    fontWeight: 600,
                    borderColor: colors.secondary,
                    color: colors.secondary,
                  }}
                  block
                >
                  Contact Us for Queries
                </Button>
              </Space>
            </>
          )}
        </div>

        {/* Hyderabad-only Alert for regular products */}
        {product.hyderabadOnly && !product.isGaneshIdol && (
          <Alert
            message="Hyderabad-Only Delivery"
            description="This product is available for delivery only within Hyderabad city limits."
            type="info"
            icon={<EnvironmentOutlined />}
            showIcon
            style={{
              marginTop: '20px',
              borderRadius: '8px',
              backgroundColor: '#9C27B010',
              border: '1px solid #9C27B030',
              color: '#9C27B0',
            }}
          />
        )}
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
});

// FINAL Optimized Product Description Component - FIXED WITH ORIGINAL DESCRIPTION
const ProductDescription = memo(({ product }) => {
  // FIXED: Always use original description and format as bullet points
  const formattedDescriptionPoints = useMemo(() => {
    // Always try to use the original product description first
    if (product.description && product.description.trim()) {
      const points = formatDescriptionAsPoints(product.description);
      if (points.length > 0) {
        return points;
      }
    }

    // If Ganesh idol and no description, provide default points
    if (product.isGaneshIdol) {
      return [
        'Beautifully handcrafted Ganga Clay Ganesh idol made by skilled artisans using traditional techniques passed down through generations.',
        'Made from sacred Ganga Clay sourced directly from the holy Ganges River, each idol carries spiritual significance and environmental consciousness.',
        'Every piece is unique and can be completely customized according to your preferences for size, design, finishing, and decorative elements.',
        'Includes complete Pooja kit with organic materials for authentic celebration.',
        'Eco-friendly Visarjan solution with plant sapling for responsible environmental stewardship.'
      ];
    }

    // Default for regular products when no description
    return [
      'This premium quality product is crafted with meticulous attention to detail using time-honored traditional methods.',
      'Each piece is carefully made by skilled artisans to ensure exceptional durability, functionality, and aesthetic appeal.',
      'The natural variations in color, texture, and finish make each item unique, adding distinctive character to your collection.'
    ];
  }, [product.description, product.isGaneshIdol]);

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Main Description Card */}
      <Card style={{
        ...customStyles.productInfoCard,
        marginBottom: '24px'
      }} bodyStyle={{ padding: '24px' }}>
        <Title level={3} style={{
          color: colors.text,
          marginBottom: '20px',
          textAlign: 'center',
          background: product.isGaneshIdol
            ? `linear-gradient(135deg, ${colors.ganesh} 0%, #FFB74D 100%)`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {product.isGaneshIdol ? '🕉️ About This Sacred Ganesh Idol' : '📋 Detailed Product Information'}
        </Title>

        {/* Debug: Show if original description exists */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px', textAlign: 'center' }}>
            Original Description: {product.description ? 'Available' : 'Not Available'} | 
            Length: {product.description ? product.description.length : 0} characters
          </div>
        )}

        {/* FIXED: Extended Description as Bullet Points - Using Original Description */}
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
                    color: product.isGaneshIdol ? colors.ganesh : colors.success,
                    fontSize: '16px',
                    marginTop: '4px',
                    flexShrink: 0
                  }} />
                  <Text style={{
                    fontSize: '16px',
                    lineHeight: '1.7',
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

        {/* Heritage & Craftsmanship Features - Fixed Layout */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ color: colors.text, marginBottom: '16px' }}>
            {product.isGaneshIdol ? 'Heritage & Craftsmanship' : 'Key Features'}
          </Title>

          <Row gutter={[16, 12]}>
            {(product.isGaneshIdol ? [
              'Made from sacred Ganga Clay sourced from holy Ganges',
              'Handcrafted by expert artisans using traditional techniques',
              'Supporting local artisan communities and heritage crafts',
              'Each piece is unique with natural variations in clay texture',
            ] : [
              '100% authentic materials sourced from trusted suppliers',
              'Handcrafted by skilled artisans using traditional methods',
              'Eco-friendly and sustainable production processes',
              'Premium quality guarantee with rigorous quality control',
            ]).map((feature, index) => (
              <Col xs={24} sm={12} key={index}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: `${product.isGaneshIdol ? colors.ganesh : colors.primary}05`,
                  border: `1px solid ${product.isGaneshIdol ? colors.ganesh : colors.primary}15`,
                }}>
                  <CheckCircleOutlined style={{
                    color: product.isGaneshIdol ? colors.ganesh : colors.success,
                    fontSize: '16px',
                    marginTop: '2px',
                    flexShrink: 0
                  }} />
                  <Text style={{ fontSize: '14px', lineHeight: '1.5', color: colors.text }}>
                    {feature}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Specifications Section - Compact Layout */}
        {(product.height || product.weight || product.material || product.color) && (
          <div>
            <Title level={4} style={{ color: colors.text, marginBottom: '16px' }}>
              Specifications
            </Title>
            <Row gutter={[12, 12]}>
              {product.height && (
                <Col xs={12} sm={6}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: `${colors.primary}08`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.primary}15`
                  }}>
                    <Text strong style={{ display: 'block', color: colors.primary, fontSize: '14px' }}>Height</Text>
                    <Text style={{ fontSize: '13px', color: colors.textSecondary }}>{product.height}</Text>
                  </div>
                </Col>
              )}
              {product.weight && (
                <Col xs={12} sm={6}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: `${colors.secondary}08`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.secondary}15`
                  }}>
                    <Text strong style={{ display: 'block', color: colors.secondary, fontSize: '14px' }}>Weight</Text>
                    <Text style={{ fontSize: '13px', color: colors.textSecondary }}>{product.weight}</Text>
                  </div>
                </Col>
              )}
              {product.material && (
                <Col xs={12} sm={6}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: `${colors.eco}08`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.eco}15`
                  }}>
                    <Text strong style={{ display: 'block', color: colors.eco, fontSize: '14px' }}>Material</Text>
                    <Text style={{ fontSize: '13px', color: colors.textSecondary }}>{product.material}</Text>
                  </div>
                </Col>
              )}
              {product.color && (
                <Col xs={12} sm={6}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: `${colors.ganesh}08`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.ganesh}15`
                  }}>
                    <Text strong style={{ display: 'block', color: colors.ganesh, fontSize: '14px' }}>Color</Text>
                    <Text style={{ fontSize: '13px', color: colors.textSecondary }}>{product.color}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Card>

      {/* Ganesh Idol Special Sections - Side by Side */}
      {product.isGaneshIdol && (
        <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <PoojaKitDisplay />
          </Col>
          <Col xs={24} lg={12}>
            <GreenerVisarjanDisplay />
          </Col>
        </Row>
      )}
    </div>
  );
});

// Enhanced Mobile Actions Component - Fixed
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
      <Affix offsetBottom={0}>
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          padding: '20px 16px',
          borderTop: `2px solid ${colors.divider}`,
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
        }}>
          {/* Mobile Action Buttons ONLY */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* First Row: Show Interest + Phone Icon (for Ganesh Idol) or Add to Cart + Wishlist/Contact (for regular) */}
            <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
              {product.isGaneshIdol ? (
                <>
                  <Button
                    type="primary"
                    size="large"
                    icon={<GiftOutlined />}
                    onClick={handleAddToCart}
                    style={{
                      background: `linear-gradient(135deg, ${colors.ganesh} 0%, #FFB74D 100%)`,
                      borderColor: colors.ganesh,
                      flex: 1,
                      height: '52px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    🕉️ Show Interest
                  </Button>
                  <Button
                    size="large"
                    icon={<PhoneOutlined />}
                    onClick={() => window.location.href = '/contactus'}
                    style={{
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      marginLeft: '8px',
                    }}
                  />
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    style={{
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                      flex: 1,
                      height: '52px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    size="large"
                    icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                    onClick={() => onToggleWishlist(product)}
                    style={{
                      borderColor: colors.divider,
                      color: isInWishlist ? colors.error : colors.textSecondary,
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      marginLeft: '8px',
                    }}
                  />
                  <Button
                    size="large"
                    icon={<PhoneOutlined />}
                    onClick={() => window.location.href = '/contactus'}
                    style={{
                      borderColor: colors.secondary,
                      color: colors.secondary,
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      marginLeft: '8px',
                    }}
                  />
                </>
              )}
            </Space>

            {/* Second Row: Buy Now/Contact Button - FIXED */}
            <Button
              size="large"
              icon={product.isGaneshIdol ? <PhoneOutlined /> : <ThunderboltOutlined />}
              onClick={product.isGaneshIdol ? () => window.location.href = '/contactus' : handleBuyNow}
              disabled={!product.isGaneshIdol && product.stock === 0}
              style={{
                ...(product.isGaneshIdol ? {
                  background: `linear-gradient(135deg, ${colors.secondary} 0%, #D7CCC8 100%)`,
                  borderColor: colors.secondary,
                  color: 'white'
                } : {
                  background: `linear-gradient(135deg, ${colors.success} 0%, #4CAF50 100%)`,
                  borderColor: colors.success,
                  color: 'white'
                }),
                width: '100%',
                height: '52px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              {product.isGaneshIdol ? 'Contact for Details' : 'Buy Now'}
            </Button>
          </Space>
        </div>
      </Affix>

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
            style={product.isGaneshIdol ? customStyles.ganeshButton : customStyles.primaryButton}
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
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
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

// Enhanced Service Features Component
const ServiceFeatures = memo(({ product }) => {
  const features = product.isGaneshIdol ? [
    {
      icon: <GiftOutlined style={{ fontSize: '48px', color: colors.ganesh }} />,
      title: 'Complete Pooja Kit',
      description: 'Organic Kumkum, Haldi, Vibudhi & Handloom fabrics included with every idol',
      highlights: ['Organic Materials', 'Traditional Items', 'Farmer Sourced']
    },
    {
      icon: <EnvironmentOutlined style={{ fontSize: '48px', color: colors.eco }} />,
      title: 'Eco-Friendly Visarjan',
      description: 'Plant sapling included for greener, pollution-free celebration at home',
      highlights: ['Zero Pollution', 'Home Visarjan', 'Plant Growth']
    },
    {
      icon: <CrownOutlined style={{ fontSize: '48px', color: colors.ganesh }} />,
      title: 'Custom Craftsmanship',
      description: 'Handcrafted by expert artisans with traditional techniques and full customization',
      highlights: ['Expert Artisans', 'Traditional Methods', 'Fully Customizable']
    },
    {
      icon: <PhoneOutlined style={{ fontSize: '48px', color: colors.secondary }} />,
      title: '24/7 Support',
      description: 'Dedicated support team for customization guidance and festival assistance',
      highlights: ['Expert Guidance', 'Festival Support', 'Quick Response']
    },
  ] : [
    {
      icon: <TruckOutlined style={{ fontSize: '48px', color: product?.hyderabadOnly ? '#9C27B0' : colors.primary }} />,
      title: product?.hyderabadOnly ? 'Hyderabad Delivery' : 'Free Shipping',
      description: product?.hyderabadOnly
        ? 'Same-day delivery available within Hyderabad city limits'
        : 'Free delivery across India for orders above ₹500',
      highlights: product?.hyderabadOnly
        ? ['Same Day Delivery', 'Local Service', 'Real-time Tracking']
        : ['Pan India Delivery', 'Free Above ₹500', 'Secure Packaging']
    },
    {
      icon: <UndoOutlined style={{ fontSize: '48px', color: colors.primary }} />,
      title: 'Easy Returns',
      description: '30-day hassle-free return policy with no questions asked',
      highlights: ['30-Day Returns', 'No Questions Asked', 'Full Refund']
    },
    {
      icon: <SecurityScanOutlined style={{ fontSize: '48px', color: colors.primary }} />,
      title: 'Secure Payment',
      description: '100% secure payment gateway with multiple payment options',
      highlights: ['100% Secure', 'Multiple Options', 'Instant Processing']
    },
    {
      icon: <PhoneOutlined style={{ fontSize: '48px', color: colors.secondary }} />,
      title: 'Customer Support',
      description: 'Dedicated customer support team for all your queries',
      highlights: ['Expert Help', 'Quick Response', 'Product Guidance']
    },
  ];

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Section Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '24px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${product.isGaneshIdol ? colors.ganesh : colors.primary}08 0%, rgba(255,255,255,0.8) 100%)`,
        border: `1px solid ${product.isGaneshIdol ? colors.ganesh : colors.primary}20`,
      }}>
        <Title level={2} style={{
          color: colors.text,
          marginBottom: '12px',
          background: product.isGaneshIdol
            ? `linear-gradient(135deg, ${colors.ganesh} 0%, #FFB74D 100%)`
            : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {product.isGaneshIdol ? '🕉️ Our Sacred Promise' : '🛡️ Why Choose Us?'}
        </Title>
        <Paragraph style={{
          fontSize: '16px',
          color: colors.textSecondary,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          {product.isGaneshIdol
            ? 'Committed to authentic, eco-friendly, and spiritually enriching Ganesh Chaturthi experience.'
            : 'Committed to providing exceptional quality products and outstanding customer service.'
          }
        </Paragraph>
      </div>

      {/* Features Grid */}
      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                ...customStyles.featureCard,
                height: '100%',
                ...(product.isGaneshIdol ? {
                  borderColor: `${colors.ganesh}30`,
                  backgroundColor: `${colors.ganesh}08`,
                } : index === 0 && product?.hyderabadOnly ? {
                  borderColor: '#9C27B030',
                  backgroundColor: '#9C27B008',
                } : {})
              }}
              bodyStyle={{
                textAlign: 'center',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              hoverable
            >
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                borderRadius: '16px',
                background: `${product.isGaneshIdol ? colors.ganesh : colors.primary}15`,
                display: 'inline-block',
              }}>
                {feature.icon}
              </div>

              <Title level={4} style={{
                marginBottom: '12px',
                color: product.isGaneshIdol
                  ? colors.ganesh
                  : (index === 0 && product?.hyderabadOnly ? '#9C27B0' : colors.text),
                fontSize: '18px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {feature.title}
              </Title>

              <Paragraph style={{
                color: colors.textSecondary,
                fontSize: '14px',
                lineHeight: '1.5',
                flex: 1,
                marginBottom: '16px'
              }}>
                {feature.description}
              </Paragraph>

              <Space wrap size="small" style={{ justifyContent: 'center' }}>
                {feature.highlights.map((highlight, idx) => (
                  <Tag
                    key={idx}
                    style={{
                      backgroundColor: product.isGaneshIdol ? `${colors.ganesh}15` : `${colors.primary}15`,
                      color: product.isGaneshIdol ? colors.ganesh : colors.primary,
                      border: 'none',
                      borderRadius: '12px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {highlight}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Trust Indicators */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${colors.backgroundLight} 0%, rgba(255,255,255,0.9) 100%)`,
        border: `1px solid ${colors.divider}`,
        textAlign: 'center'
      }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: colors.success }} />
              <div>
                <Text strong style={{ display: 'block', fontSize: '18px', color: colors.text }}>
                  {product.isGaneshIdol ? '50+' : '1000+'}
                </Text>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  {product.isGaneshIdol ? 'Custom Idols' : 'Happy Customers'}
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <StarFilled style={{ fontSize: '24px', color: colors.warning }} />
              <div>
                <Text strong style={{ display: 'block', fontSize: '18px', color: colors.text }}>
                  {product.rating || '4.8'}/5
                </Text>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Average Rating
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <SecurityScanOutlined style={{ fontSize: '24px', color: colors.primary }} />
              <div>
                <Text strong style={{ display: 'block', fontSize: '18px', color: colors.text }}>
                  100%
                </Text>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Secure & Safe
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
});

// Set display names
ProductInfo.displayName = 'ProductInfo';
QuantitySelector.displayName = 'QuantitySelector';
TermsModal.displayName = 'TermsModal';
PoojaKitModal.displayName = 'PoojaKitModal';
ProductDescription.displayName = 'ProductDescription';
MobileActions.displayName = 'MobileActions';
ServiceFeatures.displayName = 'ServiceFeatures';
PoojaKitDisplay.displayName = 'PoojaKitDisplay';
GreenerVisarjanDisplay.displayName = 'GreenerVisarjanDisplay';

export default ProductInfo;
export { MobileActions, ServiceFeatures, ProductDescription };