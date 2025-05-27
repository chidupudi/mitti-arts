// hooks/useProductsOptimization.js - FIXED VERSION
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';

// Debounce hook for search optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Virtualization hook for large product lists
export const useVirtualization = (items, containerHeight, itemHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, containerHeight, itemHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return { visibleItems, handleScroll };
};

// FIXED: Stable product processor without dependencies
export const useProductProcessor = () => {
  // Use useCallback with empty dependencies to prevent recreation
  const processProduct = useCallback((docData, docId) => {
    const price = Number(docData.price) || 0;
    
    // Calculate discount
    let discount = 0;
    if (price >= 50 && price <= 300) discount = 10;
    else if (price > 300 && price <= 1000) discount = 20;
    else if (price > 1000) discount = 25;
    
    const originalPrice = discount > 0 ? Math.ceil(price / (1 - discount/100)) : price;
    
    // Determine stock status
    const stock = Number(docData.stock) || 0;
    let stockStatus = 'normal';
    if (stock === 0) stockStatus = 'out_of_stock';
    else if (stock < 10) stockStatus = 'critical';
    else if (stock < 20) stockStatus = 'low';

    // Process images with fallback
    const images = Array.isArray(docData.images) ? docData.images : [];
    const imgUrl = images.length > 0 ? images[0] : '/api/placeholder/300/220';

    return {
      id: docId,
      name: docData.name || '',
      description: docData.description || '',
      price,
      originalPrice,
      discount,
      code: docData.code || '',
      stock,
      stockStatus,
      images,
      imgUrl,
      rating: Number(docData.rating) || 4.0,
      reviews: Number(docData.reviews) || 0,
      isFeatured: Boolean(docData.isFeatured),
      hidden: Boolean(docData.hidden),
      hyderabadOnly: Boolean(docData.hyderabadOnly),
      createdAt: docData.createdAt || new Date().toISOString(),
      // Add search terms for better filtering
      searchTerms: [
        docData.name?.toLowerCase() || '',
        docData.code?.toLowerCase() || '',
        docData.description?.toLowerCase() || '',
      ].filter(Boolean).join(' '),
      // Priority score for sorting (Hyderabad products get higher priority)
      priorityScore: docData.hyderabadOnly ? 1000 : 0,
    };
  }, []); // Empty dependencies to prevent infinite recreation

  return { processProduct };
};

// FIXED: Enhanced search with stable dependencies
export const useProductSearch = (products, searchQuery, filters, prioritizeHyderabad = true) => {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Memoize filters to prevent unnecessary recalculations
  const stableFilters = useMemo(() => ({
    priceRange: filters.priceRange,
    category: filters.category,
    hideOutOfStock: filters.hideOutOfStock,
    hyderabadOnly: filters.hyderabadOnly,
    sortBy: filters.sortBy,
  }), [
    filters.priceRange?.[0], 
    filters.priceRange?.[1], 
    filters.category, 
    filters.hideOutOfStock, 
    filters.hyderabadOnly, 
    filters.sortBy
  ]);
  
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    let filtered = products;
    
    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.searchTerms.includes(query)
      );
    }
    
    // Apply price range filter
    if (stableFilters.priceRange) {
      const [min, max] = stableFilters.priceRange;
      filtered = filtered.filter(product => 
        product.price >= min && product.price <= max
      );
    }
    
    // Apply category filter
    if (stableFilters.category && stableFilters.category !== 'all') {
      filtered = filtered.filter(product => 
        product.category === stableFilters.category
      );
    }
    
    // Apply availability filter
    if (stableFilters.hideOutOfStock) {
      filtered = filtered.filter(product => 
        product.stock > 0 && !product.hidden
      );
    }
    
    // Apply Hyderabad filter
    if (stableFilters.hyderabadOnly) {
      filtered = filtered.filter(product => product.hyderabadOnly === true);
    }
    
    return filtered;
  }, [products, debouncedSearchQuery, stableFilters]);
  
  const sortedProducts = useMemo(() => {
    if (!filteredProducts.length) return [];
    
    const sorted = [...filteredProducts];
    
    switch (stableFilters.sortBy) {
      case 'priceLowToHigh':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          return a.price - b.price;
        });
      case 'priceHighToLow':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          return b.price - a.price;
        });
      case 'alphabetical':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          return a.name.localeCompare(b.name);
        });
      case 'rating':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          return b.rating - a.rating;
        });
      case 'newest':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      case 'featured':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating - a.rating;
        });
      case 'discount':
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          return b.discount - a.discount;
        });
      default:
        return sorted.sort((a, b) => {
          if (prioritizeHyderabad) {
            if (a.hyderabadOnly && !b.hyderabadOnly) return -1;
            if (!a.hyderabadOnly && b.hyderabadOnly) return 1;
          }
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.rating - a.rating;
        });
    }
  }, [filteredProducts, stableFilters.sortBy, prioritizeHyderabad]);
  
  return {
    products: sortedProducts,
    totalCount: filteredProducts.length,
    hyderabadCount: filteredProducts.filter(p => p.hyderabadOnly).length,
    isSearching: debouncedSearchQuery !== searchQuery,
  };
};

// FIXED: Optimized cart operations
export const useCartOperations = (user) => {
  const [loading, setLoading] = useState(false);
  
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'cart'), {
        userId: user.uid,
        productId: product.id,
        name: product.name,
        price: product.price,
        code: product.code,
        quantity: quantity,
        imgUrl: product.imgUrl,
        hyderabadOnly: product.hyderabadOnly || false,
        addedAt: new Date().toISOString(),
      });
      return { success: true, message: `${product.name} added to cart!` };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // Only depend on user.uid, not entire user object

  const removeFromCart = useCallback(async (cartItemId) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'cart', cartItemId));
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Failed to remove item from cart' };
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  return { addToCart, removeFromCart, loading };
};

// FIXED: Enhanced wishlist operations
export const useWishlistOperations = (user) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Fetch wishlist - FIXED to prevent infinite loops
  useEffect(() => {
    if (!user?.uid) {
      setWishlist([]);
      fetchedRef.current = false;
      return;
    }

    if (fetchedRef.current) return; // Prevent multiple fetches

    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const wishlistRef = collection(db, 'wishlist');
        const q = query(wishlistRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.data().productId,
          wishlistDocId: doc.id,
        }));
        
        setWishlist(items);
        fetchedRef.current = true;
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?.uid]); // Only depend on user.uid

  const toggleWishlistItem = useCallback(async (product) => {
    if (!user) throw new Error('User not authenticated');
    
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    try {
      if (isInWishlist) {
        const itemToRemove = wishlist.find(item => item.id === product.id);
        if (itemToRemove?.wishlistDocId) {
          await deleteDoc(doc(db, 'wishlist', itemToRemove.wishlistDocId));
          setWishlist(prev => prev.filter(item => item.id !== product.id));
          return { success: true, message: 'Removed from wishlist', action: 'removed' };
        }
      } else {
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          imgUrl: product.imgUrl,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          reviews: product.reviews,
          code: product.code,
          hidden: product.hidden,
          stock: product.stock,
          hyderabadOnly: product.hyderabadOnly || false,
          addedAt: new Date().toISOString(),
        });

        const newItem = { ...product, wishlistDocId: docRef.id };
        setWishlist(prev => [...prev, newItem]);
        return { success: true, message: 'Added to wishlist', action: 'added' };
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      return { success: false, message: 'Failed to update wishlist' };
    }
  }, [user?.uid, wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  return { 
    wishlist, 
    toggleWishlistItem, 
    isInWishlist, 
    loading 
  };
};

// FIXED: Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    searchTime: 0,
  });

  // Use useRef to prevent recreation on every render
  const timersRef = useRef(new Map());

  const startTimer = useCallback((name) => {
    const startTime = performance.now();
    const timerId = `${name}_${Date.now()}`;
    
    const endTimer = () => {
      const endTime = performance.now();
      setMetrics(prev => ({
        ...prev,
        [name]: endTime - startTime,
      }));
      timersRef.current.delete(timerId);
    };

    timersRef.current.set(timerId, endTimer);
    return endTimer;
  }, []);

  return { metrics, startTimer };
};

// FIXED: Enhanced image lazy loading hook
export const useLazyImage = (src, placeholder = '/api/placeholder/300/220') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc === placeholder && src !== placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    }
    
    return () => {
      if (observer && observer.unobserve && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, placeholder, src]);

  return [imageSrc, setImageRef];
};

// FIXED: In-memory storage hook
export const useMemoryStorage = (key, initialValue, expirationMinutes = 60) => {
  const storage = useMemo(() => new Map(), []);
  
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storage.get(key);
      if (!item) return initialValue;
      
      const now = new Date().getTime();
      
      if (now > item.expiry) {
        storage.delete(key);
        return initialValue;
      }
      
      return item.value;
    } catch (error) {
      console.error(`Error reading memory storage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const now = new Date().getTime();
      const expiry = now + (expirationMinutes * 60 * 1000);
      
      const item = {
        value,
        expiry,
      };
      
      storage.set(key, item);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error setting memory storage key "${key}":`, error);
    }
  }, [key, expirationMinutes, storage]);

  return [storedValue, setValue];
};

// FIXED: Products data fetching hook - NO MORE INFINITE LOOPS
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { processProduct } = useProductProcessor();
  const fetchedRef = useRef(false);

  // Create stable fetchProducts function
  const fetchProducts = useCallback(async () => {
    if (fetchedRef.current && products.length > 0) return; // Prevent refetch if already loaded
    
    setLoading(true);
    setError(null);
    
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => 
        processProduct(doc.data(), doc.id)
      );

      setProducts(productsData);
      fetchedRef.current = true;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [processProduct]); // processProduct is now stable

  // Only fetch once on mount
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array - only run once

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchedRef.current = false;
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error, 
    refetch 
  };
};