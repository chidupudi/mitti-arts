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
  Container,
  Paper,
  Zoom,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Stack,
  Badge,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
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
  Dashboard as DashboardIcon,
  Analytics,
  Settings,
  ViewList,
  ViewModule,
  MoreVert,
  TrendingUp,
  TrendingDown,
  GridView,
  Refresh,
  Export,
  Import,
  Sort,
  AssignmentTurnedIn,
  InventoryRounded,
  Schedule,
  CheckCircle,
  Favorite,
  People,
  Store,
  NotificationsActive,
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

// Terracotta Theme (matching dashboard)
const terracottaTheme = createTheme({
  palette: {
    primary: {
      main: '#D2691E',
      light: '#F4A460',
      dark: '#A0522D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B4513',
      light: '#CD853F',
      dark: '#654321',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF0E6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3E2723',
      secondary: '#5D4037',
    },
    success: {
      main: '#6B7821',
      light: '#8BC34A',
    },
    warning: {
      main: '#FF8F00',
      light: '#FFB74D',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
    },
    info: {
      main: '#0277BD',
      light: '#29B6F6',
    },
    grey: {
      50: '#FAF0E6',
      100: '#F5EBE0',
      200: '#E8D5C4',
      300: '#DCC5A7',
      400: '#C4A47C',
      500: '#8B7355',
      600: '#6D5B47',
      700: '#5D4E42',
      800: '#3E2723',
      900: '#2E1A16',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(210, 105, 30, 0.08)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 40px rgba(210, 105, 30, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D2691E',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

// Styled Components with Terracotta Theme
const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: '#FFFFFF',
  minHeight: 80,
  borderRadius: '0 0 24px 24px',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    minHeight: 70,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(2),
  },
}));

const NavigationButton = styled(Button)(({ theme, active }) => ({
  color: '#FFFFFF',
  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: 'translateY(-1px)',
  },
  borderRadius: 12,
  padding: '8px 20px',
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: active ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: '6px 12px',
    minWidth: 'auto',
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
  color: 'white',
  minHeight: 140,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)',
  },
  '&.success': {
    background: 'linear-gradient(135deg, #6B7821 0%, #8BC34A 100%)',
  },
  '&.warning': {
    background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
  },
  '&.info': {
    background: 'linear-gradient(135deg, #0277BD 0%, #29B6F6 100%)',
  },
}));

const ProductCard = styled(Card)(({ theme, isHidden }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  opacity: isHidden ? 0.7 : 1,
  border: isHidden ? `2px solid ${theme.palette.warning.light}` : `1px solid ${theme.palette.grey[200]}`,
  '&::before': isHidden ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.warning.main,
    borderRadius: '16px 16px 0 0',
    zIndex: 1,
  } : {},
}));

const FilterPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  background: '#FFFFFF',
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 16,
}));

// Admin Header Component
const AdminHeader = ({ currentPage = 'inventory' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      key: 'dashboard'
    },
    {
      label: 'Inventory',
      icon: <InventoryRounded />,
      path: '/inventory',
      key: 'inventory'
    },
    {
      label: 'Admin Orders',
      icon: <AssignmentTurnedIn />,
      path: '/adminorders',
      key: 'adminorders'
    }
  ];

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'inventory':
        return 'Inventory Management';
      case 'adminorders':
        return 'Order Management';
      default:
        return 'Admin Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (currentPage) {
      case 'inventory':
        return 'Manage your product inventory and stock levels';
      case 'adminorders':
        return 'Track and manage customer orders';
      default:
        return "Welcome back! Here's what's happening with your store today.";
    }
  };

  return (
    <AppBar position="static" elevation={0} sx={{ background: 'transparent' }}>
      <Container maxWidth="xl">
        <HeaderToolbar>
          <Box sx={{ 
            display: 'flex', 
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            gap: isMobile ? 1 : 0
          }}>
            <Box sx={{ 
              flexGrow: 1,
              mb: isMobile ? 2 : 0
            }}>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                {getPageTitle()}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9, 
                  mt: 0.5,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  display: isSmallMobile ? 'none' : 'block'
                }}
              >
                {getPageDescription()}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 1.5, md: 2 },
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}>
              {navigationItems.map((item) => (
                <NavigationButton
                  key={item.key}
                  startIcon={!isSmallMobile ? item.icon : null}
                  onClick={() => handleNavigation(item.path)}
                  active={currentPage === item.key}
                  size={isSmallMobile ? 'small' : 'medium'}
                >
                  {isSmallMobile ? item.icon : item.label}
                </NavigationButton>
              ))}
              
              <Tooltip title="Refresh Data">
                <IconButton 
                  color="inherit" 
                  onClick={() => window.location.reload()}
                  size={isSmallMobile ? 'small' : 'medium'}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    ml: 1
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </HeaderToolbar>
      </Container>
    </AppBar>
  );
};

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    images: Array(8).fill(''),
    price: '',
    code: '',
    stock: 50,
    category: '',
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
        category: '',
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
        `Product ${!product.hidden ? 'hidden' : 'shown'} successfully!`, 
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

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterCategory === 'all' || 
        (filterCategory === 'hidden' && product.hidden) ||
        (filterCategory === 'visible' && !product.hidden) ||
        (filterCategory === 'low-stock' && product.stock < 10);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.stock - b.stock;
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Statistics
  const totalProducts = products.length;
  const hiddenProducts = products.filter(p => p.hidden).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <ThemeProvider theme={terracottaTheme}>
      <Box sx={{ 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        pb: 4
      }}>
        {/* Admin Header Component */}
        <AdminHeader currentPage="inventory" />

        <StyledContainer maxWidth="xl">
          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    mr: 2
                  }}>
                    <Inventory2 sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {totalProducts}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Total Products
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      In inventory
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard className="success">
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    mr: 2
                  }}>
                    <AttachMoney sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ₹{totalValue.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Total Value
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Inventory worth
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard className="warning">
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    mr: 2
                  }}>
                    <Warning sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {lowStockProducts}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Low Stock Items
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Need attention
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard className="info">
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    mr: 2
                  }}>
                    <VisibilityOff sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {hiddenProducts}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Hidden Products
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Not visible to customers
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>

          {/* Filter and Search Panel */}
          <FilterPanel>
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
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterCategory}
                label="Filter"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="visible">Visible Only</MenuItem>
                <MenuItem value="hidden">Hidden Only</MenuItem>
                <MenuItem value="low-stock">Low Stock</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="created">Created Date</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ 
                ml: 'auto',
                background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                },
              }}
            >
              Add Product
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Grid View">
                <IconButton
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <GridView />
                </IconButton>
              </Tooltip>
              <Tooltip title="Table View">
                <IconButton
                  color={viewMode === 'table' ? 'primary' : 'default'}
                  onClick={() => setViewMode('table')}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </FilterPanel>

          {/* Products Display */}
          {viewMode === 'grid' ? (
            <>
              <Grid container spacing={3}>
                {paginatedProducts.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={product.id}>
                    <Zoom in timeout={300}>
                      <ProductCard isHidden={product.hidden}>
                        {/* Product Image */}
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={product.images[0]}
                            alt={product.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 200,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                          </Box>
                        )}
                        
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          {/* Product Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                              {product.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle menu open
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.description || 'No description available'}
                          </Typography>

                          {/* Price and Stock */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                              ₹{product.price?.toLocaleString()}
                            </Typography>
                            <Chip 
                              label={`Stock: ${product.stock}`}
                              size="small"
                              color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                              variant="outlined"
                            />
                          </Box>

                          {/* Product Code */}
                          {product.code && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              Code: {product.code}
                            </Typography>
                          )}

                          {/* Status Chips */}
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                            {product.hidden && (
                              <Chip 
                                label="Hidden" 
                                size="small"
                                color="warning" 
                                variant="filled"
                              />
                            )}
                            <Chip 
                              label={product.inStock ? "In Stock" : "Out of Stock"} 
                              size="small"
                              color={product.inStock ? "success" : "error"}
                              variant="outlined"
                            />
                          </Stack>

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEditProduct(product)}
                              sx={{ flex: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color={product.hidden ? "success" : "warning"}
                              startIcon={product.hidden ? <Visibility /> : <VisibilityOff />}
                              onClick={() => handleToggleHide(product.id)}
                              sx={{ flex: 1 }}
                            >
                              {product.hidden ? 'Show' : 'Hide'}
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </ProductCard>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <TablePagination
                  component="div"
                  count={filteredProducts.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[12, 24, 48, 96]}
                />
              </Box>
            </>
          ) : (
            /* Table View */
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {product.images?.[0] ? (
                            <Avatar
                              src={product.images[0]}
                              alt={product.name}
                              sx={{ width: 48, height: 48, borderRadius: 2 }}
                              variant="rounded"
                            />
                          ) : (
                            <Avatar
                              sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'grey.100' }}
                              variant="rounded"
                            >
                              <ImageIcon color="disabled" />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.description?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.code || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
                          ₹{product.price?.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.stock}
                          size="small"
                          color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {product.hidden && (
                            <Chip label="Hidden" size="small" color="warning" variant="outlined" />
                          )}
                          <Chip 
                            label={product.inStock ? "In Stock" : "Out of Stock"} 
                            size="small"
                            color={product.inStock ? "success" : "error"}
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditProduct(product)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={product.hidden ? "Show" : "Hide"}>
                            <IconButton size="small" onClick={() => handleToggleHide(product.id)}>
                              {product.hidden ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(product)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredProducts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[12, 24, 48, 96]}
              />
            </TableContainer>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <Paper 
              sx={{ 
                p: 8, 
                textAlign: 'center', 
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'grey.300',
                bgcolor: 'grey.50',
              }}
            >
              <Inventory2 sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
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
                  sx={{ 
                    background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                    },
                  }}
                >
                  Add Your First Product
                </Button>
              )}
            </Paper>
          )}
        </StyledContainer>

        {/* Add Product Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add />
              Add New Product
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name"
                  fullWidth
                  margin="normal"
                  required
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
                  placeholder="SKU or product code"
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
                  placeholder="Detailed product description..."
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Price"
                  fullWidth
                  margin="normal"
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  error={!newProduct.price}
                  helperText={!newProduct.price ? "Price is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Stock Quantity"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Category"
                  fullWidth
                  margin="normal"
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Product category"
                />
              </Grid>
            </Grid>

            {/* Image Upload Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCamera />
                Product Images
              </Typography>
              <Grid container spacing={2}>
                {newProduct.images.slice(0, 4).map((url, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Paper
                      sx={{
                        width: '100%',
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                    >
                      {url === 'loading' ? (
                        <CircularProgress size={24} />
                      ) : url ? (
                        <>
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 8,
                            }}
                          />
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4, 
                              bgcolor: 'white',
                              boxShadow: 1,
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
                        </>
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
                          }}>
                            <CloudUpload sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              Upload Image
                            </Typography>
                          </Box>
                        </label>
                      )}
                    </Paper>
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
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProduct} 
              variant="contained" 
              startIcon={<Save />}
              sx={{ 
                background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                },
              }}
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
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', p: 3 }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Edit />
              Edit Product
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Product Name"
                  fullWidth
                  margin="normal"
                  required
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
              <Grid item xs={12} md={4}>
                <TextField
                  label="Price"
                  fullWidth
                  margin="normal"
                  type="number"
                  required
                  value={editProduct?.price || ''}
                  onChange={e => handleEditChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  error={!editProduct?.price}
                  helperText={!editProduct?.price ? "Price is required" : ""}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Stock Quantity"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={editProduct?.stock || 0}
                  onChange={e => handleEditChange('stock', Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Category"
                  fullWidth
                  margin="normal"
                  value={editProduct?.category || ''}
                  onChange={e => handleEditChange('category', e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Image Upload Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhotoCamera />
                Product Images
              </Typography>
              <Grid container spacing={2}>
                {editProduct?.images?.slice(0, 4).map((url, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Paper
                      sx={{
                        width: '100%',
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed',
                        borderColor: 'grey.300',
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                      }}
                    >
                      {url === 'loading' ? (
                        <CircularProgress size={24} />
                      ) : url ? (
                        <>
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 8,
                            }}
                          />
                          <IconButton
                            sx={{ 
                              position: 'absolute', 
                              top: 4, 
                              right: 4, 
                              bgcolor: 'white',
                              boxShadow: 1,
                            }}
                            size="small"
                            onClick={() => {
                              const newImages = [...(editProduct.images || [])];
                              newImages[index] = '';
                              handleEditChange('images', newImages);
                            }}
                          >
                            <Cancel color="error" />
                          </IconButton>
                        </>
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
                          }}>
                            <CloudUpload sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              Upload Image
                            </Typography>
                          </Box>
                        </label>
                      )}
                    </Paper>
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
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained" 
              startIcon={<Save />}
              sx={{ 
                background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #654321 0%, #8B4513 100%)',
                },
              }}
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
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ p: 3 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning color="error" />
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
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Inventory;