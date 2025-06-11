import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
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
  Zoom,
  Stack,
  Skeleton,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  ShoppingCart,
  Add, 
  Remove, 
  DeleteOutline, 
  ArrowForward,
  LocalShippingOutlined,
  PaymentOutlined,
  ShoppingBagOutlined,
  VerifiedOutlined
} from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Custom theme with terracotta/coconut color palette
const terracottaTheme = createTheme({
  palette: {
    primary: {
      main: '#E07A5F', // Terracotta
      light: '#F2CC8F', // Light terracotta/sand
      dark: '#BE5A38', // Dark terracotta
      contrastText: '#fff',
    },
    secondary: {
      main: '#81B29A', // Sage green accent
      light: '#A5C9B7',
      dark: '#5E8D7A',
    },
    background: {
      default: '#FFF9F5', // Very light coconut
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3D405B', // Dark blue-grey
      secondary: '#797B8E', // Medium blue-grey
    },
    error: {
      main: '#E07A5F', // Using terracotta as error too
    },
    success: {
      main: '#81B29A', // Sage green for success
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0, 0, 0, 0.04)',
    '0px 4px 16px rgba(0, 0, 0, 0.06)',
    '0px 6px 20px rgba(0, 0, 0, 0.08)',
    '0px 8px 24px rgba(0, 0, 0, 0.1)',
    '0px 10px 28px rgba(0, 0, 0, 0.12)',
    ...Array(20).fill('none').map((_, i) => 
      `0px ${i + 6}px ${(i + 3) * 4}px rgba(0, 0, 0, ${0.05 + i * 0.01})`
    ),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.25s ease',
        },
        contained: {
          boxShadow: '0px 4px 12px rgba(224, 122, 95, 0.25)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(224, 122, 95, 0.35)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiCardMedia: {
      styleOverrides: {
        root: {
          transition: 'transform 0.4s ease',
        },
      },
    },
  },
});

// CartItem component (memoized to prevent unnecessary re-renders)
const CartItem = memo(({ 
  item, 
  product, 
  index, 
  onRemove, 
  onUpdateQuantity,
  removing,
  updating 
}) => {
  if (!product) return null;
  
  return (
    <Grow
      in={true}
      timeout={400 + index * 75}
      style={{ transformOrigin: '0 0 0' }}
    >
      <Paper 
        elevation={1}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 2, 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
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
              top: 12,
              left: 12,
              zIndex: 2,
              fontWeight: 500,
            }}
          />
        )}
        
        <Box sx={{ 
          width: { xs: '100%', sm: 140 },
          height: { xs: 180, sm: 140 },
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          mb: { xs: 2, sm: 0 },
          backgroundColor: 'rgba(0,0,0,0.04)'
        }}>
          <CardMedia
            component="img"
            image={product.images?.[0] || 'https://via.placeholder.com/180'}
            alt={product.name}
            sx={{ 
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              '&:hover': {
                transform: 'scale(1.08)',
              }
            }}
          />
        </Box>
        
        <Box sx={{ 
          flex: 1, 
          ml: { xs: 0, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
            mb: 1,
          }}>
            <Typography variant="h6">
              {product.name}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="primary"
              fontWeight="bold"
              sx={{ mt: { xs: 1, sm: 0 } }}
            >
              ₹{(product.price * item.quantity).toLocaleString('en-IN')}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.description?.substring(0, 100)}
            {product.description?.length > 100 ? '...' : ''}
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 2, sm: 1 }
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
                Qty:
              </Typography>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                border: (theme) => `1px solid ${theme.palette.grey[200]}`,
                borderRadius: 1.5,
                overflow: 'hidden'
              }}>
                <IconButton 
                  size="small"
                  color="primary"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={updating === item.id || item.quantity <= 1}
                  sx={{ 
                    borderRadius: 0,
                    p: 0.75
                  }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                
                <Box sx={{ 
                  px: 2,
                  minWidth: 36,
                  textAlign: 'center',
                }}>
                  {updating === item.id ? (
                    <CircularProgress size={16} thickness={5} />
                  ) : (
                    <Typography fontWeight="medium">
                      {item.quantity}
                    </Typography>
                  )}
                </Box>
                
                <IconButton 
                  size="small"
                  color="primary"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={updating === item.id || (product.stock && item.quantity >= product.stock)}
                  sx={{ 
                    borderRadius: 0,
                    p: 0.75
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={removing === item.id ? null : <DeleteOutline />}
              onClick={() => onRemove(item.id)}
              disabled={removing === item.id}
              sx={{ 
                minWidth: 100,
                borderColor: 'rgba(224, 122, 95, 0.5)',
                '&:hover': {
                  borderColor: 'error.main',
                  backgroundColor: 'rgba(224, 122, 95, 0.04)',
                }
              }}
            >
              {removing === item.id ? (
                <CircularProgress size={16} thickness={5} />
              ) : (
                'Remove'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Grow>
  );
});

// OrderSummary component (memoized) - Fixed item count calculation
const OrderSummary = memo(({ cartItems, products, navigate, totalPrice, subtotal, shippingCost, discount, totalItemCount, uniqueItemCount }) => {
  return (
    <Fade in={true} timeout={600}>
      <Paper elevation={2} sx={{ 
        p: 3, 
        position: 'sticky',
        top: 20,
        height: 'fit-content'
      }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
            </Typography>
            <Typography variant="body2">
              ₹{subtotal.toLocaleString('en-IN')}
            </Typography>
          </Box>
          
          {/* Additional info about unique products */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {uniqueItemCount} unique {uniqueItemCount === 1 ? 'product' : 'products'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Total qty: {totalItemCount}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Shipping
            </Typography>
            <Typography variant="body2">
              {shippingCost === 0 ? 'Enjoy Free Delivery' : `₹${shippingCost.toLocaleString('en-IN')}`}
            </Typography>
          </Box>
          
          {discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedOutlined fontSize="small" sx={{ mr: 0.5 }} />
                Discount
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight="medium">
                -₹{discount.toLocaleString('en-IN')}
              </Typography>
            </Box>
          )}
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Total
          </Typography>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ₹{totalPrice.toLocaleString('en-IN')}
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
            py: 1.5,
            fontWeight: 'bold',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '50%',
              height: '100%',
              background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
              transform: 'skewX(-25deg)',
              animation: 'shine 3s infinite ease-in-out',
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
        
        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingOutlined fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Free delivery for orders above ₹1500
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentOutlined fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Secure payments & COD available
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
});

// Function to deduplicate cart items by consolidating quantities
const deduplicateCartItems = (items) => {
  const productMap = new Map();
  
  items.forEach(item => {
    const key = String(item.productId);
    if (productMap.has(key)) {
      // If product already exists, add to quantity and keep the first item's ID
      const existing = productMap.get(key);
      existing.quantity += item.quantity;
      existing.duplicateIds = existing.duplicateIds || [];
      existing.duplicateIds.push(item.id);
    } else {
      // New product
      productMap.set(key, { ...item });
    }
  });
  
  return Array.from(productMap.values());
};

// Main Cart component (with performance optimizations and duplicate handling)
const Cart = () => {
  const [rawCartItems, setRawCartItems] = useState([]);
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

  // Fetch cart items (memoized)
  const fetchCartItems = useCallback(async (uid) => {
    try {
      const q = query(collection(db, 'cart'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setRawCartItems(items);
      
      // Log for debugging
      console.log('Raw cart items from DB:', items);
      console.log('Total raw items:', items.length);
      
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, []);

  // Clean up duplicate cart items in database
  const cleanupDuplicateCartItems = useCallback(async (items) => {
    if (!user) return;
    
    const productGroups = {};
    items.forEach(item => {
      const key = String(item.productId);
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      productGroups[key].push(item);
    });
    
    // Find products with duplicates
    const duplicateGroups = Object.values(productGroups).filter(group => group.length > 1);
    
    if (duplicateGroups.length === 0) return;
    
    console.log('Found duplicate cart items, cleaning up...', duplicateGroups);
    
    try {
      const batch = writeBatch(db);
      
      for (const group of duplicateGroups) {
        // Keep the first item, consolidate quantities
        const [mainItem, ...duplicates] = group;
        const totalQuantity = group.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update the main item with total quantity
        const mainItemRef = doc(db, 'cart', mainItem.id);
        batch.update(mainItemRef, { quantity: totalQuantity });
        
        // Delete duplicate items
        duplicates.forEach(duplicate => {
          const duplicateRef = doc(db, 'cart', duplicate.id);
          batch.delete(duplicateRef);
        });
      }
      
      await batch.commit();
      
      // Refresh cart items
      await fetchCartItems(user.uid);
      
    } catch (error) {
      console.error('Error cleaning up duplicate cart items:', error);
    }
  }, [user, fetchCartItems]);

  // Deduplicated cart items (memoized)
  const cartItems = useMemo(() => {
    const deduplicated = deduplicateCartItems(rawCartItems);
    console.log('Deduplicated cart items:', deduplicated);
    return deduplicated;
  }, [rawCartItems]);

  // Auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      setUser(currentUser);
      await fetchCartItems(currentUser.uid);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [navigate, fetchCartItems]);

  // Clean up duplicates when raw cart items change
  useEffect(() => {
    if (rawCartItems.length > 0 && user) {
      // Check if we have duplicates and clean them up
      const productCounts = {};
      rawCartItems.forEach(item => {
        const key = String(item.productId);
        productCounts[key] = (productCounts[key] || 0) + 1;
      });
      
      const hasDuplicates = Object.values(productCounts).some(count => count > 1);
      
      if (hasDuplicates) {
        console.log('Duplicates detected, cleaning up...');
        cleanupDuplicateCartItems(rawCartItems);
      }
    }
  }, [rawCartItems, user, cleanupDuplicateCartItems]);

  // Fetch products (separate useEffect for clean separation of concerns)
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
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Get product details function (memoized)
  const getProductDetails = useCallback((productId) => {
    return products.find((p) => String(p.id) === String(productId));
  }, [products]);

  // Remove item handler (memoized) - Updated to handle duplicates
  const handleRemoveItem = useCallback(async (itemId) => {
    try {
      setRemoving(itemId);
      
      // Find the item to get duplicate IDs if any
      const item = cartItems.find(item => item.id === itemId);
      
      // Delete the main item
      await deleteDoc(doc(db, 'cart', itemId));
      
      // Delete any duplicate items
      if (item?.duplicateIds && item.duplicateIds.length > 0) {
        const batch = writeBatch(db);
        item.duplicateIds.forEach(duplicateId => {
          const duplicateRef = doc(db, 'cart', duplicateId);
          batch.delete(duplicateRef);
        });
        await batch.commit();
      }
      
      // Update local state
      setRawCartItems(prev => prev.filter(rawItem => {
        if (rawItem.id === itemId) return false;
        if (item?.duplicateIds && item.duplicateIds.includes(rawItem.id)) return false;
        return true;
      }));
      
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemoving(null);
    }
  }, [cartItems]);

  // Update quantity handler (memoized)
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(itemId);
      await updateDoc(doc(db, 'cart', itemId), {
        quantity: newQuantity
      });
      
      setRawCartItems(prev => prev.map(item => 
        item.id === itemId ? {...item, quantity: newQuantity} : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  }, []);

  // Calculate cart totals (memoized) - Fixed calculation
  const { subtotal, shippingCost, discount, totalPrice, totalItemCount, uniqueItemCount } = useMemo(() => {
    let sub = 0;
    let totalItems = 0;
    
    cartItems.forEach(item => {
      const product = getProductDetails(item.productId);
      if (product) {
        sub += product.price * item.quantity;
        totalItems += item.quantity;
      }
    });
    
    // Free shipping above ₹1500
    const shipping = sub > 1500 ? 0 : 0;
    
    // 10% discount above ₹1000, max ₹100
    const disc = sub > 1000 ? Math.min(Math.round(sub * 0.1), 100) : 0;
    
    return {
      subtotal: sub,
      shippingCost: shipping,
      discount: disc,
      totalPrice: sub + shipping - disc,
      totalItemCount: totalItems,
      uniqueItemCount: cartItems.length
    };
  }, [cartItems, getProductDetails]);

  // Remaining components (EmptyCart, RecommendedProducts, CartSkeleton) remain the same...
  
  // Empty Cart component
  const EmptyCart = memo(({ navigate }) => (
    <Fade in={true} timeout={500}>
      <Box sx={{ 
        py: 8, 
        textAlign: 'center',
        backgroundColor: (theme) => theme.palette.grey[50],
        borderRadius: 2
      }}>
        <ShoppingCart sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          Looks like you haven't added anything to your cart yet. Explore our products and find something you'll love!
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          startIcon={<ShoppingBagOutlined />}
          onClick={() => navigate('/products')}
        >
          Start Shopping
        </Button>
      </Box>
    </Fade>
  ));

  // Recommended Products component (memoized)
  const RecommendedProducts = memo(({ products, isMobile, isTablet }) => {
    return (
      <Slide direction="up" in={true} timeout={500} mountOnEnter unmountOnExit>
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Recommended for You
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {products.slice(0, isMobile ? 2 : isTablet ? 3 : 4).map((product, index) => (
              <Grid item xs={6} sm={4} md={3} key={product.id}>
                <Zoom in={true} timeout={400 + index * 75}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)',
                    }
                  }}>
                    <Box sx={{ position: 'relative', pt: '75%', backgroundColor: 'rgba(0,0,0,0.04)' }}>
                      <CardMedia
                        component="img"
                        image={product.images?.[0] || 'https://via.placeholder.com/140'}
                        alt={product.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          '&:hover': {
                            transform: 'scale(1.08)',
                          }
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
                      <Typography variant="subtitle2" noWrap fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        size="small" 
                        fullWidth
                        variant="outlined"
                        color="primary"
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
    );
  });

  // Loading Skeleton for cart
  const CartSkeleton = memo(() => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
        <Skeleton variant="text" width={120} height={40} />
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {[1, 2, 3].map((item) => (
            <Paper key={item} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <Skeleton variant="rectangular" width={120} height={120} sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 2, sm: 0 } }} />
                <Box sx={{ width: '100%' }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="90%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="rectangular" width={100} height={36} />
                    <Skeleton variant="rectangular" width={80} height={36} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            <Divider sx={{ my: 2 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Divider sx={{ my: 2 }} />
            <Skeleton variant="text" width="100%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={24} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  ));

  // Display loading skeletons
  if (loading || loadingProducts) {
    return (
      <ThemeProvider theme={terracottaTheme}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
            <CartSkeleton />
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={terracottaTheme}>
      <Fade in={true} timeout={400}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 2, sm: 3 },
            mb: 4,
            backgroundImage: 'linear-gradient(to right bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
            backdropFilter: 'blur(10px)',
          }}>
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
                <ShoppingCart sx={{ 
                  mr: 1.5, 
                  color: 'primary.main',
                  fontSize: 28
                }} />
                <Typography variant="h4" component="h1">
                  My Cart
                </Typography>
                <Badge 
                  badgeContent={uniqueItemCount} 
                  color="primary"
                  sx={{ ml: 2 }}
                />
              </Box>

              <Button 
                variant="text" 
                color="primary"
                startIcon={<ShoppingBagOutlined />}
                onClick={() => navigate('/products')}
                sx={{ fontWeight: 500 }}
              >
                Continue Shopping
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />


            {cartItems.length === 0 ? (
              <EmptyCart navigate={navigate} />
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {cartItems.map((item, index) => {
                    const product = getProductDetails(item.productId);
                    
                    return (
                      <CartItem 
                        key={item.id}
                        item={item}
                        product={product}
                        index={index}
                        onRemove={handleRemoveItem}
                        onUpdateQuantity={updateQuantity}
                        removing={removing}
                        updating={updating}
                      />
                    );
                  })}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <OrderSummary 
                    cartItems={cartItems}
                    products={products}
                    navigate={navigate}
                    totalPrice={totalPrice}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    discount={discount}
                    totalItemCount={totalItemCount}
                    uniqueItemCount={uniqueItemCount}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>
          
          {cartItems.length > 0 && (
            <RecommendedProducts 
              products={products} 
              isMobile={isMobile} 
              isTablet={isTablet} 
            />
          )}
        </Container>
      </Fade>
    </ThemeProvider>
  );
};

export default Cart;