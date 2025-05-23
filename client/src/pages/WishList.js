import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Container,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Divider,
  Skeleton,
  Chip,
  ThemeProvider,
  createTheme,
  Stack
} from '@mui/material';
import { 
  FavoriteBorderOutlined, 
  DeleteOutlineRounded, 
  ShoppingCartOutlined, 
  ArrowForwardOutlined,
  LocalMallOutlined,
  SearchOutlined
} from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Custom theme with terracotta accents
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
      fontWeight: 500,
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
          transition: 'all 0.3s ease',
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

// WishlistItem component (memoized)
const WishlistItem = memo(({ item, product, onRemove, onAddToCart, removing }) => {
  if (!product) return null;

  return (
    <Zoom in={true} timeout={400}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 2,
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        }
      }}>
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
        
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="220"
            image={product.images?.[0] || 'https://via.placeholder.com/220'}
            alt={product.name}
            sx={{
              '&:hover': {
                transform: 'scale(1.08)',
              }
            }}
          />
          <IconButton
            color="error"
            onClick={() => onRemove(item.id)}
            disabled={removing === item.id}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              }
            }}
          >
            {removing === item.id ? 
              <CircularProgress size={20} thickness={4} /> : 
              <DeleteOutlineRounded />
            }
          </IconButton>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
          <Typography variant="h6" gutterBottom noWrap>
            {product.name}
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            color="primary" 
            fontWeight="bold" 
            sx={{ mb: 1 }}
          >
            ₹{product.price.toLocaleString('en-IN')}
          </Typography>
          
          {product.stock > 0 ? (
            <Chip 
              label="In Stock" 
              size="small" 
              color="secondary" 
              variant="outlined" 
              sx={{ mb: 1 }}
            />
          ) : (
            <Chip 
              label="Out of Stock" 
              size="small" 
              color="error" 
              variant="outlined" 
              sx={{ mb: 1 }}
            />
          )}
          
          {product.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {product.description.substring(0, 60)}
              {product.description.length > 60 ? '...' : ''}
            </Typography>
          )}
        </CardContent>
        
        <CardActions sx={{ 
          p: 2,
          pt: 0
        }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartOutlined />}
            onClick={() => onAddToCart(product, item.id)}
            disabled={product.stock <= 0}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>
    </Zoom>
  );
});

// Loading skeleton
const WishlistSkeleton = memo(() => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <Grid item xs={12} sm={6} md={4} key={item}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant="rectangular" height={220} />
          <CardContent>
            <Skeleton variant="text" height={32} width="80%" />
            <Skeleton variant="text" height={24} width="40%" sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={24} width="30%" sx={{ borderRadius: 4, mb: 1 }} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="90%" />
          </CardContent>
          <CardActions sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={40} width="100%" sx={{ borderRadius: 1 }} />
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
));

// Empty wishlist component
const EmptyWishlist = memo(({ navigate }) => (
  <Box sx={{ 
    textAlign: 'center',
    py: 8, 
    px: 3
  }}>
    <FavoriteBorderOutlined sx={{ fontSize: 64, color: 'rgba(224, 122, 95, 0.3)', mb: 2 }} />
    
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
      Your wishlist is empty
    </Typography>
    
    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
      Save your favorite items to come back to them later. Start exploring our collection to find products you'll love!
    </Typography>
    
    <Button
      variant="contained"
      color="primary"
      startIcon={<SearchOutlined />}
      onClick={() => navigate('/products')}
      size="large"
    >
      Explore Products
    </Button>
  </Box>
));

// Main WishList component (optimized)
const WishList = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Fetch wishlist items (memoized with useCallback)
  const fetchWishlistItems = useCallback(async (uid) => {
    try {
      const q = query(collection(db, 'wishlist'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    }
  }, []);

  // Auth state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      setUser(currentUser);
      await fetchWishlistItems(currentUser.uid);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [navigate, fetchWishlistItems]);

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

  // Remove item handler (memoized)
  const handleRemoveItem = useCallback(async (itemId) => {
    try {
      setRemoving(itemId);
      await deleteDoc(doc(db, 'wishlist', itemId));
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemoving(null);
    }
  }, []);

  // Add to cart handler (memoized)
  const handleAddToCart = useCallback(async (product, wishlistItemId) => {
    if (!user) return;
    
    try {
      setAddingToCart(wishlistItemId);
      
      // Add to cart collection
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: product.id,
        quantity: 1,
        addedAt: Timestamp.now()
      });
      
      // Optionally remove from wishlist after adding to cart
      // await handleRemoveItem(wishlistItemId);
      
      // Show success message (you could use a snackbar/toast here)
      console.log(`Added ${product.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  }, [user]);

  // Get the products for wishlist items (memoized)
  const wishlistProducts = useMemo(() => {
    return wishlistItems.map(item => {
      const product = products.find(p => String(p.id) === String(item.productId));
      return { item, product };
    }).filter(({ product }) => product !== undefined);
  }, [wishlistItems, products]);

  // Display loading skeletons
  if (loading || loadingProducts) {
    return (
      <ThemeProvider theme={terracottaTheme}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 3 
            }}>
              <Skeleton variant="text" width={180} height={40} />
              <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <WishlistSkeleton />
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={terracottaTheme}>
      <Fade in={true} timeout={400}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              backgroundImage: 'linear-gradient(to right bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
              mb: 3 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteBorderOutlined sx={{ 
                  mr: 1.5, 
                  color: 'primary.main',
                  fontSize: 28
                }} />
                <Typography variant="h4" component="h1">
                  My Wishlist
                </Typography>
                <Chip 
                  label={wishlistItems.length} 
                  color="primary"
                  size="small"
                  sx={{ ml: 1.5 }}
                />
              </Box>
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<LocalMallOutlined />}
                  onClick={() => navigate('/cart')}
                >
                  View Cart
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  endIcon={<ArrowForwardOutlined />}
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {wishlistItems.length === 0 ? (
              <EmptyWishlist navigate={navigate} />
            ) : (
              <Grid container spacing={3}>
                {wishlistProducts.map(({ item, product }) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <WishlistItem 
                      item={item}
                      product={product}
                      onRemove={handleRemoveItem}
                      onAddToCart={handleAddToCart}
                      removing={removing === item.id}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Container>
      </Fade>
    </ThemeProvider>
  );
};

export default WishList;