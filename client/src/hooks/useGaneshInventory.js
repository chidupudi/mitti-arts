// client/src/hooks/useGaneshInventory.js
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
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinary';

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
    priceMin: 7000, // Minimum ₹7k
    priceMax: 31000, // Maximum ₹31k
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

  // Add new Ganesh idol to Firestore
  const handleAddIdol = useCallback(async () => {
    if (!newIdol.name || !newIdol.priceMin || !newIdol.priceMax) {
      showSnackbar('Please fill in required fields (Name, Price Range)', 'error');
      return;
    }

    if (newIdol.priceMin >= newIdol.priceMax) {
      showSnackbar('Maximum price must be greater than minimum price', 'error');
      return;
    }

    try {
      const idolData = {
        ...newIdol,
        priceMin: Number(newIdol.priceMin),
        priceMax: Number(newIdol.priceMax),
        images: newIdol.images.filter(url => url && url !== 'loading'),
        estimatedDays: Number(newIdol.estimatedDays) || 7,
        advancePercentage: Number(newIdol.advancePercentage) || 25,
        hidden: false,
        createdAt: new Date(),
        type: 'ganesh-idol', // Identifier for season type
        season: 'ganesh',
        // Calculate advance amounts for different price brackets
        advanceAmounts: calculateAdvanceAmounts(newIdol.priceMin, newIdol.priceMax),
      };

      const docRef = await addDoc(collection(db, 'ganeshIdols'), idolData);
      
      setGaneshIdols(prev => [
        ...prev,
        { ...idolData, id: docRef.id }
      ]);

      setNewIdol({
        name: '',
        description: '',
        images: Array(8).fill(''),
        priceMin: 7000,
        priceMax: 31000,
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

  // Calculate advance amounts based on price brackets
  const calculateAdvanceAmounts = (priceMin, priceMax) => {
    const brackets = [];
    
    // ₹8k-10k bracket
    if (priceMin <= 10000) {
      brackets.push({ min: Math.max(priceMin, 8000), max: Math.min(priceMax, 10000), advance: 2000 });
    }
    
    // ₹10k-15k bracket  
    if (priceMin <= 15000 && priceMax > 10000) {
      brackets.push({ min: Math.max(priceMin, 10000), max: Math.min(priceMax, 15000), advance: 2500 });
    }
    
    // >₹15k bracket
    if (priceMax > 15000) {
      brackets.push({ min: Math.max(priceMin, 15000), max: priceMax, advance: 3000 });
    }
    
    return brackets;
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
        case 'priceMin':
        case 'priceMax':
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

  const handleSaveEdit = useCallback(async () => {
    if (!editIdol?.name || !editIdol?.priceMin || !editIdol?.priceMax) {
      showSnackbar('Please fill in required fields', 'error');
      return;
    }

    if (editIdol.priceMin >= editIdol.priceMax) {
      showSnackbar('Maximum price must be greater than minimum price', 'error');
      return;
    }

    try {
      if (!editIdol?.id) {
        throw new Error('No idol ID found');
      }

      const { id, ...updateData } = editIdol;
      
      const updatedIdol = {
        ...updateData,
        priceMin: Number(updateData.priceMin) || 0,
        priceMax: Number(updateData.priceMax) || 0,
        images: (updateData.images || []).filter(url => url && url !== 'loading'),
        features: Array.isArray(updateData.features) ? updateData.features : [],
        updatedAt: new Date(),
        advanceAmounts: calculateAdvanceAmounts(updateData.priceMin, updateData.priceMax),
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
  }, [editIdol, showSnackbar]);

  // Image upload handler
  const handleImageUpload = useCallback(async (e, index, isEdit = false) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      validateImageFile(file);

      const updateImages = (prevImages) => {
        const imageArray = Array.isArray(prevImages) ? [...prevImages] : Array(8).fill('');
        imageArray[index] = 'loading';
        return imageArray;
      };

      if (isEdit) {
        setEditIdol(prev => ({
          ...prev,
          images: updateImages(prev.images)
        }));
      } else {
        setNewIdol(prev => ({
          ...prev,
          images: updateImages(prev.images)
        }));
      }

      const imageUrl = await uploadToCloudinary(file);

      if (isEdit) {
        setEditIdol(prev => {
          const newImages = Array.isArray(prev.images) ? [...prev.images] : Array(8).fill('');
          newImages[index] = imageUrl;
          return { ...prev, images: newImages };
        });
      } else {
        setNewIdol(prev => {
          const newImages = [...prev.images];
          newImages[index] = imageUrl;
          return { ...prev, images: newImages };
        });
      }
      
      showSnackbar('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (isEdit) {
        setEditIdol(prev => {
          const newImages = Array.isArray(prev.images) ? [...prev.images] : Array(8).fill('');
          newImages[index] = '';
          return { ...prev, images: newImages };
        });
      } else {
        setNewIdol(prev => {
          const newImages = [...prev.images];
          newImages[index] = '';
          return { ...prev, images: newImages };
        });
      }
      
      showSnackbar(error.message || 'Failed to upload image. Please try again.', 'error');
    }
  }, [showSnackbar]);

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
        case 'priceMin':
          return a.priceMin - b.priceMin;
        case 'priceMax':
          return a.priceMax - b.priceMax;
        case 'height':
          return (parseFloat(a.height) || 0) - (parseFloat(b.height) || 0);
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
      ? ganeshIdols.reduce((sum, p) => sum + ((p.priceMin + p.priceMax) / 2), 0) / ganeshIdols.length 
      : 0,
    priceRange: {
      min: ganeshIdols.length > 0 ? Math.min(...ganeshIdols.map(p => p.priceMin)) : 0,
      max: ganeshIdols.length > 0 ? Math.max(...ganeshIdols.map(p => p.priceMax)) : 0,
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
    handleImageUpload,
    handleChangePage,
    handleChangeRowsPerPage,
    fetchGaneshIdols,
  };
};