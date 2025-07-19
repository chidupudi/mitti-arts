// Updated ProductDetail.jsx - WITH ENHANCED NAVIGATION AND SCROLL MANAGEMENT
import React, {
  useEffect,
  useState,
  useCallback
} from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Typography,
  message,
  Skeleton,
  Grid,
} from 'antd';
import {
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { auth, db } from '../Firebase/Firebase';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import helper components - UPDATED VERSIONS
import ProductImageGallery from './ProductImageGallery'; // Enhanced with video support and mobile fixes
import ProductInfo, { MobileActions, ServiceFeatures } from './ProductInfoSection'; // Enhanced with formatted descriptions
// import ProductTabs from './ProductTabs'; // COMMENTED OUT - Enhanced with formatted descriptions

// Import the FIXED cart utilities
import { addToCartSafe } from '../utils/cartUtility';
import useScrollPosition from '../hooks/useScrollPosition'; // ENHANCED: Import enhanced scroll position hook

const { Title } = Typography;
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
};

// Custom styles
const customStyles = {
  container: {
    backgroundColor: colors.background,
    minHeight: '100vh',
    padding: '24px',
  },
  imageCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: `1px solid ${colors.divider}`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${colors.backgroundLight}30 100%)`,
    boxShadow: `0 8px 32px ${colors.primary}15`,
  },
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
  // ENHANCED: Updated back button styles with better UX
  backButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    color: colors.primary,
    borderRadius: '8px',
    fontWeight: 600,
    height: '44px',
    fontSize: '14px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: `0 2px 8px ${colors.primary}15`,
  },
};

// UPDATED: Enhanced video data processing function
const processVideoData = (videos) => {
  if (!videos || !Array.isArray(videos)) return [];
  
  return videos.map((video, index) => {
    if (typeof video === 'string') {
      // Simple video URL
      return {
        id: `video_${index}`,
        src: video,
        thumbnail: `${video}#t=1`, // Generate thumbnail from video at 1 second
        title: `Product Video ${index + 1}`,
        type: 'video',
        captions: []
      };
    } else if (typeof video === 'object' && video !== null) {
      // Full video object
      return {
        id: video.id || `video_${index}`,
        src: video.src || video.url,
        thumbnail: video.thumbnail || video.poster || `${video.src || video.url}#t=1`,
        title: video.title || `Product Video ${index + 1}`,
        poster: video.poster,
        captions: video.captions || [],
        duration: video.duration,
        type: 'video'
      };
    }
    return null;
  }).filter(Boolean);
};

// UPDATED: Enhanced media processing for mixed images and videos
const processAllMedia = (images = []) => {
  const processedMedia = [];
  
  images.forEach((item, index) => {
    if (typeof item === 'string') {
      // Check if it's a video URL by extension or contains video indicators
      const isVideoUrl = /\.(mp4|webm|ogg|avi|mov|wmv|flv|3gp)(\?|$)/i.test(item) ||
                         item.includes('video') ||
                         (item.includes('res.cloudinary.com') && item.includes('video'));
      
      if (isVideoUrl) {
        processedMedia.push({
          id: `video_${index}`,
          type: 'video',
          src: item,
          thumbnail: `${item}#t=1`,
          title: `Product Video ${processedMedia.filter(m => m.type === 'video').length + 1}`,
          index: index
        });
      } else {
        processedMedia.push({
          id: `image_${index}`,
          type: 'image',
          src: item,
          thumbnail: item,
          title: `Product Image ${processedMedia.filter(m => m.type === 'image').length + 1}`,
          index: index
        });
      }
    } else if (typeof item === 'object' && item !== null) {
      // Object with type specified
      processedMedia.push({
        id: item.id || `${item.type || 'media'}_${index}`,
        type: item.type || 'image',
        src: item.src || item.url || item,
        thumbnail: item.thumbnail || item.poster || item.src || item.url || item,
        title: item.title || `Product ${item.type || 'Media'} ${index + 1}`,
        poster: item.poster,
        captions: item.captions || [],
        duration: item.duration,
        index: index
      });
    }
  });
  
  return processedMedia;
};

// UPDATED: Enhanced product data hook with better video processing
const useProductData = (productId, code) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if this is a Ganesh idol route
        const isGaneshIdol = window.location.pathname.includes('/ganesh-idol/');

        let docRef, docSnap;

        if (isGaneshIdol) {
          // Fetch from ganeshIdols collection
          docRef = doc(db, 'ganeshIdols', productId);
          docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // ENHANCED: Process all media (images + videos) together
            const combinedSources = [...(data.images || []), ...(data.videos || [])];
            const allMedia = processAllMedia(combinedSources);
            const imageMedia = allMedia.filter(item => item.type === 'image');
            const videoMedia = allMedia.filter(item => item.type === 'video');

            // Ensure default Ganesh video is added as last media item
            const DEFAULT_GANESH_VIDEO = 'https://res.cloudinary.com/dca26n68n/video/upload/v1752666125/WhatsApp_Video_2025-07-16_at_16.59.19_1e4b237f_nmnceg.mp4';
            const hasDefaultVideo = videoMedia.some(v => v.src === DEFAULT_GANESH_VIDEO);
            if (!hasDefaultVideo) {
              const defaultVideoObj = {
                id: 'video_default',
                type: 'video',
                src: DEFAULT_GANESH_VIDEO,
                thumbnail: `${DEFAULT_GANESH_VIDEO}#t=1`,
                title: 'Product Video',
                index: allMedia.length,
              };
              videoMedia.push(defaultVideoObj);
              allMedia.push(defaultVideoObj);
            }
            
            // Convert Ganesh idol data to product-like structure
            const idolData = {
              id: docSnap.id,
              ...data,
              price: Number(data.price) || 15000,
              originalPrice: null,
              discount: 0,
              stock: 999,
              rating: Number(data.rating) || 4.5,
              reviews: Number(data.reviews) || 28,
              images: imageMedia.map(item => item.src), // Keep images as strings for compatibility
              videos: videoMedia, // Processed video objects
              allMedia: allMedia, // All media combined
              hyderabadOnly: false,
              isGaneshIdol: true,
              estimatedDays: Number(data.estimatedDays) || 7,
              advancePercentage: Number(data.advancePercentage) || 25,
            };
            setProduct(idolData);
          } else {
            setError('Ganesh idol not found');
          }
        } else {
          // Regular product logic
          docRef = doc(db, 'products', productId);
          docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // ENHANCED: Process all media for regular products too
            const productSources = [...(data.images || (data.imgUrl ? [data.imgUrl] : [])), ...(data.videos || [])];
            const allMedia = processAllMedia(productSources);
            const imageMedia = allMedia.filter(item => item.type === 'image');
            const videoMedia = allMedia.filter(item => item.type === 'video');
            
            const productData = {
              id: docSnap.id,
              ...data,
              price: Number(data.price) || 0,
              stock: Number(data.stock) || 0,
              rating: Number(data.rating) || 4.2,
              reviews: Number(data.reviews) || 156,
              images: imageMedia.map(item => item.src), // Keep backward compatibility
              videos: videoMedia, // Processed video objects
              allMedia: allMedia, // All media combined
              hyderabadOnly: data.hyderabadOnly || false,
              isGaneshIdol: false,
            };
            setProduct(productData);
          } else if (code) {
            // Try finding by code
            const productsRef = collection(db, 'products');
            const querySnapshot = await getDocs(query(productsRef, where('code', '==', code)));

            if (!querySnapshot.empty) {
              const data = querySnapshot.docs[0].data();
              
              // Process media for code-based lookup too
              const productImages = data.images || (data.imgUrl ? [data.imgUrl] : []);
              const allMedia = processAllMedia(productImages);
              const imageMedia = allMedia.filter(item => item.type === 'image');
              const videoMedia = allMedia.filter(item => item.type === 'video');
              
              const productData = {
                id: querySnapshot.docs[0].id,
                ...data,
                price: Number(data.price) || 0,
                stock: Number(data.stock) || 0,
                rating: Number(data.rating) || 4.2,
                reviews: Number(data.reviews) || 156,
                images: imageMedia.map(item => item.src),
                videos: videoMedia,
                allMedia: allMedia,
                hyderabadOnly: data.hyderabadOnly || false,
                isGaneshIdol: false,
              };
              setProduct(productData);
            } else {
              setError('Product not found');
            }
          } else {
            setError('Product not found');
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, code]);

  return { product, loading, error };
};

// Custom hook for wishlist (unchanged)
const useWishlist = (user) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }

      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = useCallback(async (product) => {
    if (!user) return { success: false, message: 'Please log in first' };

    // Don't allow wishlist for Ganesh idols (they're custom made)
    if (product.isGaneshIdol) {
      return { success: false, message: 'Ganesh idols cannot be added to wishlist. Please show interest instead.' };
    }

    const isInWishlist = wishlist.some(item => item.id === product.id);

    try {
      if (isInWishlist) {
        const itemToRemove = wishlist.find(item => item.id === product.id);
        if (itemToRemove?.wishlistDocId) {
          await deleteDoc(doc(db, 'wishlist', itemToRemove.wishlistDocId));
          setWishlist(prev => prev.filter(item => item.id !== product.id));
          return { success: true, message: 'Removed from wishlist', action: 'removed' };
        }
      } else {
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          imgUrl: product.images?.[0] || product.imgUrl,
          price: product.price,
          code: product.code,
          addedAt: new Date().toISOString(),
          hyderabadOnly: product.hyderabadOnly || false,
        });

        const newItem = { ...product, wishlistDocId: docRef.id };
        setWishlist(prev => [...prev, newItem]);
        return { success: true, message: 'Added to wishlist', action: 'added' };
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return { success: false, message: 'Failed to update wishlist' };
    }
  }, [user, wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  return { wishlist, toggleWishlist, isInWishlist, loading };
};

// Loading Skeleton Component (unchanged)
const ProductDetailSkeleton = () => (
  <div style={customStyles.container}>
    <Skeleton.Button size="large" style={{ marginBottom: '24px' }} />
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <div style={customStyles.imageCard}>
          <Skeleton.Image style={{ width: '100%', height: '500px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', padding: '16px' }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton.Image key={i} style={{ width: '80px', height: '80px' }} />
            ))}
          </div>
        </div>
      </Col>
      <Col xs={24} lg={10}>
        <div style={customStyles.productInfoCard}>
          <Skeleton active paragraph={{ rows: 8 }} style={{ padding: '24px' }} />
        </div>
      </Col>
    </Row>
  </div>
);

// Main ProductDetail Component - ENHANCED WITH SMART NAVIGATION
const ProductDetail = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // ENHANCED: Add enhanced scroll position management
  const { 
    saveScrollPosition, 
    getCurrentScrollPosition,
    hasSavedPosition,
    scrollToTop 
  } = useScrollPosition('productsScrollPosition');

  const code = new URLSearchParams(search).get('code');
  const { product, loading, error } = useProductData(id, code);

  const [user, setUser] = useState(null);
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist(user);

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ENHANCED: Smart back navigation handler with multiple fallback options
  const handleBackToProducts = useCallback(() => {
    console.log('🔙 Back button clicked');
    
    // Method 1: Check if we have saved scroll position (most reliable indicator of where user came from)
    const hasScrollData = hasSavedPosition();
    
    // Method 2: Check navigation history and sessionStorage flags
    const fromProductDetail = sessionStorage.getItem('returnFromProductDetail');
    const navigationSource = sessionStorage.getItem('navigationSource') || 'direct';
    
    console.log('Navigation context:', {
      hasScrollData,
      fromProductDetail,
      navigationSource,
      historyLength: window.history.length,
      canGoBack: window.history.length > 1
    });

    // Save current product detail position (in case user wants to come back)
    const currentPosition = getCurrentScrollPosition();
    sessionStorage.setItem('productDetailScrollPosition', JSON.stringify(currentPosition));
    
    // Determine the best navigation method
    if (hasScrollData || fromProductDetail === 'true' || navigationSource === 'products') {
      // User came from products page - restore their session
      console.log('✅ Returning to products page with state restoration');
      
      // Set flag for products page to restore state
      sessionStorage.setItem('returnFromProductDetail', 'true');
      
      // Navigate back to products
      navigate('/products');
    } else if (window.history.length > 1 && navigationSource !== 'direct') {
      // User has history and didn't arrive directly - use browser back
      console.log('🔄 Using browser back navigation');
      
      // Set fallback flag in case browser back doesn't work
      sessionStorage.setItem('returnFromProductDetail', 'true');
      
      // Try browser back first
      window.history.back();
      
      // Fallback timer in case history.back() doesn't work
      setTimeout(() => {
        if (window.location.pathname.includes('/product') || window.location.pathname.includes('/ganesh-idol')) {
          console.log('⚠️ Browser back failed, using navigate fallback');
          navigate('/products');
        }
      }, 1000);
    } else {
      // Fresh visit or direct access - go to products home
      console.log('🏠 Fresh visit - navigating to products home');
      
      // Clear any stale data and start fresh
      sessionStorage.removeItem('returnFromProductDetail');
      sessionStorage.removeItem('navigationSource');
      
      // Go to products page and scroll to top
      navigate('/products');
      
      // Ensure we scroll to top after navigation
      setTimeout(() => {
        scrollToTop({ smooth: true, clearSaved: true });
      }, 100);
    }
  }, [navigate, hasSavedPosition, getCurrentScrollPosition, scrollToTop]);

  // ENHANCED: Set navigation source when component mounts
  useEffect(() => {
    // Only set navigation source if not already set
    if (!sessionStorage.getItem('navigationSource')) {
      const referrer = document.referrer;
      if (referrer.includes('/products')) {
        sessionStorage.setItem('navigationSource', 'products');
      } else if (referrer.includes(window.location.origin)) {
        sessionStorage.setItem('navigationSource', 'internal');
      } else {
        sessionStorage.setItem('navigationSource', 'direct');
      }
    }

    // Clean up on unmount
    return () => {
      // Don't clear navigation source here - let it persist for back navigation
    };
  }, []);

  // ENHANCED: Auto-scroll to top when product changes (for direct navigation between products)
  useEffect(() => {
    if (product && !sessionStorage.getItem('returnFromProductDetail')) {
      // Only scroll to top if this is a fresh product view (not returning from products)
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [product?.id]);

  // Existing handlers (unchanged but with enhanced logging)
  const handleAddToCart = useCallback(async (product, quantity) => {
    console.log('🛒 Add to cart:', { product: product.name, quantity });
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Special handling for Ganesh idols - MODIFIED: NO LOGIN CHECK
    if (product.isGaneshIdol) {
      navigate('/ganesh-order-summary', {
        state: {
          idol: {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category || 'traditional',
            height: product.height || '',
            weight: product.weight || '',
            color: product.color || '',
            material: product.material || 'Eco-friendly Clay',
            estimatedDays: product.estimatedDays || 7,
            advancePercentage: product.advancePercentage || 25,
            images: product.images || [],
            videos: product.videos || [], // ENHANCED: Include videos
            description: product.description || '',
            customizable: product.customizable || true,
            availability: product.availability || 'available',
            features: product.features || [],
            imgUrl: product.images?.[0] || product.imgUrl || '',
          }
        }
      });
      return;
    }

    // Regular product add to cart logic
    try {
      const result = await addToCartSafe(user.uid, product.id, quantity);

      if (result.success) {
        if (result.action === 'added') {
          message.success(`${product.name} added to cart successfully!`);
        } else if (result.action === 'updated') {
          message.success(`Cart updated! Total quantity: ${result.newQuantity}`);
        }
      } else {
        message.error(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      message.error('Failed to add to cart');
      console.error('Error adding to cart:', error);
    }
  }, [user, navigate]);

  // MODIFIED: Show Interest handler - NO LOGIN CHECK
  const handleBuyNow = useCallback(async (product, quantity) => {
    console.log('⚡ Buy now:', { product: product.name, quantity });
    
    // Special handling for Ganesh idols - MODIFIED: NO LOGIN CHECK
    if (product.isGaneshIdol) {
      navigate('/ganesh-order-summary', {
        state: {
          idol: {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category || 'traditional',
            height: product.height || '',
            weight: product.weight || '',
            color: product.color || '',
            material: product.material || 'Eco-friendly Clay',
            estimatedDays: product.estimatedDays || 7,
            advancePercentage: product.advancePercentage || 25,
            images: product.images || [],
            videos: product.videos || [], // ENHANCED: Include videos
            description: product.description || '',
            customizable: product.customizable || true,
            availability: product.availability || 'available',
            features: product.features || [],
            imgUrl: product.images?.[0] || product.imgUrl || '',
          }
        }
      });
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    // Regular product buy now logic
    try {
      const result = await addToCartSafe(user.uid, product.id, quantity);

      if (result.success) {
        message.success(`${product.name} added to cart!`);
        setTimeout(() => {
          navigate('/cart');
        }, 1000);
      } else {
        message.error(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      message.error('Failed to add to cart');
      console.error('Error in Buy Now:', error);
    }
  }, [user, navigate]);

  const handleToggleWishlist = useCallback(async (product) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const result = await toggleWishlist(product);
    if (result.success) {
      message.success(result.message);
    } else {
      message.error(result.message);
    }
  }, [user, navigate, toggleWishlist]);

  // Loading state
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <div style={customStyles.container}>
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Title level={3} type="secondary">
            {error || 'Product not found'}
          </Title>
          <Button
            type="primary"
            size="large"
            onClick={handleBackToProducts}
            style={customStyles.primaryButton}
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={customStyles.container}>
      {/* ENHANCED: Smart Back Button with better UX */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBackToProducts}
        style={{
          ...customStyles.backButton,
          ':hover': {
            backgroundColor: `${colors.primary}08`,
            borderColor: colors.primaryDark,
            transform: 'translateX(-2px)',
          }
        }}
      >
        {hasSavedPosition() ? 'Back to Products' : 'Browse Products'}
      </Button>
      
      {/* Main Product Section */}
      <Row gutter={[24, 24]}>
        {/* ENHANCED: Image Gallery with Video Support - 60% width on desktop */}
        <Col xs={24} lg={14}>
          <ProductImageGallery
            images={product.images}
            videos={product.videos} // ENHANCED: Pass videos to gallery
            productName={product.name}
            defaultMediaType="mixed" // ENHANCED: Show mixed media by default
          />
        </Col>

        {/* Product Information - 40% width on desktop */}
        <Col xs={24} lg={10}>
          <ProductInfo
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={isInWishlist(product.id)}
          />
        </Col>
      </Row>

      {/* Service Features */}
      <ServiceFeatures product={product} />

      {/* Mobile Actions Bar */}
      {screens.xs && (
        <MobileActions
          product={product}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist(product.id)}
        />
      )}
    </div>
  );
};

export default ProductDetail;