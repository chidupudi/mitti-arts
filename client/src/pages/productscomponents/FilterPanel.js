// pages/productscomponents/FilterPanel.js
import React, { memo } from 'react';
import {
  Typography,
  Button,
  Slider,
  Select,
  Switch,
  Tag,
  Divider,
  Collapse,
} from 'antd';
import {
  DollarOutlined,
  SortAscendingOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
  StarOutlined,
  FireOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Terracotta colors
const terracottaColors = {
  primary: '#D2691E',
  primaryLight: '#E8A857',
  primaryDark: '#A0522D',
  secondary: '#CD853F',
  accent: '#F4A460',
  background: '#FDFCFA',
  backgroundLight: '#FFEEE6',
  text: '#2C1810',
  textSecondary: '#6B4423',
  divider: '#E8D5C4',
  success: '#8BC34A',
  warning: '#FF9800',
  error: '#F44336',
  ganesh: '#FF8F00',
};

// Format price helper
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

const FilterPanel = memo(({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  hyderabadOnly,
  setHyderabadOnly,
  onResetFilters,
}) => {
  const filterSections = [
    {
      key: '1',
      label: (
        <span>
          <DollarOutlined style={{ color: terracottaColors.primary, marginRight: 8 }} />
          Price Range
        </span>
      ),
      children: (
        <div>
          <Slider
            range
            value={priceRange}
            onChange={setPriceRange}
            min={1}
            max={5000}
            step={50}
            tooltip={{
              formatter: formatPrice
            }}
            style={{ marginBottom: '16px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="secondary">
              Min: {formatPrice(priceRange[0])}
            </Text>
            <Text type="secondary">
              Max: {formatPrice(priceRange[1])}
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SortAscendingOutlined style={{ color: terracottaColors.primary, marginRight: 8 }} />
          Sort By
        </span>
      ),
      children: (
        <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: '100%' }}
        >
          <Option value="relevance">
            <span>
              <TrophyOutlined style={{ marginRight: 8 }} />
              Most Relevant
            </span>
          </Option>
          <Option value="priceLowToHigh">
            <span>
              💰 Price: Low to High
            </span>
          </Option>
          <Option value="priceHighToLow">
            <span>
              💎 Price: High to Low
            </span>
          </Option>
          <Option value="alphabetical">
            <span>
              🔤 Alphabetical
            </span>
          </Option>
          <Option value="rating">
            <span>
              <StarOutlined style={{ marginRight: 8 }} />
              Highest Rated
            </span>
          </Option>
          <Option value="newest">
            <span>
              ✨ Newest First
            </span>
          </Option>
          <Option value="featured">
            <span>
              <FireOutlined style={{ marginRight: 8 }} />
              Featured
            </span>
          </Option>
          <Option value="discount">
            <span>
              🏷️ Best Discounts
            </span>
          </Option>
        </Select>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <EnvironmentOutlined style={{ color: terracottaColors.primary, marginRight: 8 }} />
          Delivery Options
        </span>
      ),
      children: (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px dashed ${terracottaColors.primary}50`,
            backgroundColor: `${terracottaColors.primary}08`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong>Hyderabad Only</Text>
              <Tag 
                style={{ 
                  marginLeft: 8,
                  backgroundColor: hyderabadOnly ? '#9C27B0' : '#9C27B030',
                  color: hyderabadOnly ? 'white' : '#9C27B0',
                  border: 'none'
                }}
              >
                HYD
              </Tag>
            </div>
            <Switch
              checked={hyderabadOnly}
              onChange={setHyderabadOnly}
            />
          </div>
          <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
            Show only products available for delivery in Hyderabad
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ fontWeight: 700, marginBottom: '8px', color: terracottaColors.primary }}>
          🔍 Product Filters
        </Title>
        <Divider style={{ margin: 0 }} />
      </div>

      <Collapse
        defaultActiveKey={['1', '2', '3']}
        ghost
        expandIconPosition="right"
        items={filterSections}
      />

      <Button
        type="default"
        icon={<ReloadOutlined />}
        onClick={onResetFilters}
        block
        style={{
          marginTop: '16px',
          height: '40px',
          borderRadius: '8px',
          fontWeight: 600,
          borderWidth: 2,
          borderColor: terracottaColors.primary,
          color: terracottaColors.primary,
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
export { terracottaColors, formatPrice };