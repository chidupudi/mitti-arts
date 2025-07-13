// pages/Products.js - Main Products Page
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Grid, message, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../Firebase/Firebase';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc } from 'firebase/firestore';

// Import season hook and cart utilities
import { useSeason } from '../hooks/useSeason';
import { addToCartSafe } from '../utils/cartUtility';

// Import components from productscomponents directory
import FilterPanel from './productscomponents/FilterPanel';
import ProductCard from './productscomponents/ProductCard';
import { GaneshIdolCard, PotteryComingSoonCard } from './productscomponents/GaneshComponents';
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

// Custom pottery image URL - Replace this with your own image URL
const CUSTOM_POTTERY_IMAGE = 'https://res.cloudinary.com/dca26n68n/image/upload/v1752423554/WhatsApp_Image_2025-07-13_at_13.36.04_5cdf4b7c_ucnech.jpg';
// You can replace the above URL with your own pottery image URL
// Example: const CUSTOM_POTTERY_IMAGE = 'https://yourdomain.com/pottery-image.jpg';

// Enhanced custom styles with Ganesh season additions and mobile responsiveness
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
`;

// Custom hooks for data fetching (keeping all existing functionality)
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

// Hook to fetch Ganesh idols (keeping all existing functionality)
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

// Wishlist hook (keeping all existing functionality)
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

// Product search and filtering hook (keeping all existing functionality)
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

// Main Products Component
const Products = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isSmallScreen = !screens.sm;
  
  // Season context
  const { currentSeason, isGaneshSeason, loading: seasonLoading } = useSeason();
  
  // State (keeping all existing state)
  const [user, setUser] = useState(null);
  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [hyderabadOnly, setHyderabadOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use hooks (keeping all existing hooks)
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

  // Auth effect (keeping existing functionality)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Responsive grid configuration (keeping existing functionality)
  const getProductGridCols = () => {
    if (!screens.sm) return { xs: 24 }; // 1 column on mobile (< 576px)
    if (!screens.md) return { xs: 24, sm: 12 }; // 2 columns on small screens (576px - 768px)
    if (!screens.lg) return { xs: 24, sm: 12, md: 8 }; // 3 columns on medium screens (768px - 992px)
    if (!screens.xl) return { xs: 24, sm: 12, md: 8, lg: 6 }; // 4 columns on large screens (992px - 1200px)
    return { xs: 24, sm: 12, md: 6, lg: 6, xl: 6 }; // 4 columns on extra large screens (> 1200px)
  };

  const productGridCols = getProductGridCols();

  // Stable callbacks to prevent infinite loops (keeping all existing handlers)
  const showMessage = useCallback((content, type = 'success') => {
    message[type](content);
  }, []);

  const handleProductClick = useCallback((id, code) => {
    console.log('Product clicked:', { id, code });
    window.location.href = `/product/${id}?code=${code}`;
  }, []);

  // Season-specific handlers (keeping existing functionality)
  const handlePotteryPrebook = useCallback(() => {
    showMessage('Pre-booking feature coming soon!', 'info');
  }, [showMessage]);

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
  }, [user, navigate, showMessage]);

  const handleGaneshIdolClick = useCallback((idolId) => {
    navigate(`/ganesh-idol/${idolId}`);
  }, [navigate]);

  // Add to Cart handler (keeping existing functionality)
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

  // Buy Now handler (keeping existing functionality)
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

  // Confirm Add to Cart handler (keeping existing functionality)
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

  // Loading states (keeping existing functionality)
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
          {/* Header Section - Season Aware (keeping existing functionality) */}
          <ProductsHeader 
            isGaneshSeason={isGaneshSeason}
            isMobile={isMobile}
            totalCount={totalCount}
            hyderabadCount={hyderabadCount}
          />

          {/* Search and Filter Bar - Only show for non-Ganesh season (keeping existing functionality) */}
          {!isGaneshSeason && (
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

          {/* Main Content (keeping existing functionality) */}
          <Row gutter={[24, 0]}>
            {/* Desktop Filter Panel - Only show for non-Ganesh season */}
            {!isMobile && !isGaneshSeason && (
              <Col span={6}>
                <div className="products-filter-sidebar">
                  <div
                    style={{
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${terracottaColors.backgroundLight}30 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${terracottaColors.primary}20`,
                      padding: '24px'
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
                  </div>
                </div>
              </Col>
            )}

            {/* Products Grid */}
            <Col xs={24} md={isGaneshSeason ? 24 : 18}>
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
                  // Ganesh Season Layout with Custom Pottery Image
                  <Row gutter={[16, 16]}>
                    {/* First Card: Pottery Coming Soon with Custom Image */}
                    <Col {...productGridCols}>
                      <PotteryComingSoonCard 
                        onClick={handlePotteryPrebook}
                        customPotteryImage={CUSTOM_POTTERY_IMAGE}
                      />
                    </Col>

                    {/* Ganesh Idols with Enhanced Mobile Image Height */}
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
                    <EmptyState 
                      handleResetFilters={handleResetFilters}
                      isGaneshSeason={isGaneshSeason}
                      ganeshIdols={ganeshIdols}
                      ganeshLoading={ganeshLoading}
                    />
                  </Row>
                ) : filteredProducts.length === 0 ? (
                  // Empty state for regular products
                  <EmptyState 
                    handleResetFilters={handleResetFilters}
                    isGaneshSeason={isGaneshSeason}
                    ganeshIdols={ganeshIdols}
                    ganeshLoading={ganeshLoading}
                  />
                ) : (
                  // Regular products grid
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

        {/* Mobile Filter Drawer - Only for non-Ganesh season (keeping existing functionality) */}
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

        {/* Quantity Modal (keeping existing functionality) */}
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