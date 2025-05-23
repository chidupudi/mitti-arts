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
  TruckOutlined,
  UndoOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  StarFilled,
  ZoomInOutlined,
  HomeOutlined,
  AppstoreOutlined,
  WarningOutlined,
  InfoCircleOutlined,
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
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Product Title */}
      <Title level={2} style={{ 
        marginBottom: '16px', 
        color: colors.text,
        fontSize: screens.xs ? '24px' : '32px',
      }}>
        {product.name}
      </Title>

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
        <Text type="secondary">Inclusive of all taxes • Free shipping above ₹500</Text>
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
const ServiceFeatures = memo(() => {
  const features = [
    {
      icon: <TruckOutlined style={{ fontSize: '40px', color: colors.primary }} />,
      title: 'Free Shipping',
      description: 'Free delivery on orders above ₹500',
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
            style={customStyles.featureCard}
            bodyStyle={{ textAlign: 'center', padding: '32px 16px' }}
            hoverable
          >
            {feature.icon}
            <Title level={4} style={{ marginTop: '16px', marginBottom: '8px', color: colors.text }}>
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
    { label: 'Material', value: 'Premium Natural Clay' },
    { label: 'Dimensions', value: '10" x 10" x 1.5"' },
    { label: 'Weight', value: '0.8 kg' },
    { label: 'Color', value: 'Natural Terracotta' },
    { label: 'Origin', value: 'Handmade in India' },
    { label: 'Care', value: 'Hand wash recommended' },
    { label: 'Warranty', value: '6 months manufacturing defect' },
    { label: 'Certification', value: 'Food grade safe' },
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

  const careInstructions = {
    daily: [
      'Hand wash with mild soap and warm water',
      'Avoid harsh chemicals or abrasive cleaners',
      'Dry thoroughly after washing',
      'Store in a cool, dry place',
    ],
    longTerm: [
      'Season periodically with natural oils',
      'Avoid extreme temperature changes',
      'Handle with care to prevent chipping',
      'Polish occasionally with soft cloth',
    ],
  };

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
                      border: `1px solid ${colors.divider}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
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
            <Title level={3} style={{ color: colors.text }}>Care Instructions</Title>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title={<Text strong style={{ color: colors.primary, fontSize: '18px' }}>Daily Care</Text>}
                  style={{
                    border: `1px solid ${colors.divider}`,
                    borderRadius: '12px',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <List
                    size="small"
                    dataSource={careInstructions.daily}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: colors.success, marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card
                  title={<Text strong style={{ color: colors.primary, fontSize: '18px' }}>Long-term Maintenance</Text>}
                  style={{
                    border: `1px solid ${colors.divider}`,
                    borderRadius: '12px',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <List
                    size="small"
                    dataSource={careInstructions.longTerm}
                    renderItem={item => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: colors.success, marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Alert
              message="Important Notes"
              description={
                <div style={{ marginTop: '8px' }}>
                  <p style={{ margin: '4px 0' }}>• This is a handcrafted product, so slight variations in size, color, and texture are natural and add to its unique charm.</p>
                  <p style={{ margin: '4px 0' }}>• Avoid using in microwave or dishwasher unless specifically mentioned as microwave/dishwasher safe.</p>
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
      <ServiceFeatures />

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