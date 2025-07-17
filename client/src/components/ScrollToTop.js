// client/src/components/ScrollToTop.js - Enhanced version with scroll preservation
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef();

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    
    // Store current scroll position if we're leaving the products page
    if (prevPathname === '/products' && pathname !== '/products') {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      sessionStorage.setItem('productsScrollPosition', scrollPosition.toString());
      console.log('Stored scroll position:', scrollPosition);
    }
    
    // Restore scroll position if we're returning to products page
    if (pathname === '/products' && prevPathname && prevPathname.startsWith('/product')) {
      const savedPosition = sessionStorage.getItem('productsScrollPosition');
      
      if (savedPosition) {
        // Use setTimeout to ensure DOM is rendered before scrolling
        setTimeout(() => {
          const position = parseInt(savedPosition, 10);
          window.scrollTo({
            top: position,
            behavior: 'smooth'
          });
          console.log('Restored scroll position:', position);
        }, 100);
      }
    } 
    // For all other route changes, scroll to top
    else if (pathname !== '/products' || !prevPathname || !prevPathname.startsWith('/product')) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Update the previous pathname
    prevPathnameRef.current = pathname;
  }, [pathname]);

  return null;
};

export default ScrollToTop;