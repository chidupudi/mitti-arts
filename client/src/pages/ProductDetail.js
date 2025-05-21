import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Button,
  Typography,
  Image,
  Divider,
  Rate,
  Tag,
  Card,
  Tabs,
  List,
  Avatar,
  InputNumber,
  Modal,
  Skeleton,
  message,
  Space,
  Badge,
  Grid
} from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
  CheckOutlined,
  TruckOutlined,
  UndoOutlined,
  SecurityScanOutlined,
  StarFilled,
  MinusOutlined,  // Add this
  PlusOutlined    // Add this
} from '@ant-design/icons';
import { auth, db } from '../Firebase/Firebase';
import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  doc 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const colors = {
  terracotta: '#E07A5F',  // warm terracotta
  sage: '#81B29A'         // complementary sage green
};

const ProductDetail = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  
  const code = new URLSearchParams(search).get('code');
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [user, setUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // Add this with other state declarations
  const screens = useBreakpoint();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = {
            id: docSnap.id,
            ...docSnap.data(),
            price: Number(docSnap.data().price),
            stock: Number(docSnap.data().stock) || 0
          };
          
          setProduct(productData);
          if (productData.images?.length) {
            setSelectedImage(productData.images[0]);
          }
        } else {
          // If product not found by ID, try searching by code
          const productsRef = collection(db, 'products');
          const querySnapshot = await getDocs(query(productsRef, where('code', '==', code)));
          
          if (!querySnapshot.empty) {
            const productData = {
              id: querySnapshot.docs[0].id,
              ...querySnapshot.docs[0].data(),
              price: Number(querySnapshot.docs[0].data().price),
              stock: Number(querySnapshot.docs[0].data().stock) || 0
            };
            setProduct(productData);
            if (productData.images?.length) {
              setSelectedImage(productData.images[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, code]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const showModal = () => {
    if (!user) {
      navigate('/auth');
    } else {
      setVisible(true);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0] || product.imgUrl,
        code: product.code
      });
      setAddedToCart(true);
      message.success('Added to cart successfully!');
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      message.error('Failed to add to cart');
      console.error('Error adding to cart:', error);
    }
    setVisible(false);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Skeleton.Image active style={{ width: '100%', height: 400 }} />
            <div style={{ display: 'flex', marginTop: 16, gap: 8 }}>
              {[1, 2, 3, 4].map((item) => (
                <Skeleton.Image key={item} active style={{ width: 80, height: 80 }} />
              ))}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active paragraph={{ rows: 4 }} />
            <Skeleton.Button active size="large" style={{ marginRight: 16 }} />
            <Skeleton.Button active size="large" />
          </Col>
        </Row>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <Text type="secondary">Product not found</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Back button */}
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        Back
      </Button>

      {/* Main product section */}
      <Row gutter={[32, 32]}>  {/* Increased gap between columns */}
        {/* Image gallery - Left side */}
        <Col xs={24} lg={10}>  {/* Changed from md={8} to lg={10} */}
          <Card
            hoverable
            bodyStyle={{ padding: 12 }}
            style={{ overflow: 'hidden' }}
            cover={
              <div style={{ 
                padding: 16,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 400,  /* Fixed height */
                overflow: 'hidden'  /* Prevent overflow */
              }}>
                <Image
                  src={selectedImage || product.imgUrl || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  preview={false}
                  style={{ 
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    padding: '10px'
                  }}
                />
              </div>
            }
          >
            <div style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: 8,
              padding: '8px 0',
              scrollbarWidth: 'none',  /* Hide scrollbar for Firefox */
              msOverflowStyle: 'none',  /* Hide scrollbar for IE/Edge */
              '&::-webkit-scrollbar': { display: 'none' }  /* Hide scrollbar for Chrome/Safari */
            }}>
              {(product.images || [product.imgUrl]).map((img, i) => (
                <Badge key={i} dot={selectedImage === img} color="#1890ff">
                  <Image
                    src={img}
                    alt={`thumb-${i}`}
                    preview={false}
                    width={60}
                    height={60}
                    style={{ 
                      cursor: 'pointer',
                      border: selectedImage === img ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      borderRadius: 4,
                      objectFit: 'cover'
                    }}
                    onClick={() => setSelectedImage(img)}
                  />
                </Badge>
              ))}
            </div>
          </Card>
        </Col>

        {/* Product info - Middle */}
        <Col xs={24} lg={9}>
          <div style={{ height: '100%' }}>
            <Title level={3} style={{ marginBottom: 8 }}>{product.name}</Title>
            
            <Space size="middle" style={{ marginBottom: 16 }}>
              <Rate value={4.2} allowHalf character={<StarFilled />} disabled />
              <Text type="secondary">4.2 (201 reviews)</Text>
            </Space>

            <Tag color="blue" style={{ marginBottom: 16 }}>{product.code}</Tag>

            {/* Price section */}
            <Space direction="vertical" size="small" style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>₹{product.price}</Title>
              <Space>
                <Text delete type="secondary">₹506.00</Text>
                <Text type="success">31% OFF</Text>
              </Space>
            </Space>

            {/* Mobile-only actions */}
            {!screens.lg && (
              <>
                <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="middle">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={showModal}
                    block
                    style={{ 
                      height: '45px',
                      backgroundColor: colors.sage,
                      borderColor: colors.sage
                    }}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    size="large" 
                    block
                    style={{ 
                      height: '45px',
                      backgroundColor: colors.terracotta,
                      borderColor: colors.terracotta,
                      color: 'white'
                    }}
                  >
                    Buy Now
                  </Button>
                </Space>

                <Divider style={{ margin: '16px 0' }} />

                {/* Mobile-only features list */}
                <List
                  size="small"
                  style={{ marginBottom: 24 }}
                  dataSource={[
                    '100% natural clay',
                    'Handcrafted by artisans',
                    'Enhances food flavor',
                    'Biodegradable and sustainable'
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />
              </>
            )}

            {/* Description section */}
            <div style={{ position: 'relative' }}>
              <Paragraph
                style={{
                  marginBottom: 16,
                  overflow: 'hidden',
                  maxHeight: isDescriptionExpanded ? 'none' : '80px', // About 4 lines of text
                  position: 'relative',
                  transition: 'max-height 0.3s ease-out',
                }}
              >
                {product.description || 'No description available.'}
              </Paragraph>
              
              {/* Show gradient fade effect when collapsed */}
              {!isDescriptionExpanded && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
                    pointerEvents: 'none',
                  }}
                />
              )}
              
              {/* Show More/Less Button */}
              <Button
                type="link"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                style={{
                  padding: 0,
                  height: 'auto',
                  marginTop: -8,
                  marginBottom: 16,
                }}
              >
                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </div>

            {/* Desktop-only features list */}
            {screens.lg && (
              <List
                size="small"
                dataSource={[
                  '100% natural clay',
                  'Handcrafted by artisans',
                  'Enhances food flavor',
                  'Biodegradable and sustainable'
                ]}
                renderItem={item => (
                  <List.Item>
                    <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            )}
          </div>
        </Col>

        {/* Actions and Delivery - Right side */}
        <Col xs={24} lg={5} style={{ display: screens.lg ? 'block' : 'none' }}>
          <Card bodyStyle={{ padding: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Title level={5} style={{ marginBottom: 12 }}>Quantity</Title>
                <Space style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    icon={<MinusOutlined />} 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  />
                  <InputNumber 
                    min={1} 
                    value={quantity} 
                    onChange={value => setQuantity(value || 1)}
                    style={{ width: 60 }}
                  />
                  <Button 
                    icon={<PlusOutlined />} 
                    onClick={() => setQuantity(quantity + 1)}
                  />
                </Space>
              </div>

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={showModal}
                  block
                  style={{ 
                    height: '45px',
                    backgroundColor: colors.sage,
                    borderColor: colors.sage
                  }}
                >
                  Add to Cart
                </Button>
                <Button 
                  size="large" 
                  block
                  style={{ 
                    height: '45px',
                    backgroundColor: colors.terracotta,
                    borderColor: colors.terracotta,
                    color: 'white'
                  }}
                >
                  Buy Now
                </Button>
              </Space>

              <Divider style={{ margin: '12px 0' }} />

              <List itemLayout="horizontal" split={false}>
                <List.Item>
                  <List.Item.Meta
                    avatar={<TruckOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
                    title="Free Delivery"
                    description="Orders over ₹500"
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    avatar={<UndoOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
                    title="Easy Returns"
                    description="30 day return policy"
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    avatar={<SecurityScanOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
                    title="Secure Checkout"
                    description="100% secure payment"
                  />
                </List.Item>
              </List>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Product details tabs */}
      <Card style={{ marginTop: 24 }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Description" key="1">
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: isDescriptionExpanded ? 'none' : '100px',
                  transition: 'max-height 0.3s ease-out',
                }}
              >
                <Paragraph>
                  The {product.name} is a premium product designed for those who appreciate traditional craftsmanship and sustainable living.
                </Paragraph>
                <Paragraph>
                  Each plate carries a unique rustic charm that enhances your dining experience. The natural clay material adds an earthy essence to your food.
                </Paragraph>
              </div>
              
              {!isDescriptionExpanded && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
                    pointerEvents: 'none',
                  }}
                />
              )}
              
              <Button
                type="link"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                style={{
                  padding: 0,
                  height: 'auto',
                  marginTop: 8,
                }}
              >
                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
              </Button>
            </div>
          </TabPane>
          <TabPane tab="Product Details" key="2">
            <Title level={5} style={{ marginBottom: 16 }}>Product Specifications</Title>
            <Row gutter={[16, 16]}>
              {[
                { name: 'Material', value: 'Natural clay' },
                { name: 'Dimensions', value: '10 inch diameter' },
                { name: 'Weight', value: '0.8 kg' },
                { name: 'Care', value: 'Hand wash recommended' },
                { name: 'Origin', value: 'Handmade in India' },
              ].map((detail, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card size="small" hoverable>
                    <Space>
                      <Text strong>{detail.name}:</Text>
                      <Text>{detail.value}</Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
          <TabPane tab="Reviews" key="3">
            <Space size="large" style={{ marginBottom: 24 }}>
              <Title level={2} style={{ margin: 0 }}>4.2</Title>
              <div>
                <Rate 
                  value={4.2} 
                  allowHalf 
                  character={<StarFilled />}
                  disabled
                />
                <Text type="secondary">Based on 201 reviews</Text>
              </div>
            </Space>

            <Title level={5} style={{ marginBottom: 16 }}>Customer Reviews</Title>
            
            <List
              itemLayout="vertical"
             
              renderItem={item => (
                <List.Item>
                  <Card>
                    <Space direction="vertical" size="middle">
                      <Space>
                        <Rate 
                          value={item.rating} 
                          disabled 
                          character={<StarFilled />}
                        />
                        <Text strong>{item.author}</Text>
                        <Text type="secondary">{item.date}</Text>
                      </Space>
                      <Paragraph>{item.content}</Paragraph>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />

            <Button type="primary" style={{ marginTop: 16 }}>
              See All Reviews
            </Button>
          </TabPane>
        </Tabs>
      </Card>

      {/* Quantity Modal */}
      <Modal
        title="Add to Cart"
        visible={visible}
        onOk={handleAddToCart}
        onCancel={() => setVisible(false)}
        okText="Add to Cart"
        cancelText="Cancel"
        width={400}
      >
        <Space size="middle" style={{ margin: '24px 0' }}>
          <Button 
            icon={<MinusOutlined />} 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          />
          <InputNumber 
            min={1} 
            value={quantity} 
            onChange={value => setQuantity(value || 1)}
          />
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => setQuantity(quantity + 1)}
          />
        </Space>

        <Card>
          <Space size="middle">
            <Avatar 
              src={product.images?.[0] || product.imgUrl}
              size={60}
              shape="square"
            />
            <Space direction="vertical" size={0}>
              <Text strong>{product.name}</Text>
              <Text type="secondary">Code: {product.code}</Text>
            </Space>
          </Space>
          <Divider />
          <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>Total:</Text>
            <Title level={4} style={{ margin: 0 }}>₹{product.price * quantity}</Title>
          </Space>
        </Card>
      </Modal>
    </div>
  );
};

export default ProductDetail;