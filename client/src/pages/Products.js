import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useCallback,
  memo
} from 'react';
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Input,
  Button,
  Drawer,
  Skeleton,
  message,
  Rate,
  Slider,
  Select,
  Collapse,
  Divider,
  Modal,
  Avatar,
  Switch,
  Space,
  Badge,
  Tag,
  Tooltip,
  InputNumber,
  Spin,
  Empty,
  Affix,
  Grid
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  WarningOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined,
  StarFilled,
  StarOutlined,
  DollarOutlined,
  SortAscendingOutlined,
  ReloadOutlined,
  DownOutlined,
  PlusOutlined,
  MinusOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import FIXED optimization hooks
import {
  useProducts,
  useProductSearch,
  useCartOperations,
  useWishlistOperations,
  usePerformanceMonitor,
  useLazyImage,
  useMemoryStorage,
} from '../hooks/useProductsOptimization';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

// Terracotta color scheme
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
};

// Custom CSS styles
const customStyles = `
  .products-container {
    background-color: ${terracottaColors.background};
    min-height: 100vh;
    padding: 16px 0;
  }

  .products-main-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .products-filter-sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    z-index: 10;
  }

  .products-grid {
    min-height: calc(100vh - 200px);
  }

  .product-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid ${terracottaColors.divider};
    cursor: pointer;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px ${terracottaColors.primary}25;
  }

  .product-card.unavailable {
    opacity: 0.75;
  }

  .product-card.unavailable:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .product-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .product-card:hover .product-image {
    transform: scale(1.05);
  }

  .product-card.unavailable .product-image {
    filter: grayscale(30%);
  }

  .product-card.unavailable:hover .product-image {
    transform: none;
  }

  .status-ribbon {
    position: absolute;
    top: 12px;
    right: -25px;
    transform: rotate(35deg);
    width: 100px;
    text-align: center;
    padding: 4px 0;
    font-size: 10px;
    font-weight: 700;
    color: white;
    z-index: 2;
    letter-spacing: 0.5px;
  }

  .status-ribbon.unavailable {
    background-color: ${terracottaColors.warning};
  }

  .status-ribbon.out-of-stock {
    background-color: ${terracottaColors.error};
  }

  .featured-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    margin: 0;
    background-color: ${terracottaColors.primary};
    color: white;
    border: none;
  }

  .hyderabad-badge {
    position: absolute;
    left: 12px;
    z-index: 2;
    margin: 0;
    background-color: #9C27B0;
    color: white;
    border: none;
  }

  .hyderabad-badge.with-featured {
    top: 46px;
  }

  .hyderabad-badge.without-featured {
    top: 12px;
  }

  /* Mobile responsive styles */
  @media (max-width: 576px) {
    .products-main-wrapper {
      padding: 0 8px;
    }
    
    .product-card .ant-card-body {
      padding: 8px;
    }
    
    .product-image {
      height: 180px;
    }
    
    .header-title {
      font-size: 24px !important;
      text-align: center;
    }
    
    .header-description {
      text-align: center;
      font-size: 14px;
    }
    
    .search-filter-card .ant-card-body {
      padding: 16px;
    }
  }

  @media (max-width: 768px) {
    .products-main-wrapper {
      padding: 0 12px;
    }
    
    .header-title {
      font-size: 28px !important;
    }
  }

  /* Custom scrollbar for filter sidebar */
  .products-filter-sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .products-filter-sidebar::-webkit-scrollbar-track {
    background: ${terracottaColors.backgroundLight};
    border-radius: 3px;
  }

  .products-filter-sidebar::-webkit-scrollbar-thumb {
    background: ${terracottaColors.primary};
    border-radius: 3px;
  }

  .products-filter-sidebar::-webkit-scrollbar-thumb:hover {
    background: ${terracottaColors.primaryDark};
  }
`;

// Format price helper
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

// ProductCard Component
const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  onProductClick,
  isInWishlist
}) => {
  const [imageSrc, setImageRef] = useLazyImage(
    product.imgUrl, 
    'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product'
  );
  
  const isOutOfStock = product.stock === 0;
  const isHidden = product.hidden;
  const isUnavailable = isHidden || isOutOfStock;

  const handleCardClick = (e) => {
    if (e.target.closest('.ant-btn') || 
        e.target.closest('.ant-rate') ||
        e.target.closest('[role="button"]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    e.preventDefault();
    onProductClick(product.id, product.code);
  };

  const renderStockStatus = () => {
    if (isHidden) {
      return (
        <Tag icon={<EyeInvisibleOutlined />} color="warning">
          Currently Unavailable
        </Tag>
      );
    }

    if (isOutOfStock) {
      return (
        <Tag icon={<WarningOutlined />} color="error">
          Out of Stock
        </Tag>
      );
    }

    if (product.hyderabadOnly) {
      return (
        <Tag icon={<EnvironmentOutlined />} color="purple">
          Hyderabad Only Delivery
        </Tag>
      );
    }

    if (product.stock < 10) {
      return (
        <Tag icon={<WarningOutlined />} color="error">
          Only {product.stock} left!
        </Tag>
      );
    }

    if (product.stock < 20) {
      return (
        <Tag icon={<InfoCircleOutlined />} color="warning">
          Few items left
        </Tag>
      );
    }

    return (
      <Tag color="success">
        In Stock
      </Tag>
    );
  };

  return (
    <Card
      hoverable={!isUnavailable}
      className={`product-card ${isUnavailable ? 'unavailable' : ''}`}
      bodyStyle={{ padding: 0 }}
      onClick={handleCardClick}
    >
      {/* Status Ribbons */}
      {isHidden && (
        <div className="status-ribbon unavailable">
          UNAVAILABLE
        </div>
      )}
      {!isHidden && isOutOfStock && (
        <div className="status-ribbon out-of-stock">
          OUT OF STOCK
        </div>
      )}

      {/* Featured Badge */}
      {product.isFeatured && !isUnavailable && (
        <Tag className="featured-badge">
          Featured
        </Tag>
      )}

      {/* Hyderabad-Only Badge */}
      {product.hyderabadOnly && !isUnavailable && (
        <Tag
          icon={<EnvironmentOutlined />}
          className={`hyderabad-badge ${product.isFeatured ? 'with-featured' : 'without-featured'}`}
        >
          Hyderabad Only
        </Tag>
      )}

      <div style={{ position: 'relative' }}>
        <img
          ref={setImageRef}
          src={imageSrc}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div style={{ padding: '16px' }}>
        <Title 
          level={5} 
          ellipsis={{ rows: 1 }}
          style={{ 
            marginBottom: '8px',
            fontSize: '16px',
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Title>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Rate
            value={parseFloat(product.rating || 0)}
            disabled
            allowHalf
            style={{ fontSize: '14px', color: terracottaColors.primary }}
          />
          <Text 
            type="secondary" 
            style={{ marginLeft: '8px', fontSize: '12px' }}
          >
            {product.rating} ({product.reviews || 0})
          </Text>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <Text 
            strong 
            style={{ 
              fontSize: '20px',
              color: terracottaColors.primary,
            }}
          >
            {formatPrice(product.price)}
          </Text>
          {product.originalPrice > product.price && (
            <>
              <Text
                delete
                type="secondary"
                style={{ fontSize: '14px' }}
              >
                {formatPrice(product.originalPrice)}
              </Text>
              <Tag color="error" style={{ margin: 0, fontSize: '10px' }}>
                {product.discount}% OFF
              </Tag>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div style={{ marginTop: '8px' }}>
          {renderStockStatus()}
        </div>

        {/* Product Code */}
        <Text 
          type="secondary"
          style={{ 
            display: 'block', 
            marginTop: '8px',
            fontSize: '11px',
          }}
        >
          Code: {product.code}
        </Text>
      </div>

      {/* Card Actions */}
      <div style={{ 
        padding: '16px', 
        paddingTop: 0, 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Add to Cart Button */}
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={isUnavailable}
          block
          style={{
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: terracottaColors.primary,
            borderColor: terracottaColors.primary,
          }}
        >
          {isOutOfStock ? 'Out of Stock' : isHidden ? 'Unavailable' : 'Add to Cart'}
        </Button>

        {/* Buy Now and Wishlist Row */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          width: '100%',
        }}>
          {/* Buy Now Button */}
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={isUnavailable}
            style={{
              flex: 1,
              borderRadius: '8px',
              height: '40px',
              fontWeight: 600,
              fontSize: '14px',
              background: `linear-gradient(135deg, ${terracottaColors.success} 0%, #4CAF50 100%)`,
              borderColor: terracottaColors.success,
            }}
          >
            Buy Now
          </Button>

          {/* Wishlist Button */}
          <Tooltip title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
            <Button
              icon={isInWishlist ? <HeartFilled /> : <HeartOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              style={{
                borderRadius: '8px',
                height: '40px',
                borderColor: isInWishlist ? terracottaColors.error : terracottaColors.divider,
                color: isInWishlist ? terracottaColors.error : 'inherit',
              }}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
});

// FilterPanel Component
const FilterPanel = memo(({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  hyderabadOnly,
  setHyderabadOnly,
  onResetFilters,
}) => {
  const filterSections = [
    {
      key: '1',
      label: (
        <span>
          <DollarOutlined style={{ color: terracottaColors.primary, marginRight: 8 }} />
          Price Range
        </span>
      ),
      children: (
        <div>
          <Slider
            range
            value={priceRange}
            onChange={setPriceRange}
            min={1}
            max={5000}
            step={50}
            tooltip={{
              formatter: formatPrice
            }}
            style={{ marginBottom: '16px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">
              Min: {formatPrice(priceRange[0])}
            </Text>
            <Text type="secondary">
              Max: {formatPrice(priceRange[1])}
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SortAscendingOutlined style={{ color: terracottaColors.primary, marginRight: 8 }} />
          Sort By
        </span>
      ),
      children: (
        <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: '100%' }}
        >
          <Option value="relevance">Relevance (Hyderabad First)</Option>
          <Option value="priceLowToHigh">Price: Low to High</Option>
          <Option value="priceHighToLow">Price: High to Low</Option>
          <Option value="alphabetical">Alphabetical</Option>
          <Option value="rating">Rating</Option>
          <Option value="newest">Newest First</Option>
          <Option value="featured">Featured First</Option>
          <Option value="discount">Best Discounts</Option>
        </Select>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <EnvironmentOutlined style={{ color: terracottaColors.primary, marginRight: 8 }} />
          Delivery Location
        </span>
      ),
      children: (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px dashed ${terracottaColors.primary}50`,
            backgroundColor: `${terracottaColors.primary}08`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong>Hyderabad Only</Text>
              <Tag 
                style={{ 
                  marginLeft: 8,
                  backgroundColor: hyderabadOnly ? terracottaColors.primary : `${terracottaColors.primary}30`,
                  color: hyderabadOnly ? 'white' : terracottaColors.primary,
                  border: 'none'
                }}
              >
                Local
              </Tag>
            </div>
            <Switch
              checked={hyderabadOnly}
              onChange={setHyderabadOnly}
            />
          </div>
          <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
            Show only products available for delivery within Hyderabad city limits
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ fontWeight: 700, marginBottom: '8px' }}>
          Filters
        </Title>
        <Divider style={{ margin: 0 }} />
      </div>

      <Collapse
        defaultActiveKey={['1', '2', '3']}
        ghost
        expandIconPosition="right"
        items={filterSections}
      />

      <Button
        type="default"
        icon={<ReloadOutlined />}
        onClick={onResetFilters}
        block
        style={{
          marginTop: '16px',
          height: '40px',
          borderRadius: '8px',
          fontWeight: 600,
          borderWidth: 2,
          borderColor: terracottaColors.primary,
          color: terracottaColors.primary,
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
});

// QuantityModal Component
const QuantityModal = ({ 
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
            {product.originalPrice > product.price && (
              <>
                <Text
                  delete
                  type="secondary"
                >
                  {formatPrice(product.originalPrice)}
                </Text>
                <Tag color="error">
                  {product.discount}% OFF
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
        
        {product.hyderabadOnly && (
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
          {product.originalPrice > product.price && (
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

// Loading skeleton component
const ProductSkeleton = () => {
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
            className="product-card"
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

// Main Products Component
const Products = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallScreen = !screens.sm;
  
  // State
  const [user, setUser] = useState(null);
  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [hyderabadOnly, setHyderabadOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use FIXED optimization hooks
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { addToCart } = useCartOperations(user);
  const { wishlist, toggleWishlistItem, isInWishlist } = useWishlistOperations(user);
  const { metrics, startTimer } = usePerformanceMonitor();
  
  // Memoize search parameters to prevent unnecessary re-renders
  const searchParams = useMemo(() => ({
    priceRange,
    sortBy,
    hyderabadOnly,
    hideOutOfStock: false,
  }), [priceRange[0], priceRange[1], sortBy, hyderabadOnly]);

  // Search and filter with Hyderabad priority
  const { 
    products: filteredProducts, 
    totalCount, 
    hyderabadCount,
    isSearching 
  } = useProductSearch(products, searchQuery, searchParams, true);

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Responsive grid configuration
  const getProductGridCols = () => {
    if (!screens.sm) return { xs: 24 }; // 1 column on mobile (< 576px)
    if (!screens.md) return { xs: 24, sm: 12 }; // 2 columns on small screens (576px - 768px)
    if (!screens.lg) return { xs: 24, sm: 12, md: 8 }; // 3 columns on medium screens (768px - 992px)
    if (!screens.xl) return { xs: 24, sm: 12, md: 8, lg: 6 }; // 4 columns on large screens (992px - 1200px)
    return { xs: 24, sm: 12, md: 6, lg: 6, xl: 6 }; // 4 columns on extra large screens (> 1200px)
  };

  const productGridCols = getProductGridCols();

  // Stable callbacks to prevent infinite loops
  const showMessage = useCallback((content, type = 'success') => {
    message[type](content);
  }, []);

  const handleProductClick = useCallback((id, code) => {
    console.log('Product clicked:', { id, code });
    window.location.href = `/product/${id}?code=${code}`;
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    if (product.hidden || product.stock === 0) {
      showMessage(
        product.hidden ? 'This product is currently unavailable.' : 'This product is out of stock.',
        'warning'
      );
      return;
    }

    if (!user) {
      showMessage('Please log in to add items to cart.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    setSelectedProduct(product);
    setModalOpen(true);
  }, [user, navigate, showMessage]);

  const handleBuyNow = useCallback(async (product) => {
    if (product.hidden || product.stock === 0) {
      showMessage(
        product.hidden ? 'This product is currently unavailable.' : 'This product is out of stock.',
        'warning'
      );
      return;
    }

    if (!user) {
      showMessage('Please log in to purchase items.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        showMessage(result.message, 'success');
        setTimeout(() => {
          navigate('/cart');
        }, 1000);
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      console.error('Error in Buy Now:', error);
      showMessage('Error processing your request', 'error');
    }
  }, [user, navigate, showMessage, addToCart]);

  const handleToggleWishlist = useCallback(async (product) => {
    if (!user) {
      showMessage('Please log in to manage your wishlist.', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      const result = await toggleWishlistItem(product);
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showMessage('Error updating wishlist', 'error');
    }
  }, [user, navigate, showMessage, toggleWishlistItem]);

  const handleConfirmAddToCart = useCallback(async (quantity) => {
    if (!selectedProduct || !user) return;

    if (selectedProduct.stock < quantity) {
      showMessage(`Only ${selectedProduct.stock} items available in stock.`, 'error');
      return;
    }

    try {
      const result = await addToCart(selectedProduct, quantity);
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.message, 'error');
      }
      setModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showMessage('Error adding to cart', 'error');
    }
  }, [selectedProduct, user, showMessage, addToCart]);

  const handleResetFilters = useCallback(() => {
    setPriceRange([1, 5000]);
    setSortBy('relevance');
    setSearchQuery('');
    setHyderabadOnly(false);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="products-container">
        <div className="products-main-wrapper">
          {/* Header Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <Title 
                level={1} 
                className="header-title"
                style={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${terracottaColors.primary} 0%, ${terracottaColors.secondary} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                  textAlign: isMobile ? 'center' : 'left',
                  fontSize: isMobile ? '28px' : '36px'
                }}
              >
                Discover Our Products
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
                Explore our curated collection of premium items
              </Paragraph>
              
              {/* Products Stats */}
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
            </div>

            {/* Search and Filter Bar */}
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
          </div>

          {/* Main Content */}
          <Row gutter={[24, 0]}>
            {/* Desktop Filter Panel */}
            {!isMobile && (
              <Col span={6}>
                <div className="products-filter-sidebar">
                  <Card
                    style={{
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${terracottaColors.primary}20`,
                    }}
                    bodyStyle={{ padding: '24px' }}
                  >
                    <FilterPanel
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      hyderabadOnly={hyderabadOnly}
                      setHyderabadOnly={setHyderabadOnly}
                      onResetFilters={handleResetFilters}
                    />
                  </Card>
                </div>
              </Col>
            )}

            {/* Products Grid */}
            <Col xs={24} md={18}>
              <div className="products-grid">
                {productsLoading ? (
                  <ProductSkeleton />
                ) : productsError ? (
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
                      {productsError}
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
                ) : filteredProducts.length === 0 ? (
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
                ) : (
                  <Row gutter={[16, 16]}>
                    {filteredProducts.map((product, index) => (
                      <Col 
                        {...productGridCols}
                        key={product.id}
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                          onToggleWishlist={handleToggleWishlist}
                          onProductClick={handleProductClick}
                          isInWishlist={isInWishlist(product.id)}
                        />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="Filters"
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={isMobile ? '90vw' : 300}
          style={{
            maxWidth: '350px'
          }}
          bodyStyle={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${terracottaColors.backgroundLight}50 100%)`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <FilterPanel
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            hyderabadOnly={hyderabadOnly}
            setHyderabadOnly={setHyderabadOnly}
            onResetFilters={handleResetFilters}
          />
        </Drawer>

        {/* Quantity Modal */}
        {modalOpen && selectedProduct && (
          <QuantityModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            product={selectedProduct}
            onConfirm={handleConfirmAddToCart}
          />
        )}

        {/* Performance Debug (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              position: 'fixed',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              zIndex: 9999,
              display: isMobile ? 'none' : 'block',
            }}
          >
            Products: {filteredProducts.length} | Total: {totalCount}
          </div>
        )}
      </div>
    </>
  );
};

export default Products;