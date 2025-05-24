import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

// Regular components
import Header from './components/Header';
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

// Check if current path is admin route
const useIsAdminRoute = () => {
  const location = useLocation();
  return ['/dashboard', '/inventory', '/adminorders'].includes(location.pathname);
};

// Admin Layout Component (only for admin routes)
const AdminLayoutContent = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      backgroundColor: '#FAF0E6', // Light terracotta background
      minHeight: '100vh' 
    }}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: isMobile ? '100%' : 'calc(100% - 280px)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: isMobile && !sidebarOpen ? 8 : 0
        }}
      >
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        
        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

// Main App Layout Component
const AppLayout = ({ children }) => {
  const isAdminRoute = useIsAdminRoute();

  if (isAdminRoute) {
    // Admin Layout: Sidebar + Header + Content + Footer
    return (
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    );
  }

  // Regular Layout: Header + Content + Footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
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
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/wishlist" element={<WishList />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/phonepe" element={<PhonePePayment />} />
          <Route path="/payment-status/:orderId" element={<PaymentStatusPage />} />
          <Route path="/supercontrollogin" element={<AdminAuth />} />

          {/* 🔐 Admin Routes - WITH SIDEBAR + HEADER */}
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
      <Analytics />
    </Router>
  );
};

export default App;