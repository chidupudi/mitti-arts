import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Divider,
  IconButton,
  Container,
  Paper,
  CircularProgress,
  Badge,
  useMediaQuery,
  Chip,
  Fade,
  Grow,
  Slide,
  Zoom
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  ShoppingCart,
  Add, 
  Remove, 
  Delete, 
  ArrowForward,
  LocalShipping,
  Payment,
  ShoppingBag
} from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
      } else {
        setUser(currentUser);
        await fetchCartItems(currentUser.uid);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsArr = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsArr.push({
            id: doc.id,
            ...data,
            price: Number(data.price),
            images: data.images || [],
            stock: Number(data.stock) || 0
          });
        });
        setProducts(productsArr);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  const fetchCartItems = async (uid) => {
    try {
      const q = query(collection(db, 'cart'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const getProductDetails = (productId) => {
    return products.find((p) => String(p.id) === String(productId));
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setRemoving(itemId);
      await deleteDoc(doc(db, 'cart', itemId));
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemoving(null);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      await updateDoc(doc(db, 'cart', itemId), {
        quantity: newQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? {...item, quantity: newQuantity} : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProductDetails(item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);
  
  const shippingCost = subtotal > 0 ? 0 : 0;
  const discount = subtotal > 1000 ? 100 : 0;
  const totalPrice = subtotal + shippingCost - discount;

  if (loading || loadingProducts) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh'
      }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const containerCardStyle = {
    borderRadius: 3,
    boxShadow: theme.shadows[5],
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    mb: 4,
    p: { xs: 2, sm: 3 }
  };

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper elevation={0} sx={containerCardStyle}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: { xs: 'center', sm: 'space-between' }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: { xs: 2, sm: 0 }
            }}>
              <ShoppingCart sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                My Cart
              </Typography>
              <Badge 
                badgeContent={cartItems.length} 
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>

            <Button 
              variant="text" 
              color="primary"
              startIcon={<ShoppingBag />}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {cartItems.length === 0 ? (
            <Fade in={true} timeout={500}>
              <Box sx={{ 
                py: 8, 
                textAlign: 'center',
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2
              }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Your cart is empty
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Looks like you haven't added anything to your cart yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  startIcon={<ShoppingBag />}
                  onClick={() => navigate('/products')}
                >
                  Start Shopping
                </Button>
              </Box>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                {cartItems.map((item, index) => {
                  const product = getProductDetails(item.productId);
                  if (!product) return null;
                  
                  return (
                    <Grow
                      key={item.id}
                      in={true}
                      timeout={500 + index * 100}
                      style={{ transformOrigin: '0 0 0' }}
                    >
                      <Paper 
                        sx={{ 
                          p: { xs: 1, sm: 2 }, 
                          mb: 2, 
                          borderRadius: 2,
                          boxShadow: 1,
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                          {product.isNew && (
                            <Chip 
                              label="New"
                              color="primary"
                              size="small"
                              sx={{ 
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                zIndex: 2
                              }}
                            />
                          )}
                          
                          <Box sx={{ 
                            width: { xs: '100%', sm: 120 },
                            height: { xs: 150, sm: 120 },
                            position: 'relative',
                            borderRadius: 1,
                            overflow: 'hidden',
                            mb: { xs: 2, sm: 0 }
                          }}>
                            <CardMedia
                              component="img"
                              image={product.images?.[0] || 'https://via.placeholder.com/180'}
                              alt={product.name}
                              sx={{ 
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ 
                            flex: 1, 
                            ml: { xs: 0, sm: 2 },
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              flexDirection: { xs: 'column', sm: 'row' },
                              mb: 1
                            }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                              <Typography 
                                variant="subtitle1" 
                                color="primary"
                                fontWeight="bold"
                                sx={{ mt: { xs: 1, sm: 0 } }}
                              >
                                ₹{product.price * item.quantity}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {product.description?.substring(0, 80)}...
                            </Typography>
                            
                            <Box sx={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 'auto',
                              flexWrap: 'wrap',
                              gap: 1
                            }}>
                              <Box sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                  Qty:
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  border: `1px solid ${theme.palette.grey[300]}`,
                                  borderRadius: 1,
                                  overflow: 'hidden'
                                }}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={updating === item.id || item.quantity <= 1}
                                  >
                                    <Remove fontSize="small" />
                                  </IconButton>
                                  
                                  <Typography sx={{ 
                                    px: 2,
                                    minWidth: 30,
                                    textAlign: 'center',
                                    fontWeight: 'medium'
                                  }}>
                                    {updating === item.id ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      item.quantity
                                    )}
                                  </Typography>
                                  
                                  <IconButton 
                                    size="small"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={updating === item.id}
                                  >
                                    <Add fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={removing === item.id ? null : <Delete />}
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={removing === item.id}
                              >
                                {removing === item.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  'Remove'
                                )}
                              </Button>
                            </Box>
                          </Box>
                        </Paper>
                    </Grow>
                  );
                })}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Fade in={true} timeout={800}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    position: 'sticky',
                    top: 20,
                    boxShadow: theme.shadows[3],
                    height: 'fit-content'
                  }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Order Summary
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                      </Typography>
                      <Typography variant="body2">₹{subtotal}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Shipping
                      </Typography>
                      <Typography variant="body2">₹{shippingCost}</Typography>
                    </Box>
                    
                    {discount > 0 && (
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="success.main">
                          Discount
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          -₹{discount}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="bold">
                        Total
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{totalPrice}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/order-summary', { 
                        state: { 
                          totalAmount: totalPrice,
                          items: cartItems 
                        } 
                      })}
                      sx={{ 
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        boxShadow: theme.shadows[4],
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '50%',
                          height: '100%',
                          background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                          transform: 'skewX(-25deg)',
                          animation: 'shine 2s infinite'
                        },
                        '@keyframes shine': {
                          '0%': {
                            left: '-100%'
                          },
                          '100%': {
                            left: '150%'
                          }
                        }
                      }}
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocalShipping fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Free delivery for orders above ₹1500
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Payment fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Secure payments & COD available
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          )}
        </Paper>
        
        {cartItems.length > 0 && (
          <Slide direction="up" in={true} timeout={500} mountOnEnter unmountOnExit>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recommended for You
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {products.slice(0, isMobile ? 2 : isTablet ? 3 : 4).map((product, index) => (
                  <Grid item xs={6} sm={4} md={3} key={product.id}>
                    <Zoom in={true} timeout={500 + index * 100}>
                      <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: 1,
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height={140}
                          image={product.images?.[0] || 'https://via.placeholder.com/140'}
                          alt={product.name}
                          sx={{
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, py: 1 }}>
                          <Typography variant="subtitle2" noWrap>
                            {product.name}
                          </Typography>
                          <Typography variant="subtitle1" color="primary" fontWeight="bold">
                            ₹{product.price}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            fullWidth
                            variant="outlined"
                          >
                            Add to Cart
                          </Button>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Slide>
        )}
      </Container>
    </Fade>
  );
};

export default Cart;