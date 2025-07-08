// ProductDetail.jsx - Enhanced Main Component with Ganesh Idol Support
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

// Import helper components
import ProductImageGallery from './ProductImageGallery';
import ProductInfo, { MobileActions, ServiceFeatures } from './ProductInfoSection';
import ProductTabs from './ProductTabs';

// Import the FIXED cart utilities
import { addToCartSafe } from '../utils/cartUtility';

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
};

// ENHANCED Custom hook for product data - NOW SUPPORTS GANESH IDOLS
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
            // FIXED CODE:
            const idolData = {
              id: docSnap.id,
              ...data,
              // Convert Ganesh idol data to product-like structure
              price: Number(data.price) || 15000,
              originalPrice: null, // No original price for Ganesh idols
              discount: 0, // No discount for custom made idols
              stock: 999, // Ganesh idols are custom made
              rating: Number(data.rating) || 4.5,
              reviews: Number(data.reviews) || 28,
              images: Array.isArray(data.images) ? data.images : [],
              hyderabadOnly: false, // Ganesh idols can be shipped anywhere
              isGaneshIdol: true, // Flag to identify this as a Ganesh idol
              estimatedDays: Number(data.estimatedDays) || 7,
              advancePercentage: Number(data.advancePercentage) || 25,
            };
            setProduct(idolData);
          } else {
            setError('Ganesh idol not found');
          }
        } else {
          // Regular product logic (existing code)
          docRef = doc(db, 'products', productId);
          docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const productData = {
              id: docSnap.id,
              ...data,
              price: Number(data.price) || 0,
              stock: Number(data.stock) || 0,
              rating: Number(data.rating) || 4.2,
              reviews: Number(data.reviews) || 156,
              images: Array.isArray(data.images) ? data.images : data.imgUrl ? [data.imgUrl] : [],
              hyderabadOnly: data.hyderabadOnly || false,
              isGaneshIdol: false,
            };
            setProduct(productData);
          } else if (code) {
            // Try finding by code (existing logic)
            const productsRef = collection(db, 'products');
            const querySnapshot = await getDocs(query(productsRef, where('code', '==', code)));

            if (!querySnapshot.empty) {
              const data = querySnapshot.docs[0].data();
              const productData = {
                id: querySnapshot.docs[0].id,
                ...data,
                price: Number(data.price) || 0,
                stock: Number(data.stock) || 0,
                rating: Number(data.rating) || 4.2,
                reviews: Number(data.reviews) || 156,
                images: Array.isArray(data.images) ? data.images : data.imgUrl ? [data.imgUrl] : [],
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

// Custom hook for wishlist
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

// Loading Skeleton Component
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

// Main ProductDetail Component
const ProductDetail = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();

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

  // NEW: Updated handleAddToCart function
  const handleAddToCart = useCallback(async (product, quantity) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Special handling for Ganesh idols - Navigate to order summary instead
    if (product.isGaneshIdol) {
      // Navigate to Ganesh order summary page with idol data
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

    // Regular product add to cart logic (existing code)
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

  // NEW: Updated handleBuyNow function
  const handleBuyNow = useCallback(async (product, quantity) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Special handling for Ganesh idols - Navigate to order summary (same as Add to Cart)
    if (product.isGaneshIdol) {
      // Navigate to Ganesh order summary page with idol data
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

    // Regular product buy now logic (existing code)
    try {
      const result = await addToCartSafe(user.uid, product.id, quantity);

      if (result.success) {
        message.success(`${product.name} added to cart!`);

        // Navigate to cart page after a short delay
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
            onClick={() => navigate('/products')}
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
      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '24px',
          color: colors.primary,
          borderColor: colors.primary,
          fontWeight: 600,
          borderRadius: '8px',
          height: '40px',
        }}
      >
        {product.isGaneshIdol ? 'Back to Ganesh Collection' : 'Back to Products'}
      </Button>

      {/* Main Product Section */}
      <Row gutter={[24, 24]}>
        {/* Image Gallery - 60% width on desktop */}
        <Col xs={24} lg={14}>
          <ProductImageGallery
            images={product.images}
            productName={product.name}
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

      {/* Product Details Tabs */}
      <ProductTabs product={product} />

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