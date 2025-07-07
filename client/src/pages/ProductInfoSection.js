// ProductInfoSection.jsx - Enhanced with Ganesh Idol Support
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
  ganesh: '#FF6B35', // Special color for Ganesh idols
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

// Product Info Component
const ProductInfo = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const screens = useBreakpoint();

  const { originalPrice, discount } = useMemo(() => {
    if (product.isGaneshIdol) {
      // For Ganesh idols, show the price range
      const discountPercent = Math.round(((product.priceMax - product.priceMin) / product.priceMax) * 100);
      return { originalPrice: product.priceMax, discount: discountPercent };
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

  return (
    <Card style={customStyles.productInfoCard} bodyStyle={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href={product.isGaneshIdol ? "/ganesh-collection" : "/products"}>
          <AppstoreOutlined /> {product.isGaneshIdol ? 'Ganesh Collection' : 'Products'}
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {product.name}
          {product.isGaneshIdol && (
            <Tag 
              icon={<GiftOutlined />}
              color="#FF6B35"
              style={{ 
                marginLeft: '8px',
                fontSize: '12px',
              }}
            >
              Custom Made
            </Tag>
          )}
          {product.hyderabadOnly && !product.isGaneshIdol && (
            <Tag 
              icon={<EnvironmentOutlined />}
              color="#9C27B0"
              style={{ 
                marginLeft: '8px',
                fontSize: '12px',
              }}
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
          <Tag 
            icon={<GiftOutlined />} 
            color="#FF6B35"
            style={{ 
              fontWeight: 600, 
              marginLeft: screens.xs ? '0' : '8px',
              marginTop: screens.xs ? '8px' : '0',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Custom Made
          </Tag>
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
              display: 'inline-flex',
              alignItems: 'center',
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

      {/* Price Section */}
      <div style={{
        ...customStyles.priceContainer, 
        marginBottom: '20px',
        ...(product.isGaneshIdol && {
          background: `linear-gradient(135deg, ${colors.ganesh}12 0%, #FF8A6512 100%)`,
          border: `1px solid ${colors.ganesh}20`,
        })
      }}>
        <Space wrap align="baseline" style={{ marginBottom: '8px' }}>
          {product.isGaneshIdol ? (
            // Show price range for Ganesh idols
            <>
              <Title level={1} style={{ 
                margin: 0, 
                color: colors.ganesh,
                fontSize: screens.xs ? '24px' : '32px',
              }}>
                ₹{product.priceMin?.toLocaleString()} - ₹{product.priceMax?.toLocaleString()}
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Price Range
              </Text>
            </>
          ) : (
            // Regular product pricing
            <>
              <Title level={1} style={{ 
                margin: 0, 
                color: colors.primary,
                fontSize: screens.xs ? '28px' : '36px',
              }}>
                ₹{product.price.toLocaleString()}
              </Title>
              {discount > 0 && (
                <>
                  <Text delete type="secondary" style={{ fontSize: '18px' }}>
                    ₹{originalPrice.toLocaleString()}
                  </Text>
                  <Tag color="error" style={{ fontWeight: 600 }}>
                    {discount}% OFF
                  </Tag>
                </>
              )}
            </>
          )}
        </Space>
        <Text type="secondary">
          {product.isGaneshIdol 
            ? `Inclusive of all taxes • ${product.advancePercentage}% advance required • Delivered in ${product.estimatedDays} days`
            : product.hyderabadOnly 
              ? 'Inclusive of all taxes • Available for delivery in Hyderabad only' 
              : 'Inclusive of all taxes • Free shipping above ₹500'
          }
        </Text>
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

      {/* Ganesh Idol Special Info */}
      {product.isGaneshIdol && (
        <Alert
          message="🕉️ Custom Ganesh Idol"
          description={`Handcrafted to your specifications • ${product.estimatedDays || 7} days delivery • ${product.advancePercentage || 25}% advance payment • Height: ${product.height || 'Customizable'} • Material: ${product.material || 'Clay'}`}
          type="info"
          icon={<GiftOutlined />}
          showIcon
          style={{ 
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: `${colors.ganesh}10`,
            border: `1px solid ${colors.ganesh}30`,
            color: colors.ganesh,
          }}
        />
      )}

      {/* Hyderabad-only Alert for regular products */}
      {product.hyderabadOnly && !product.isGaneshIdol && (
        <Alert
          message="Hyderabad-Only Delivery"
          description="This product is available for delivery only within Hyderabad city limits."
          type="info"
          icon={<EnvironmentOutlined />}
          showIcon
          style={{ 
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: '#9C27B010',
            border: '1px solid #9C27B030',
            color: '#9C27B0',
          }}
        />
      )}

      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <Paragraph
          ellipsis={!expandedDescription ? { rows: 3, expandable: true, symbol: 'Show more' } : false}
          style={{ fontSize: '16px', lineHeight: '1.6' }}
        >
          {product.description || (product.isGaneshIdol 
            ? 'Beautifully handcrafted Ganesh idol made by skilled artisans using traditional techniques. Each idol is unique and can be customized according to your preferences for size, design, and finishing.'
            : 'Premium quality product crafted with attention to detail using traditional methods. Each piece is carefully made to ensure durability and aesthetic appeal.'
          )}
        </Paragraph>
      </div>

      {/* Desktop Actions */}
      {!screens.xs && (
        <>
          {/* Quantity Selector - Only for regular products */}
          {!product.isGaneshIdol && product.stock > 0 && (
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

          {/* Action Buttons */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Add to Cart/Show Interest and Wishlist Row */}
            <Space size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={product.isGaneshIdol ? <GiftOutlined /> : <ShoppingCartOutlined />}
                onClick={() => onAddToCart(product, quantity)}
                disabled={!product.isGaneshIdol && product.stock === 0}
                style={product.isGaneshIdol ? customStyles.ganeshButton : customStyles.primaryButton}
                block
              >
                {product.isGaneshIdol ? '🕉️ Show Interest' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
              </Button>
              {!product.isGaneshIdol && (
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
              )}
            </Space>
            
            {/* Buy Now Button / Contact Us */}
            <Button
              size="large"
              icon={product.isGaneshIdol ? <PhoneOutlined /> : <ThunderboltOutlined />}
              onClick={() => onBuyNow(product, quantity)}
              disabled={!product.isGaneshIdol && product.stock === 0}
              style={product.isGaneshIdol ? customStyles.ganeshButton : customStyles.buyNowButton}
              block
            >
              {product.isGaneshIdol ? 'Contact for Details' : 'Buy Now'}
            </Button>
          </Space>
        </>
      )}

      {/* Key Features */}
      <Divider />
      <Title level={4} style={{ color: colors.text }}>
        {product.isGaneshIdol ? 'Customization Features' : 'Key Features'}
      </Title>
      <List
        size="small"
        dataSource={product.isGaneshIdol ? [
          'Handcrafted by expert artisans',
          'Customizable height and design',
          'Traditional clay and eco-friendly materials',
          'Personalized finishing options',
          `${product.estimatedDays || 7} days delivery timeline`,
          `${product.advancePercentage || 25}% advance payment required`,
        ] : [
          '100% authentic materials',
          'Handcrafted by skilled artisans',
          'Eco-friendly and sustainable',
          'Premium quality guarantee',
          ...(product.hyderabadOnly ? ['Available for delivery in Hyderabad only'] : []),
        ]}
        renderItem={item => (
          <List.Item>
            <CheckCircleOutlined style={{ 
              color: product.isGaneshIdol ? colors.ganesh : colors.success, 
              marginRight: '8px' 
            }} />
            {item}
          </List.Item>
        )}
      />
    </Card>
  );
});

// Mobile Actions Component - Enhanced for Ganesh Idols
const MobileActions = memo(({ product, onAddToCart, onBuyNow, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('cart'); // 'cart' or 'buy'

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
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          borderTop: `1px solid ${colors.divider}`,
          borderRadius: '20px 20px 0 0',
        }}>
          {/* Special badges */}
          {(product.hyderabadOnly || product.isGaneshIdol) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: product.isGaneshIdol ? colors.ganesh : '#9C27B0',
              marginBottom: '8px',
            }}>
              {product.isGaneshIdol ? <GiftOutlined /> : <EnvironmentOutlined />}
              <Text style={{ fontSize: '12px', color: product.isGaneshIdol ? colors.ganesh : '#9C27B0' }}>
                {product.isGaneshIdol ? 'Custom Made Ganesh Idol' : 'Hyderabad Only Delivery'}
              </Text>
            </div>
          )}
          
          {/* Mobile Action Buttons */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* First Row: Wishlist + Add to Cart/Show Interest */}
            <Space size="middle" style={{ width: '100%' }}>
              {!product.isGaneshIdol && (
                <Button
                  size="large"
                  icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
                  onClick={() => onToggleWishlist(product)}
                  style={{
                    borderColor: colors.divider,
                    color: isInWishlist ? colors.error : colors.textSecondary,
                    width: '60px',
                    height: '48px',
                  }}
                />
              )}
              <Button
                type="primary"
                size="large"
                icon={product.isGaneshIdol ? <GiftOutlined /> : <ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={!product.isGaneshIdol && product.stock === 0}
                style={{
                  ...(product.isGaneshIdol ? customStyles.ganeshButton : customStyles.primaryButton),
                  flex: 1,
                }}
              >
                {product.isGaneshIdol ? '🕉️ Show Interest' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
              </Button>
            </Space>

            {/* Second Row: Buy Now/Contact Button */}
            <Button
              size="large"
              icon={product.isGaneshIdol ? <PhoneOutlined /> : <ThunderboltOutlined />}
              onClick={handleBuyNow}
              disabled={!product.isGaneshIdol && product.stock === 0}
              style={{
                ...(product.isGaneshIdol ? customStyles.ganeshButton : customStyles.buyNowButton),
                width: '100%',
              }}
            >
              {product.isGaneshIdol ? 'Contact for Details' : 'Buy Now'}
            </Button>
          </Space>
        </div>
      </Affix>

      {/* Quantity Modal - Only for regular products */}
      <Modal
        title={product.isGaneshIdol 
          ? (actionType === 'cart' ? 'Show Interest in Ganesh Idol' : 'Contact for Ganesh Idol Details')
          : (actionType === 'cart' ? 'Select Quantity' : 'Buy Now - Select Quantity')
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
            icon={product.isGaneshIdol ? <GiftOutlined /> : (actionType === 'cart' ? <ShoppingCartOutlined /> : <ThunderboltOutlined />)}
            onClick={confirmAction}
            style={product.isGaneshIdol ? customStyles.ganeshButton : (actionType === 'cart' ? customStyles.primaryButton : customStyles.buyNowButton)}
          >
            {product.isGaneshIdol 
              ? (actionType === 'cart' ? '🕉️ Show Interest' : 'Contact Us')
              : (actionType === 'cart' ? 'Add to Cart' : 'Buy Now')
            }
          </Button>,
        ]}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size="middle">
            <Avatar
              src={product.images?.[0] || product.imgUrl}
              size={64}
              shape="square"
            />
            <div>
              <Text strong>{product.name}</Text>
              <div>
                {product.code && (
                  <Text type="secondary">Code: {product.code}</Text>
                )}
                {product.isGaneshIdol && (
                  <Tag 
                    icon={<GiftOutlined />}
                    color="#FF6B35"
                    size="small"
                    style={{ marginLeft: '4px' }}
                  >
                    Custom Made
                  </Tag>
                )}
                {product.hyderabadOnly && !product.isGaneshIdol && (
                  <Tag 
                    icon={<EnvironmentOutlined />}
                    color="#9C27B0"
                    size="small"
                    style={{ marginLeft: '4px' }}
                  >
                    Hyderabad Only
                  </Tag>
                )}
              </div>
              <Title level={4} style={{ margin: 0, color: product.isGaneshIdol ? colors.ganesh : colors.primary }}>
                {product.isGaneshIdol 
                  ? `₹${product.priceMin?.toLocaleString()} - ₹${product.priceMax?.toLocaleString()}`
                  : `₹${product.price.toLocaleString()}`
                }
              </Title>
            </div>
          </Space>

          {!product.isGaneshIdol && (
            <div style={{ textAlign: 'center' }}>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={product.stock}
              />
            </div>
          )}

          {/* Special info based on product type */}
          {product.isGaneshIdol ? (
            <div style={{ 
              background: `${colors.ganesh}10`,
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <GiftOutlined style={{ color: colors.ganesh }} />
              <Text type="secondary" style={{ color: colors.ganesh }}>
                Custom made Ganesh idol. Our team will contact you for customization details and advance payment.
              </Text>
            </div>
          ) : product.hyderabadOnly ? (
            <div style={{ 
              background: '#9C27B010',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <EnvironmentOutlined style={{ color: '#9C27B0' }} />
              <Text type="secondary" style={{ color: '#9C27B0' }}>
                This product is available for delivery only within Hyderabad city limits.
              </Text>
            </div>
          ) : null}

          {!product.isGaneshIdol && (
            <div style={{
              background: `${colors.primary}08`,
              padding: '16px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text strong>Total: ₹{(product.price * quantity).toLocaleString()}</Text>
              <Text type="secondary">{quantity} × ₹{product.price.toLocaleString()}</Text>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
});

// Service Features Component - Enhanced for Ganesh Idols
const ServiceFeatures = memo(({ product }) => {
  const features = product.isGaneshIdol ? [
    {
      icon: <GiftOutlined style={{ fontSize: '40px', color: colors.ganesh }} />,
      title: 'Custom Made',
      description: 'Handcrafted according to your specifications',
    },
    {
      icon: <PhoneOutlined style={{ fontSize: '40px', color: colors.ganesh }} />,
      title: 'Personal Consultation',
      description: 'Direct consultation with expert artisans',
    },
    {
      icon: <SecurityScanOutlined style={{ fontSize: '40px', color: colors.ganesh }} />,
      title: 'Quality Assured',
      description: 'Traditional techniques with modern quality standards',
    },
  ] : [
    {
      icon: <TruckOutlined style={{ fontSize: '40px', color: product?.hyderabadOnly ? '#9C27B0' : colors.primary }} />,
      title: product?.hyderabadOnly ? 'Hyderabad Only' : 'Free Shipping',
      description: product?.hyderabadOnly ? 'Available for delivery in Hyderabad only' : 'Free delivery on orders above ₹500',
    },
    {
      icon: <UndoOutlined style={{ fontSize: '40px', color: colors.primary }} />,
      title: 'Easy Returns',
      description: '30-day hassle-free return policy',
    },
    {
      icon: <SecurityScanOutlined style={{ fontSize: '40px', color: colors.primary }} />,
      title: 'Secure Payment',
      description: '100% secure payment gateway',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginTop: '48px' }}>
      {features.map((feature, index) => (
        <Col xs={24} sm={8} key={index}>
          <Card
            style={{
              ...customStyles.featureCard,
              ...(index === 0 && product?.hyderabadOnly && !product.isGaneshIdol ? {
                borderColor: '#9C27B030',
                backgroundColor: '#9C27B008',
              } : {}),
              ...(product.isGaneshIdol ? {
                borderColor: `${colors.ganesh}30`,
                backgroundColor: `${colors.ganesh}08`,
              } : {})
            }}
            bodyStyle={{ textAlign: 'center', padding: '32px 16px' }}
            hoverable
          >
            {feature.icon}
            <Title level={4} style={{ 
              marginTop: '16px', 
              marginBottom: '8px', 
              color: product.isGaneshIdol ? colors.ganesh : (index === 0 && product?.hyderabadOnly ? '#9C27B0' : colors.text)
            }}>
              {feature.title}
            </Title>
            <Text type="secondary">{feature.description}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
});

// Set display names
ProductInfo.displayName = 'ProductInfo';
MobileActions.displayName = 'MobileActions';
ServiceFeatures.displayName = 'ServiceFeatures';
QuantitySelector.displayName = 'QuantitySelector';

export default ProductInfo;
export { MobileActions, ServiceFeatures };