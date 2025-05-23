// components/FilterPanel/FilterPanel.jsx
import React, { memo } from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControl,
  Select,
  MenuItem,
  Button,
  Paper,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  PriceChange,
  Sort,
  Refresh,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FilterSection = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const SectionContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2, 2, 2),
}));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shorter,
  }),
  padding: 4,
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: theme.palette.primary.main,
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0 3px 8px rgba(210, 105, 30, 0.3)',
    },
  },
  '& .MuiSlider-track': {
    backgroundColor: theme.palette.primary.main,
    border: 'none',
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.divider,
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.primary.main,
    '&:before': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

const FilterPanel = memo(({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onResetFilters,
  expanded,
  onToggleSection,
}) => {
  const sections = [
    {
      key: 'price',
      title: 'Price Range',
      icon: <PriceChange sx={{ color: 'primary.main' }} />,
      content: (
        <Box>
          <StyledSlider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            min={1}
            max={5000}
            step={50}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Min: {formatPrice(priceRange[0])}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Max: {formatPrice(priceRange[1])}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'sort',
      title: 'Sort By',
      icon: <Sort sx={{ color: 'primary.main' }} />,
      content: (
        <FormControl fullWidth>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              '& .MuiSelect-select': { 
                py: 1.5 
              },
            }}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
            <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
          </Select>
        </FormControl>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Filters
        </Typography>
        <Divider />
      </Box>

      {sections.map((section) => (
        <FilterSection key={section.key} elevation={0}>
          <SectionHeader
            onClick={() => onToggleSection(section.key)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {section.icon}
              <Typography variant="subtitle1" fontWeight={600}>
                {section.title}
              </Typography>
            </Box>
            <ExpandButton
              size="small"
              expanded={expanded[section.key]}
            >
              <ExpandMore />
            </ExpandButton>
          </SectionHeader>
          
          <Collapse in={expanded[section.key]} timeout="auto" unmountOnExit>
            <SectionContent>
              {section.content}
            </SectionContent>
          </Collapse>
        </FilterSection>
      ))}

      <Button
        variant="outlined"
        color="primary"
        fullWidth
        startIcon={<Refresh />}
        onClick={onResetFilters}
        sx={{
          mt: 2,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'primary.light',
            color: 'white',
          },
        }}
      >
        Reset Filters
      </Button>
    </Box>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;