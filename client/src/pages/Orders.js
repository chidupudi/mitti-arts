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
  VerifiedOutlined,
  Build
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

// Simple deduplication function
const deduplicateCartItems = (items) => {
  console.log('🔄 DEDUPLICATING', items.length, 'items');
  
  const productMap = new Map();
  
  items.forEach((item, index) => {
    const key = String(item.productId);
    console.log(`   Item ${index + 1}: Product ${key}, Qty ${item.quantity}`);
    
    if (productMap.has(key)) {
      const existing = productMap.get(key);
      existing.quantity += item.quantity;
      existing.allItemIds = existing.allItemIds || [existing.id];
      existing.allItemIds.push(item.id);
      console.log(`   ⚠️  DUPLICATE FOUND! Consolidated qty: ${existing.quantity}`);
    } else {
      productMap.set(key, { 
        ...item,
        allItemIds: [item.id]
      });
      console.log(`   ✅ New unique product: ${key}`);
    }
  });
  
  const result = Array.from(productMap.values());
  console.log('🔄 RESULT: Reduced', items.length, 'items to', result.length, 'unique products');
  return result;
};

// CartItem component with permanent deletion confirmation
const CartItem = memo(({ 
  item, 
  product, 
  index, 
  onRemove, 
  onUpdateQuantity,
  removing,
  updating 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRemoveClick = () => {
    // Show confirmation dialog for permanent deletion
    const confirmDelete = window.confirm(
      `⚠️ PERMANENT DELETION\n\nAre you sure you want to permanently remove "${product?.name || 'this item'}" from your cart?\n\nThis action cannot be undone and the item will be completely deleted from the database.`
    );
    
    if (confirmDelete) {
      console.log('🗑️ User confirmed permanent deletion of item:', item.id);
      onRemove(item.id);
    } else {
      console.log('❌ User cancelled deletion of item:', item.id);
    }
  };

  if (!product) {
    console.log('❌ CartItem: No product found for', item.productId);
    return (
      <Paper 
        elevation={1}
        sx={{ 
          p: 3, 
          mb: 2, 
          border: '3px solid red',
          backgroundColor: '#ffebee'
        }}
      >
        <Typography color="error" variant="h6" gutterBottom>
          ❌ Missing Product - Will be Permanently Deleted
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
          Cart Item ID: {item.id}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
          Product ID: {item.productId}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
          Quantity: {item.quantity}
        </Typography>
        <Typography variant="body2" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
          ⚠️ This item will be permanently deleted from database
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          size="small"
          onClick={() => {
            const confirmDelete = window.confirm(
              '⚠️ PERMANENT DELETION\n\nThis will permanently delete the invalid cart item from the database.\n\nProceed?'
            );
            if (confirmDelete) {
              onRemove(item.id);
            }
          }}
          disabled={removing === item.id}
        >
          {removing === item.id ? 'Permanently Deleting...' : '🔥 Permanently Delete Invalid Item'}
        </Button>
      </Paper>
    );
  }
  
  console.log('✅ CartItem: Rendering product', product.name, 'qty', item.quantity);
  
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
          
          {/* Debug info for cart item */}
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1, fontFamily: 'monospace' }}>
            Debug: Cart ID: {item.id} | Product ID: {item.productId} | Qty: {item.quantity}
            {item.allItemIds && item.allItemIds.length > 1 && (
              <> | Consolidated from: [{item.allItemIds.join(', ')}]</>
            )}
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
              onClick={handleRemoveClick}
              disabled={removing === item.id}
              sx={{ 
                minWidth: 120,
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
                '🔥 Delete Forever'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Grow>
  );
});

// OrderSummary component (memoized) - Fixed with proper transaction data
const OrderSummary = memo(({ cartItems, products, navigate, totalPrice, subtotal, shippingCost, discount, totalItemCount, uniqueItemCount }) => {
  
  // Create transaction-ready cart data (what user actually sees)
  const prepareTransactionData = () => {
    return cartItems.map(item => {
      const product = products.find(p => String(p.id) === String(item.productId));
      return {
        id: item.id, // Use the main item ID
        productId: item.productId,
        quantity: item.quantity, // This is the consolidated quantity
        price: product?.price || 0,
        name: product?.name || '',
        image: product?.images?.[0] || '',
        // Don't include duplicate tracking data in transaction
      };
    });
  };

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
          
          {/* Show exactly what user sees */}
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
          onClick={() => {
            // Pass the EXACT data user sees - deduplicated items
            const transactionItems = prepareTransactionData();
            
            console.log('🛒 PROCEEDING TO CHECKOUT');
            console.log('   Transaction items:', transactionItems.length);
            console.log('   Total amount:', totalPrice);
            
            navigate('/order-summary', { 
              state: { 
                totalAmount: totalPrice,
                items: transactionItems, // Use deduplicated items
                orderDetails: {
                  subtotal,
                  shippingCost,
                  discount,
                  totalItemCount,
                  uniqueItemCount
                }
              } 
            });
          }}
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

// Main Cart component with simple debug logging
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

  // Simple fetchCartItems with basic logging
  const fetchCartItems = useCallback(async (uid) => {
    console.log('🔍 FETCHING CART for user:', uid);
    try {
      const q = query(collection(db, 'cart'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📦 RAW CART DATA:');
      items.forEach((item, i) => {
        console.log(`   ${i+1}. Cart ID: ${item.id}, Product ID: ${item.productId}, Qty: ${item.quantity}`);
      });
      
      setRawCartItems(items);
      
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  }, []);

  // Deduplicated cart items (memoized)
  const cartItems = useMemo(() => {
    const deduplicated = deduplicateCartItems(rawCartItems);
    return deduplicated;
  }, [rawCartItems]);

  // Simple debug logging
  useEffect(() => {
    console.log('🔍 SIMPLE DEBUG - Cart Items:', cartItems.length);
    console.log('🔍 SIMPLE DEBUG - Products:', products.length);
    
    console.log('📋 CART ITEMS:');
    cartItems.forEach((item, i) => {
      console.log(`   ${i+1}. Product: ${item.productId}, Qty: ${item.quantity}`);
    });
    
    console.log('🏪 PRODUCTS:');
    products.forEach((prod, i) => {
      console.log(`   ${i+1}. ID: ${prod.id}, Name: ${prod.name}`);
    });
    
    console.log('🔗 MATCHING CHECK:');
    cartItems.forEach((item, i) => {
      const found = products.find(p => String(p.id) === String(item.productId));
      console.log(`   ${i+1}. ${item.productId} → ${found ? '✅ FOUND: ' + found.name : '❌ MISSING'}`);
    });
    
  }, [cartItems, products]);

  // Auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      console.log('👤 USER LOGGED IN:', currentUser.uid);
      setUser(currentUser);
      await fetchCartItems(currentUser.uid);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [navigate, fetchCartItems]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      console.log('🔍 FETCHING PRODUCTS...');
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
        
        console.log('📦 PRODUCTS LOADED:', productsArr.length);
        productsArr.forEach((product, i) => {
          console.log(`   ${i+1}. ID: ${product.id}, Name: ${product.name}, Price: ₹${product.price}`);
        });
        
        setProducts(productsArr);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Get product details function (memoized)
  const getProductDetails = useCallback((productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) {
      console.warn(`❌ PRODUCT NOT FOUND: ${productId}`);
    }
    return product;
  }, [products]);

  // Remove item handler
  const handleRemoveItem = useCallback(async (itemId) => {
    console.log('🗑️ REMOVING ITEM:', itemId);
    try {
      setRemoving(itemId);
      
      // Find the deduplicated item to get all related IDs
      const deduplicatedItem = cartItems.find(item => item.id === itemId);
      
      if (!deduplicatedItem) {
        console.error('Item not found in deduplicated cart');
        return;
      }

      // Get all IDs that need to be deleted (including duplicates)
      const idsToDelete = deduplicatedItem.allItemIds || [itemId];
      
      console.log('   Deleting IDs:', idsToDelete);
      
      // Delete all related items from database
      if (idsToDelete.length === 1) {
        await deleteDoc(doc(db, 'cart', idsToDelete[0]));
      } else {
        const batch = writeBatch(db);
        idsToDelete.forEach(id => {
          const itemRef = doc(db, 'cart', id);
          batch.delete(itemRef);
        });
        await batch.commit();
      }
      
      // Update local state
      setRawCartItems(prev => prev.filter(rawItem => !idsToDelete.includes(rawItem.id)));
      
    } catch (error) {
      console.error('❌ Error removing item:', error);
    } finally {
      setRemoving(null);
    }
  }, [cartItems]);

  // Update quantity handler
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    console.log('🔄 UPDATING QUANTITY:', itemId, 'to', newQuantity);
    
    try {
      setUpdating(itemId);
      
      // Find the deduplicated item
      const deduplicatedItem = cartItems.find(item => item.id === itemId);
      
      if (!deduplicatedItem) return;
      
      const allItemIds = deduplicatedItem.allItemIds || [itemId];
      
      if (allItemIds.length === 1) {
        // Simple case - just update quantity
        await updateDoc(doc(db, 'cart', itemId), {
          quantity: newQuantity
        });
      } else {
        // Complex case - consolidate duplicates
        const batch = writeBatch(db);
        
        // Update the main item with new quantity
        const mainItemRef = doc(db, 'cart', allItemIds[0]);
        batch.update(mainItemRef, { quantity: newQuantity });
        
        // Delete all duplicate items
        for (let i = 1; i < allItemIds.length; i++) {
          const duplicateRef = doc(db, 'cart', allItemIds[i]);
          batch.delete(duplicateRef);
        }
        
        await batch.commit();
        
        // Refresh cart items to reflect changes
        await fetchCartItems(user.uid);
        return;
      }
      
      // Update local state for simple case
      setRawCartItems(prev => prev.map(item => 
        item.id === itemId ? {...item, quantity: newQuantity} : item
      ));
      
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  }, [cartItems, fetchCartItems, user]);

  // Calculate cart totals - FIXED to only count valid products
  const { subtotal, shippingCost, discount, totalPrice, totalItemCount, uniqueItemCount } = useMemo(() => {
    console.log('💰 CALCULATING TOTALS...');
    
    let sub = 0;
    let totalItems = 0;
    let validItemsCount = 0; // Only count items with valid products
    
    cartItems.forEach((item, index) => {
      const product = getProductDetails(item.productId);
      if (product) { // Only count if product exists
        const itemTotal = product.price * item.quantity;
        sub += itemTotal;
        totalItems += item.quantity;
        validItemsCount++; // Increment only for valid products
        console.log(`   ✅ Item ${index + 1}: ${product.name} - Qty: ${item.quantity}, Price: ₹${product.price}, Total: ₹${itemTotal}`);
      } else {
        console.log(`   ❌ Item ${index + 1}: Missing product ${item.productId} - Qty: ${item.quantity} (EXCLUDED from totals)`);
      }
    });
    
    // Free shipping above ₹1500
    const shipping = sub > 1500 ? 0 : 0;
    
    // 10% discount above ₹1000, max ₹100
    const disc = sub > 1000 ? Math.min(Math.round(sub * 0.1), 100) : 0;
    
    const finalTotal = sub + shipping - disc;
    
    console.log('💰 TOTALS:');
    console.log(`   Subtotal: ₹${sub}`);
    console.log(`   Shipping: ₹${shipping}`);
    console.log(`   Discount: ₹${disc}`);
    console.log(`   Final Total: ₹${finalTotal}`);
    console.log(`   Total Items: ${totalItems}`);
    console.log(`   Valid Items: ${validItemsCount}/${cartItems.length}`);
    
    return {
      subtotal: sub,
      shippingCost: shipping,
      discount: disc,
      totalPrice: finalTotal,
      totalItemCount: totalItems,
      uniqueItemCount: validItemsCount // Return count of valid products only
    };
  }, [cartItems, getProductDetails]);

  // Filter out invalid products from rendering
  const validCartItems = useMemo(() => {
    const filtered = cartItems.filter(item => {
      const product = getProductDetails(item.productId);
      return product !== undefined;
    });
    
    console.log(`🔍 FILTERING: ${cartItems.length} total items → ${filtered.length} valid items`);
    return filtered;
  }, [cartItems, getProductDetails]);

  // Force cleanup function
  const forceCleanupCart = useCallback(async () => {
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    console.log('🔧 FORCE CLEANUP INITIATED');
    
    try {
      // Fetch fresh data
      const q = query(collection(db, 'cart'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const allItems = [];
      querySnapshot.forEach((doc) => {
        allItems.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Found', allItems.length, 'total cart items');
      
      // Check for orphaned items (items without valid products)
      const orphanedItems = [];
      allItems.forEach(item => {
        const product = products.find(p => String(p.id) === String(item.productId));
        if (!product) {
          orphanedItems.push(item);
        }
      });
      
      if (orphanedItems.length > 0) {
        console.log('🗑️ Found', orphanedItems.length, 'orphaned items to remove');
        const batch = writeBatch(db);
        orphanedItems.forEach(item => {
          console.log('   Removing orphaned item:', item.id, 'for missing product:', item.productId);
          const itemRef = doc(db, 'cart', item.id);
          batch.delete(itemRef);
        });
        await batch.commit();
        
        // Refresh cart
        await fetchCartItems(user.uid);
      } else {
        console.log('✅ No orphaned items found');
      }
      
    } catch (error) {
      console.error('❌ Force cleanup failed:', error);
    }
  }, [user, products, fetchCartItems]);

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

              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  size="small"
                  startIcon={<Build />}
                  onClick={forceCleanupCart}
                  sx={{ fontWeight: 500 }}
                >
                  🔧 Clean Orphans
                </Button>
                
                <Button 
                  variant="text" 
                  color="primary"
                  startIcon={<ShoppingBagOutlined />}
                  onClick={() => navigate('/products')}
                  sx={{ fontWeight: 500 }}
                >
                  Continue Shopping
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Enhanced Debug Info Panel */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                🐛 Debug Info (Check console for detailed logs)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2">
                    Raw DB Items: <strong>{rawCartItems.length}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2">
                    Deduplicated: <strong>{cartItems.length}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2">
                    Valid Products: <strong>{uniqueItemCount}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2">
                    Total Quantity: <strong>{totalItemCount}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2">
                    Badge Count: <strong>{uniqueItemCount}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2">
                    Products Loaded: <strong>{products.length}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

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