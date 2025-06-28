import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Box, useTheme, useMediaQuery, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { auth, db } from './Firebase/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Season Management - NEW IMPORT
import { SeasonProvider } from './hooks/useSeason';

// Regular components
import Header from './components/Header';
import ResetPassword from './pages/ResetPassword';
import Welcome from './pages/Welcome';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/aboutus';
import Policies from './pages/Policies';
import ContactUs from './pages/Contact';
import AuthForm from './components/AuthForm';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import OrderSummary from './pages/OrderSummary';
import OrderConfirmation from './pages/OrderConfirmations';
import WishList from './pages/WishList';
import Order from './pages/Orders';
import Footer from './components/Footer';
import PhonePePayment from './components/PhonePePayment';
import PaymentStatusPage from './pages/PaymentStatusPage';
import NotFound from './components/NotFound';

// Admin components
import Dashboard from './adminpages/Dashboard';
import Inventory from './adminpages/Inventory';
import AdminOrders from './adminpages/adminorders';
import AdminAuth, { ProtectedAdminRoute } from './adminpages/adminauth';
import AdminSidebar from './adminpages/components/AdminSidebar';

// ScrollToTop component
import ScrollToTop from './components/ScrollToTop';
import SSLErrorHandler from './components/SSLErrorHandler';

// Create responsive theme with mobile-first approach
const responsiveTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,      // Extra small devices (phones, 0px and up)
      sm: 576,    // Small devices (landscape phones, 576px and up)
      md: 768,    // Medium devices (tablets, 768px and up)  
      lg: 992,    // Large devices (desktops, 992px and up)
      xl: 1200,   // Extra large devices (large desktops, 1200px and up)
    },
  },
  typography: {
    // Responsive font sizes
    h1: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    },
    h2: {
      fontSize: 'clamp(1.25rem, 3.5vw, 2rem)',
    },
    h3: {
      fontSize: 'clamp(1.125rem, 3vw, 1.75rem)',
    },
    h4: {
      fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
    },
    h5: {
      fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
    },
    h6: {
      fontSize: 'clamp(0.75rem, 1.5vw, 1.125rem)',
    },
    body1: {
      fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    },
    body2: {
      fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
    },
  },
  components: {
    // Global styles for responsive behavior
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          // Prevent horizontal scroll on mobile
          overflowX: 'hidden',
          // Smooth scrolling
          scrollBehavior: 'smooth',
          // Fix iOS zoom issue
          WebkitTextSizeAdjust: '100%',
        },
        body: {
          overflowX: 'hidden',
          // Improve text rendering
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          // Prevent pull-to-refresh on mobile
          overscrollBehavior: 'none',
        },
        // Fix iOS Safari bottom bar issue
        '@supports (-webkit-touch-callout: none)': {
          '.ios-safe-area': {
            paddingBottom: 'env(safe-area-inset-bottom)',
          },
        },
      },
    },
    // Make all Material-UI components responsive by default
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px !important',
          paddingRight: '16px !important',
          '@media (max-width: 576px)': {
            paddingLeft: '12px !important',
            paddingRight: '12px !important',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 576px)': {
            minHeight: '44px', // iOS minimum touch target
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width: 576px)': {
            '& .MuiInputBase-input': {
              fontSize: '16px', // Prevent zoom on iOS
            },
          },
        },
      },
    },
  },
});

// Hook to check if user is admin
const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is admin
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          
          if (adminDoc.exists() && adminDoc.data().isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
};

// Check if current path is admin-specific route (dashboard, inventory, etc.)
const useIsAdminRoute = () => {
  const location = useLocation();
  return ['/dashboard', '/inventory', '/adminorders', '/admin', '/supercontrollogin'].includes(location.pathname);
};

// Admin Layout Component (for ALL pages when admin is logged in)
const AdminLayoutContent = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      backgroundColor: '#FAF0E6', // Light terracotta background
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden', // Prevent horizontal scroll
    }}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area */}
      <Box 
        component="main" 
        className="ios-safe-area"
        sx={{ 
          flexGrow: 1,
          width: isMobile ? '100%' : 'calc(100% - 280px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: isMobile && !sidebarOpen ? 8 : 0,
          // Mobile-specific adjustments
          ...(isMobile && {
            maxWidth: '100vw',
            overflow: 'hidden',
          }),
          // Small mobile adjustments
          ...(isSmallMobile && {
            pt: 10, // More top padding for very small screens
          }),
        }}
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <Box sx={{ 
          flexGrow: 1,
          width: '100%',
          // Ensure content doesn't overflow on mobile
          ...(isMobile && {
            maxWidth: '100vw',
            overflow: 'hidden',
          }),
        }}>
          {children}
        </Box>
        
        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

// Regular User Layout Component
const RegularLayoutContent = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      className="ios-safe-area"
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent horizontal scroll
        // Mobile-specific adjustments
        ...(isMobile && {
          maxWidth: '100vw',
        }),
      }}
    >
      <Header />
      
      {/* Main Content Wrapper */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          width: '100%',
          // Ensure content fits properly on mobile
          ...(isMobile && {
            maxWidth: '100vw',
            overflow: 'hidden',
          }),
          // Additional padding for small screens
          ...(isSmallMobile && {
            px: 1, // Small horizontal padding
          }),
        }}
      >
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
};

// Main App Layout Component
const AppLayout = ({ children }) => {
  const { isAdmin, loading } = useIsAdmin();
  const isAdminRoute = useIsAdminRoute();

  // Show loading while checking admin status
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </Box>
    );
  }

  // If user is admin AND not on login/auth pages, show admin layout
  if (isAdmin && !isAdminRoute) {
    return (
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    );
  }

  // If user is admin AND on admin-specific pages, show admin layout
  if (isAdmin && isAdminRoute) {
    return (
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    );
  }

  // For regular users or admin on login pages, show regular layout
  return (
    <RegularLayoutContent>
      {children}
    </RegularLayoutContent>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={responsiveTheme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon */}
      <CssBaseline />
      
      <Router>
        {/* Season Provider - NEW: Wraps entire app for season management */}
        <SeasonProvider>
          {/* ScrollToTop component - must be inside Router */}
          <ScrollToTop />
          
          {/* Main App Container with mobile-first responsive design */}
          <Box sx={{
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden', // Prevent horizontal scroll
            // iOS-specific fixes
            WebkitOverflowScrolling: 'touch',
            // Android-specific fixes
            overscrollBehavior: 'none',
          }}>
            <AppLayout>
              <Routes>
                {/* 🌍 Public Routes */}
                <Route path="/" element={<Welcome />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/contactus" element={<ContactUs />} />
                
                {/* 🔑 Authentication Routes */}
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/login" element={<AuthForm />} />

                {/* 👤 User Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/order-summary" element={<OrderSummary />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/wishlist" element={<WishList />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/phonepe" element={<PhonePePayment />} />
                <Route path="/payment-status/:orderId" element={<PaymentStatusPage />} />
                <Route path="/supercontrollogin" element={<AdminAuth />} />

                {/* 🔐 Admin Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedAdminRoute adminOnly={true}>
                      <Dashboard />
                    </ProtectedAdminRoute>
                  } 
                />

                <Route 
                  path="/inventory" 
                  element={
                    <ProtectedAdminRoute adminOnly={true}>
                      <Inventory />
                    </ProtectedAdminRoute>
                  }
                />

                <Route
                  path="/adminorders"
                  element={
                    <ProtectedAdminRoute adminOnly={true}>
                      <AdminOrders />
                    </ProtectedAdminRoute>
                  }
                />

                {/* 🎯 Catch all route - Keep this LAST */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </Box>
        </SeasonProvider>
        
        <Analytics />
      </Router>
    </ThemeProvider>
  );
};

export default App;