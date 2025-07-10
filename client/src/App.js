// // client/src/App.js - Updated and Optimized
// import React, { useState, useEffect, Suspense, lazy } from 'react';
// import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import { Analytics } from '@vercel/analytics/react';
// import { Box, useTheme, useMediaQuery, CssBaseline, ThemeProvider, createTheme, CircularProgress } from '@mui/material';
// import { auth, db } from './Firebase/Firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';

// // Season Management
// import { SeasonProvider } from './hooks/useSeason';

// // Regular components
// import Header from './components/Header';
// import Footer from './components/Footer';
// import ScrollToTop from './components/ScrollToTop';
// import SSLErrorHandler from './components/SSLErrorHandler';
// import NotFound from './components/NotFound';

// // Lazy load components for better performance
// const Welcome = lazy(() => import('./pages/Welcome'));
// const Products = lazy(() => import('./pages/Products'));
// const ProductDetail = lazy(() => import('./pages/ProductDetail'));
// const About = lazy(() => import('./pages/aboutus'));
// const Policies = lazy(() => import('./pages/Policies'));
// const ContactUs = lazy(() => import('./pages/Contact'));
// const AuthForm = lazy(() => import('./components/AuthForm'));
// const Profile = lazy(() => import('./pages/Profile'));
// const Cart = lazy(() => import('./pages/Cart'));
// const OrderSummary = lazy(() => import('./pages/OrderSummary'));
// const GaneshOrderSummary = lazy(() => import('./pages/GaneshOrderSummary'));
// const OrderConfirmation = lazy(() => import('./pages/OrderConfirmations'));
// const WishList = lazy(() => import('./pages/WishList'));
// const Order = lazy(() => import('./pages/Orders'));
// const ResetPassword = lazy(() => import('./pages/ResetPassword'));
// const PhonePePayment = lazy(() => import('./components/PhonePePayment'));
// const PaymentStatusPage = lazy(() => import('./pages/PaymentStatusPage'));

// // Admin components
// const Dashboard = lazy(() => import('./adminpages/Dashboard'));
// const Inventory = lazy(() => import('./adminpages/Inventory'));
// const AdminOrders = lazy(() => import('./adminpages/adminorders'));
// const AdminAuth = lazy(() => import('./adminpages/adminauth'));
// const { ProtectedAdminRoute } = require('./adminpages/adminauth');
// const AdminSidebar = lazy(() => import('./adminpages/components/AdminSidebar'));

// // Ganesh Season Components
// const GaneshInventory = lazy(() => import('./adminpages/ganeshseason/GaneshInventory'));
// const GaneshLeads = lazy(() => import('./adminpages/ganeshseason/GaneshLeads'));
// const GaneshOrders = lazy(() => import('./adminpages/ganeshseason/GaneshOrders'));
// //const GaneshIdolDetail = lazy(() => import('./pages/GaneshIdolDetail'));

// // Create responsive theme with terracotta colors
// const responsiveTheme = createTheme({
//   palette: {
//     primary: {
//       main: '#E07A5F', // Terracotta
//       light: '#F2CC8F',
//       dark: '#BE5A38',
//       contrastText: '#fff',
//     },
//     secondary: {
//       main: '#3D405B', // Dark blue-grey
//       light: '#6C6F94',
//       dark: '#2A2C3F',
//     },
//     background: {
//       default: '#FFF9F5', // Very light coconut
//       paper: '#FFFFFF',
//     },
//     text: {
//       primary: '#3D405B',
//       secondary: '#797B8E',
//     },
//   },
//   breakpoints: {
//     values: {
//       xs: 0,
//       sm: 576,
//       md: 768,
//       lg: 992,
//       xl: 1200,
//     },
//   },
//   typography: {
//     fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
//     h1: { fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' },
//     h2: { fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' },
//     h3: { fontSize: 'clamp(1.125rem, 3vw, 1.75rem)' },
//     h4: { fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' },
//     h5: { fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' },
//     h6: { fontSize: 'clamp(0.75rem, 1.5vw, 1.125rem)' },
//     body1: { fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' },
//     body2: { fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)' },
//   },
//   components: {
//     MuiCssBaseline: {
//       styleOverrides: {
//         '*': { boxSizing: 'border-box' },
//         html: {
//           overflowX: 'hidden',
//           scrollBehavior: 'smooth',
//           WebkitTextSizeAdjust: '100%',
//         },
//         body: {
//           overflowX: 'hidden',
//           WebkitFontSmoothing: 'antialiased',
//           MozOsxFontSmoothing: 'grayscale',
//           overscrollBehavior: 'none',
//         },
//       },
//     },
//     MuiContainer: {
//       styleOverrides: {
//         root: {
//           paddingLeft: '16px !important',
//           paddingRight: '16px !important',
//           '@media (max-width: 576px)': {
//             paddingLeft: '12px !important',
//             paddingRight: '12px !important',
//           },
//         },
//       },
//     },
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           '@media (max-width: 576px)': {
//             minHeight: '44px',
//             fontSize: '0.875rem',
//           },
//         },
//       },
//     },
//   },
// });

// // Loading component
// const LoadingFallback = ({ message = 'Loading...' }) => (
//   <Box sx={{ 
//     display: 'flex', 
//     flexDirection: 'column',
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     minHeight: '60vh',
//     gap: 2 
//   }}>
//     <CircularProgress sx={{ color: 'primary.main' }} />
//     <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
//       {message}
//     </Box>
//   </Box>
// );

// // Hook to check if user is admin
// const useIsAdmin = () => {
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           const adminDoc = await getDoc(doc(db, 'admins', user.uid));
//           setIsAdmin(adminDoc.exists() && adminDoc.data().isAdmin);
//         } catch (error) {
//           console.error('Error checking admin status:', error);
//           setIsAdmin(false);
//         }
//       } else {
//         setIsAdmin(false);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return { isAdmin, loading };
// };

// // Check if current path is admin route
// const useIsAdminRoute = () => {
//   const location = useLocation();
//   const adminRoutes = [
//     '/dashboard', 
//     '/inventory', 
//     '/adminorders', 
//     '/admin', 
//     '/supercontrollogin',
//     '/ganesh-inventory',
//     '/ganesh-leads', 
//     '/ganesh-orders'
//   ];
//   return adminRoutes.includes(location.pathname);
// };

// // Admin Layout Component
// const AdminLayoutContent = ({ children }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleSidebarToggle = () => {
//     setSidebarOpen(prev => !prev);
//   };

//   return (
//     <Box sx={{ 
//       display: 'flex', 
//       backgroundColor: '#FAF0E6',
//       minHeight: '100vh',
//       width: '100%',
//       overflow: 'hidden',
//     }}>
//       <Suspense fallback={<LoadingFallback message="Loading admin panel..." />}>
//         <AdminSidebar 
//           open={sidebarOpen} 
//           onToggle={handleSidebarToggle}
//         />
//       </Suspense>

//       <Box 
//         component="main" 
//         sx={{ 
//           flexGrow: 1,
//           width: isMobile ? '100%' : 'calc(100% - 280px)',
//           minHeight: '100vh',
//           display: 'flex',
//           flexDirection: 'column',
//           pt: isMobile && !sidebarOpen ? 8 : 0,
//           maxWidth: '100vw',
//           overflow: 'hidden',
//         }}
//       >
//         <Header />
//         <Box sx={{ 
//           flexGrow: 1,
//           width: '100%',
//           maxWidth: '100vw',
//           overflow: 'hidden',
//         }}>
//           {children}
//         </Box>
//         <Footer />
//       </Box>
//     </Box>
//   );
// };

// // Regular User Layout Component
// const RegularLayoutContent = ({ children }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   return (
//     <Box sx={{
//       width: '100%',
//       minHeight: '100vh',
//       display: 'flex',
//       flexDirection: 'column',
//       overflow: 'hidden',
//       maxWidth: '100vw',
//     }}>
//       <Header />
//       <Box 
//         component="main"
//         sx={{ 
//           flexGrow: 1,
//           width: '100%',
//           maxWidth: '100vw',
//           overflow: 'hidden',
//           ...(isMobile && { px: 1 }),
//         }}
//       >
//         {children}
//       </Box>
//       <Footer />
//     </Box>
//   );
// };

// // Main App Layout Component
// const AppLayout = ({ children }) => {
//   const { isAdmin, loading } = useIsAdmin();
//   const isAdminRoute = useIsAdminRoute();

//   if (loading) {
//     return <LoadingFallback message="Checking authentication..." />;
//   }

//   // Show admin layout for admin users or admin routes
//   if (isAdmin || isAdminRoute) {
//     return (
//       <AdminLayoutContent>
//         {children}
//       </AdminLayoutContent>
//     );
//   }

//   return (
//     <RegularLayoutContent>
//       {children}
//     </RegularLayoutContent>
//   );
// };

// const App = () => {
//   return (
//     <ThemeProvider theme={responsiveTheme}>
//       <CssBaseline />
//       <Router>
//         <SeasonProvider>
//           <ScrollToTop />
//           {/* <SSLErrorHandler /> */}
          
//           <Box sx={{
//             width: '100%',
//             minHeight: '100vh',
//             overflow: 'hidden',
//             WebkitOverflowScrolling: 'touch',
//             overscrollBehavior: 'none',
//           }}>
//             <AppLayout>
//               <Suspense fallback={<LoadingFallback />}>
//                 <Routes>
//                   {/* Public Routes */}
//                   <Route path="/" element={<Welcome />} />
//                   <Route path="/products" element={<Products />} />
//                   <Route path="/product/:id" element={<ProductDetail />} />
//                   <Route path="/about" element={<About />} />
//                   <Route path="/policies" element={<Policies />} />
//                   <Route path="/contactus" element={<ContactUs />} />
                  
//                   {/* Ganesh Idol Detail Route */}
//                  {/* Ganesh Idol Detail Route */}
// <Route path="/ganesh-idol/:id" element={<ProductDetail />} />
                  
//                   {/* Authentication Routes */}
//                   <Route path="/auth" element={<AuthForm />} />
//                   <Route path="/login" element={<AuthForm />} />
//                   <Route path="/reset-password" element={<ResetPassword />} />

//                   {/* User Routes */}
//                   <Route path="/profile" element={<Profile />} />
//                   <Route path="/cart" element={<Cart />} />
//                   <Route path="/order-summary" element={<OrderSummary />} />
//                   <Route path="/ganesh-order-summary" element={<GaneshOrderSummary />} />
//                   <Route path="/order-confirmation" element={<OrderConfirmation />} />
//                   <Route path="/wishlist" element={<WishList />} />
//                   <Route path="/orders" element={<Order />} />
//                   <Route path="/phonepe" element={<PhonePePayment />} />
//                   <Route path="/payment-status/:orderId" element={<PaymentStatusPage />} />

//                   {/* Admin Routes */}
//                   <Route path="/supercontrollogin" element={<AdminAuth />} />
//                   <Route 
//                     path="/dashboard" 
//                     element={
//                       <ProtectedAdminRoute adminOnly={true}>
//                         <Dashboard />
//                       </ProtectedAdminRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/inventory" 
//                     element={
//                       <ProtectedAdminRoute adminOnly={true}>
//                         <Inventory />
//                       </ProtectedAdminRoute>
//                     }
//                   />
//                   <Route
//                     path="/adminorders"
//                     element={
//                       <ProtectedAdminRoute adminOnly={true}>
//                         <AdminOrders />
//                       </ProtectedAdminRoute>
//                     }
//                   />

//                   {/* Ganesh Season Routes */}
//                   <Route 
//                     path="/ganesh-inventory" 
//                     element={
//                       <ProtectedAdminRoute adminOnly={true}>
//                         <GaneshInventory />
//                       </ProtectedAdminRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/ganesh-leads" 
//                     element={
//                       <ProtectedAdminRoute adminOnly={true}>
//                         <GaneshLeads />
//                       </ProtectedAdminRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/ganesh-orders" 
//                     element={
//                       <ProtectedAdminRoute adminOnly={true}>
//                         <GaneshOrders />
//                       </ProtectedAdminRoute>
//                     } 
//                   />

//                   {/* Catch all route */}
//                   <Route path="*" element={<NotFound />} />
//                 </Routes>
//               </Suspense>
//             </AppLayout>
//           </Box>
//         </SeasonProvider>
//         <Analytics />
//       </Router>
//     </ThemeProvider>
//   );
// };

// export default App;