// client/src/hooks/useGaneshInventory.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { db } from '../Firebase/Firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

export const useGaneshInventory = () => {
  // Data states
  const [ganeshIdols, setGaneshIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idolToDelete, setIdolToDelete] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  
  // Form states for Ganesh idols
  const [newIdol, setNewIdol] = useState({
    name: '',
    description: '',
    images: Array(8).fill(''),
    price: 15000, // Single price field
    height: '', // in inches
    weight: '', // in kg
    color: '',
    material: 'Eco-friendly Clay',
    features: [], // Array of features
    customizable: true,
    category: 'traditional', // traditional, modern, premium
    availability: 'available', // available, custom-order, sold-out
    estimatedDays: 7, // Production/delivery days
    advancePercentage: 25, // 25% advance by default
  });
  const [editIdol, setEditIdol] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch Ganesh idols from Firestore
  const fetchGaneshIdols = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'ganeshIdols'));
      const idolsArr = [];
      querySnapshot.forEach((doc) => {
        idolsArr.push({ 
          id: doc.id,
          ...doc.data()
        });
      });
      setGaneshIdols(idolsArr);
    } catch (error) {
      console.error('Error fetching Ganesh idols:', error);
      setError('Error loading Ganesh idols: ' + error.message);
      showSnackbar('Error loading Ganesh idols: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGaneshIdols();
  }, [fetchGaneshIdols]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // FIXED: Add new Ganesh idol to Firestore
  const handleAddIdol = useCallback(async () => {
    // FIXED: Check for correct fields (price instead of priceMin/priceMax)
    if (!newIdol.name || !newIdol.price) {
      showSnackbar('Please fill in required fields (Name and Price)', 'error');
      return;
    }

    // FIXED: Validate price is a positive number
    if (newIdol.price <= 0) {
      showSnackbar('Price must be greater than 0', 'error');
      return;
    }

    try {
      const idolData = {
        ...newIdol,
        price: Number(newIdol.price), // Ensure it's a number
        images: newIdol.images.filter(url => url && url !== 'loading'),
        estimatedDays: Number(newIdol.estimatedDays) || 7,
        advancePercentage: Number(newIdol.advancePercentage) || 25,
        hidden: false,
        createdAt: new Date(),
        type: 'ganesh-idol', // Identifier for season type
        season: 'ganesh',
        // Calculate advance amount for single price
        advanceAmount: calculateAdvanceAmount(newIdol.price),
      };

      const docRef = await addDoc(collection(db, 'ganeshIdols'), idolData);
      
      setGaneshIdols(prev => [
        ...prev,
        { ...idolData, id: docRef.id }
      ]);

      // Reset form
      setNewIdol({
        name: '',
        description: '',
        images: Array(8).fill(''),
        price: 15000,
        height: '',
        weight: '',
        color: '',
        material: 'Eco-friendly Clay',
        features: [],
        customizable: true,
        category: 'traditional',
        availability: 'available',
        estimatedDays: 7,
        advancePercentage: 25,
      });
      setAddDialogOpen(false);
      showSnackbar('Ganesh idol added successfully!', 'success');
    } catch (error) {
      console.error('Error adding Ganesh idol:', error);
      showSnackbar('Failed to add Ganesh idol. Please try again.', 'error');
    }
  }, [newIdol, showSnackbar]);

  // FIXED: Calculate advance amount based on price brackets
  const calculateAdvanceAmount = (price) => {
    if (price >= 8000 && price <= 10000) return 2000;
    if (price > 10000 && price <= 15000) return 2500;
    if (price > 15000) return 3000;
    return 2000; // Default
  };

  // Delete idol with confirmation
  const handleDeleteClick = useCallback((idol) => {
    setIdolToDelete(idol);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!idolToDelete) return;

    try {
      await deleteDoc(doc(db, 'ganeshIdols', idolToDelete.id));
      setGaneshIdols(prev => prev.filter((p) => p.id !== idolToDelete.id));
      setDeleteDialogOpen(false);
      setIdolToDelete(null);
      showSnackbar('Ganesh idol deleted successfully!', 'success');
    } catch (error) {
      console.error('Error removing Ganesh idol:', error);
      showSnackbar('Error deleting Ganesh idol: ' + error.message, 'error');
    }
  }, [idolToDelete, showSnackbar]);

  // Toggle idol visibility
  const handleToggleHide = useCallback(async (id) => {
    try {
      const idol = ganeshIdols.find(p => p.id === id);
      if (!idol) return;

      const updatedFields = {
        hidden: !idol.hidden,
        updatedAt: new Date()
      };

      const idolRef = doc(db, 'ganeshIdols', id);
      await updateDoc(idolRef, updatedFields);
      
      setGaneshIdols(prev => prev.map(p =>
        p.id === id ? { ...p, ...updatedFields } : p
      ));
      
      showSnackbar(
        `Ganesh idol ${!idol.hidden ? 'hidden' : 'shown'} successfully!`, 
        'success'
      );
    } catch (error) {
      console.error('Error updating idol visibility:', error);
      showSnackbar('Error updating idol visibility: ' + error.message, 'error');
    }
  }, [ganeshIdols, showSnackbar]);

  // Edit idol handlers
  const handleEditIdol = useCallback((idol) => {
    setEditIdol({ 
      ...idol,
      images: Array.isArray(idol.images) ? idol.images : Array(8).fill(''),
      features: Array.isArray(idol.features) ? idol.features : [],
    });
    setEditDialogOpen(true);
  }, []);

  const handleEditChange = useCallback((field, value) => {
    if (!editIdol) return;

    try {
      let processedValue = value;
      
      switch(field) {
        case 'images':
          processedValue = Array.isArray(value) ? value : Array(8).fill('');
          break;
        case 'price': // FIXED: Handle price field correctly
        case 'estimatedDays':
        case 'advancePercentage':
          processedValue = value === '' ? 0 : Number(value);
          break;
        case 'features':
          processedValue = Array.isArray(value) ? value : [];
          break;
        case 'customizable':
          processedValue = Boolean(value);
          break;
        default:
          processedValue = value;
      }

      setEditIdol(prev => ({
        ...prev,
        [field]: processedValue
      }));
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  }, [editIdol]);

  // FIXED: Save edited idol
  const handleSaveEdit = useCallback(async () => {
    // FIXED: Check editIdol instead of newIdol, and check for price instead of priceMin/priceMax
    if (!editIdol?.name || !editIdol?.price) {
      showSnackbar('Please fill in required fields (Name and Price)', 'error');
      return;
    }

    // FIXED: Validate price is a positive number
    if (editIdol.price <= 0) {
      showSnackbar('Price must be greater than 0', 'error');
      return;
    }

    try {
      if (!editIdol?.id) {
        throw new Error('No idol ID found');
      }

      const { id, ...updateData } = editIdol;
      
      const updatedIdol = {
        ...updateData,
        price: Number(updateData.price), // Ensure it's a number
        images: (updateData.images || []).filter(url => url && url !== 'loading'),
        features: Array.isArray(updateData.features) ? updateData.features : [],
        updatedAt: new Date(),
        advanceAmount: calculateAdvanceAmount(updateData.price), // FIXED: Use single price
      };

      const idolRef = doc(db, 'ganeshIdols', id);
      await updateDoc(idolRef, updatedIdol);
      
      setGaneshIdols(prev => prev.map(p =>
        p.id === id ? { id, ...updatedIdol } : p
      ));
      
      setEditDialogOpen(false);
      setEditIdol(null);
      showSnackbar('Ganesh idol updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating Ganesh idol:', error);
      showSnackbar('Error updating Ganesh idol: ' + error.message, 'error');
    }
  }, [editIdol, showSnackbar]); // FIXED: Use editIdol in dependency

  // Filter and sort idols
  const filteredIdols = ganeshIdols
    .filter(idol => {
      const matchesSearch = 
        idol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (idol.color && idol.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (idol.height && idol.height.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterCategory === 'all' || 
        (filterCategory === 'hidden' && idol.hidden) ||
        (filterCategory === 'visible' && !idol.hidden) ||
        (filterCategory === 'traditional' && idol.category === 'traditional') ||
        (filterCategory === 'modern' && idol.category === 'modern') ||
        (filterCategory === 'premium' && idol.category === 'premium') ||
        (filterCategory === 'available' && idol.availability === 'available') ||
        (filterCategory === 'custom-order' && idol.availability === 'custom-order');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'height':
          return (parseFloat(a.height) || 0) - (parseFloat(b.height) || 0);
        case 'priceDesc':
          return (b.price || 0) - (a.price || 0);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  // Statistics
  const statistics = {
    totalIdols: ganeshIdols.length,
    hiddenIdols: ganeshIdols.filter(p => p.hidden).length,
    traditionalIdols: ganeshIdols.filter(p => p.category === 'traditional').length,
    modernIdols: ganeshIdols.filter(p => p.category === 'modern').length,
    premiumIdols: ganeshIdols.filter(p => p.category === 'premium').length,
    customizableIdols: ganeshIdols.filter(p => p.customizable).length,
    averagePrice: ganeshIdols.length > 0 
      ? ganeshIdols.reduce((sum, p) => sum + (p.price || 0), 0) / ganeshIdols.length 
      : 0,
    priceRange: {
      min: ganeshIdols.length > 0 ? Math.min(...ganeshIdols.map(p => p.price || 0)) : 0,
      max: ganeshIdols.length > 0 ? Math.max(...ganeshIdols.map(p => p.price || 0)) : 0,
    }
  };

  // Pagination
  const paginatedIdols = filteredIdols.slice(
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
    ganeshIdols,
    filteredIdols,
    paginatedIdols,
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
    idolToDelete,
    
    // Form states
    newIdol,
    setNewIdol,
    editIdol,
    
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
    handleAddIdol,
    handleDeleteClick,
    handleConfirmDelete,
    handleToggleHide,
    handleEditIdol,
    handleEditChange,
    handleSaveEdit,
    handleChangePage,
    handleChangeRowsPerPage,
    fetchGaneshIdols,
  };
};