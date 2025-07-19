// pages/Products.js - Updated with filter state persistence
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Row,
  Col,
  Spin,
  Grid,
  message,
  Drawer,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Typography
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  FilterOutlined,
  AppstoreOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../Firebase/Firebase';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from 'firebase/firestore';

// Import season hook and cart utilities
import { useSeason } from '../hooks/useSeason';
import { addToCartSafe } from '../utils/cartUtility';
import useScrollPosition from '../hooks/useScrollPosition';

// Import components from productscomponents directory
import FilterPanel from './productscomponents/FilterPanel';
import ProductCard from './productscomponents/ProductCard';
import { GaneshIdolCard, PotteryComingSoonCard } from './productscomponents/GaneshComponents';
import GaneshFilterPanel from './productscomponents/GaneshFilterPanel';
import GaneshCarousel from './productscomponents/GaneshCarousel';
import CompactSearchFilter from './productscomponents/CompactSearchFilter';
import {
  QuantityModal,
  ProductsHeader,
  SearchFilterBar,
  EmptyState,
  ErrorState,
  ProductSkeleton,
  terracottaColors
} from './productscomponents/ProductModals';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// NEW: Enhanced filter state management
const FILTER_STATE_KEY = 'productsFilterState';
const GANESH_FILTER_STATE_KEY = 'ganeshFilterState';

// NEW: Save filter state to sessionStorage
const saveFilterState = (isGaneshSeason, filterState) => {
  const key = isGaneshSeason ? GANESH_FILTER_STATE_KEY : FILTER_STATE_KEY;
  try {
    sessionStorage.setItem(key, JSON.stringify({
      ...filterState,
      timestamp: Date.now()
    }));
    console.log('Filter state saved:', filterState);
  } catch (error) {
    console.error('Error saving filter state:', error);
  }
};

// NEW: Load filter state from sessionStorage
const loadFilterState = (isGaneshSeason) => {
  const key = isGaneshSeason ? GANESH_FILTER_STATE_KEY : FILTER_STATE_KEY;
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const parsedState = JSON.parse(saved);
      // Check if state is not too old (24 hours)
      const isStale = Date.now() - parsedState.timestamp > 24 * 60 * 60 * 1000;
      if (!isStale) {
        console.log('Filter state loaded:', parsedState);
        return parsedState;
      }
    }
  } catch (error) {
    console.error('Error loading filter state:', error);
  }
  return null;
};

// NEW: Clear filter state
const clearFilterState = (isGaneshSeason) => {
  const key = isGaneshSeason ? GANESH_FILTER_STATE_KEY : FILTER_STATE_KEY;
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing filter state:', error);
  }
};

// Enhanced custom styles with mobile-first approach
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
    min-height: 40vh;
  }

  .ganesh-idol-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px ${terracottaColors.ganesh}25;
    border-color: ${terracottaColors.ganesh};
  }

  .pottery-unavailable-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 193, 7, 0.2);
  }

  /* Enhanced Mobile responsive styles */
  @media (max-width: 576px) {
    .products-main-wrapper {
      padding: 0 8px;
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

    /* Mobile-specific Ganesh card improvements */
    .ganesh-idol-card .ant-card-body {
      padding: 0;
    }

    .ganesh-idol-card img {
      border-radius: 0;
    }

    /* Ensure proper spacing on mobile */
    .ant-col {
      margin-bottom: 16px;
    }
  }

  @media (max-width: 768px) {
    .products-main-wrapper {
      padding: 0 12px;
    }
    
    .header-title {
      font-size: 28px !important;
    }

    /* Tablet optimizations */
    .ganesh-idol-card {
      height: auto !important;
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

  /* Image loading optimizations */
  .ganesh-idol-card img,
  .pottery-unavailable-card img {
    object-fit: cover;
    object-position: center;
  }

  /* Compact header for mobile Ganesh season */
  .mobile-ganesh-header {
    text-align: center;
    margin-bottom: 16px;
    padding: 16px;
    background: linear-gradient(135deg, ${terracottaColors.ganesh}15 0%, ${terracottaColors.backgroundLight}30 100%);
    border-radius: 12px;
    border: 1px solid ${terracottaColors.ganesh}20;
  }
`;

// All existing hooks remain the same...
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
          const isGaneshProduct = data.category?.toLowerCase().includes('ganesh');
          const defaultVideo = isGaneshProduct && !data.videos?.length 
            ? ['https://res.cloudinary.com/dca26n68n/video/upload/v1752666125/WhatsApp_Video_2025-07-16_at_16.59.19_1e4b237f_nmnceg.mp4']
            : [];
          
          productsArr.push({
            id: doc.id,
            ...data,
            price: Number(data.price) || 0,
            stock: Number(data.stock) || 0,
            rating: Number(data.rating) || 4.2,
            reviews: Number(data.reviews) || 156,
            media: [...(data.images || []), ...(data.videos || []), ...defaultVideo],
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
          if (!data.hidden) {
            idolsArr.push({
              id: doc.id,
              ...data,
              price: Number(data.price) || 15000,
              rating: Number(data.rating) || 4.5,
              reviews: Number(data.reviews) || 28,
              imgUrl: data.images?.[0] || '',
              estimatedDays: Number(data.estimatedDays) || 7,
              advancePercentage: Number(data.advancePercentage) || 25,
              createdAt: data.createdAt || new Date().toISOString(),
              height: data.height || '',
              category: data.category || 'traditional',
              customizable: data.customizable !== false,
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

const useProductSearch = (products, searchQuery, filters) => {
  return useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.code?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }

    if (filters.hyderabadOnly) {
      filtered = filtered.filter(product => product.hyderabadOnly);
    }

    switch (filters.sortBy) {
      case 'relevance':
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

// Enhanced useGaneshIdolFilter with height filtering
const useGaneshIdolFilter = (ganeshIdols, searchQuery, filters, heightFilter) => {
  return useMemo(() => {
    let filtered = [...ganeshIdols];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idol =>
        idol.name?.toLowerCase().includes(query) ||
        idol.description?.toLowerCase().includes(query) ||
        idol.category?.toLowerCase().includes(query)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(idol =>
        idol.price >= filters.priceRange[0] && idol.price <= filters.priceRange[1]
      );
    }

    if (filters.categoryFilter && filters.categoryFilter !== 'all') {
      filtered = filtered.filter(idol => 
        idol.category === filters.categoryFilter
      );
    }

    if (filters.customizableOnly) {
      filtered = filtered.filter(idol => idol.customizable);
    }

    // Height filtering logic
    if (heightFilter) {
      const heightOptions = {
        '3ft': [3, 3.5],
        '4ft': [4, 4.5], 
        '5ft': [5, 5.5],
        '6ft': [6, 6.5],
        '7ft': [7, 7.5],
        '8ft': [8, 8.5]
      };
      
      const heightRange = heightOptions[heightFilter];
      if (heightRange) {
        filtered = filtered.filter(idol => {
          if (!idol.height) return false;
          
          // Extract numeric value from height string (e.g., "3.5 feet" -> 3.5)
          const heightValue = parseFloat(idol.height.toString().replace(/[^0-9.]/g, ''));
          
          return heightValue >= heightRange[0] && heightValue <= heightRange[1];
        });
      }
    }

    switch (filters.sortBy) {
      case 'relevance':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'priceLowToHigh':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'heightLowToHigh':
        filtered.sort((a, b) => {
          const heightA = parseFloat((a.height || '0').toString().replace(/[^0-9.]/g, '')) || 0;
          const heightB = parseFloat((b.height || '0').toString().replace(/[^0-9.]/g, '')) || 0;
          return heightA - heightB;
        });
        break;
      case 'heightHighToLow':
        filtered.sort((a, b) => {
          const heightA = parseFloat((a.height || '0').toString().replace(/[^0-9.]/g, '')) || 0;
          const heightB = parseFloat((b.height || '0').toString().replace(/[^0-9.]/g, '')) || 0;
          return heightB - heightA;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'estimatedDays':
        filtered.sort((a, b) => (a.estimatedDays || 7) - (b.estimatedDays || 7));
        break;
      default:
        filtered.sort((a, b) => {
          const heightA = parseFloat((a.height || '0').toString().replace(/[^0-9.]/g, '')) || 0;
          const heightB = parseFloat((b.height || '0').toString().replace(/[^0-9.]/g, '')) || 0;
          return heightB - heightA;
        });
        break;
    }

    const totalCount = ganeshIdols.length;
    const traditionalCount = ganeshIdols.filter(idol => idol.category === 'traditional').length;
    const modernCount = ganeshIdols.filter(idol => idol.category === 'modern').length;
    const premiumCount = ganeshIdols.filter(idol => idol.category === 'premium').length;
    const customizableCount = ganeshIdols.filter(idol => idol.customizable).length;

    return {
      idols: filtered,
      totalCount,
      traditionalCount,
      modernCount,
      premiumCount,
      customizableCount,
      isSearching: false
    };
  }, [ganeshIdols, searchQuery, filters.priceRange, filters.sortBy, filters.categoryFilter, filters.customizableOnly, heightFilter]);
};

// Main Products Component
const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  
  const isMobile = !screens.md;
  const isSmallScreen = !screens.sm;
  
  const { currentSeason, isGaneshSeason, loading: seasonLoading } = useSeason();
  
  const { restoreScrollPosition, saveScrollPosition } = useScrollPosition('productsScrollPosition');
  
  const [user, setUser] = useState(null);
  
  // Regular products filter states
  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [hyderabadOnly, setHyderabadOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Ganesh products filter states
  const [ganeshPriceRange, setGaneshPriceRange] = useState([5000, 50000]);
  const [ganeshSortBy, setGaneshSortBy] = useState('priceLowToHigh');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [ganeshDrawerOpen, setGaneshDrawerOpen] = useState(false);
  const [selectedHeightFilter, setSelectedHeightFilter] = useState(null);

  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { ganeshIdols, loading: ganeshLoading, error: ganeshError } = useGaneshIdols();
  const { wishlist, toggleWishlistItem, isInWishlist } = useWishlist(user);
  
  const searchParams = useMemo(() => ({
    priceRange,
    sortBy,
    hyderabadOnly,
    hideOutOfStock: false,
  }), [priceRange[0], priceRange[1], sortBy, hyderabadOnly]);

  const ganeshFilterParams = useMemo(() => ({
    priceRange: ganeshPriceRange,
    sortBy: ganeshSortBy,
    categoryFilter,
    customizableOnly,
  }), [ganeshPriceRange[0], ganeshPriceRange[1], ganeshSortBy, categoryFilter, customizableOnly]);

  const { 
    products: filteredProducts, 
    totalCount, 
    hyderabadCount,
    isSearching 
  } = useProductSearch(products, searchQuery, searchParams);

  const {
    idols: filteredGaneshIdols,
    totalCount: ganeshTotalCount,
    isSearching: isGaneshSearching
  } = useGaneshIdolFilter(ganeshIdols, searchQuery, ganeshFilterParams, selectedHeightFilter);

  // NEW: Effect to restore filter state when returning from product detail
  useEffect(() => {
    const fromProductDetail = sessionStorage.getItem('returnFromProductDetail');
    
    if (fromProductDetail === 'true') {
      console.log('Returning from product detail, restoring state...');
      
      // Load and restore filter state
      const savedState = loadFilterState(isGaneshSeason);
      if (savedState) {
        if (isGaneshSeason) {
          // Restore Ganesh filter state
          if (savedState.ganeshPriceRange) setGaneshPriceRange(savedState.ganeshPriceRange);
          if (savedState.ganeshSortBy) setGaneshSortBy(savedState.ganeshSortBy);
          if (savedState.categoryFilter) setCategoryFilter(savedState.categoryFilter);
          if (savedState.customizableOnly !== undefined) setCustomizableOnly(savedState.customizableOnly);
          if (savedState.selectedHeightFilter) setSelectedHeightFilter(savedState.selectedHeightFilter);
          if (savedState.searchQuery) setSearchQuery(savedState.searchQuery);
        } else {
          // Restore regular products filter state
          if (savedState.priceRange) setPriceRange(savedState.priceRange);
          if (savedState.sortBy) setSortBy(savedState.sortBy);
          if (savedState.hyderabadOnly !== undefined) setHyderabadOnly(savedState.hyderabadOnly);
          if (savedState.searchQuery) setSearchQuery(savedState.searchQuery);
        }
      }
      
      // Clear the return flag
      sessionStorage.removeItem('returnFromProductDetail');
      
      // Restore scroll position after a short delay to allow for rendering
      const timer = setTimeout(() => {
        restoreScrollPosition();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, restoreScrollPosition, isGaneshSeason]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const getProductGridCols = () => {
    if (!screens.sm) return { xs: 24 };
    if (!screens.md) return { xs: 24, sm: 12 };
    if (!screens.lg) return { xs: 24, sm: 12, md: 8 };
    if (!screens.xl) return { xs: 24, sm: 12, md: 8, lg: 6 };
    return { xs: 24, sm: 12, md: 6, lg: 6, xl: 6 };
  };

  const productGridCols = getProductGridCols();

  const showMessage = useCallback((content, type = 'success') => {
    message[type](content);
  }, []);

  // NEW: Enhanced navigation handlers that save state
  const handleProductClick = useCallback((id, code) => {
    console.log('Product clicked:', { id, code });
    
    // Save current scroll position
    saveScrollPosition();
    
    // Save current filter state
    const currentState = isGaneshSeason ? {
      ganeshPriceRange,
      ganeshSortBy,
      categoryFilter,
      customizableOnly,
      selectedHeightFilter,
      searchQuery
    } : {
      priceRange,
      sortBy,
      hyderabadOnly,
      searchQuery
    };
    
    saveFilterState(isGaneshSeason, currentState);
    
    // Set the return flag
    sessionStorage.setItem('returnFromProductDetail', 'true');
    
    navigate(`/product/${id}?code=${code}`);
  }, [navigate, isGaneshSeason, ganeshPriceRange, ganeshSortBy, categoryFilter, customizableOnly, selectedHeightFilter, searchQuery, priceRange, sortBy, hyderabadOnly, saveScrollPosition]);

  const handleGaneshIdolClick = useCallback((idolId) => {
    console.log('Ganesh idol clicked:', idolId);
    
    // Save current scroll position
    saveScrollPosition();
    
    // Save current filter state for Ganesh season
    const currentState = {
      ganeshPriceRange,
      ganeshSortBy,
      categoryFilter,
      customizableOnly,
      selectedHeightFilter,
      searchQuery
    };
    
    saveFilterState(true, currentState);
    
    // Set the return flag
    sessionStorage.setItem('returnFromProductDetail', 'true');
    
    navigate(`/ganesh-idol/${idolId}`);
  }, [navigate, ganeshPriceRange, ganeshSortBy, categoryFilter, customizableOnly, selectedHeightFilter, searchQuery, saveScrollPosition]);

  const handlePotteryPrebook = useCallback(() => {
    navigate('/contact');
  }, [navigate]);

  const handleShowInterest = useCallback((idol) => {
    if (!user) {
      showMessage('Please login to show interest', 'warning');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }
    
    navigate('/ganesh-order-summary', {
      state: {
        idol: {
          id: idol.id,
          name: idol.name,
          price: idol.price,
          category: idol.category || 'traditional',
          height: idol.height || '',
          weight: idol.weight || '',
          color: idol.color || '',
          material: idol.material || 'Eco-friendly Clay',
          estimatedDays: idol.estimatedDays || 7,
          advancePercentage: idol.advancePercentage || 25,
          images: idol.images || [],
          description: idol.description || '',
          customizable: idol.customizable || true,
          availability: idol.availability || 'available',
          features: idol.features || [],
          imgUrl: idol.images?.[0] || idol.imgUrl || '',
        }
      }
    });
  }, [user, showMessage, navigate]);

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
  }, [user, showMessage, navigate]);

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
  }, [user, showMessage, navigate]);

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
  }, [user, showMessage, toggleWishlistItem, navigate]);

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
    // Clear saved filter state
    clearFilterState(false);
  }, []);

  const handleGaneshResetFilters = useCallback(() => {
    setGaneshPriceRange([5000, 50000]);
    setGaneshSortBy('priceLowToHigh'); 
    setCategoryFilter('all');
    setCustomizableOnly(false);
    setSearchQuery('');
    setSelectedHeightFilter(null);
    // Clear saved filter state
    clearFilterState(true);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const handleGaneshDrawerToggle = useCallback(() => {
    setGaneshDrawerOpen(prev => !prev);
  }, []);

  if (seasonLoading || (isGaneshSeason && ganeshLoading)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="products-container">
        <div className="products-main-wrapper">
          {/* Mobile Ganesh Header */}
          {isGaneshSeason && isMobile && (
            <div className="mobile-ganesh-header">
              <Title 
                level={2} 
                style={{ 
                  margin: 0,
                  background: `linear-gradient(135deg, ${terracottaColors.ganesh} 0%, #FFB74D 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                🕉️ Ganesh Festival Collection
              </Title>
            </div>
          )}

          {/* Desktop Header for non-mobile */}
          {(!isMobile || !isGaneshSeason) && (
            <ProductsHeader 
              isGaneshSeason={isGaneshSeason}
              isMobile={isMobile}
              totalCount={isGaneshSeason ? ganeshTotalCount : totalCount}
              hyderabadCount={hyderabadCount}
            />
          )}

          {/* Carousel for Ganesh Season */}
          {isGaneshSeason && (
            <GaneshCarousel 
              isMobile={isMobile} 
              onPotteryClick={handlePotteryPrebook}
            />
          )}

          {/* Compact Search and Filter for Ganesh Season with Height Filters */}
          {isGaneshSeason ? (
            <CompactSearchFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredGaneshIdols={filteredGaneshIdols}
              isGaneshSearching={isGaneshSearching}
              handleGaneshDrawerToggle={handleGaneshDrawerToggle}
              selectedHeightFilter={selectedHeightFilter}
              setSelectedHeightFilter={setSelectedHeightFilter}
              isMobile={isMobile}
            />
          ) : (
            /* Regular Search and Filter Bar for Non-Ganesh Season */
            <div style={{ marginBottom: '32px' }}>
              <SearchFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                hyderabadOnly={hyderabadOnly}
                setHyderabadOnly={setHyderabadOnly}
                filteredProducts={filteredProducts}
                isSearching={isSearching}
                handleDrawerToggle={handleDrawerToggle}
                isMobile={isMobile}
                isSmallScreen={isSmallScreen}
              />
            </div>
          )}

          {/* Main Content */}
          <Row gutter={[24, 0]}>
            {/* Desktop Filter Panel */}
            {!isMobile && (
              <Col span={6}>
                <div className="products-filter-sidebar">
                  <div
                    style={{
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${isGaneshSeason ? terracottaColors.ganesh + '10' : terracottaColors.backgroundLight + '30'} 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${isGaneshSeason ? terracottaColors.ganesh + '20' : terracottaColors.primary + '20'}`,
                      padding: '24px'
                    }}
                  >
                    {isGaneshSeason ? (
                      <GaneshFilterPanel
                        priceRange={ganeshPriceRange}
                        setPriceRange={setGaneshPriceRange}
                        sortBy={ganeshSortBy}
                        setSortBy={setGaneshSortBy}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        customizableOnly={customizableOnly}
                        setCustomizableOnly={setCustomizableOnly}
                        onResetFilters={handleGaneshResetFilters}
                      />
                    ) : (
                      <FilterPanel
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        hyderabadOnly={hyderabadOnly}
                        setHyderabadOnly={setHyderabadOnly}
                        onResetFilters={handleResetFilters}
                      />
                    )}
                  </div>
                </div>
              </Col>
            )}

            {/* Products Grid */}
            <Col xs={24} md={!isMobile ? 18 : 24}>
              <div className="products-grid">
                {(productsLoading || (isGaneshSeason && ganeshLoading)) ? (
                  <ProductSkeleton />
                ) : productsError || (isGaneshSeason && ganeshError) ? (
                  <ErrorState 
                    productsError={productsError}
                    ganeshError={ganeshError}
                    isGaneshSeason={isGaneshSeason}
                  />
                ) : isGaneshSeason ? (
                  <Row gutter={[16, 16]}>
                    {/* Ganesh Idols */}
                    {filteredGaneshIdols.map((idol) => (
                      <Col {...productGridCols} key={idol.id}>
                        <GaneshIdolCard
                          idol={idol}
                          onShowInterest={handleShowInterest}
                          onProductClick={handleGaneshIdolClick}
                        />
                      </Col>
                    ))}

                    {/* Empty state for Ganesh idols */}
                    {filteredGaneshIdols.length === 0 && !ganeshLoading && (
                      <Col span={24}>
                        <Card
                          style={{
                            borderRadius: '12px',
                            textAlign: 'center',
                            backgroundColor: `${terracottaColors.ganesh}08`,
                            border: `1px solid ${terracottaColors.ganesh}30`,
                            marginTop: '20px'
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
                            No Ganesh Idols Found Matching Your Filters
                          </Title>
                          <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
                            Please try different filter options or reset filters to see all available idols.
                          </Text>
                          <Button
                            type="primary"
                            onClick={handleGaneshResetFilters}
                            style={{ 
                              borderRadius: '8px',
                              backgroundColor: terracottaColors.ganesh,
                              borderColor: terracottaColors.ganesh,
                            }}
                          >
                            Reset Filters
                          </Button>
                        </Card>
                      </Col>
                    )}
                  </Row>
                ) : filteredProducts.length === 0 ? (
                  <EmptyState 
                    handleResetFilters={handleResetFilters}
                    isGaneshSeason={isGaneshSeason}
                    ganeshIdols={ganeshIdols}
                    ganeshLoading={ganeshLoading}
                  />
                ) : (
                  <Row gutter={[16, 16]}>
                    {filteredProducts.map((product) => (
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
        {isGaneshSeason ? (
          <Drawer
            title="Ganesh Idol Filters"
            placement="left"
            open={ganeshDrawerOpen}
            onClose={() => setGaneshDrawerOpen(false)}
            width={isMobile ? '90vw' : 300}
            style={{
              maxWidth: '350px'
            }}
            bodyStyle={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${terracottaColors.ganesh}10 100%)`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <GaneshFilterPanel
              priceRange={ganeshPriceRange}
              setPriceRange={setGaneshPriceRange}
              sortBy={ganeshSortBy}
              setSortBy={setGaneshSortBy}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              customizableOnly={customizableOnly}
              setCustomizableOnly={setCustomizableOnly}
              onResetFilters={handleGaneshResetFilters}
            />
          </Drawer>
        ) : (
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

        {/* Performance Debug */}
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
            {isGaneshSeason ? (
              <>Idols: {filteredGaneshIdols.length} | Total: {ganeshTotalCount} | Season: Ganesh | Sort: {ganeshSortBy} | Height: {selectedHeightFilter || 'All'}</>
            ) : (
              <>Products: {filteredProducts.length} | Total: {totalCount} | Season: Normal</>
            )}
            <br />
            Filters: {isGaneshSeason ? 'Ganesh' : 'Regular'} | Saved: {sessionStorage.getItem(isGaneshSeason ? GANESH_FILTER_STATE_KEY : FILTER_STATE_KEY) ? 'Yes' : 'No'}
          </div>
        )}
      </div>
    </>
  );
};

export default Products;