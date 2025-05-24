import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Search,
  GridView,
  ViewList,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FilterPanelContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  background: '#FFFFFF',
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 16,
}));

const FilterPanel = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onAddProduct,
}) => {
  return (
    <FilterPanelContainer>
      <TextField
        placeholder="Search products..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 250 }}
      />
      
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Filter</InputLabel>
        <Select
          value={filterCategory}
          label="Filter"
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <MenuItem value="all">All Products</MenuItem>
          <MenuItem value="visible">Visible Only</MenuItem>
          <MenuItem value="hidden">Hidden Only</MenuItem>
          <MenuItem value="low-stock">Low Stock</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          label="Sort By"
          onChange={(e) => setSortBy(e.target.value)}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="price">Price</MenuItem>
          <MenuItem value="stock">Stock</MenuItem>
          <MenuItem value="created">Created Date</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAddProduct}
        sx={{ 
          ml: 'auto',
          background: 'linear-gradient(135deg, #D2691E 0%, #F4A460 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
          },
        }}
      >
        Add Product
      </Button>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Grid View">
          <IconButton
            color={viewMode === 'grid' ? 'primary' : 'default'}
            onClick={() => setViewMode('grid')}
          >
            <GridView />
          </IconButton>
        </Tooltip>
        <Tooltip title="Table View">
          <IconButton
            color={viewMode === 'table' ? 'primary' : 'default'}
            onClick={() => setViewMode('table')}
          >
            <ViewList />
          </IconButton>
        </Tooltip>
      </Box>
    </FilterPanelContainer>
  );
};

export default FilterPanel;