import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Collapse,
  Tooltip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  FilterList,
  Sort,
  Search,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  Close,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { DatePicker, Space } from 'antd';
import { styled } from '@mui/material/styles';

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(210, 105, 30, 0.08)',
  background: '#FFFFFF',
}));

const OrderFilters = ({
  filtersOpen,
  setFiltersOpen,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  deliveryFilter,
  setDeliveryFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  orderStatusFilter,
  setOrderStatusFilter,
  showDateRange,
  setShowDateRange,
  handleResetFilters,
  ordersCount,
  filteredCount,
}) => {
  return (
    <>
      {/* Filters Section */}
      <FilterSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
            <FilterList sx={{ mr: 1, color: 'primary.main' }} /> 
            Filters & Sorting
          </Typography>
          
          <Box>
            <Button
              size="small"
              startIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setFiltersOpen(!filtersOpen)}
              sx={{ mr: 1 }}
            >
              {filtersOpen ? 'Hide' : 'Show'} Filters
            </Button>
            
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<Close />}
            >
              Clear
            </Button>
          </Box>
        </Box>
        
        <Collapse in={filtersOpen}>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by order #, customer, items, address or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Sort By */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  startAdornment={
                    <InputAdornment position="start">
                      <Sort />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="latest">Latest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="highest">Highest Amount</MenuItem>
                  <MenuItem value="lowest">Lowest Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Date Range */}
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant={showDateRange ? "contained" : "outlined"}
                color="primary"
                startIcon={<CalendarMonth />}
                onClick={() => setShowDateRange(!showDateRange)}
                size="medium"
                sx={{ height: '40px' }}
              >
                {dateRange[0] && dateRange[1] 
                  ? `${dateRange[0].format('DD/MM/YY')} - ${dateRange[1].format('DD/MM/YY')}` 
                  : "Date Range"}
              </Button>
            </Grid>
            
            {/* Delivery Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Delivery Status</InputLabel>
                <Select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  label="Delivery Status"
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="added">Delivery Set</MenuItem>
                  <MenuItem value="notadded">No Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Payment Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {showDateRange && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Select Date Range</Typography>
                  <Space direction="vertical" size={12}>
                    <DatePicker.RangePicker
                      value={dateRange[0] && dateRange[1] ? [dateRange[0], dateRange[1]] : null}
                      onChange={(dates) => setDateRange(dates)}
                      style={{ width: '100%' }}
                    />
                  </Space>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </FilterSection>
      
      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Showing {filteredCount} of {ordersCount} orders
        </Typography>
        
        <Box>
          <Tooltip title="Latest Orders">
            <IconButton 
              color={sortBy === 'latest' ? 'primary' : 'default'}
              onClick={() => setSortBy('latest')}
              size="small"
            >
              <ArrowDownward />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Oldest Orders">
            <IconButton 
              color={sortBy === 'oldest' ? 'primary' : 'default'}
              onClick={() => setSortBy('oldest')}
              size="small"
            >
              <ArrowUpward />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default OrderFilters;