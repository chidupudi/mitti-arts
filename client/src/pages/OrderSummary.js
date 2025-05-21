import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../Firebase/Firebase';
import { 
  doc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import sha256 from 'sha256';

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Fade,
  Alert,
  IconButton,
  Chip,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Badge,
  Avatar,
  Snackbar,
  Grid,
  Tooltip,
  Paper,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  styled,
  useTheme
} from '@mui/material';

// MUI Icons
import {
  LocalShipping,
  Payment,
  LocationOn,
  ShoppingBag,
  CheckCircle,
  ArrowForward,
  Edit,
  ArrowBack,
  Home,
  PhoneAndroid,
  Email,
  Person,
  LocationCity,
  Public,
  PinDrop,
  Info,
  LocalOffer,
  ShoppingCart,
  LockOutlined,
  Apartment,
  SignpostOutlined,
  LandscapeOutlined
} from '@mui/icons-material';

// Ant Design Components
import { Form, Card as AntCard, Divider as AntDivider } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  height: '100%',
  background: '#FFFFFF'
}));

const ProductImage = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(2),
  objectFit: 'cover',
  border: '1px solid #eee'
}));

const StyledStepIcon = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: ownerState.active ? theme.palette.primary.main : theme.palette.grey[100],
  borderRadius: '50%',
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: ownerState.active ? '#FFFFFF' : theme.palette.text.disabled
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.primary.main,
    color: '#FFFFFF',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? '#484848' : '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  margin: theme.spacing(2, 0),
  paddingBottom: theme.spacing(1),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 60,
    height: 3,
    backgroundColor: theme.palette.primary.main,
  }
}));

// Step icon component for customization
const CustomStepIcon = (props) => {
  const { active, completed, icon } = props;
  const icons = {
    1: <Person />,
    2: <LocationOn />,
    3: <ShoppingBag />,
    4: <Payment />
  };

  return (
    <StyledStepIcon ownerState={{ active }}>
      {completed ? <CheckCircle /> : icons[icon]}
    </StyledStepIcon>
  );
};

// Define checkout steps
const steps = ['Personal Info', 'Delivery Address', 'Order Review', 'Payment'];

const CheckoutFlow = () => {
  // Theme and responsive setup
  const theme = useTheme();
  theme.palette.primary = {
    ...theme.palette.primary,
    main: '#E07A5F', // Terracotta primary color
    light: '#F2D0C2',
    dark: '#C85A3D',
    contrastText: '#FFFFFF'
  };
  
  theme.palette.secondary = {
    ...theme.palette.secondary,
    main: '#3D405B', // Dark blue secondary color
    light: '#6C6F94',
    dark: '#2A2C3F',
    contrastText: '#FFFFFF'
  };
  
  theme.palette.background = {
    ...theme.palette.background,
    default: '#F8F9FA',
    paper: '#FFFFFF'
  };
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Navigation and location
  const navigate = useNavigate();
  const { state } = useLocation();
  
  // State variables
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(true);
   const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    
  // Form data state
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: ''
  });
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home'
  });
  
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home'
  });
  
  const [formErrors, setFormErrors] = useState({
    personal: {},
    delivery: {},
    billing: {}
  });
  
  // Cart data state
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    shippingCost: 0,
    discount: 0,
    totalPrice: 0
  });

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch user data and cart on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/auth');
          return;
        }

        // Fetch user profile if available
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set personal info
          setPersonalInfo({
            fullName: userData.fullName || userData.name || user.displayName || '',
            email: userData.email || user.email || '',
            phone: userData.phone || user.phoneNumber || '',
            alternatePhone: userData.alternatePhone || ''
          });
          
          // Set delivery address if available
          if (userData.address) {
            setDeliveryAddress(userData.address);
            setBillingAddress(userData.address);
          }
        } else {
          // Set basic info from Firebase auth
          setPersonalInfo({
            fullName: user.displayName || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            alternatePhone: ''
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbarMessage('Error loading your profile');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      }
    };

    const fetchCartData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/auth');
          return;
        }

        // Get the final price from the previous page
        const finalPrice = state?.totalAmount || 0;
        const items = state?.items || [];
        
        // Calculate components matching Cart.js
        const subtotal = finalPrice;
        const shippingCost = subtotal > 0 ? 99 : 0;
        const discount = subtotal > 1000 ? 100 : 0;
        const totalPrice = subtotal + shippingCost - discount; // Calculate correctly

        setCartData({
          items: items,
          subtotal,
          shippingCost,
          discount,
          totalPrice
        });

      } catch (error) {
        console.error('Error fetching cart data:', error);
        setSnackbarMessage('Error loading your cart');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };

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

    const fetchAll = async () => {
      await Promise.all([
        fetchUserData(),
        fetchCartData(),
        fetchProducts()
      ]);
    };

    fetchAll();
  }, [navigate, state]);

  // Handle input changes for personal info
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (formErrors.personal[name]) {
      setFormErrors(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          [name]: null
        }
      }));
    }
  };

  // Handle address changes
  const handleAddressChange = (type, e) => {
    const { name, value } = e.target;
    
    if (type === 'delivery') {
      setDeliveryAddress(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update billing address if same as delivery
      if (sameAsBilling) {
        setBillingAddress(prev => ({
          ...prev,
          [name]: value
        }));
      }
      
      // Clear error for this field if any
      if (formErrors.delivery[name]) {
        setFormErrors(prev => ({
          ...prev,
          delivery: {
            ...prev.delivery,
            [name]: null
          }
        }));
      }
    } else {
      setBillingAddress(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field if any
      if (formErrors.billing[name]) {
        setFormErrors(prev => ({
          ...prev,
          billing: {
            ...prev.billing,
            [name]: null
          }
        }));
      }
    }
  };

  // Handle same as billing toggle
  const handleSameAsBillingChange = (e) => {
    setSameAsBilling(e.target.checked);
    
    if (e.target.checked) {
      setBillingAddress(deliveryAddress);
    }
  };

  // Handle next step
  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    
    // Show success message when moving to next step
    let message = '';
    switch (activeStep) {
      case 0:
        message = 'Personal information saved';
        break;
      case 1:
        message = 'Delivery address saved';
        break;
      case 2:
        message = 'Order details confirmed';
        break;
      default:
        message = 'Step completed successfully';
    }
    
    setSnackbarMessage(message);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Validate current step fields
  const validateCurrentStep = () => {
    let isValid = true;
    const errors = { personal: {}, delivery: {}, billing: {} };
    
    // Phone number regex
    const phoneRegex = /^[6-9]\d{9}$/;
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Pincode regex
    const pincodeRegex = /^\d{6}$/;
    
    if (activeStep === 0) {
      // Validate personal info
      if (!personalInfo.fullName.trim()) {
        errors.personal.fullName = 'Name is required';
        isValid = false;
      }
      
      if (!personalInfo.email.trim()) {
        errors.personal.email = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(personalInfo.email)) {
        errors.personal.email = 'Enter a valid email address';
        isValid = false;
      }
      
      if (!personalInfo.phone.trim()) {
        errors.personal.phone = 'Phone number is required';
        isValid = false;
      } else if (!phoneRegex.test(personalInfo.phone)) {
        errors.personal.phone = 'Enter a valid 10-digit mobile number';
        isValid = false;
      }
      
      if (personalInfo.alternatePhone.trim() && !phoneRegex.test(personalInfo.alternatePhone)) {
        errors.personal.alternatePhone = 'Enter a valid 10-digit mobile number';
        isValid = false;
      }
    } else if (activeStep === 1) {
      // Validate delivery address
      if (!deliveryAddress.addressLine1.trim()) {
        errors.delivery.addressLine1 = 'Address line 1 is required';
        isValid = false;
      }
      
      if (!deliveryAddress.city.trim()) {
        errors.delivery.city = 'City is required';
        isValid = false;
      }
      
      if (!deliveryAddress.state.trim()) {
        errors.delivery.state = 'State is required';
        isValid = false;
      }
      
      if (!deliveryAddress.pincode.trim()) {
        errors.delivery.pincode = 'Pincode is required';
        isValid = false;
      } else if (!pincodeRegex.test(deliveryAddress.pincode)) {
        errors.delivery.pincode = 'Enter a valid 6-digit pincode';
        isValid = false;
      }
      
      // Validate billing address if different from delivery
      if (!sameAsBilling) {
        if (!billingAddress.addressLine1.trim()) {
          errors.billing.addressLine1 = 'Address line 1 is required';
          isValid = false;
        }
        
        if (!billingAddress.city.trim()) {
          errors.billing.city = 'City is required';
          isValid = false;
        }
        
        if (!billingAddress.state.trim()) {
          errors.billing.state = 'State is required';
          isValid = false;
        }
        
        if (!billingAddress.pincode.trim()) {
          errors.billing.pincode = 'Pincode is required';
          isValid = false;
        } else if (!pincodeRegex.test(billingAddress.pincode)) {
          errors.billing.pincode = 'Enter a valid 6-digit pincode';
          isValid = false;
        }
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle edit dialog
  const handleEditField = (field, value) => {
    setEditField(field);
    setEditValue(value);
    setEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (editField && editValue) {
      const fieldParts = editField.split('.');
      
      if (fieldParts.length === 1) {
        setPersonalInfo(prev => ({
          ...prev,
          [fieldParts[0]]: editValue
        }));
      } else if (fieldParts[0] === 'delivery') {
        setDeliveryAddress(prev => ({
          ...prev,
          [fieldParts[1]]: editValue
        }));
        
        // Update billing address if same as delivery
        if (sameAsBilling) {
          setBillingAddress(prev => ({
            ...prev,
            [fieldParts[1]]: editValue
          }));
        }
      } else if (fieldParts[0] === 'billing') {
        setBillingAddress(prev => ({
          ...prev,
          [fieldParts[1]]: editValue
        }));
      }
      
      setSnackbarMessage('Information updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
    
    setEditDialogOpen(false);
  };
  
  // Snackbar close handler
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Helper function to get product details
  const getProductDetails = (productId) => {
    return products.find((p) => String(p.id) === String(productId));
  };

  // Step 1: Personal Information Form
  const renderPersonalInfoForm = () => (
    <StyledPaper elevation={0}>
      <SectionHeading>
        Personal Information
      </SectionHeading>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <StyledTextField
            required
            fullWidth
            label="Full Name"
            name="fullName"
            value={personalInfo.fullName}
            onChange={handlePersonalInfoChange}
            variant="outlined"
            error={!!formErrors.personal.fullName}
            helperText={formErrors.personal.fullName}
            InputProps={{
              startAdornment: <Person sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={personalInfo.email}
            onChange={handlePersonalInfoChange}
            variant="outlined"
            error={!!formErrors.personal.email}
            helperText={formErrors.personal.email}
            InputProps={{
              startAdornment: <Email sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={personalInfo.phone}
            onChange={handlePersonalInfoChange}
            variant="outlined"
            error={!!formErrors.personal.phone}
            helperText={formErrors.personal.phone}
            InputProps={{
              startAdornment: <PhoneAndroid sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <StyledTextField
            fullWidth
            label="Alternate Phone (Optional)"
            name="alternatePhone"
            value={personalInfo.alternatePhone}
            onChange={handlePersonalInfoChange}
            variant="outlined"
            error={!!formErrors.personal.alternatePhone}
            helperText={formErrors.personal.alternatePhone}
            InputProps={{
              startAdornment: <PhoneAndroid sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2 }}>
        <Alert severity="info" variant="outlined" icon={<Info />}>
          Your details are secure and will only be used for delivery purposes.
        </Alert>
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        mt: 3,
        gap: 2
      }}>
        <Button
          variant="contained"
          onClick={handleNext}
          size={isMobile ? "large" : "medium"}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            py: isMobile ? 1.5 : 1,
            maxWidth: 200
          }}
          endIcon={<ArrowForward />}
        >
          Continue
        </Button>
      </Box>
    </StyledPaper>
  );

  // Step 2: Delivery Address Form
  const renderAddressForm = () => (
    <StyledPaper elevation={0}>
      <SectionHeading>
        Delivery Address
      </SectionHeading>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledTextField
            required
            fullWidth
            label="Flat, House No., Building, Company"
            name="addressLine1"
            value={deliveryAddress.addressLine1}
            onChange={(e) => handleAddressChange('delivery', e)}
            variant="outlined"
            error={!!formErrors.delivery.addressLine1}
            helperText={formErrors.delivery.addressLine1}
            InputProps={{
              startAdornment: <Apartment sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Area, Street, Sector, Village"
            name="addressLine2"
            value={deliveryAddress.addressLine2}
            onChange={(e) => handleAddressChange('delivery', e)}
            variant="outlined"
            error={!!formErrors.delivery.addressLine2}
            helperText={formErrors.delivery.addressLine2}
            InputProps={{
              startAdornment: <SignpostOutlined sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <StyledTextField
            fullWidth
            label="Landmark (Optional)"
            name="landmark"
            value={deliveryAddress.landmark}
            onChange={(e) => handleAddressChange('delivery', e)}
            variant="outlined"
            InputProps={{
              startAdornment: <LandscapeOutlined sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StyledTextField
            required
            fullWidth
            label="City/Town/District"
            name="city"
            value={deliveryAddress.city}
            onChange={(e) => handleAddressChange('delivery', e)}
            variant="outlined"
            error={!!formErrors.delivery.city}
            helperText={formErrors.delivery.city}
            InputProps={{
              startAdornment: <LocationCity sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StyledTextField
            required
            fullWidth
            label="State"
            name="state"
            value={deliveryAddress.state}
            onChange={(e) => handleAddressChange('delivery', e)}
            variant="outlined"
            error={!!formErrors.delivery.state}
            helperText={formErrors.delivery.state}
            InputProps={{
              startAdornment: <Public sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <StyledTextField
            required
            fullWidth
            label="Pincode"
            name="pincode"
            value={deliveryAddress.pincode}
            onChange={(e) => handleAddressChange('delivery', e)}
            variant="outlined"
            error={!!formErrors.delivery.pincode}
            helperText={formErrors.delivery.pincode}
            InputProps={{
              startAdornment: <PinDrop sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="address-type-label">Address Type</InputLabel>
            <Select
              labelId="address-type-label"
              id="address-type"
              name="addressType"
              value={deliveryAddress.addressType}
              onChange={(e) => handleAddressChange('delivery', e)}
              label="Address Type"
            >
              <MenuItem value="home">Home</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={sameAsBilling}
              onChange={handleSameAsBillingChange}
              name="sameAsBilling"
              color="primary"
            />
          }
          label="Billing address same as delivery address"
        />
      </Box>
      
      {!sameAsBilling && (
        <>
          <SectionHeading sx={{ mt: 4 }}>
            Billing Address
          </SectionHeading>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StyledTextField
                required
                fullWidth
                label="Flat, House No., Building, Company"
                name="addressLine1"
                value={billingAddress.addressLine1}
                onChange={(e) => handleAddressChange('billing', e)}
                variant="outlined"
                error={!!formErrors.billing.addressLine1}
                helperText={formErrors.billing.addressLine1}
                InputProps={{
                  startAdornment: <Apartment sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Area, Street, Sector, Village"
                name="addressLine2"
                value={billingAddress.addressLine2}
                onChange={(e) => handleAddressChange('billing', e)}
                variant="outlined"
                error={!!formErrors.billing.addressLine2}
                helperText={formErrors.billing.addressLine2}
                InputProps={{
                  startAdornment: <SignpostOutlined sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Landmark (Optional)"
                name="landmark"
                value={billingAddress.landmark}
                onChange={(e) => handleAddressChange('billing', e)}
                variant="outlined"
                InputProps={{
                  startAdornment: <LandscapeOutlined sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="City/Town/District"
                name="city"
                value={billingAddress.city}
                onChange={(e) => handleAddressChange('billing', e)}
                variant="outlined"
                error={!!formErrors.billing.city}
                helperText={formErrors.billing.city}
                InputProps={{
                  startAdornment: <LocationCity sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="State"
                name="state"
                value={billingAddress.state}
                onChange={(e) => handleAddressChange('billing', e)}
                variant="outlined"
                error={!!formErrors.billing.state}
                helperText={formErrors.billing.state}
                InputProps={{
                  startAdornment: <Public sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <StyledTextField
                required
                fullWidth
                label="Pincode"
                name="pincode"
                value={billingAddress.pincode}
                onChange={(e) => handleAddressChange('billing', e)}
                variant="outlined"
                error={!!formErrors.billing.pincode}
                helperText={formErrors.billing.pincode}
                InputProps={{
                  startAdornment: <PinDrop sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="billing-address-type-label">Address Type</InputLabel>
                <Select
                  labelId="billing-address-type-label"
                  id="billing-address-type"
                  name="addressType"
                  value={billingAddress.addressType}
                  onChange={(e) => handleAddressChange('billing', e)}
                  label="Address Type"
                >
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        mt: 3,
        gap: 2
      }}>
        <Button
          onClick={handleBack}
          variant="outlined"
          size={isMobile ? "large" : "medium"}
          startIcon={<ArrowBack />}
          sx={{
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
            },
            maxWidth: 200
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          size={isMobile ? "large" : "medium"}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            py: isMobile ? 1.5 : 1,
            maxWidth: 200
          }}
          endIcon={<ArrowForward />}
        >
          Continue
        </Button>
      </Box>
    </StyledPaper>
  );

  // Step 3: Order Review
  const renderOrderReview = () => (
    <StyledPaper elevation={0}>
      <SectionHeading>
        Order Summary
      </SectionHeading>
      
      <Box sx={{ mb: 3 }}>
        {cartData.items.map((item) => {
          const product = getProductDetails(item.productId);
          if (!product) return null;

          return (
            <Box 
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ProductImage
                  component="img"
                  src={product.images?.[0] || 'https://via.placeholder.com/60'}
                  alt={product.name}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity}
                  </Typography>
                  {product.discount > 0 && (
                    <Chip 
                      label={`${product.discount}% off`}
                      size="small"
                      color="success"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
              <Typography variant="subtitle1" fontWeight={500}>
                ₹{(product.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <SectionHeading>
        Delivery Information
      </SectionHeading>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Person sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body1">
            {personalInfo.fullName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PhoneAndroid sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body1">
            {personalInfo.phone}
            {personalInfo.alternatePhone && `, ${personalInfo.alternatePhone}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <LocationOn sx={{ color: 'text.secondary', mr: 1, mt: 0.5 }} />
          <Box>
            <Typography variant="body1">
              {deliveryAddress.addressLine1}
            </Typography>
            {deliveryAddress.addressLine2 && (
              <Typography variant="body1">
                {deliveryAddress.addressLine2}
              </Typography>
            )}
            {deliveryAddress.landmark && (
              <Typography variant="body1">
                Landmark: {deliveryAddress.landmark}
              </Typography>
            )}
            <Typography variant="body1">
              {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {deliveryAddress.addressType === 'home' ? 'Home' : 
               deliveryAddress.addressType === 'work' ? 'Work' : 'Other'} Address
            </Typography>
          </Box>
        </Box>
      </Box>

      {!sameAsBilling && (
        <>
          <SectionHeading>
            Billing Information
          </SectionHeading>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocationOn sx={{ color: 'text.secondary', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="body1">
                  {billingAddress.addressLine1}
                </Typography>
                {billingAddress.addressLine2 && (
                  <Typography variant="body1">
                    {billingAddress.addressLine2}
                  </Typography>
                )}
                {billingAddress.landmark && (
                  <Typography variant="body1">
                    Landmark: {billingAddress.landmark}
                  </Typography>
                )}
                <Typography variant="body1">
                  {billingAddress.city}, {billingAddress.state} - {billingAddress.pincode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {billingAddress.addressType === 'home' ? 'Home' : 
                   billingAddress.addressType === 'work' ? 'Work' : 'Other'} Address
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        mt: 3,
        gap: 2
      }}>
        <Button
          onClick={handleBack}
          variant="outlined"
          size={isMobile ? "large" : "medium"}
          startIcon={<ArrowBack />}
          sx={{
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
            },
            maxWidth: 200
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          size={isMobile ? "large" : "medium"}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            py: isMobile ? 1.5 : 1,
            maxWidth: 200
          }}
          endIcon={<ArrowForward />}
        >
          Continue
        </Button>
      </Box>
    </StyledPaper>
  );

  // Step 4: Payment with Fallback
  const renderPayment = ({ paymentProcessing, 
  setPaymentProcessing,
  orderPlaced,
  setOrderPlaced,
  orderNumber,
  setOrderNumber}) => {

   
    const handleSubmitOrder = async () => {
  setPaymentProcessing(true);
  
  try {
    // Generate order number
    const generatedOrderNumber = 'ORD' + Math.floor(100000 + Math.random() * 900000);
    setOrderNumber(generatedOrderNumber);
    
    // Prepare detailed items information with product details
    const orderItems = cartData.items.map(item => {
      const product = getProductDetails(item.productId);
      return {
        id: item.productId,
        productId: item.productId,
        name: product ? product.name : item.name || 'Unknown Product',
        price: product ? product.price : item.price || 0,
        quantity: item.quantity,
        image: product && product.images && product.images.length > 0 ? product.images[0] : null,
        totalItemPrice: (product ? product.price : item.price || 0) * item.quantity
      };
    });
    
    // Save order to Firebase with detailed items
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId: auth.currentUser.uid,
      orderNumber: generatedOrderNumber,
      orderDetails: {
        personalInfo,
        deliveryAddress,
        billingAddress: sameAsBilling ? deliveryAddress : billingAddress,
        cartData: {
          ...cartData,
          items: orderItems // Use the detailed items array
        },
        items: orderItems,
        totalAmount: cartData.totalPrice,
      },
      status: 'PENDING',
      paymentStatus: 'AWAITING_CONFIRMATION',
      paymentMethod: 'OFFLINE',
      createdAt: Timestamp.now(),
      notes: "Order placed during payment gateway maintenance."
    });

    // Store cart items as order items with more detail
    const orderItemsPromises = orderItems.map(item => {
      return addDoc(collection(db, 'orderItems'), {
        orderId: orderRef.id,
        orderNumber: generatedOrderNumber,
        userId: auth.currentUser.uid,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        image: item.image, // Include the image URL
        totalItemPrice: item.totalItemPrice, // Include the calculated total price
        createdAt: Timestamp.now()
      });
    });

    await Promise.all(orderItemsPromises);
    
    // Clear cart after successful order placement
    const cartQuery = query(
      collection(db, 'cart'),
      where('userId', '==', auth.currentUser.uid)
    );
    
    const cartSnapshot = await getDocs(cartQuery);
    const deletePromises = cartSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Order placed successfully
    setOrderPlaced(true);
    setSnackbarMessage('Order placed successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Redirect to order confirmation after 3 seconds
    setTimeout(() => {
      navigate('/order-confirmation', { 
        state: { 
          orderNumber: generatedOrderNumber,
          amount: cartData.totalPrice,
          status: 'SUCCESS',
          items: orderItems // Pass the items to the confirmation page
        } 
      });
    }, 3000);
    
  } catch (error) {
    console.error('Order Error:', error);
    setSnackbarMessage('There was a problem placing your order. Please try again.');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    setPaymentProcessing(false);
  }
};
    return (
      <StyledPaper elevation={0}>
        <SectionHeading>
          Complete Order
        </SectionHeading>

        {orderPlaced ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3 
          }}>
            <CheckCircle color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order #{orderNumber} has been placed successfully.
            </Typography>
            <Typography variant="body1" paragraph>
              We will contact you shortly to confirm payment details.
            </Typography>
            <CircularProgress size={30} sx={{ mt: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Redirecting to order confirmation...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity="info" 
              variant="filled"
              sx={{ mb: 3, backgroundColor: '#3D405B' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                Payment Gateway Maintenance
              </Typography>
              <Typography variant="body2">
                Our payment gateway is currently undergoing maintenance. You can still place your order, and our team will contact you shortly to confirm payment details.
              </Typography>
            </Alert>

            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}>
              <Typography variant="h6" fontWeight={500}>
                Total Amount: ₹{cartData.totalPrice.toFixed(2)}
              </Typography>

              <Button
                variant="contained"
                onClick={handleSubmitOrder}
                disabled={paymentProcessing}
                size="large"
                fullWidth
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  py: 1.5,
                  maxWidth: 300
                }}
                startIcon={
                  paymentProcessing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <ShoppingBag />
                  )
                }
              >
                {paymentProcessing ? 'Processing...' : 'Place Order Now'}
              </Button>
            </Box>

            <Typography variant="body1" sx={{ mt: 3, mb: 2, fontWeight: 500 }}>
              Available Payment Methods:
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              mb: 3 
            }}>
              <Chip 
                label="Cash on Delivery" 
                variant="outlined" 
                color="primary"
                icon={<LocalShipping />}
              />
              <Chip 
                label="Bank Transfer" 
                variant="outlined" 
                color="primary"
                icon={<Payment />}
              />
              <Chip 
                label="UPI/Phone Pe" 
                variant="outlined" 
                color="primary"
                icon={<PhoneAndroid />}
              />
            </Box>

            {/* Summary section */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Order Summary
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Items Total
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    ₹{cartData.subtotal.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    ₹{cartData.shippingCost.toFixed(2)}
                  </Typography>
                </Grid>
                
                {cartData.discount > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="success.main">
                        Discount
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="success.main">
                        -₹{cartData.discount.toFixed(2)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total Amount
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    ₹{cartData.totalPrice.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {!orderPlaced && (
          <Button
            onClick={handleBack}
            variant="outlined"
            size={isMobile ? "large" : "medium"}
            startIcon={<ArrowBack />}
            sx={{
              color: theme.palette.secondary.main,
              borderColor: theme.palette.secondary.main,
              '&:hover': {
                borderColor: theme.palette.secondary.dark,
              },
              maxWidth: 200
            }}
          >
            Back
          </Button>
        )}
      </StyledPaper>
    );
  };

  // Price Summary Component (used in sidebar)
  const PriceSummary = () => (
    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
        Price Details
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal ({cartData.items.length} items)
          </Typography>
          <Typography variant="body2">₹{cartData.subtotal.toFixed(2)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Shipping
          </Typography>
          <Typography variant="body2">₹{cartData.shippingCost}</Typography>
        </Box>
        
        {cartData.discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="success.main">
              Discount
            </Typography>
            <Typography variant="body2" color="success.main">
              -₹{cartData.discount}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Total Amount
        </Typography>
        <Typography variant="subtitle1" fontWeight={600}>
          ₹{cartData.totalPrice.toFixed(2)}
        </Typography>
      </Box>
      
      {cartData.discount > 0 && (
        <Alert severity="success" icon={<LocalOffer />} sx={{ mt: 2 }}>
          You saved ₹{cartData.discount.toFixed(2)} on this order!
        </Alert>
      )}
    </Card>
  );

  // Loading state
  return (
    <Fade in={true}>
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        px: isMobile ? 2 : 4, 
        py: 4 
      }}>
        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* New Ant Design Layout */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
          {/* Left Side - Form Content */}
          <div style={{ flex: '1 1 65%' }}>
            <AntCard bordered={false} style={{ background: '#fff' }}>
              {activeStep === 0 && renderPersonalInfoForm()}
              {activeStep === 1 && renderAddressForm()}
              {activeStep === 2 && renderOrderReview()}
              {activeStep === 3 && renderPayment({
                 paymentProcessing, 
  setPaymentProcessing,
  orderPlaced,
  setOrderPlaced,
  orderNumber,
  setOrderNumber
              })}
            </AntCard>
          </div>
{/* Right Side - Cart Summary */}
<div style={{ flex: '1 1 35%' }}>
  <AntCard 
    title={
      <span>
        <ShoppingCartOutlined style={{ marginRight: 8 }} />
        Order Summary
      </span>
    }
    bordered={false}
    style={{ background: '#fff' }}
  >
    {/* Display items in the cart */}
    <div style={{ marginBottom: 16, maxHeight: '300px', overflowY: 'auto' }}>
      {cartData.items.map((item) => {
        const product = getProductDetails(item.productId);
        if (!product) return null;

        return (
          <div 
            key={item.id || item.productId}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 12,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: 40, 
                  height: 40, 
                  marginRight: 8, 
                  background: '#f5f5f5',
                  backgroundImage: `url(${product.images?.[0] || 'https://via.placeholder.com/40'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 4
                }}
              />
              <div>
                <div style={{ fontWeight: 500, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.name}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                  Qty: {item.quantity}
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 500 }}>
              ₹{(product.price * item.quantity).toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
    
    <AntDivider />
    
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>Subtotal ({cartData.items.length} items)</span>
        <span>₹{cartData.subtotal.toFixed(2)}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span>Shipping</span>
        <span>₹{cartData.shippingCost}</span>
      </div>
      
      {cartData.discount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#52c41a' }}>
          <span>Discount</span>
          <span>-₹{cartData.discount}</span>
        </div>
      )}
    </div>
    
    <AntDivider />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
      <span style={{ fontSize: 16, fontWeight: 600 }}>Total Amount</span>
      <span style={{ fontSize: 16, fontWeight: 600 }}>₹{cartData.totalPrice.toFixed(2)}</span>
    </div>

    {cartData.discount > 0 && (
      <Alert
        message={`You saved ₹${cartData.discount.toFixed(2)} on this order!`}
        type="success"
        showIcon
      />
    )}

    {/* Help Section */}
    <AntCard style={{ marginTop: 16 }} bordered={false}>
      <Typography variant="subtitle1" style={{ marginBottom: 8, fontWeight: 500 }}>
        Need Help?
      </Typography>
      <Typography variant="body2" style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: 8 }}>
        Contact our customer support for any questions about your order.
      </Typography>
      <Button 
        variant="text" 
        size="small" 
        startIcon={<PhoneAndroid />}
        style={{ color: theme.palette.secondary.main }}
      >
        +91 7382150250
      </Button>
    </AntCard>
  </AntCard>
</div>
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Edit Information</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Value"
              type="text"
              fullWidth
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default CheckoutFlow;