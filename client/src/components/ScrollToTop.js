// Enhanced ScrollToTop Component with Third-Party Libraries
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useSimpleScrollPosition from '../hooks/useSimpleScrollPosition';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef();
  
  // Simple scroll management
  const {
    saveScrollPosition,
    restoreScrollPosition,
    scrollToTop,
    hasSavedPosition,
  } = useSimpleScrollPosition('globalScrollPosition');

  // Products page specific scroll management
  const {
    saveScrollPosition: saveProductsPosition,
    restoreScrollPosition: restoreProductsPosition,
  } = useSimpleScrollPosition('productsScrollPosition');

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    
    // Track navigation (simplified)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧭 [ScrollToTop] Navigation:', {
        from: prevPathname,
        to: pathname,
        source: prevPathname ? 'internal' : 'direct'
      });
    }

    // Enhanced Products Page Logic
    if (prevPathname === '/products' && pathname !== '/products') {
      // Leaving products page - save position with enhanced method
      console.log('🔄 [ScrollToTop] Leaving products page, saving scroll position...');
      
      saveProductsPosition({
        trigger: 'route-change',
        fromPage: prevPathname,
        toPage: pathname,
      });
      
      // Set return flag
      sessionStorage.setItem('returnFromProductDetail', 'true');
    }
    
    // Enhanced Restoration Logic
    else if (pathname === '/products' && prevPathname && 
             (prevPathname.startsWith('/product') || prevPathname.startsWith('/ganesh-idol'))) {
      
      console.log('🔙 [ScrollToTop] Returning to products page, restoring scroll position...');
      
      // Check return flag
      const shouldRestore = sessionStorage.getItem('returnFromProductDetail') === 'true';
      
      if (shouldRestore) {
        // Use simple restoration
        setTimeout(async () => {
          try {
            const restored = await restoreProductsPosition({
              maxAttempts: 8,
              delay: 150,
            });
            
            if (restored) {
              console.log('✅ [ScrollToTop] Simple restoration successful');
            } else {
              console.log('⚠️ [ScrollToTop] Simple restoration failed');
            }
            
            // Clean up storage
            sessionStorage.removeItem('returnFromProductDetail');
          } catch (error) {
            console.error('❌ [ScrollToTop] Restoration failed:', error);
          }
        }, 200);
      }
    }
    
    // Ganesh Idol Navigation
    else if (pathname.startsWith('/ganesh-idol') && prevPathname === '/products') {
      console.log('🕉️ [ScrollToTop] Navigating to Ganesh idol from products');
      
      saveProductsPosition({
        trigger: 'ganesh-navigation',
        fromPage: prevPathname,
        toPage: pathname,
      });
      
      sessionStorage.setItem('returnFromProductDetail', 'true');
    }
    
    // General Navigation
    else if (pathname !== '/products' || !prevPathname || 
             (!prevPathname.startsWith('/product') && !prevPathname.startsWith('/ganesh-idol'))) {
      
      // For all other route changes, scroll to top
      setTimeout(() => {
        scrollToTop({ smooth: true });
      }, 50);
    }

    // Update the previous pathname
    prevPathnameRef.current = pathname;
  }, [
    pathname,
    saveProductsPosition,
    restoreProductsPosition,
    scrollToTop,
  ]);

  return null;
};

export default ScrollToTop;