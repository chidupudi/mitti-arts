import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Favorite, Delete, ShoppingCart } from '@mui/icons-material';
import { auth, db } from '../Firebase/Firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const WishList = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
      } else {
        setUser(currentUser);
        await fetchWishlistItems(currentUser.uid);
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

  const fetchWishlistItems = async (uid) => {
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
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setRemoving(itemId);
      await deleteDoc(doc(db, 'wishlist', itemId));
      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (product) => {
    // Implement your add to cart logic here
    // This might involve adding the product to a cart collection in Firestore
    // Or updating a cart state using a context or Redux
    alert(`Added ${product.name} to cart!`); // Replace with actual logic
  };

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

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              My Wishlist
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </Box>

          {wishlistItems.length === 0 ? (
            <Typography variant="h6" color="textSecondary">
              Your wishlist is empty.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {wishlistItems.map((item) => {
                const product = products.find(p => String(p.id) === String(item.productId));
                if (!product) return null;

                return (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Zoom in={true} timeout={500}>
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
                          height="200"
                          image={product.images?.[0] || 'https://via.placeholder.com/200'}
                          alt={product.name}
                          sx={{
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div">
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Price: ₹{product.price}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Code: {product.code}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          p: 2 
                        }}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ShoppingCart />}
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removing === item.id}
                          >
                            {removing === item.id ? 
                              <CircularProgress size={24} /> : 
                              <Delete />
                            }
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      </Container>
    </Fade>
  );
};

export default WishList;