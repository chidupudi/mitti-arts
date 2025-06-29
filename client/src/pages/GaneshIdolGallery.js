// client/src/pages/GaneshIdolGallery.js - Customer-facing Ganesh Idol Gallery
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  ZoomIn,
  FilterList,
  Sort,
  Close,
  Phone,
  WhatsApp,
  Email,
  Height,
  Scale,
  Palette,
  Star,
  Info,
  CelebrationOutlined
} from '@mui/icons-material';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../Firebase/Firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSeason } from '../hooks/useSeason';

const GaneshIdolGallery = () => {
  const [user] = useAuthState(auth);
  const { isGaneshSeason } = useSeason();
  
  // Data states
  const [idols, setIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdol, setSelectedIdol] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  
  // Filter states
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([7000, 31000]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Lead form states
  const [leadForm, setLeadForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    requirements: '',
    preferredSize: '',
    customization: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch Ganesh idols
  useEffect(() => {
    const fetchIdols = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'ganeshIdols'));
        const idolsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.hidden) { // Only show non-hidden idols
            idolsData.push({ id: doc.id, ...data });
          }
        });
        setIdols(idolsData);
      } catch (error) {
        console.error('Error fetching Ganesh idols:', error);
        showSnackbar('Error loading Ganesh idols', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isGaneshSeason) {
      fetchIdols();
    } else {
      setLoading(false);
    }
  }, [isGaneshSeason]);

  // Filter and sort idols
  const filteredIdols = idols
    .filter(idol => {
      const categoryMatch = category === 'all' || idol.category === category;
      const priceMatch = (idol.priceMin <= priceRange[1]) && (idol.priceMax >= priceRange[0]);
      const availabilityMatch = tabValue === 0 || 
        (tabValue === 1 && idol.availability === 'available') ||
        (tabValue === 2 && idol.customizable);
      
      return categoryMatch && priceMatch && availabilityMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return a.priceMin - b.priceMin;
        case 'priceHigh':
          return b.priceMax - a.priceMax;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: // featured
          return (b.category === 'premium' ? 1 : 0) - (a.category === 'premium' ? 1 : 0);
      }
    });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleShowInterest = (idol) => {
    if (!user) {
      showSnackbar('Please login to show interest', 'warning');
      return;
    }
    setSelectedIdol(idol);
    setLeadForm(prev => ({
      ...prev,
      customerName: user.displayName || '',
      email: user.email || ''
    }));
    setLeadFormOpen(true);
  };

  const handleSubmitLead = async () => {
    if (!leadForm.customerName || !leadForm.phone) {
      showSnackbar('Please fill in required fields', 'error');
      return;
    }

    try {
      setSubmitLoading(true);
      
      // Check if user already submitted interest for this idol
      const existingLeads = await getDocs(query(
        collection(db, 'ganeshLeads'),
        where('customerId', '==', user.uid),
        where('idolId', '==', selectedIdol.id)
      ));

      if (!existingLeads.empty) {
        showSnackbar('You have already shown interest in this idol', 'warning');
        return;
      }

      const leadData = {
        customerId: user.uid,
        idolId: selectedIdol.id,
        customerInfo: {
          name: leadForm.customerName,
          phone: leadForm.phone,
          email: leadForm.email || user.email
        },
        idolDetails: {
          name: selectedIdol.name,
          category: selectedIdol.category,
          priceMin: selectedIdol.priceMin,
          priceMax: selectedIdol.priceMax,
          height: selectedIdol.height,
          material: selectedIdol.material,
          image: selectedIdol.images?.[0] || ''
        },
        requirements: leadForm.requirements,
        preferredSize: leadForm.preferredSize,
        customization: leadForm.customization,
        status: 'new',
        source: 'customer_gallery',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'ganeshLeads'), leadData);

      showSnackbar('Interest submitted! Our team will contact you soon.', 'success');
      setLeadFormOpen(false);
      setLeadForm({
        customerName: '',
        phone: '',
        email: '',
        requirements: '',
        preferredSize: '',
        customization: ''
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      showSnackbar('Error submitting interest. Please try again.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'traditional': return '🏛️';
      case 'modern': return '⭐';
      case 'premium': return '👑';
      default: return '🕉️';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'traditional': return '#8E24AA';
      case 'modern': return '#1976D2';
      case 'premium': return '#D32F2F';
      default: return '#FF8F00';
    }
  };

  const calculateAdvanceAmount = (priceMin, priceMax) => {
    const avgPrice = (priceMin + priceMax) / 2;
    if (avgPrice <= 10000) return 2000;
    if (avgPrice <= 15000) return 2500;
    return 3000;
  };

  if (!isGaneshSeason) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <CelebrationOutlined sx={{ fontSize: 64, color: '#FF8F00', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="primary">
            Ganesh Season Not Active
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The Ganesh idol collection is only available during Ganesh season.
            Please check back during the festive period.
          </Typography>
          <Button variant="contained" href="/products" sx={{ mt: 2 }}>
            Browse Regular Products
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
          color: 'white',
          p: 4,
          borderRadius: 3,
          mb: 4,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          🕉️ Ganesh Idol Collection
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Beautiful handcrafted Ganesh idols for your festivities
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
          Browse our collection and show interest • Our team will contact you for customization and booking
        </Typography>
      </Paper>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, value) => setTabValue(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All Idols (${idols.length})`} />
          <Tab label={`Available (${idols.filter(i => i.availability === 'available').length})`} />
          <Tab label={`Customizable (${idols.filter(i => i.customizable).length})`} />
        </Tabs>

        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="traditional">🏛️ Traditional</MenuItem>
              <MenuItem value="modern">⭐ Modern</MenuItem>
              <MenuItem value="premium">👑 Premium</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="featured">Featured</MenuItem>
              <MenuItem value="priceLow">Price: Low to High</MenuItem>
              <MenuItem value="priceHigh">Price: High to Low</MenuItem>
              <MenuItem value="name">Name A-Z</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" color="text.secondary">
              Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(e, value) => setPriceRange(value)}
              min={5000}
              max={35000}
              step={1000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredIdols.length} idol{filteredIdols.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Paper>

      {/* Idols Grid */}
      <Grid container spacing={3}>
        {filteredIdols.map((idol) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idol.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              {/* Image */}
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={idol.images?.[0] || '/api/placeholder/300/220'}
                  alt={idol.name}
                  sx={{ objectFit: 'cover' }}
                />
                
                {/* Category Badge */}
                <Chip
                  label={`${getCategoryIcon(idol.category)} ${idol.category}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: getCategoryColor(idol.category),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />

                {/* Customizable Badge */}
                {idol.customizable && (
                  <Chip
                    label="Customizable"
                    size="small"
                    color="secondary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 'bold'
                    }}
                  />
                )}

                {/* Image Count */}
                {idol.images?.length > 1 && (
                  <Chip
                    label={`${idol.images.length} photos`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white'
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom noWrap>
                  🕉️ {idol.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                  {idol.description}
                </Typography>

                {/* Price Range */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₹{idol.priceMin?.toLocaleString()} - ₹{idol.priceMax?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Advance: ₹{calculateAdvanceAmount(idol.priceMin, idol.priceMax).toLocaleString()}
                  </Typography>
                </Box>

                {/* Specifications */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {idol.height && (
                    <Chip
                      label={idol.height}
                      size="small"
                      icon={<Height />}
                      variant="outlined"
                    />
                  )}
                  {idol.weight && (
                    <Chip
                      label={idol.weight}
                      size="small"
                      icon={<Scale />}
                      variant="outlined"
                    />
                  )}
                  {idol.color && (
                    <Chip
                      label={idol.color}
                      size="small"
                      icon={<Palette />}
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Estimated Days */}
                {idol.estimatedDays && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                    🕒 Ready in {idol.estimatedDays} days
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleShowInterest(idol)}
                  sx={{
                    background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)',
                    fontWeight: 'bold',
                    mb: 1
                  }}
                >
                  Show Interest
                </Button>
                
                <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedIdol(idol);
                      setDetailsOpen(true);
                    }}
                    startIcon={<Info />}
                  >
                    Details
                  </Button>
                  <IconButton size="small">
                    <FavoriteBorder />
                  </IconButton>
                  <IconButton size="small">
                    <Share />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No Results */}
      {filteredIdols.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No idols found matching your criteria
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setCategory('all');
              setPriceRange([7000, 31000]);
              setTabValue(0);
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      )}

      {/* Idol Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedIdol && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">🕉️ {selectedIdol.name}</Typography>
                <IconButton onClick={() => setDetailsOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* Implement detailed view with image gallery, full specs, etc. */}
              <Typography variant="body1" paragraph>
                {selectedIdol.description}
              </Typography>
              {/* Add more details here */}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Lead Form Dialog */}
      <Dialog open={leadFormOpen} onClose={() => setLeadFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            🕉️ Show Interest in {selectedIdol?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Our team will contact you within 24 hours to discuss customization and finalize pricing.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name *"
                value={leadForm.customerName}
                onChange={(e) => setLeadForm({...leadForm, customerName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preferred Size/Height"
                value={leadForm.preferredSize}
                onChange={(e) => setLeadForm({...leadForm, preferredSize: e.target.value})}
                placeholder="e.g., 12 inches, 1.5 feet"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requirements"
                value={leadForm.requirements}
                onChange={(e) => setLeadForm({...leadForm, requirements: e.target.value})}
                placeholder="Any specific requirements or preferences..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Customization Requests"
                value={leadForm.customization}
                onChange={(e) => setLeadForm({...leadForm, customization: e.target.value})}
                placeholder="Any customization requests..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeadFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitLead}
            disabled={submitLoading}
            sx={{ background: 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)' }}
          >
            {submitLoading ? <CircularProgress size={20} /> : 'Submit Interest'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GaneshIdolGallery;