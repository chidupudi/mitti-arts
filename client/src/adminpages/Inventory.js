import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Chip,
  CircularProgress,
  Fab,
  Avatar,
  CardActions,
  Divider,
  Container,
  Paper,
  Zoom,
  Slide,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Stack,
  Badge,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  Save,
  Cancel,
  Image as ImageIcon,
  CloudUpload,
  Inventory2,
  AttachMoney,
  QrCode,
  PhotoCamera,
  FilterList,
  Search,
  Warning,
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc 
} from 'firebase/firestore';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinary';

// Custom theme with terracotta colors
const terracottaTheme = createTheme({
  palette: {
    primary: {
      main: '#CD853F', // Terracotta
      light: '#E4A05F',
      dark: '#8B4513',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D2691E', // Chocolate
      light: '#E6924E',
      dark: '#A0522D',
    },
    accent: {
      main: '#F4A460', // Sandy Brown
      light: '#F7C280',
      dark: '#C17030',
    },
    background: {
      default: '#FFF8F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5D4037',
      secondary: '#8D6E63',
    },
    success: {
      main: '#8BC34A',
    },
    error: {
      main: '#E57373',
    },
    warning: {
      main: '#FFB74D',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#5D4037',
    },
    h6: {
      fontWeight: 600,
      color: '#5D4037',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(205, 133, 63, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 16px 48px rgba(205, 133, 63, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },
  },
});

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #FFF5F0 100%)`,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 24,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-30%',
    left: '-10%',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
  },
}));

const ProductCard = styled(Card)(({ theme, isHidden }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  opacity: isHidden ? 0.7 : 1,
  border: `2px solid ${isHidden ? theme.palette.warning.light : 'transparent'}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '20px 20px 0 0',
  },
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 200,
  backgroundColor: theme.palette.grey[100],
  borderRadius: 16,
  overflow: 'hidden',
  border: `2px dashed ${theme.palette.primary.light}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  },
  zIndex: 1000,
}));

const StatsChip = styled(Chip)(({ theme, variant }) => ({
  borderRadius: 8,
  fontWeight: 600,
  ...(variant === 'price' && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    color: 'white',
  }),
  ...(variant === 'stock' && {
    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
    color: 'white',
  }),
  ...(variant === 'code' && {
    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
    color: 'white',
  }),
}));

const Inventory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [products, setProducts] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    images: Array(8).fill(''),
    price: '',
    code: '',
    stock: 50,
  });
  const [editProduct, setEditProduct] = useState(null);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsArr = [];
        querySnapshot.forEach((doc) => {
          productsArr.push({ 
            id: doc.id,
            ...doc.data()
          });
        });
        setProducts(productsArr);
      } catch (error) {
        console.error('Error fetching products:', error);
        showSnackbar('Error loading products: ' + error.message, 'error');
      }
    };
    fetchProducts();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Add new product to Firestore
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      showSnackbar('Please fill in required fields', 'error');
      return;
    }

    try {
      const productData = {
        ...newProduct,
        price: Number(newProduct.price),
        images: newProduct.images.filter(url => url && url !== 'loading'),
        stock: Number(newProduct.stock) || 50,
        hidden: false,
        inStock: true,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      setProducts([
        ...products,
        { ...productData, id: docRef.id }
      ]);

      setNewProduct({
        name: '',
        description: '',
        images: Array(8).fill(''),
        price: '',
        code: '',
        stock: 50,
      });
      setAddDialogOpen(false);
      showSnackbar('Product added successfully!', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      showSnackbar('Failed to add product. Please try again.', 'error');
    }
  };

  // Remove product with confirmation
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      showSnackbar('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error removing product:', error);
      showSnackbar('Error deleting product: ' + error.message, 'error');
    }
  };

  // Update product visibility in Firestore
  const handleToggleHide = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const updatedFields = {
        hidden: !product.hidden,
        inStock: !product.hidden ? false : true,
        updatedAt: new Date()
      };

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, updatedFields);
      
      setProducts(products.map(p =>
        p.id === id ? { ...p, ...updatedFields } : p
      ));
      
      showSnackbar(
        `Product ${!product.hidden ? 'hidden' : 'unhidden'} successfully!`, 
        'success'
      );
    } catch (error) {
      console.error('Error updating product visibility:', error);
      showSnackbar('Error updating product visibility: ' + error.message, 'error');
    }
  };

  // Edit product in Firestore
  const handleSaveEdit = async () => {
    if (!editProduct?.name || !editProduct?.price) {
      showSnackbar('Please fill in required fields', 'error');
      return;
    }

    try {
      if (!editProduct?.id) {
        throw new Error('No product ID found');
      }

      const { id, ...updateData } = editProduct;
      
      const updatedProduct = {
        ...updateData,
        price: Number(updateData.price) || 0,
        images: (updateData.images || []).filter(url => url && url !== 'loading'),
        updatedAt: new Date()
      };

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, updatedProduct);
      
      setProducts(products.map(p =>
        p.id === id ? { id, ...updatedProduct } : p
      ));
      
      setEditDialogOpen(false);
      setEditProduct(null);
      showSnackbar('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar('Error updating product: ' + error.message, 'error');
    }
  };

  // Edit product handler
  const handleEditProduct = (product) => {
    setEditProduct({ ...product });
    setEditDialogOpen(true);
  };

  // Update edit form handlers
  const handleEditChange = (field, value) => {
    if (!editProduct) return;

    try {
      let processedValue = value;
      
      switch(field) {
        case 'images':
          processedValue = Array.isArray(value) ? value : Array(8).fill('');
          break;
        case 'price':
        case 'stock':
          processedValue = value === '' ? 0 : Number(value);
          break;
        default:
          processedValue = value;
      }

      setEditProduct(prev => ({
        ...prev,
        [field]: processedValue
      }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e, index, isEdit = false) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      validateImageFile(file);

      const updateImages = (prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = 'loading';
        return newImages;
      };

      if (isEdit) {
        setEditProduct(prev => ({
          ...prev,
          images: updateImages(prev.images)
        }));
      } else {
        setNewProduct(prev => ({
          ...prev,
          images: updateImages(prev.images)
        }));
      }

      const imageUrl = await uploadToCloudinary(file);

      if (isEdit) {
        setEditProduct(prev => {
          const newImages = [...prev.images];
          newImages[index] = imageUrl;
          return { ...prev, images: newImages };
        });
      } else {
        setNewProduct(prev => {
          const newImages = [...prev.images];
          newImages[index] = imageUrl;
          return { ...prev, images: newImages };
        });
      }
      
      showSnackbar('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (isEdit) {
        setEditProduct(prev => {
          const newImages = [...prev.images];
          newImages[index] = '';
          return { ...prev, images: newImages };
        });
      } else {
        setNewProduct(prev => {
          const newImages = [...prev.images];
          newImages[index] = '';
          return { ...prev, images: newImages };
        });
      }
      
      showSnackbar(error.message || 'Failed to upload image. Please try again.', 'error');
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalProducts = products.length;
  const hiddenProducts = products.filter(p => p.hidden).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  return (
    <ThemeProvider theme={terracottaTheme}>
      <StyledContainer maxWidth="xl">
        {/* Hero Section */}
        <HeroSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <Inventory2 sx={{ fontSize: 32 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
                Inventory Management
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Manage your products with style and efficiency
              </Typography>
            </Box>
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 3 }}>
                  <Typography variant="h6" color="primary.main">{totalProducts}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Products</Typography>
                </Paper>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 3 }}>
                  <Typography variant="h6" color="warning.main">{lowStockProducts}</Typography>
                  <Typography variant="body2" color="text.secondary">Low Stock</Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </HeroSection>

        {/* Search and Filter Section */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search products..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, flex: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {filteredProducts.length} of {totalProducts} products
            </Typography>
          </Box>
        </Paper>

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} lg={4} key={product.id}>
              <Zoom in timeout={300}>
                <ProductCard isHidden={product.hidden}>
                  {product.images && product.images.length > 0 && product.images[0] ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.images[0]}
                      alt={product.name}
                      sx={{ borderRadius: '16px 16px 0 0' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        borderRadius: '16px 16px 0 0',
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={product.hidden ? "Show Product" : "Hide Product"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleHide(product.id)}
                            sx={{ color: product.hidden ? 'warning.main' : 'text.secondary' }}
                          >
                            {product.hidden ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Product">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditProduct(product)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(product)}
                            sx={{ color: 'error.main' }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>

                    {/* Additional Images */}
                    {product.images && product.images.length > 1 && (
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {product.images.slice(1, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${product.name}-${idx + 1}`}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '2px solid #f0f0f0',
                            }}
                          />
                        ))}
                        {product.images.length > 4 && (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              bgcolor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #f0f0f0',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              +{product.images.length - 4}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      <StatsChip 
                        label={`₹${product.price}`} 
                        variant="price"
                        size="small"
                        icon={<AttachMoney />}
                      />
                      <StatsChip 
                        label={product.code} 
                        variant="code"
                        size="small"
                        icon={<QrCode />}
                      />
                      <Badge 
                        badgeContent={product.stock < 10 ? <Warning sx={{ fontSize: 12 }} /> : null}
                        color="warning"
                      >
                        <StatsChip 
                          label={`Stock: ${product.stock}`} 
                          variant="stock"
                          size="small"
                          color={product.stock > 10 ? "success" : "error"}
                        />
                      </Badge>
                      {product.hidden && (
                        <Chip 
                          label="Hidden" 
                          size="small"
                          color="warning" 
                          variant="outlined"
                        />
                      )}
                      <Chip 
                        label={product.inStock ? "In Stock" : "Out of Stock"} 
                        size="small"
                        color={product.inStock ? "success" : "error"}
                        variant="outlined"
                      />
                    </Stack>
                  </CardContent>
                </ProductCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Floating Action Button */}
        <StyledFab
          onClick={() => setAddDialogOpen(true)}
          aria-label="add product"
        >
          <Add />
        </StyledFab>

        {/* Add Product Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add />
              Add New Product
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name *"
                  fullWidth
                  margin="normal"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  error={!newProduct.name}
                  helperText={!newProduct.name ? "Product name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Code"
                  fullWidth
                  margin="normal"
                  value={newProduct.code}
                  onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Price *"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  error={!newProduct.price}
                  helperText={!newProduct.price ? "Price is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Stock Quantity"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCamera />
                Product Images (Up to 8)
              </Typography>
              <Grid container spacing={2}>
                {newProduct.images.map((url, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <ImageContainer>
                      {url === 'loading' ? (
                        <CircularProgress />
                      ) : url ? (
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 12,
                            }}
                          />
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              bgcolor: 'white',
                              '&:hover': { bgcolor: 'grey.100' }
                            }}
                            size="small"
                            onClick={() => {
                              const newImages = [...newProduct.images];
                              newImages[index] = '';
                              setNewProduct({ ...newProduct, images: newImages });
                            }}
                          >
                            <Cancel color="error" />
                          </IconButton>
                        </Box>
                      ) : (
                        <label style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, index, false)}
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            p: 2,
                          }}>
                            <CloudUpload sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              Upload Image {index + 1}
                            </Typography>
                          </Box>
                        </label>
                      )}
                    </ImageContainer>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setAddDialogOpen(false)} 
              startIcon={<Cancel />}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct} 
              variant="contained" 
              startIcon={<Save />}
              sx={{ borderRadius: 3 }}
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', p: 3 }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Edit />
              Edit Product
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name *"
                  fullWidth
                  margin="normal"
                  value={editProduct?.name || ''}
                  onChange={e => handleEditChange('name', e.target.value)}
                  error={!editProduct?.name}
                  helperText={!editProduct?.name ? "Product name is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Code"
                  fullWidth
                  margin="normal"
                  value={editProduct?.code || ''}
                  onChange={e => handleEditChange('code', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  value={editProduct?.description || ''}
                  onChange={e => handleEditChange('description', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Price *"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editProduct?.price || ''}
                  onChange={e => handleEditChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  error={!editProduct?.price}
                  helperText={!editProduct?.price ? "Price is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Stock Quantity"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editProduct?.stock || 0}
                  onChange={e => handleEditChange('stock', Number(e.target.value))}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCamera />
                Product Images (Up to 8)
              </Typography>
              <Grid container spacing={2}>
                {editProduct?.images?.map((url, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <ImageContainer>
                      {url === 'loading' ? (
                        <CircularProgress />
                      ) : url ? (
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 12,
                            }}
                          />
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              bgcolor: 'white',
                              '&:hover': { bgcolor: 'grey.100' }
                            }}
                            size="small"
                            onClick={() => {
                              const newImages = [...editProduct.images];
                              newImages[index] = '';
                              handleEditChange('images', newImages);
                            }}
                          >
                            <Cancel color="error" />
                          </IconButton>
                        </Box>
                      ) : (
                        <label style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, index, true)}
                          />
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            p: 2,
                          }}>
                            <CloudUpload sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              Upload Image {index + 1}
                            </Typography>
                          </Box>
                        </label>
                      )}
                    </ImageContainer>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              startIcon={<Cancel />}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained" 
              startIcon={<Save />}
              sx={{ borderRadius: 3 }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, overflow: 'hidden' }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', p: 3 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning />
              Confirm Delete
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography variant="body1">
              Are you sure you want to delete{' '}
              <strong>{productToDelete?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This will permanently remove the product from your inventory.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{ borderRadius: 3 }}
            >
              Delete Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Paper 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '2px dashed',
              borderColor: 'primary.light',
            }}
          >
            <Inventory2 sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchTerm ? 'No products found' : 'No products yet'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm 
                ? `No products match "${searchTerm}". Try adjusting your search.`
                : 'Start building your inventory by adding your first product.'
              }
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Add Your First Product
              </Button>
            )}
          </Paper>
        )}
      </StyledContainer>
    </ThemeProvider>
  );
};

export default Inventory;