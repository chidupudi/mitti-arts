// ProductDetail.jsx - Complete Professional Ant Design Version
import React, { 
  useEffect, 
  useState, 
  useMemo, 
  useCallback, 
  memo 
} from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Image,
  Typography,
  Button,
  Rate,
  Tag,
  Space,
  InputNumber,
  Tabs,
  List,
  Avatar,
  Divider,
  Modal,
  message,
  Skeleton,
  Breadcrumb,
  Badge,
  Grid,
  Affix,
  Spin,
  Alert,
  Tooltip,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  MinusOutlined,
  ShareAltOutlined,
  ReconciliationOutlined,
  TruckOutlined,
  UndoOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  StarFilled,
  ZoomInOutlined,
  HomeOutlined,
  AppstoreOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  FireOutlined,
  EnvironmentOutlined, // Added for location
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
  deleteDoc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
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
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    borderRadius: '8px',
    fontWeight: 600,
    height: '48px',
    fontSize: '16px',
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
  tabsContainer: {
    background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, ${colors.backgroundLight}20 100%)`,
    border: `1px solid ${colors.divider}`,
    borderRadius: '12px',
  },
};

// Custom hook for product data
const useProductData = (productId, code) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
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
            hyderabadOnly: data.hyderabadOnly || false, // Added hyderabadOnly property
          };
          setProduct(productData);
        } else if (code) {
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
              hyderabadOnly: data.hyderabadOnly || false, // Added hyderabadOnly property
            };
            setProduct(productData);
          } else {
            setError('Product not found');
          }
        } else {
          setError('Product not found');
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
          hyderabadOnly: product.hyderabadOnly || false, // Include hyderabadOnly property
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

// Image Gallery Component
const ImageGallery = memo(({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  const imageList = useMemo(() => {
    if (!images || images.length === 0) {
      return [`https://via.placeholder.com/500x500/${colors.primary.slice(1)}/FFFFFF?text=${encodeURIComponent(productName || 'Product')}`];
    }
    return images;
  }, [images, productName]);

  useEffect(() => {
    setSelectedImage(0);
  }, [imageList]);

  return (
    <Card style={customStyles.imageCard} bodyStyle={{ padding: '16px' }}>
      {/* Main Image */}
      <div style={{ 
        position: 'relative',
        marginBottom: '16px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#f8f9fa',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <Image
          src={imageList[selectedImage]}
          alt={productName}
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            padding: '10px',
          }}
          preview={false}
          onClick={() => setPreviewVisible(true)}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<ZoomInOutlined />}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: colors.primary,
            border: 'none',
          }}
          onClick={() => setPreviewVisible(true)}
        />
      </div>

      {/* Thumbnail Strip */}
      <div style={{ 
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px 0',
      }}>
        {imageList.map((image, index) => (
          <div
            key={index}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: selectedImage === index 
                ? `3px solid ${colors.primary}` 
                : `2px solid ${colors.divider}`,
              transition: 'all 0.3s ease',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
            }}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image}
              alt={`${productName} ${index + 1}`}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              preview={false}
            />
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <Image
        style={{ display: 'none' }}
        src={imageList[selectedImage]}
        preview={{
          visible: previewVisible,
          onVisibleChange: setPreviewVisible,
          src: imageList[selectedImage],
        }}
      />
    </Card>
  );
});

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
const ProductInfo = memo(({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const screens = useBreakpoint();

  const { originalPrice, discount } = useMemo(() => {
    let discountRate = 0;
    if (product.price >= 1000) discountRate = 0.25;
    else if (product.price >= 500) discountRate = 0.20;
    else discountRate = 0.15;
    
    const original = Math.ceil(product.price / (1 - discountRate));
    const discountPercent = Math.round(((original - product.price) / original) * 100);
    
    return { originalPrice: original, discount: discountPercent };
  }, [product.price]);

  const stockStatus = useMemo(() => {
    if (product.stock === 0) return { status: 'error', icon: <WarningOutlined />, text: 'Out of Stock', color: colors.error };
    if (product.stock <= 5) return { status: 'error', icon: <WarningOutlined />, text: `Only ${product.stock} left!`, color: colors.error };
    if (product.stock <= 10) return { status: 'warning', icon: <InfoCircleOutlined />, text: 'Few items left', color: colors.warning };
    return { status: 'success', icon: <CheckCircleOutlined />, text: 'In Stock', color: colors.success };
  }, [product.stock]);

  return (
    <Card style={customStyles.productInfoCard} bodyStyle={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '16px' }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined /> Home
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/products">
          <AppstoreOutlined /> Products
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {product.name}
          {product.hyderabadOnly && (
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
        
        {product.hyderabadOnly && (
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
          style={{ color: colors.primary }}
        />
        <Text type="secondary">
          {product.rating} ({product.reviews} reviews)
        </Text>
        <Tag color={colors.primary} style={{ fontWeight: 600 }}>
          {product.code}
        </Tag>
      </Space>

      {/* Price Section */}
      <div style={{...customStyles.priceContainer, marginBottom: '20px'}}>
        <Space wrap align="baseline" style={{ marginBottom: '8px' }}>
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
        </Space>
        <Text type="secondary">
          Inclusive of all taxes • 
          {product.hyderabadOnly 
            ? ' Available for delivery in Hyderabad only' 
            : ' Free shipping above ₹500'}
        </Text>
      </div>

      {/* Stock Status */}
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

      {/* Hyderabad-only Alert */}
      {product.hyderabadOnly && (
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
          {product.description || 'Premium quality product crafted with attention to detail using traditional methods. Each piece is carefully made to ensure durability and aesthetic appeal.'}
        </Paragraph>
      </div>

      {/* Desktop Actions */}
      {!screens.xs && product.stock > 0 && (
        <>
          {/* Quantity Selector */}
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

          {/* Action Buttons */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={() => onAddToCart(product, quantity)}
                disabled={product.stock === 0}
                style={customStyles.primaryButton}
                block
              >
                Add to Cart
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
            
            <Button
              size="large"
              style={customStyles.secondaryButton}
              block
            >
              Buy Now
            </Button>
          </Space>
        </>
      )}

      {/* Key Features */}
      <Divider />
      <Title level={4} style={{ color: colors.text }}>Key Features</Title>
      <List
        size="small"
        dataSource={[
          '100% authentic materials',
          'Handcrafted by skilled artisans',
          'Eco-friendly and sustainable',
          'Premium quality guarantee',
          ...(product.hyderabadOnly ? ['Available for delivery in Hyderabad only'] : []),
        ]}
        renderItem={item => (
          <List.Item>
            <CheckCircleOutlined style={{ color: colors.success, marginRight: '8px' }} />
            {item}
          </List.Item>
        )}
      />
    </Card>
  );
});

// Mobile Actions Component
const MobileActions = memo(({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    setModalVisible(true);
  };

  const confirmAddToCart = () => {
    onAddToCart(product, quantity);
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
          {/* Hyderabad-Only Badge - Visible on mobile bottom bar */}
          {product.hyderabadOnly && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#9C27B0',
              marginBottom: '8px',
            }}>
              <EnvironmentOutlined />
              <Text style={{ fontSize: '12px', color: '#9C27B0' }}>
                Hyderabad Only Delivery
              </Text>
            </div>
          )}
          
          <Space size="middle" style={{ width: '100%' }}>
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
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                ...customStyles.primaryButton,
                flex: 1,
              }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Space>
        </div>
      </Affix>

      {/* Quantity Modal */}
      <Modal
        title="Select Quantity"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={confirmAddToCart}
            style={customStyles.primaryButton}
          >
            Add to Cart
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
                <Text type="secondary">Code: {product.code}</Text>
                {product.hyderabadOnly && (
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
              <Title level={4} style={{ margin: 0, color: colors.primary }}>
                ₹{product.price.toLocaleString()}
              </Title>
            </div>
          </Space>

          <div style={{ textAlign: 'center' }}>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={product.stock}
            />
          </div>

          {/* Hyderabad-Only delivery info */}
          <div style={{ 
            background: product.hyderabadOnly ? '#9C27B010' : 'inherit',
            padding: product.hyderabadOnly ? '12px' : '0',
            borderRadius: '8px',
            marginTop: product.hyderabadOnly ? '16px' : '0',
            display: product.hyderabadOnly ? 'flex' : 'none',
            alignItems: 'center',
            gap: '8px',
          }}>
            {product.hyderabadOnly && (
              <>
                <EnvironmentOutlined style={{ color: '#9C27B0' }} />
                <Text type="secondary" style={{ color: '#9C27B0' }}>
                  This product is available for delivery only within Hyderabad city limits.
                </Text>
              </>
            )}
          </div>

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
        </Space>
      </Modal>
    </>
  );
});
// Service Features Component
const ServiceFeatures = memo(({ product }) => {
  const features = [
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
              ...(index === 0 && product?.hyderabadOnly ? {
                borderColor: '#9C27B030',
                backgroundColor: '#9C27B008',
              } : {})
            }}
            bodyStyle={{ textAlign: 'center', padding: '32px 16px' }}
            hoverable
          >
            {feature.icon}
            <Title level={4} style={{ 
              marginTop: '16px', 
              marginBottom: '8px', 
              color: index === 0 && product?.hyderabadOnly ? '#9C27B0' : colors.text 
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
// Product Tabs Component
const ProductTabs = memo(({ product }) => {
  const specifications = [
    { label: 'Material', value: product?.material || 'Premium Natural Clay' },
    { label: 'Dimensions', value: product?.dimensions || 'Standard Size' },
    { label: 'Weight', value: product?.weight || 'Standard Weight' },
    { label: 'Color', value: product?.color || 'Natural Terracotta' },
    { label: 'Origin', value: 'Handmade in India' },
    { label: 'Care', value: 'Hand wash recommended' },
   
  ];

  const reviews = [
    {
      name: 'Priya Sharma',
      rating: 5,
      date: '2 weeks ago',
      review: 'Absolutely love this product! The quality is exceptional and it looks beautiful in my kitchen. Highly recommended!',
    },
    {
      name: 'Rajesh Kumar',
      rating: 4,
      date: '1 month ago',
      review: 'Good quality product. Fast delivery and well packaged. Worth the price.',
    },
    {
      name: 'Anita Patel',
      rating: 5,
      date: '2 months ago',
      review: 'Traditional craftsmanship at its finest. The attention to detail is remarkable.',
    },
  ];

  const whyClayPots = [
    {
      title: 'Amazing Flavor',
      description: 'Locks in moisture and aromas for incredibly delicious, never-dry food.',
      icon: <FireOutlined style={{ color: '#D2691E' }} />,
    },
    {
      title: 'Naturally Healthy',
      description: 'Cooks with less oil, preserves nutrients, and balances food pH.',
      icon: <HeartOutlined style={{ color: '#D2691E' }} />,
    },
    {
      title: 'Eco-Friendly & Efficient',
      description: 'Sustainable choice that saves energy and lasts for years.',
      icon: <ReconciliationOutlined style={{ color: '#D2691E' }} />,
    },
    {
      title: 'Mindful Cooking',
      description: 'Connects you to ancient traditions and encourages slow, wholesome meals.',
      icon: <ClockCircleOutlined style={{ color: '#D2691E' }} />,
    },
  ];

  const cleaningSteps = [
    {
      title: 'Rinse & Soak',
      content: 'After cooking, let your pot cool completely. Scrape out any food residue. Then, rinse it thoroughly with plain water. For stuck-on bits, you can soak it in water for 15-20 minutes to loosen them.'
    },
    {
      title: 'Choose Your Natural Scrubber',
      content: (
        <>
          <Paragraph><strong>Coconut Scrubber:</strong> This is your best friend! A natural coconut fiber scrubber is gentle yet effective. It cleans without scratching and actually helps to keep the pot's surface smooth over time.</Paragraph>
          <Paragraph><strong>Avoid:</strong> Metal scrubbers or harsh abrasive pads – these can damage the clay.</Paragraph>
        </>
      )
    },
    {
      title: 'Your Natural Cleaning Powder Powerhouses',
      content: (
        <>
          <Paragraph><strong>Rice Flour or Gram Flour (Besan):</strong> These are fantastic everyday cleaners! Simply sprinkle a generous amount onto the wet pot and scrub gently with your coconut scrubber. They absorb oils and residue beautifully.</Paragraph>
          <Paragraph><strong>Baking Soda:</strong> For a deeper clean or tougher spots, baking soda is excellent. Make a paste with a little water and scrub. It's great for neutralizing odors too!</Paragraph>
          <Paragraph><strong>Ash Powder (The Traditional Secret!):</strong> If you have access to clean wood ash (like from a bonfire or wood-burning stove), it's truly the best! Ash is a natural abrasive and degreaser. Sprinkle it on, scrub, and watch your pot sparkle!</Paragraph>
        </>
      )
    },
    {
      title: 'Rinse Thoroughly',
      content: 'After scrubbing, rinse your pot very thoroughly under running water. Make sure no cleaning powder residue remains.'
    }
  ];

  const mouldSteps = [
    'Scrub with a Coconut Scrubber: Give the mouldy areas a good scrub with your natural coconut scrubber.',
    'Baking Soda Power: Make a paste with baking soda and water and scrub the mouldy spots vigorously. The baking soda will help lift the mould and neutralize any odors.',
    'Sunlight (Nature\'s Sterilizer): After cleaning, let your pot dry completely in direct sunlight for a few hours. Sunlight is a natural disinfectant and will help kill any remaining mould spores.'
  ];

  const storingSteps = [
    'Air Dry Completely: This is crucial! Always let your clay pot air dry completely before storing it. Never store it damp, as this can lead to mould growth.',
    'Good Airflow: Store your pot in a well-ventilated area. You can even leave the lid slightly ajar if storing with the lid on, to ensure airflow.'
  ];

  return (
    <Card style={{ ...customStyles.tabsContainer, marginTop: '48px' }}>
      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="Description" key="1">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Product Description</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
              {product.description || `The ${product.name} represents the perfect blend of traditional craftsmanship and modern design. Each piece is carefully handcrafted by skilled artisans who have perfected their techniques over generations.`}
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '16px' }}>
              Made from premium quality materials, this product ensures durability while maintaining aesthetic appeal. The natural variations in color and texture make each piece unique, adding character to your collection.
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Whether you're looking to enhance your daily routine or searching for the perfect gift, this product combines functionality with timeless beauty that will be appreciated for years to come.
            </Paragraph>
            
            {/* Why Choose Clay Pots Section */}
            <Title level={3} style={{ color: colors.text, marginTop: '32px', marginBottom: '24px' }}>
              Why Choose Clay Pots?
            </Title>
            
            <Row gutter={[24, 24]}>
              {whyClayPots.map((benefit, index) => (
                <Col xs={24} md={12} key={index}>
                  <Card 
                    style={{ 
                      borderRadius: '12px', 
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(210, 105, 30, 0.08)'
                    }}
                  >
                    <Space align="start">
                      <Avatar
                        style={{ 
                          backgroundColor: 'rgba(210, 105, 30, 0.1)', 
                          color: '#D2691E',
                        }}
                        icon={benefit.icon}
                        size={48}
                      />
                      <div>
                        <Text strong style={{ fontSize: 18, color: '#A0522D', display: 'block' }}>
                          {benefit.title}
                        </Text>
                        <Text style={{ fontSize: 15 }}>
                          {benefit.description}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* Add Hyderabad-only information in description if applicable */}
            {product.hyderabadOnly && (
              <Alert
                message="Delivery Information"
                description="This product is available for delivery only within Hyderabad city limits. Please ensure your shipping address is within Hyderabad before placing an order."
                type="info"
                icon={<EnvironmentOutlined />}
                showIcon
                style={{
                  marginTop: '24px',
                  borderRadius: '8px',
                  backgroundColor: '#9C27B010',
                  border: '1px solid #9C27B030',
                  color: '#9C27B0',
                }}
              />
            )}
          </div>
        </TabPane>

        <TabPane tab="Specifications" key="2">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Product Specifications</Title>
            <Row gutter={[16, 16]}>
              {specifications.map((spec, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    size="small"
                    style={{
                      border: `1px solid ${spec.label === 'Delivery' && product.hyderabadOnly ? '#9C27B030' : colors.divider}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      backgroundColor: spec.label === 'Delivery' && product.hyderabadOnly ? '#9C27B008' : 'inherit',
                    }}
                    bodyStyle={{ padding: '16px' }}
                    hoverable
                  >
                    <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                      {spec.label}
                    </Text>
                    <Text strong>{spec.value}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </TabPane>

        <TabPane tab="Reviews" key="3">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text }}>Customer Reviews</Title>
            
            {/* Review Summary */}
            <Card
              style={{
                background: `${colors.primary}08`,
                border: `1px solid ${colors.primary}20`,
                borderRadius: '12px',
                marginBottom: '24px',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Title level={1} style={{ margin: 0, color: colors.primary, fontSize: '48px' }}>
                    {product.rating}
                  </Title>
                  <Rate
                    value={product.rating}
                    allowHalf
                    disabled
                    style={{ color: colors.primary, marginBottom: '8px' }}
                  />
                  <Text type="secondary">Based on {product.reviews} reviews</Text>
                </Col>
                
                <Col xs={24} sm={16}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = Math.random() * 80 + 10;
                    const count = Math.floor(Math.random() * 50 + 10);
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <Text style={{ minWidth: '20px' }}>{stars}</Text>
                        <StarFilled style={{ fontSize: '16px', color: colors.primary, margin: '0 8px' }} />
                        <Progress
                          percent={percentage}
                          size="small"
                          strokeColor={colors.primary}
                          style={{ flex: 1, margin: '0 8px' }}
                          showInfo={false}
                        />
                        <Text type="secondary" style={{ minWidth: '30px' }}>{count}</Text>
                      </div>
                    );
                  })}
                </Col>
              </Row>
            </Card>

            {/* Individual Reviews */}
            <List
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item>
                  <Card
                    style={{
                      width: '100%',
                      border: `1px solid ${colors.divider}`,
                      borderRadius: '8px',
                      marginBottom: '16px',
                    }}
                    bodyStyle={{ padding: '20px' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={50}
                          style={{ backgroundColor: colors.primary, fontSize: '18px', fontWeight: 600 }}
                        >
                          {review.name.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Space direction="vertical" size={4}>
                          <Text strong style={{ fontSize: '16px' }}>{review.name}</Text>
                          <Space>
                            <Rate
                              value={review.rating}
                              disabled
                              size="small"
                              style={{ color: colors.primary }}
                            />
                            <Text type="secondary">{review.date}</Text>
                          </Space>
                        </Space>
                      }
                      description={
                        <Paragraph style={{ marginTop: '12px', fontSize: '15px', lineHeight: '1.6' }}>
                          {review.review}
                        </Paragraph>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />

            <Button
              type="default"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: '8px',
                fontWeight: 600,
                height: '40px',
              }}
            >
              Write a Review
            </Button>
          </div>
        </TabPane>

        <TabPane tab="Care Guide" key="4">
          <div style={{ padding: '24px' }}>
            <Title level={3} style={{ color: colors.text, marginBottom: '24px', textAlign: 'center' }}>
              Caring for Your Clay Pot: Simple Steps for Years of Delicious Meals!
            </Title>
            
            {/* No Soap Warning */}
            <Alert
              message="Important Note: No Soap! 🚫"
              description="Clay is porous, meaning it can absorb liquids – including dish soap! Using soap will make your food taste like soap, and nobody wants that! We'll stick to natural cleaners to keep your pot pure."
              type="warning"
              showIcon
              style={{ 
                marginBottom: '32px',
                borderRadius: '8px',
              }}
            />
            
            <Title level={4} style={{ color: '#D2691E', marginBottom: '24px' }}>
              Cleaning Your Clay Pot: Easy & Natural!
            </Title>
            
            <List
              itemLayout="vertical"
              dataSource={cleaningSteps}
              style={{ 
                marginBottom: '32px', 
                border: '1px solid #E8D5C4',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              renderItem={(item, index) => (
                <List.Item style={{ padding: '16px', borderBottom: index < cleaningSteps.length - 1 ? '1px solid #E8D5C4' : 'none' }}>
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Space align="center">
                      <Avatar style={{ backgroundColor: '#D2691E', color: 'white' }}>{index + 1}</Avatar>
                      <Text strong style={{ fontSize: '17px' }}>{item.title}</Text>
                    </Space>
                    <div style={{ marginLeft: '40px' }}>
                      {item.content}
                    </div>
                  </Space>
                </List.Item>
              )}
            />

            {/* Dealing with Mould Section */}
            <Card
              style={{
                marginBottom: '24px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 69, 19, 0.05)',
                border: '1px solid rgba(139, 69, 19, 0.1)',
              }}
            >
              <Title level={4} style={{ color: '#D2691E' }}>
                Dealing with Mould (It Happens!)
              </Title>
              <Paragraph>
                If you notice any mould (usually from storing a damp pot), don't worry! It's easy to fix:
              </Paragraph>
              <List
                dataSource={mouldSteps}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ color: '#D2691E' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            {/* Drying & Storing Section */}
            <Card 
              style={{ 
                marginBottom: '24px',
                borderRadius: '8px',
                backgroundColor: 'rgba(210, 105, 30, 0.05)',
                border: '1px solid rgba(210, 105, 30, 0.1)',
              }}
            >
              <Title level={4} style={{ color: '#D2691E' }}>
                Drying & Storing Your Pot
              </Title>
              <List
                dataSource={storingSteps}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                    <Space align="start">
                      <CheckCircleOutlined style={{ color: '#D2691E' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            <Alert
              message="Important Notes"
              description={
                <div style={{ marginTop: '8px' }}>
                  <p style={{ margin: '4px 0' }}>• This is a handcrafted product, so slight variations in size, color, and texture are natural and add to its unique charm.</p>
                  <p style={{ margin: '4px 0' }}>• Avoid using in microwave or dishwasher</p>
                  <p style={{ margin: '4px 0' }}>• For first use, rinse with water and let it air dry completely.</p>
                  <p style={{ margin: '4px 0' }}>• Contact our support team if you have any questions about care and maintenance.</p>
                </div>
              }
              type="warning"
              showIcon
              style={{
                marginTop: '24px',
                borderRadius: '8px',
                backgroundColor: `${colors.warning}10`,
                border: `1px solid ${colors.warning}30`,
              }}
            />
            
            {/* Add Hyderabad-only delivery info */}
            {product.hyderabadOnly && (
              <Alert
                message="Delivery Information"
                description="This product is available for delivery only within Hyderabad city limits. Please ensure your delivery address is within Hyderabad before placing an order."
                type="info"
                icon={<EnvironmentOutlined />}
                showIcon
                style={{
                  marginTop: '24px',
                  borderRadius: '8px',
                  backgroundColor: '#9C27B010',
                  border: '1px solid #9C27B030',
                  color: '#9C27B0',
                }}
              />
            )}
            
            <Paragraph style={{ marginTop: '24px', textAlign: 'center', fontStyle: 'italic' }}>
              By following these simple, natural cleaning methods, your clay pot will remain a cherished and effective cooking companion for many years to come! Enjoy healthier, more flavorful meals with ease.
            </Paragraph>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
});

// Loading Skeleton Component
const ProductDetailSkeleton = () => (
  <div style={customStyles.container}>
    <Skeleton.Button size="large" style={{ marginBottom: '24px' }} />
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <Card style={customStyles.imageCard}>
          <Skeleton.Image style={{ width: '100%', height: '500px' }} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton.Image key={i} style={{ width: '80px', height: '80px' }} />
            ))}
          </div>
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card style={customStyles.productInfoCard}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
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

  const handleAddToCart = useCallback(async (product, quantity) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imgUrl: product.images?.[0] || product.imgUrl,
        code: product.code,
        addedAt: new Date().toISOString(),
        hyderabadOnly: product.hyderabadOnly || false, // Include hyderabadOnly property
      });
      
      message.success(`${product.name} added to cart successfully!`);
    } catch (error) {
      message.error('Failed to add to cart');
      console.error('Error adding to cart:', error);
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

  if (loading) {
    return <ProductDetailSkeleton />;
  }

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
        Back to Products
      </Button>

      {/* Main Product Section */}
      <Row gutter={[24, 24]}>
        {/* Image Gallery - 60% width on desktop */}
        <Col xs={24} lg={14}>
          <ImageGallery
            images={product.images}
            productName={product.name}
          />
        </Col>

        {/* Product Information - 40% width on desktop */}
        <Col xs={24} lg={10}>
          <ProductInfo
            product={product}
            onAddToCart={handleAddToCart}
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
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist(product.id)}
        />
      )}
    </div>
  );
};

export default ProductDetail;