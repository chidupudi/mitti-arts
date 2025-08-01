// hooks/useInventory.js - Updated to use ImageKit
import { useState, useEffect, useCallback } from 'react';
import { db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc 
} from 'firebase/firestore';
// UPDATED: Corrected the import from 'uploadToImageKit' to 'simpleImageKitUpload'
import { simpleImageKitUpload, validateImageFile } from '../utils/imagekit';

export const useInventory = () => {
  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    images: Array(8).fill(''),
    price: '',
    code: '',
    stock: 50,
    category: '',
    hyderabadOnly: false,
    // Added new specification fields
    color: '',
    dimensions: '',
    weight: '',
  });
  const [editProduct, setEditProduct] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch products from Firestore
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError('Error loading products: ' + error.message);
      showSnackbar('Error loading products: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Add new product to Firestore
  const handleAddProduct = useCallback(async () => {
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
        hyderabadOnly: newProduct.hyderabadOnly || false,
        hidden: false,
        inStock: true,
        createdAt: new Date(),
        // Add new specification fields
        color: newProduct.color || '',
        dimensions: newProduct.dimensions || '',
        weight: newProduct.weight || '',
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      
      setProducts(prev => [
        ...prev,
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
        hyderabadOnly: false,
        color: '',
        dimensions: '',
        weight: '',
      });
      setAddDialogOpen(false);
      showSnackbar('Product added successfully!', 'success');
    } catch (error) {
      console.error('Error adding product:', error);
      showSnackbar('Failed to add product. Please try again.', 'error');
    }
  }, [newProduct, showSnackbar]);

  // Delete product with confirmation
  const handleDeleteClick = useCallback((product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setProducts(prev => prev.filter((p) => p.id !== productToDelete.id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      showSnackbar('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error removing product:', error);
      showSnackbar('Error deleting product: ' + error.message, 'error');
    }
  }, [productToDelete, showSnackbar]);

  // Toggle product visibility
  const handleToggleHide = useCallback(async (id) => {
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
      
      setProducts(prev => prev.map(p =>
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
  }, [products, showSnackbar]);

  // Edit product handlers
  const handleEditProduct = useCallback((product) => {
    // Initialize all fields including new specifications
    setEditProduct({ 
      ...product,
      hyderabadOnly: product.hyderabadOnly || false,
      color: product.color || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      // Ensure images array is properly initialized
      images: Array.isArray(product.images) ? product.images : Array(8).fill('')
    });
    setEditDialogOpen(true);
  }, []);

  const handleEditChange = useCallback((field, value) => {
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
        case 'hyderabadOnly': // Handle boolean explicitly
          processedValue = Boolean(value);
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
  }, [editProduct]);

  const handleSaveEdit = useCallback(async () => {
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
        hyderabadOnly: updateData.hyderabadOnly || false,
        images: (updateData.images || []).filter(url => url && url !== 'loading'),
        updatedAt: new Date(),
        // Include specification fields
        color: updateData.color || '',
        dimensions: updateData.dimensions || '',
        weight: updateData.weight || '',
      };

      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, updatedProduct);
      
      setProducts(prev => prev.map(p =>
        p.id === id ? { id, ...updatedProduct } : p
      ));
      
      setEditDialogOpen(false);
      setEditProduct(null);
      showSnackbar('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar('Error updating product: ' + error.message, 'error');
    }
  }, [editProduct, showSnackbar]);

  // Image upload handler - UPDATED to use ImageKit
  const handleImageUpload = useCallback(async (e, index, isEdit = false) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      validateImageFile(file);

      const updateImages = (prevImages) => {
        // Ensure prevImages is an array
        const imageArray = Array.isArray(prevImages) ? [...prevImages] : Array(8).fill('');
        imageArray[index] = 'loading';
        return imageArray;
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

      // UPDATED: Use simpleImageKitUpload instead of uploadToImageKit
      // Passing options as an object
      const result = await simpleImageKitUpload(file, { folder: '/products' });
      const imageUrl = result.url; // Assuming the result object has a 'url' property

      if (isEdit) {
        setEditProduct(prev => {
          const newImages = Array.isArray(prev.images) ? [...prev.images] : Array(8).fill('');
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
          const newImages = Array.isArray(prev.images) ? [...prev.images] : Array(8).fill('');
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
  }, [showSnackbar]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        // Add search in specifications
        (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.dimensions && product.dimensions.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.weight && product.weight.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterCategory === 'all' || 
        (filterCategory === 'hidden' && product.hidden) ||
        (filterCategory === 'visible' && !product.hidden) ||
        (filterCategory === 'low-stock' && product.stock < 10) ||
        (filterCategory === 'hyderabad-only' && product.hyderabadOnly);
      
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
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

  // Statistics
  const statistics = {
    totalProducts: products.length,
    hiddenProducts: products.filter(p => p.hidden).length,
    lowStockProducts: products.filter(p => p.stock < 10).length,
    hyderabadOnlyProducts: products.filter(p => p.hyderabadOnly).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    // Data
    products,
    filteredProducts,
    paginatedProducts,
    statistics,
    loading,
    error,
    
    // Dialog states
    addDialogOpen,
    setAddDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    productToDelete,
    
    // Form states
    newProduct,
    setNewProduct,
    editProduct,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filterCategory,
    setFilterCategory,
    page,
    rowsPerPage,
    
    // Snackbar
    snackbar,
    handleCloseSnackbar,
    
    // Actions
    handleAddProduct,
    handleDeleteClick,
    handleConfirmDelete,
    handleToggleHide,
    handleEditProduct,
    handleEditChange,
    handleSaveEdit,
    handleImageUpload,
    handleChangePage,
    handleChangeRowsPerPage,
    fetchProducts,
  };
};