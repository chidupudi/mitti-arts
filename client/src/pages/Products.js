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
  Grid,
  Alert
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
  FilterOutlined,
  TrophyOutlined,
  NotificationOutlined,
  CalendarOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  addDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import season hook and cart utilities
import { useSeason } from '../hooks/useSeason';
import { addToCartSafe } from '../utils/cartUtility';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

// Terracotta color scheme with Ganesh season additions
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
  ganesh: '#FF8F00', // Special color for Ganesh season
};

// Enhanced custom styles with Ganesh season additions
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

  /* Ganesh season specific styles */
  .ganesh-season-card {
    background: linear-gradient(135deg, ${terracottaColors.ganesh}15 0%, #FFE0B2 100%);
    border: 2px solid ${terracottaColors.ganesh}40;
  }

  .ganesh-season-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px ${terracottaColors.ganesh}30;
    border-color: ${terracottaColors.ganesh};
  }

  .pottery-unavailable-card {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 224, 178, 0.2) 100%);
    border: 2px dashed ${terracottaColors.warning};
  }

  .pottery-unavailable-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 193, 7, 0.2);
  }

  .ganesh-idol-card {
    border: 1px solid ${terracottaColors.ganesh}30;
    transition: all 0.3s ease;
  }

  .ganesh-idol-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px ${terracottaColors.ganesh}25;
    border-color: ${terracottaColors.ganesh};
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

  .status-ribbon.coming-soon {
    background-color: ${terracottaColors.ganesh};
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

// Custom hooks for data fetching
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsArr = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsArr.push({
            id: doc.id,
            ...data,
            price: Number(data.price) || 0,
            stock: Number(data.stock) || 0,
            rating: Number(data.rating) || 4.2,
            reviews: Number(data.reviews) || 156,
            imgUrl: data.images?.[0] || data.imgUrl || '',
            hyderabadOnly: data.hyderabadOnly || false,
            isFeatured: data.isFeatured || false,
            hidden: data.hidden || false,
            originalPrice: data.originalPrice || 0,
            discount: data.discount || 0,
            category: data.category || '',
            code: data.code || `PRD${doc.id.slice(-6)}`,
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        setProducts(productsArr);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Hook to fetch Ganesh idols
const useGaneshIdols = () => {
  const [ganeshIdols, setGaneshIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGaneshIdols = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'ganeshIdols'));
        const idolsArr = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.hidden) { // Only show non-hidden idols
            idolsArr.push({
              id: doc.id,
              ...data,
              priceMin: Number(data.priceMin) || 7000,
              priceMax: Number(data.priceMax) || 31000,
              rating: Number(data.rating) || 4.5,
              reviews: Number(data.reviews) || 28,
              imgUrl: data.images?.[0] || '',
              estimatedDays: Number(data.estimatedDays) || 7,
              advancePercentage: Number(data.advancePercentage) || 25,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }
        });
        setGaneshIdols(idolsArr);
      } catch (error) {
        console.error('Error fetching Ganesh idols:', error);
        setError('Failed to load Ganesh idols');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGaneshIdols();
  }, []);

  return { ganeshIdols, loading, error };
};

// Wishlist hook
const useWishlist = (user) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }
      
      try {
        const wishlistRef = collection(db, 'wishlist');
        const q = query(wishlistRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.data().productId,
          wishlistDocId: doc.id,
        }));
        
        setWishlist(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlistItem = useCallback(async (product) => {
    if (!user) return { success: false, message: 'Please log in first' };

    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    try {
      if (isInWishlist) {
        const itemToRemove = wishlist.find(item => item.id === product.id);
        if (itemToRemove?.wishlistDocId) {
          await deleteDoc(doc(db, 'wishlist', itemToRemove.wishlistDocId));
          setWishlist(prev => prev.filter(item => item.id !== product.id));
          return { success: true, message: 'Removed from wishlist' };
        }
      } else {
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          imgUrl: product.imgUrl,
          price: product.price,
          code: product.code,
          addedAt: new Date().toISOString(),
          hyderabadOnly: product.hyderabadOnly || false,
        });

        const newItem = { ...product, wishlistDocId: docRef.id };
        setWishlist(prev => [...prev, newItem]);
        return { success: true, message: 'Added to wishlist' };
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return { success: false, message: 'Failed to update wishlist' };
    }
  }, [user, wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  return { wishlist, toggleWishlistItem, isInWishlist };
};

// Product search and filtering hook
const useProductSearch = (products, searchQuery, filters) => {
  return useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.code?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }

    // Hyderabad-only filter
    if (filters.hyderabadOnly) {
      filtered = filtered.filter(product => product.hyderabadOnly);
    }

    // Sort products
    switch (filters.sortBy) {
      case 'relevance':
        // Hyderabad products first, then by rating
        filtered.sort((a, b) => {
          if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
          if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
      case 'priceLowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }

    const totalCount = products.length;
    const hyderabadCount = products.filter(p => p.hyderabadOnly).length;

    return {
      products: filtered,
      totalCount,
      hyderabadCount,
      isSearching: false
    };
  }, [products, searchQuery, filters.priceRange, filters.sortBy, filters.hyderabadOnly]);
};

// Pottery "Coming Soon" Card Component
const PotteryComingSoonCard = memo(({ onClick }) => {
  const screens = useBreakpoint();
  
  return (
    <Card
      hoverable
      className="pottery-unavailable-card"
      onClick={onClick}
      style={{
        height: '100%',
        borderRadius: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div className="status-ribbon coming-soon">
          COMING SOON
        </div>
        
        {/* Placeholder image for pottery */}
        <div
          style={{
            width: '100%',
            height: '220px',
            background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center', color: terracottaColors.warning }}>
            <TrophyOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              🏺 All Pottery Items
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <Title 
          level={5} 
          style={{ 
            marginBottom: '8px',
            color: terracottaColors.warning,
            fontSize: '16px',
            textAlign: 'center'
          }}
        >
          🎉 Pottery Collection Coming Soon!
        </Title>

        <Text 
          type="secondary" 
          style={{ 
            display: 'block', 
            textAlign: 'center',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          All pottery items will be available after Ganesh festival
        </Text>

        {/* Features of pottery */}
        <div style={{ marginBottom: '16px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text style={{ fontSize: '12px', color: terracottaColors.textSecondary }}>
              ✨ Handcrafted Clay Products
            </Text>
            <Text style={{ fontSize: '12px', color: terracottaColors.textSecondary }}>
              🌿 Eco-friendly & Natural
            </Text>
            <Text style={{ fontSize: '12px', color: terracottaColors.textSecondary }}>
              🏠 Traditional Cookware
            </Text>
          </Space>
        </div>

        <Alert
          message="Festive Season Notice"
          description="During Ganesh season, we focus on crafting beautiful Ganesh idols. Our pottery collection will return soon!"
          type="info"
          showIcon
          style={{
            fontSize: '12px',
            marginBottom: '16px',
            backgroundColor: `${terracottaColors.ganesh}10`,
            border: `1px solid ${terracottaColors.ganesh}30`,
          }}
        />
      </div>

      {/* Action Button */}
      <div style={{ 
        padding: '16px', 
        paddingTop: 0,
      }}>
        <Button
          type="primary"
          icon={<NotificationOutlined />}
          block
          style={{
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            fontSize: '14px',
            background: `linear-gradient(135deg, ${terracottaColors.warning} 0%, #FFA726 100%)`,
            borderColor: terracottaColors.warning,
          }}
        >
          Click to Pre-book Pottery
        </Button>
        
        <Text 
          style={{ 
            display: 'block',
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '11px',
            color: terracottaColors.textSecondary
          }}
        >
          Get notified when pottery returns!
        </Text>
      </div>
    </Card>
  );
});

// Ganesh Idol Card Component
const GaneshIdolCard = memo(({ 
  idol, 
  onShowInterest,
  onProductClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(idol.imgUrl || 'https://via.placeholder.com/300x220/FF8F00/FFFFFF?text=Ganesh+Idol');
  
  const averagePrice = (idol.priceMin + idol.priceMax) / 2;
  const advanceAmount = Math.round(averagePrice * (idol.advancePercentage || 25) / 100);

  const handleCardClick = (e) => {
    if (e.target.closest('.ant-btn') || 
        e.target.closest('.ant-rate') ||
        e.target.closest('[role="button"]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    e.preventDefault();
    onProductClick(idol.id);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'traditional': return '🏛️';
      case 'modern': return '⭐';
      case 'premium': return '👑';
      default: return '🕉️';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'traditional': return '#8E24AA';
      case 'modern': return '#1976D2';
      case 'premium': return '#D32F2F';
      default: return terracottaColors.ganesh;
    }
  };

  return (
    <Card
      hoverable
      className="ganesh-idol-card"
      onClick={handleCardClick}
      style={{
        height: '100%',
        borderRadius: '12px',
      }}
    >
      {/* Category Badge */}
      <Tag
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          backgroundColor: getCategoryColor(idol.category),
          color: 'white',
          border: 'none',
          fontWeight: 'bold'
        }}
      >
        {getCategoryIcon(idol.category)} {idol.category}
      </Tag>

      {/* Customizable Badge */}
      {idol.customizable && (
        <Tag
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 2,
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Customizable
        </Tag>
      )}

      <div style={{ position: 'relative' }}>
        <img
          src={imageSrc}
          alt={idol.name}
          className="product-image"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageSrc('https://via.placeholder.com/300x220/FF8F00/FFFFFF?text=Ganesh+Idol')}
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
            color: terracottaColors.text
          }}
        >
          🕉️ {idol.name}
        </Title>

        {/* Description */}
        <Text 
          type="secondary" 
          ellipsis={{ rows: 2 }}
          style={{ 
            display: 'block',
            marginBottom: '12px',
            fontSize: '13px',
            height: '36px'
          }}
        >
          {idol.description || 'Beautiful handcrafted Ganesh idol for your festivities'}
        </Text>

        {/* Price Range */}
        <div style={{ marginBottom: '12px' }}>
          <Title 
            level={5} 
            style={{ 
              margin: 0,
              color: terracottaColors.ganesh,
              fontSize: '18px'
            }}
          >
            ₹{idol.priceMin?.toLocaleString()} - ₹{idol.priceMax?.toLocaleString()}
          </Title>
          <Text 
            type="secondary" 
            style={{ fontSize: '12px' }}
          >
            Advance: ₹{advanceAmount.toLocaleString()} ({idol.advancePercentage || 25}%)
          </Text>
        </div>

        {/* Specifications */}
        <Space wrap size="small" style={{ marginBottom: '12px' }}>
          {idol.height && (
            <Tag size="small" style={{ fontSize: '10px', color: terracottaColors.textSecondary }}>
              📏 {idol.height}
            </Tag>
          )}
          {idol.weight && (
            <Tag size="small" style={{ fontSize: '10px', color: terracottaColors.textSecondary }}>
              ⚖️ {idol.weight}
            </Tag>
          )}
          {idol.color && (
            <Tag size="small" style={{ fontSize: '10px', color: terracottaColors.textSecondary }}>
              🎨 {idol.color}
            </Tag>
          )}
        </Space>

        {/* Estimated Time */}
        {idol.estimatedDays && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginBottom: '12px'
          }}>
            <CalendarOutlined style={{ fontSize: '12px', color: terracottaColors.success }} />
            <Text style={{ fontSize: '12px', color: terracottaColors.success, fontWeight: 600 }}>
              Ready in {idol.estimatedDays} days
            </Text>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div style={{ 
        padding: '16px', 
        paddingTop: 0,
      }}>
        <Button
          type="primary"
          icon={<GiftOutlined />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShowInterest(idol);
          }}
          block
          style={{
            borderRadius: '8px',
            height: '40px',
            fontWeight: 600,
            fontSize: '14px',
            background: `linear-gradient(135deg, ${terracottaColors.ganesh} 0%, #FFB74D 100%)`,
            borderColor: terracottaColors.ganesh,
          }}
        >
          Show Interest
        </Button>
        
        <Text 
          style={{ 
            display: 'block',
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '11px',
            color: terracottaColors.textSecondary
          }}
        >
          Our team will contact you for customization
        </Text>
      </div>
    </Card>
  );
});

// Regular Product Card Component
const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  onProductClick,
  isInWishlist
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.imgUrl || 'https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product');
  
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
      <Tag icon={<EnvironmentOutlined />} color="green">
        Pan India Delivery
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
          src={imageSrc}
          alt={product.name}
          className="product-image"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageSrc('https://via.placeholder.com/300x220/D2691E/FFFFFF?text=Product')}
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
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <Text
                delete
                type="secondary"
                style={{ fontSize: '14px' }}
              >
                {formatPrice(product.originalPrice)}
              </Text>
              <Tag color="error" style={{ margin: 0, fontSize: '10px' }}>
                {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
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

// Quantity Modal Component
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

// Main Products Component - Combined Season-Aware Version
const Products = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallScreen = !screens.sm;
  
  // Season context
  const { currentSeason, isGaneshSeason, loading: seasonLoading } = useSeason();
  
  // State
  const [user, setUser] = useState(null);
  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [hyderabadOnly, setHyderabadOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use hooks
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { ganeshIdols, loading: ganeshLoading, error: ganeshError } = useGaneshIdols();
  const { wishlist, toggleWishlistItem, isInWishlist } = useWishlist(user);
  
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
  } = useProductSearch(products, searchQuery, searchParams);

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

  // Season-specific handlers
  const handlePotteryPrebook = useCallback(() => {
    showMessage('Pre-booking feature coming soon!', 'info');
    // Could redirect to a pre-booking form or contact page
  }, [showMessage]);

  const handleShowInterest = useCallback((idol) => {
    if (!user) {
      showMessage('Please login to show interest', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }
    
    // Navigate to Ganesh idol gallery with specific idol
    navigate(`/ganesh-idols?idol=${idol.id}`);
  }, [user, navigate, showMessage]);

  const handleGaneshIdolClick = useCallback((idolId) => {
    // Navigate to Ganesh idol details or gallery
    navigate(`/ganesh-idols?idol=${idolId}`);
  }, [navigate]);

  // Add to Cart handler using cartUtils
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

  // Buy Now handler using cartUtils
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
      const result = await addToCartSafe(user.uid, product.id, 1);
      if (result.success) {
        if (result.action === 'added') {
          showMessage(`${product.name} added to cart!`, 'success');
        } else if (result.action === 'updated') {
          showMessage(`Cart updated! Total quantity: ${result.newQuantity}`, 'success');
        }
        setTimeout(() => {
          navigate('/cart');
        }, 1000);
      } else {
        showMessage(result.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Error in Buy Now:', error);
      showMessage('Error processing your request', 'error');
    }
  }, [user, navigate, showMessage]);

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

  // Confirm Add to Cart handler using cartUtils
  const handleConfirmAddToCart = useCallback(async (quantity) => {
    if (!selectedProduct || !user) return;

    if (selectedProduct.stock < quantity) {
      showMessage(`Only ${selectedProduct.stock} items available in stock.`, 'error');
      return;
    }

    try {
      const result = await addToCartSafe(user.uid, selectedProduct.id, quantity);
      if (result.success) {
        if (result.action === 'added') {
          showMessage(`${selectedProduct.name} added to cart successfully!`, 'success');
        } else if (result.action === 'updated') {
          showMessage(`Cart updated! Total quantity: ${result.newQuantity}`, 'success');
        }
      } else {
        showMessage(result.message || 'Failed to add to cart', 'error');
      }
      setModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showMessage('Error adding to cart', 'error');
    }
  }, [selectedProduct, user, showMessage]);

  const handleResetFilters = useCallback(() => {
    setPriceRange([1, 5000]);
    setSortBy('relevance');
    setSearchQuery('');
    setHyderabadOnly(false);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  // Loading states
  if (seasonLoading || (isGaneshSeason && ganeshLoading)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="products-container">
        <div className="products-main-wrapper">
          {/* Header Section - Season Aware */}
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

            {/* Search and Filter Bar - Only show for non-Ganesh season */}
            {!isGaneshSeason && (
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
            )}
          </div>

          {/* Main Content */}
          <Row gutter={[24, 0]}>
            {/* Desktop Filter Panel - Only show for non-Ganesh season */}
            {!isMobile && !isGaneshSeason && (
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
            <Col xs={24} md={isGaneshSeason ? 24 : 18}>
              <div className="products-grid">
                {(productsLoading || (isGaneshSeason && ganeshLoading)) ? (
                  <ProductSkeleton />
                ) : productsError || (isGaneshSeason && ganeshError) ? (
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
                ) : isGaneshSeason ? (
                  // Ganesh Season Layout
                  <Row gutter={[16, 16]}>
                    {/* First Card: Pottery Coming Soon */}
                    <Col {...productGridCols}>
                      <PotteryComingSoonCard onClick={handlePotteryPrebook} />
                    </Col>

                    {/* Ganesh Idols */}
                    {ganeshIdols.map((idol) => (
                      <Col {...productGridCols} key={idol.id}>
                        <GaneshIdolCard
                          idol={idol}
                          onShowInterest={handleShowInterest}
                          onProductClick={handleGaneshIdolClick}
                        />
                      </Col>
                    ))}

                    {/* Empty state for Ganesh idols */}
                    {ganeshIdols.length === 0 && !ganeshLoading && (
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
                    )}
                  </Row>
                ) : filteredProducts.length === 0 ? (
                  // Empty state for regular products
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
                  // Regular products grid
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

        {/* Mobile Filter Drawer - Only for non-Ganesh season */}
        {!isGaneshSeason && (
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
        )}

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
        {process.env.NODE_ENV === 'development' && !isGaneshSeason && (
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
            Products: {filteredProducts.length} | Total: {totalCount} | Season: {isGaneshSeason ? 'Ganesh' : 'Normal'}
          </div>
        )}
      </div>
    </>
  );
};

export default Products;