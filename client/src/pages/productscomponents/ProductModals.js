// pages/productscomponents/ProductModals.js
import React, { useState, useEffect, memo } from 'react';
import {
  Typography,
  Card,
  Input,
  Button,
  Drawer,
  Modal,
  Avatar,
  Space,
  Tag,
  InputNumber,
  Empty,
  Row,
  Col,
  Divider,
  Alert,
  Grid,
  Skeleton,
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  AppstoreOutlined,
  FilterOutlined,
  TrophyOutlined,
  PlusOutlined,
  MinusOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// Terracotta colors
const terracottaColors = {
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
  ganesh: '#FF8F00',
};

// Format price helper
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

// Quantity Modal Component
export const QuantityModal = ({ 
  open, 
  onClose, 
  product, 
  onConfirm
}) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setError('');
    }
  }, [open]);

  const handleQuantityChange = (value) => {
    if (value < 1) return;
    if (value > product.stock) {
      setError(`Only ${product.stock} items available`);
      return;
    }
    setError('');
    setQuantity(value);
  };

  const handleConfirm = () => {
    if (quantity > product.stock) {
      setError(`Only ${product.stock} items available`);
      return;
    }
    onConfirm(quantity);
  };

  const totalPrice = product.price * quantity;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>Add to Cart</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      {/* Product Information */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          backgroundColor: `${terracottaColors.primary}08`,
          borderRadius: '8px',
          marginTop: '8px',
        }}
      >
        <Avatar
          src={product.imgUrl}
          alt={product.name}
          shape="square"
          size={80}
        />
        <div style={{ flexGrow: 1 }}>
          <Title level={4} style={{ marginBottom: '4px', lineHeight: 1.3 }}>
            {product.name}
          </Title>
          <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
            Code: {product.code}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Text 
              strong 
              style={{ 
                fontSize: '20px',
                color: terracottaColors.primary 
              }}
            >
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <Text
                  delete
                  type="secondary"
                >
                  {formatPrice(product.originalPrice)}
                </Text>
                <Tag color="error">
                  {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Tag>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stock Information */}
      <div style={{ marginTop: '16px' }}>
        <Text type="secondary">
          Availability: {' '}
          <Text
            style={{
              color: product.stock > 10 ? terracottaColors.success : product.stock > 0 ? terracottaColors.warning : terracottaColors.error,
              fontWeight: 600
            }}
          >
            {product.stock > 10 
              ? 'In Stock' 
              : product.stock > 0 
                ? `Only ${product.stock} left!`
                : 'Out of Stock'
            }
          </Text>
        </Text>
        
        {product.hyderabadOnly ? (
          <div style={{ 
            marginTop: '8px', 
            display: 'flex', 
            alignItems: 'center',
            color: '#9C27B0'
          }}>
            <EnvironmentOutlined style={{ marginRight: '4px' }} />
            <Text style={{ fontWeight: 600, color: '#9C27B0' }}>
              Available for delivery in Hyderabad only
            </Text>
          </div>
        ) : (
          <div style={{ 
            marginTop: '8px', 
            display: 'flex', 
            alignItems: 'center',
            color: '#4CAF50'
          }}>
            <EnvironmentOutlined style={{ marginRight: '4px' }} />
            <Text style={{ fontWeight: 600, color: '#4CAF50' }}>
              Available for Pan India delivery
            </Text>
          </div>
        )}
      </div>

      <Divider />

      {/* Quantity Selection */}
      <Title level={5} style={{ marginBottom: '16px' }}>
        Select Quantity
      </Title>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '16px',
        justifyContent: 'center',
      }}>
        <Button
          icon={<MinusOutlined />}
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          style={{
            borderColor: terracottaColors.primary,
            color: terracottaColors.primary,
            borderRadius: '6px',
            width: 40,
            height: 40,
          }}
        />

        <InputNumber
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={product.stock}
          style={{
            width: 100,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '18px'
          }}
        />

        <Button
          icon={<PlusOutlined />}
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= product.stock}
          style={{
            borderColor: terracottaColors.primary,
            color: terracottaColors.primary,
            borderRadius: '6px',
            width: 40,
            height: 40,
          }}
        />
      </div>

      {error && (
        <Text 
          type="danger" 
          style={{ 
            display: 'block',
            textAlign: 'center',
            marginTop: '8px'
          }}
        >
          {error}
        </Text>
      )}

      {/* Price Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          backgroundColor: `${terracottaColors.primary}15`,
          borderRadius: '6px',
          border: `1px solid ${terracottaColors.primary}30`,
          marginTop: '16px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Total Amount</Text>
          <div>
            <Text 
              strong 
              style={{ 
                fontSize: '24px',
                color: terracottaColors.primary 
              }}
            >
              {formatPrice(totalPrice)}
            </Text>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            {quantity} × {formatPrice(product.price)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <div>
              <Text 
                style={{ 
                  fontWeight: 600,
                  color: terracottaColors.success 
                }}
              >
                You save {formatPrice((product.originalPrice - product.price) * quantity)}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Modal Actions */}
      <div style={{ 
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <Button
          onClick={onClose}
          style={{ 
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            borderColor: terracottaColors.primary,
            color: terracottaColors.primary,
          }}
          block
        >
          Cancel
        </Button>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleConfirm}
          disabled={quantity > product.stock || product.stock === 0}
          style={{
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            backgroundColor: terracottaColors.primary,
            borderColor: terracottaColors.primary,
          }}
          block
        >
          Add to Cart
        </Button>
      </div>
    </Modal>
  );
};

// Header Section Component for Products Page
export const ProductsHeader = memo(({ 
  isGaneshSeason, 
  isMobile, 
  totalCount, 
  hyderabadCount 
}) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title 
          level={1} 
          className="header-title"
          style={{ 
            fontWeight: 700,
            background: isGaneshSeason 
              ? `linear-gradient(135deg, ${terracottaColors.ganesh} 0%, #FFB74D 100%)`
              : `linear-gradient(135deg, ${terracottaColors.primary} 0%, ${terracottaColors.secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            textAlign: isMobile ? 'center' : 'left',
            fontSize: isMobile ? '28px' : '36px'
          }}
        >
          {isGaneshSeason ? '🕉️ Ganesh Festival Collection' : 'Discover Our Products'}
        </Title>
        
        <Paragraph 
          className="header-description"
          style={{ 
            marginBottom: '24px',
            textAlign: isMobile ? 'center' : 'left',
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.65)'
          }}
        >
          {isGaneshSeason 
            ? 'Beautiful handcrafted Ganesh idols for your festivities • Pottery collection returning soon!'
            : 'Explore our curated collection of premium items'
          }
        </Paragraph>

        {/* Season Alert */}
        {isGaneshSeason && (
          <Alert
            message="🎉 Ganesh Festival Season is Here!"
            description="We're currently focusing on crafting beautiful Ganesh idols. Our pottery collection will return after the festival. Browse our exclusive Ganesh idol collection below!"
            type="info"
            showIcon
            style={{
              marginBottom: '24px',
              borderRadius: '12px',
              backgroundColor: `${terracottaColors.ganesh}10`,
              border: `1px solid ${terracottaColors.ganesh}30`,
            }}
          />
        )}
        
        {/* Products Stats */}
        {!isGaneshSeason && (
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
            marginBottom: '16px',
          }}>
            <Tag
              style={{
                backgroundColor: `${terracottaColors.primary}15`,
                color: terracottaColors.primaryDark,
                fontWeight: 600,
                border: 'none',
                padding: '4px 12px',
                borderRadius: '16px'
              }}
            >
              {totalCount} Total Products
            </Tag>
            {hyderabadCount > 0 && (
              <Tag
                icon={<EnvironmentOutlined />}
                style={{
                  backgroundColor: '#9C27B015',
                  color: '#9C27B0',
                  fontWeight: 600,
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '16px'
                }}
              >
                {hyderabadCount} Hyderabad Available
              </Tag>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ProductsHeader.displayName = 'ProductsHeader';

// Search and Filter Bar Component
export const SearchFilterBar = memo(({ 
  searchQuery, 
  setSearchQuery, 
  hyderabadOnly, 
  setHyderabadOnly, 
  filteredProducts, 
  isSearching, 
  handleDrawerToggle, 
  isMobile, 
  isSmallScreen 
}) => {
  return (
    <Card
      className="search-filter-card"
      style={{
        borderRadius: '12px',
        background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${terracottaColors.primary}20`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* Search */}
        <Col xs={24} sm={24} md={12} lg={14}>
          <Input
            size="large"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined style={{ color: terracottaColors.primary }} />}
            suffix={searchQuery && (
              <Button 
                type="text" 
                size="small" 
                icon={<CloseOutlined />}
                onClick={() => setSearchQuery('')}
              />
            )}
            style={{
              borderRadius: '8px',
              borderColor: `${terracottaColors.primary}30`,
            }}
          />
        </Col>

        {/* Filter Controls */}
        <Col xs={24} sm={24} md={12} lg={10}>
          <Space wrap style={{ width: '100%', justifyContent: isMobile ? 'center' : 'flex-end' }}>
            {/* Mobile Filter Button */}
            {isMobile && (
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={handleDrawerToggle}
                style={{ 
                  borderRadius: '8px',
                  backgroundColor: terracottaColors.primary,
                  borderColor: terracottaColors.primary,
                }}
              >
                Filters
              </Button>
            )}

            {/* Hyderabad Only Quick Filter Button */}
            <Button
              type={hyderabadOnly ? "primary" : "default"}
              icon={<EnvironmentOutlined />}
              onClick={() => setHyderabadOnly(!hyderabadOnly)}
              style={{ 
                borderRadius: '8px',
                borderColor: '#9C27B0',
                color: hyderabadOnly ? 'white' : '#9C27B0',
                backgroundColor: hyderabadOnly ? '#9C27B0' : 'transparent',
              }}
            >
              {isSmallScreen ? 'HYD' : 'Hyderabad Only'}
            </Button>

            {/* Results Count */}
            <Tag
              icon={<AppstoreOutlined />}
              style={{
                backgroundColor: `${terracottaColors.primary}15`,
                color: terracottaColors.primaryDark,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              {filteredProducts.length} Products
              {isSearching && ' (searching...)'}
            </Tag>
          </Space>
        </Col>
      </Row>
    </Card>
  );
});

SearchFilterBar.displayName = 'SearchFilterBar';

// Empty State Component
export const EmptyState = memo(({ 
  handleResetFilters, 
  isGaneshSeason, 
  ganeshIdols, 
  ganeshLoading 
}) => {
  if (isGaneshSeason) {
    // Empty state for Ganesh idols
    if (ganeshIdols.length === 0 && !ganeshLoading) {
      return (
        <Col span={24}>
          <Card
            style={{
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: `${terracottaColors.ganesh}08`,
              border: `1px solid ${terracottaColors.ganesh}30`,
            }}
            bodyStyle={{ padding: '48px' }}
          >
            <TrophyOutlined 
              style={{ 
                fontSize: '64px', 
                color: terracottaColors.ganesh,
                marginBottom: '16px' 
              }} 
            />
            <Title level={4} style={{ color: terracottaColors.ganesh }}>
              Ganesh Idol Collection Coming Soon!
            </Title>
            <Text type="secondary">
              Our artisans are working on creating beautiful Ganesh idols. Check back soon!
            </Text>
          </Card>
        </Col>
      );
    }
    return null;
  }

  // Empty state for regular products
  return (
    <Card
      style={{
        borderRadius: '12px',
        background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
      }}
      bodyStyle={{ padding: '48px' }}
    >
      <Empty
        description={
          <div>
            <Title level={4} type="secondary" style={{ marginBottom: '16px' }}>
              No products found matching your criteria
            </Title>
            <Button
              type="primary"
              onClick={handleResetFilters}
              style={{ 
                borderRadius: '8px',
                backgroundColor: terracottaColors.primary,
                borderColor: terracottaColors.primary,
              }}
            >
              Reset Filters
            </Button>
          </div>
        }
      />
    </Card>
  );
});

EmptyState.displayName = 'EmptyState';

// Error State Component
export const ErrorState = memo(({ 
  productsError, 
  ganeshError, 
  isGaneshSeason 
}) => {
  return (
    <Card
      style={{
        borderRadius: '12px',
        background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
        textAlign: 'center'
      }}
      bodyStyle={{ padding: '48px' }}
    >
      <Title level={4} type="danger" style={{ marginBottom: '16px' }}>
        Error Loading Products
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: '24px' }}>
        {productsError || ganeshError}
      </Paragraph>
      <Button
        type="primary"
        onClick={() => window.location.reload()}
        style={{ 
          borderRadius: '8px',
          backgroundColor: terracottaColors.primary,
          borderColor: terracottaColors.primary,
        }}
      >
        Try Again
      </Button>
    </Card>
  );
});

ErrorState.displayName = 'ErrorState';

// Loading skeleton component
export const ProductSkeleton = () => {
  const screens = useBreakpoint();
  
  // Responsive grid based on screen size
  const getGridCols = () => {
    if (!screens.sm) return { xs: 24 }; // 1 column on mobile
    if (!screens.md) return { xs: 24, sm: 12 }; // 2 columns on small screens
    if (!screens.lg) return { xs: 24, sm: 12, md: 8 }; // 3 columns on medium screens
    return { xs: 24, sm: 12, md: 8, lg: 6 }; // 4 columns on large screens
  };

  const gridCols = getGridCols();

  return (
    <Row gutter={[16, 16]}>
      {Array(8).fill(0).map((_, index) => (
        <Col {...gridCols} key={index}>
          <Card
            style={{
              height: '100%',
              borderRadius: '12px',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Skeleton.Image 
              style={{ width: '100%', height: '220px' }}
              active
            />
            <div style={{ padding: '16px' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Skeleton.Button style={{ flexGrow: 1, height: '40px' }} active />
                <Skeleton.Button style={{ width: '40px', height: '40px' }} active />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default {
  QuantityModal,
  ProductsHeader,
  SearchFilterBar,
  EmptyState,
  ErrorState,
  ProductSkeleton
};

export { terracottaColors, formatPrice };