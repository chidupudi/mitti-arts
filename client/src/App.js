import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Welcome from './pages/Welcome';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/aboutus';
import Policies from './pages/Policies';
import ContactUs from './pages/Contact';
import AuthForm  from './components/AuthForm';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import OrderSummary from './pages/OrderSummary';
import OrderConfirmation from './pages/OrderConfirmations';
import WishList from './pages/WishList';
import Dashboard from './adminpages/Dashboard';
import Inventory from './adminpages/Inventory';
import Order from './pages/Orders';
import Footer from './components/Footer';
import PhonePePayment from './components/PhonePePayment';
import PaymentStatusPage from './pages/PaymentStatusPage';
import NotFound from './components/NotFound'; 
import AdminOrders from './adminpages/adminorders';
import AdminAuth , {ProtectedAdminRoute} from './adminpages/adminauth';

const App = () => {
  return (
    <Router>
      <Header />
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
        <Route path="/supercontrollogin" element={<AdminAuth/>} />
{/* 🔐 Admin Routes - NOW PROPERLY PROTECTED */}
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
      <Footer/>
      <Analytics />
    </Router>
  );
};

export default App;