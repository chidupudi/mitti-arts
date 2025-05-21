import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Slider,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
  Drawer,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Rating,
  Chip,
  Fade,
  Zoom,
  CircularProgress,
  InputAdornment,
  Badge,
  Avatar,
  SwipeableDrawer,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

import { 
  FilterList, 
  Search, 
  ShoppingCart, 
  FavoriteBorder, 
  Close, 
  Sort, 
  PriceChange, 
  ColorLens, 
  Refresh, 
  Add, 
  Remove,
  ExpandMore, 
  ExpandLess,
  AddShoppingCart,
  ShoppingBag,
  Star,
  StarBorder,
  FilterAlt,
  Menu as MenuIcon,
  Favorite, // Import Favorite icon
  Warning,
  InfoOutlined,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ff6d75',
  },
  '& .MuiRating-iconHover': {
    color: '#ff3d47',
  },
});

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// Update the ProductCard styled component to handle stock status
const ProductCard = styled(Card)(({ theme, isHidden, stockStatus }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: stockStatus === 'out_of_stock' || isHidden ? 'none' : 'translateY(-8px)',
    boxShadow: stockStatus === 'out_of_stock' || isHidden ? theme.shadows[1] : theme.shadows[10],
  },
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  opacity: stockStatus === 'out_of_stock' || isHidden ? 0.7 : 1,
  border: isHidden ? `2px solid ${theme.palette.warning.light}` : 
         stockStatus === 'out_of_stock' ? `2px solid ${theme.palette.error.light}` : 
         'transparent',
}));

// New component for availability ribbon
const AvailabilityRibbon = styled(Box)(({ theme, status }) => ({
  position: 'absolute',
  top: 30,
  right: -50,
  transform: 'rotate(45deg)',
  width: 200,
  textAlign: 'center',
  padding: '8px 0',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  zIndex: 5,
  color: 'white',
  boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
  letterSpacing: '1px',
  overflow: 'visible',
  whiteSpace: 'nowrap',
  ...(status === 'unavailable' && {
    backgroundColor: theme.palette.warning.main,
  }),
  ...(status === 'out_of_stock' && {
    backgroundColor: theme.palette.error.main,
  }),
}));

const StockBadge = styled(Chip)(({ theme, stockLevel }) => ({
  position: 'absolute',
  bottom: 16,
  right: 16,
  zIndex: 1,
  fontWeight: 600,
  ...(stockLevel === 'low' && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  }),
  ...(stockLevel === 'critical' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
}));

const ProductBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 1,
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // States
  const [priceRange, setPriceRange] = useState([1, 5000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedColors, setSelectedColors] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loginAlert, setLoginAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    price: true,
    sort: true,
    colors: true,
  });
  const [wishlist, setWishlist] = useState([]);
  const [wishlistAlert, setWishlistAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedToCartAlert, setAddedToCartAlert] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Update the assignProductDetails function:
  const assignProductDetails = (products) => {
    return products.map((product) => {
      // Calculate discount
      let discount = 0;
      const targetPrice = product.price;

      if (targetPrice >= 50 && targetPrice <= 300) {
        discount = 10;
      } else if (targetPrice > 300 && targetPrice <= 1000) {
        discount = 20;
      } else if (targetPrice > 1000) {
        discount = 25;
      }

      const originalPrice = Math.ceil(targetPrice / (1 - discount/100));

      // Get the first image from the images array with proper path
      const imgUrl = product.images && product.images.length > 0 
        ? `${process.env.PUBLIC_URL}${product.images[0]}`  // This will properly resolve the path
        : 'https://via.placeholder.com/150';

      // Determine stock status
      let stockStatus = 'normal';
      if (product.stock === 0) {
        stockStatus = 'out_of_stock';
      } else if (product.stock < 10) {
        stockStatus = 'critical';
      } else if (product.stock < 20) {
        stockStatus = 'low';
      }

      return {
        ...product,
        imgUrl: imgUrl,
        rating: product.rating || 4.0,
        originalPrice: originalPrice,
        finalPrice: targetPrice,
        discount: discount,
        reviews: product.reviews || 0,
        isFeatured: product.isFeatured || false,
        stock: product.stock || 0,
        stockStatus: stockStatus
      };
    });
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products.filter(
      (product) =>
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        (searchQuery === '' || 
         product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         product.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortBy === 'priceLowToHigh') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHighToLow') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
  }, [priceRange, sortBy, products, searchQuery]);

  // Handle color selection
  const handleColorChange = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setPriceRange([100, 5000]);
    setSortBy('relevance');
    setSearchQuery('');
  };

  // Product click handler
  const handleProductClick = (id, code) => {
    navigate(`/product/${id}?code=${code}`);
  };

  // Add to cart handler
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    
    // Check if product is hidden or out of stock
    if (product.hidden || product.stock === 0) {
      showSnackbar(
        product.hidden ? 'This product is currently unavailable.' : 'This product is out of stock.',
        'warning'
      );
      return;
    }
    
    if (!user) {
      setLoginAlert(true);
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setOpenModal(true);
  };

  // Snackbar function
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Confirm add to cart
  const confirmAddToCart = async () => {
    if (!user) {
      setLoginAlert(true);
      setOpenModal(false);
      return;
    }

    if (!selectedProduct || quantity < 1) return;

    // Check stock availability
    if (selectedProduct.stock < quantity) {
      showSnackbar(`Sorry, only ${selectedProduct.stock} items available in stock.`, 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        code: selectedProduct.code,
        quantity: quantity,
      });
      setCartMessage(`${selectedProduct.name} added to cart!`);
      setAddedToCartAlert(true);
      setOpenModal(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar('Error adding to cart: ' + error.message, 'error');
    }
  };

  // Buy now handler
  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    
    // Check if product is hidden or out of stock
    if (product.hidden || product.stock === 0) {
      showSnackbar(
        product.hidden ? 'This product is currently unavailable.' : 'This product is out of stock.',
        'warning'
      );
      return;
    }
    
    if (!user) {
      setLoginAlert(true);
      return;
    }
    alert(`Proceeding to buy ${product.name}!`);
  };

  // Toggle wishlist
  const handleToggleWishlist = async (product, e) => {
    e.stopPropagation();
    
    // Check if product is hidden or out of stock - still allow adding to wishlist
    // but inform user about status
    if (product.hidden || product.stock === 0) {
      showSnackbar(
        product.hidden ? 
        'Adding an unavailable product to your wishlist. You will be notified when it becomes available.' :
        'Adding an out of stock product to your wishlist. You will be notified when it is restocked.',
        'info'
      );
    }
    
    if (!user) {
      setLoginAlert(true);
      return;
    }

    const wishlistRef = collection(db, 'wishlist');
    const userId = auth.currentUser.uid;

    try {
      if (wishlist.some(item => item.id === product.id)) {
        // Remove from wishlist
        const itemToRemove = wishlist.find(item => item.id === product.id);
        if (itemToRemove && itemToRemove.wishlistDocId) {
          await deleteDoc(doc(db, 'wishlist', itemToRemove.wishlistDocId));
          setWishlist(wishlist.filter(item => item.id !== product.id));
        }
      } else {
        // Add to wishlist
        const docRef = await addDoc(wishlistRef, {
          userId: userId,
          productId: product.id,
          name: product.name,
          imgUrl: product.imgUrl,
          finalPrice: product.finalPrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          reviews: product.reviews,
          code: product.code,
          hidden: product.hidden,
          stock: product.stock
        });

        setWishlist([...wishlist, { ...product, wishlistDocId: docRef.id }]);
        setWishlistAlert(true);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showSnackbar("Error updating wishlist: " + error.message, 'error');
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        const wishlistRef = collection(db, 'wishlist');
        const q = query(wishlistRef, where("userId", "==", user.uid));

        try {
          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.data().productId, // Use productId as the 'id'
            wishlistDocId: doc.id // Store the document ID for deletion
          }));
          setWishlist(items);
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    };

    fetchWishlist();
  }, [user]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsArr = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            price: Number(data.price),
            code: data.code,
            stock: Number(data.stock) || 0,
            images: Array.isArray(data.images) ? data.images : [], // Ensure images is an array
            imgUrl: Array.isArray(data.images) && data.images.length > 0 
              ? data.images[0]  // Use the first image as main image
              : 'https://via.placeholder.com/150', // Fallback image
            rating: data.rating || 4.0,
            reviews: data.reviews || 0,
            isFeatured: data.isFeatured || false,
            hidden: data.hidden || false
          };
        });

        // Calculate additional details for each product
        const processedProducts = productsArr.map(product => {
          // Calculate discount
          let discount = 0;
          const price = product.price;

          if (price >= 50 && price <= 300) discount = 10;
          else if (price > 300 && price <= 1000) discount = 20;
          else if (price > 1000) discount = 25;

          const originalPrice = Math.ceil(price / (1 - discount/100));

          // Determine stock status
          let stockStatus = 'normal';
          if (product.stock === 0) {
            stockStatus = 'out_of_stock';
          } else if (product.stock < 10) {
            stockStatus = 'critical';
          } else if (product.stock < 20) {
            stockStatus = 'low';
          }

          return {
            ...product,
            originalPrice: originalPrice,
            finalPrice: price,
            discount: discount,
            stockStatus: stockStatus
          };
        });

        setProducts(processedProducts);
        setFilteredProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  // Toggle filter sections
  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    });
  };

  // Alert close handlers
  const handleCloseLoginAlert = () => {
    setLoginAlert(false);
    navigate('/auth');
  };

  const handleCloseWishlistAlert = () => {
    setWishlistAlert(false);
  };

  const handleCloseAddedToCartAlert = () => {
    setAddedToCartAlert(false);
  };

  // Price formatter
  const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (originalPrice, finalPrice) => {
    return finalPrice;
  };

  // Filter drawer for mobile
  const filterDrawer = (
    <Box sx={{ width: isMobile ? 250 : 320, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Search in mobile view */}
      <Box sx={{ mb: 2, display: { xs: 'block', md: 'none' } }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Price Range Filter */}
      <FilterSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PriceChange sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Price Range
            </Typography>
          </Box>
          <ExpandButton
            size="small"
            expanded={expanded.price}
            onClick={() => toggleSection('price')}
            edge="end"
          >
            {expanded.price ? <ExpandLess /> : <ExpandMore />}
          </ExpandButton>
        </Box>
        <Collapse in={expanded.price} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue)}
              min={100}
              max={5000}
              step={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${value}`}
              sx={{
                '& .MuiSlider-thumb': {
                  height: 24,
                  width: 24,
                  backgroundColor: '#fff',
                  border: '2px solid currentColor',
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'inherit',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Min: {formatPrice(priceRange[0])}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max: {formatPrice(priceRange[1])}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </FilterSection>

      {/* Sort By Filter */}
      <FilterSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Sort sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Sort By
            </Typography>
          </Box>
          <ExpandButton
            size="small"
            expanded={expanded.sort}
            onClick={() => toggleSection('sort')}
            edge="end"
          >
            {expanded.sort ? <ExpandLess /> : <ExpandMore />}
          </ExpandButton>
        </Box>
        <Collapse in={expanded.sort} timeout="auto" unmountOnExit>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiSelect-select': { py: 1.5 } }}
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
              <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>
        </Collapse>
      </FilterSection>

      {/* Reset Filters */}
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        startIcon={<Refresh />}
        onClick={resetFilters}
        sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
      >
        Reset Filters
      </Button>
    </Box>
  );

  // Render product cards
  const renderProductCards = () => {
    if (loading) {
      return Array(8).fill(0).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
          <Fade in={true} timeout={500 + index * 100}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="rectangular" height={36} />
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      ));
    }

    if (filteredProducts.length === 0) {
      return (
        <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
          <Typography variant="h5" color="text.secondary">
            No products found matching your criteria
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={resetFilters}
            sx={{ mt: 2 }}
          >
            Reset Filters
          </Button>
        </Box>
      );
    }

    return filteredProducts.map((product, index) => {
      // Determine product status for UI elements
      const isOutOfStock = product.stock === 0;
      const isHidden = product.hidden;
      const isUnavailable = isHidden || isOutOfStock;
      const stockStatus = isOutOfStock ? 'out_of_stock' : product.stockStatus;
      
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <Zoom in={true} timeout={500 + index * 100}>
            <ProductCard 
              elevation={3} 
              isHidden={isHidden}
              stockStatus={stockStatus}
            >
              {/* New Availability Ribbon */}
              {isHidden && (
                <AvailabilityRibbon status="unavailable">
                  CURRENTLY UNAVAILABLE
                </AvailabilityRibbon>
              )}
              {!isHidden && isOutOfStock && (
                <AvailabilityRibbon status="out_of_stock">
                  OUT OF STOCK
                </AvailabilityRibbon>
              )}
              
              {/* Stock indicator badge for low stock */}
              {!isHidden && !isOutOfStock && product.stock < 20 && (
                <StockBadge 
                  stockLevel={product.stock < 10 ? 'critical' : 'low'}
                  label={product.stock < 10 ? `Only ${product.stock} left!` : 'Few items left!'}
                  icon={<Warning fontSize="small" />}
                />
              )}
              
              {product.isFeatured && (
                <ProductBadge
                  label="Featured"
                  color="primary"
                  size="small"
                />
              )}
              
              <CardActionArea 
                onClick={() => handleProductClick(product.id, product.code)}
                disabled={isUnavailable}
                sx={{ 
                  opacity: isUnavailable ? 0.7 : 1, 
                  cursor: isUnavailable ? 'default' : 'pointer'
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imgUrl || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: isUnavailable ? 'none' : 'scale(1.05)',
                    },
                    filter: isUnavailable ? 'grayscale(50%)' : 'none',
                  }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {product.name}
                    {isHidden && (
                      <Tooltip title="This product is currently unavailable">
                        <VisibilityOff fontSize="small" color="warning" sx={{ ml: 1, verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <StyledRating
                      name={`rating-${product.id}`}
                      value={parseFloat(product.rating)}
                      readOnly
                      precision={0.1}
                      size="small"
                      icon={<Star fontSize="inherit" />}
                      emptyIcon={<StarBorder fontSize="inherit" />}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {product.rating} ({product.reviews})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" fontWeight={600} color="primary">
                      {formatPrice(product.price)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1, textDecoration: 'line-through' }}>
                      {formatPrice(product.originalPrice)}
                    </Typography>
                    <Chip
                      label={`${product.discount}% off`}
                      size="small"
                      color="error"
                      sx={{ ml: 1, height: 20 }}
                    />
                  </Box>
                  
                  {/* Stock status indication */}
                  {!isHidden && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {isOutOfStock ? (
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <Warning fontSize="small" sx={{ mr: 0.5 }} /> 
                          Out of Stock
                        </Typography>
                      ) : product.stock < 10 ? (
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <Warning fontSize="small" sx={{ mr: 0.5 }} /> 
                          Only {product.stock} left!
                        </Typography>
                      ) : product.stock < 20 ? (
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} /> 
                          Few items left
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                          In Stock
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Code: {product.code}
                  </Typography>

                  {/* Product image thumbnails */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {product.images && product.images.map((imgUrl, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          overflow: 'hidden',
                          border: '1px solid #eee',
                          cursor: 'pointer',
                          opacity: isUnavailable ? 0.5 : 1,
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`${product.name} - ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ mt: 'auto', justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddShoppingCart />}
                  size="small"
                  onClick={(e) => handleAddToCart(product, e)}
                  disabled={isUnavailable}
                  sx={{
                    borderRadius: 2,
                    flexGrow: 1,
                    mr: 1,
                    '&:hover': {
                      transform: isUnavailable ? 'none' : 'translateY(-2px)',
                    },
                    transition: 'transform 0.2s ease-in-out',
                    opacity: isUnavailable ? 0.6 : 1,
                  }}
                >
                  {isOutOfStock ? 'Out of Stock' : isHidden ? 'Unavailable' : 'Add to Cart'}
                </Button>
                <IconButton
                  color={wishlist.some(item => item.id === product.id) ? 'error' : 'default'}
                  onClick={(e) => handleToggleWishlist(product, e)}
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: '50%',
                    p: 1,
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                    transition: 'transform 0.2s ease-in-out, color 0.2s ease-in-out',
                  }}
                >
                  {wishlist.some(item => item.id === product.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </CardActions>
            </ProductCard>
          </Zoom>
        </Grid>
      );
    });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 2 }}>
      {/* Alerts */}
      <Snackbar
        open={loginAlert}
        autoHideDuration={3000}
        onClose={handleCloseLoginAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseLoginAlert} severity="warning" sx={{ width: '100%' }}>
          Please log in to continue!
        </Alert>
      </Snackbar>

      <Snackbar
        open={wishlistAlert}
        autoHideDuration={3000}
        onClose={handleCloseWishlistAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseWishlistAlert} severity="success" sx={{ width: '100%' }}>
          Product added to wishlist!
        </Alert>
      </Snackbar>

      <Snackbar
        open={addedToCartAlert}
        autoHideDuration={3000}
        onClose={handleCloseAddedToCartAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAddedToCartAlert} severity="success" sx={{ width: '100%' }}>
          {cartMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar?.severity || 'success'} 
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>

      {/* Main Container */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Explore Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find the perfect product for your needs
          </Typography>
        </Box>

        {/* Search & Filter Bar */}
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Search */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 2, py: 0.5 }
              }}
            />
          </Box>
          
          {/* Filter Toggle Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDrawerOpen(true)}
            startIcon={<FilterAlt />}
            sx={{
              display: { xs: 'flex', md: 'none' },
              borderRadius: 2,
              px: 2,
            }}
          >
            Filters
          </Button>
          
          {/* Result Count */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredProducts.length} products found
            </Typography>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Filter Panel (Desktop) */}
          <Box
            component={Paper}
            elevation={2}
            sx={{
              width: { md: 280, lg: 320 },
              p: 2,
              mr: { md: 3 },
              mb: { xs: 3, md: 0 },
              borderRadius: 2,
              display: { xs: 'none', md: 'block' },
            }}
          >
            {filterDrawer}
          </Box>

          {/* Product Grid */}
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
              {renderProductCards()}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Filter Drawer (Mobile) */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        {filterDrawer}
      </SwipeableDrawer>

      {/* Quantity Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6">Choose Quantity</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <IconButton
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              color="primary"
              sx={{ border: '1px solid #ddd' }}
            >
              <Remove />
            </IconButton>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || 1)))}
              inputProps={{ min: 1, max: selectedProduct?.stock || 1 }}
              sx={{ mx: 2, width: '100%' }}
            />
            <IconButton
              onClick={() => setQuantity(Math.min(quantity + 1, selectedProduct?.stock || 999))}
              color="primary"
              sx={{ border: '1px solid #ddd' }}
              disabled={quantity >= (selectedProduct?.stock || 1)}
            >
              <Add />
            </IconButton>
          </Box>
          
          {selectedProduct && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Product Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar
                  src={selectedProduct.imgUrl || 'https://via.placeholder.com/150'}
                  alt={selectedProduct.name}
                  variant="rounded"
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">{selectedProduct.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {selectedProduct.code}
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight="bold">
                    {formatPrice(selectedProduct.finalPrice)}
                  </Typography>
                  {selectedProduct.stock > 0 && (
                    <Typography variant="body2" color={selectedProduct.stock < 10 ? "error.main" : "success.main"}>
                      {selectedProduct.stock < 10 ? `Only ${selectedProduct.stock} in stock` : "In Stock"}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Image Gallery */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {selectedProduct.images?.map((imgUrl, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid #eee'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${selectedProduct.name} - ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          
          <Box sx={{ mt: 3, bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
            <Typography variant="body2">
              Total: <strong>{selectedProduct ? formatPrice(selectedProduct.finalPrice * quantity) : ''}</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenModal(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmAddToCart} 
            variant="contained"
            startIcon={<ShoppingCart />}
            disabled={selectedProduct?.stock < 1}
            sx={{ borderRadius: 2 }}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Scroll to top button */}
      <Zoom in={true}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 2,
          }}
        >
          <Tooltip title="Back to top">
            <IconButton
              color="primary"
              aria-label="back to top"
              component="span"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              <ExpandLess />
            </IconButton>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Cart badge button */}
      <Zoom in={!!user}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 2,
            display: { xs: 'block', md: 'none' },
          }}
        >
          <Tooltip title="View Cart">
            <IconButton
              color="primary"
              aria-label="shopping cart"
              component="span"
              onClick={() => navigate('/cart')}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                p: 2,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                }
              }}
            >
              <StyledBadge badgeContent={4} color="error">
                <ShoppingCart />
              </StyledBadge>
            </IconButton>
          </Tooltip>
        </Box>
      </Zoom>
    </Box>
  );
};

export default Products;