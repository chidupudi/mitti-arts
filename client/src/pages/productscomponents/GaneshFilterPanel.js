// client/src/pages/productscomponents/GaneshFilterPanel.js
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
  ColumnHeightOutlined,
  ReloadOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
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

const GaneshFilterPanel = memo(({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  categoryFilter,
  setCategoryFilter,
  customizableOnly,
  setCustomizableOnly,
  onResetFilters,
}) => {
  const filterSections = [
    {
      key: '1',
      label: (
        <span>
          <DollarOutlined style={{ color: terracottaColors.ganesh, marginRight: 8 }} />
          Price Range
        </span>
      ),
      children: (
        <div>
          <Slider
            range
            value={priceRange}
            onChange={setPriceRange}
            min={5000}
            max={50000}
            step={1000}
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
          <SortAscendingOutlined style={{ color: terracottaColors.ganesh, marginRight: 8 }} />
          Sort By
        </span>
      ),
      children: (
        <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: '100%' }}
        >
          <Option value="relevance">🕉️ Most Relevant</Option>
          <Option value="priceLowToHigh">💰 Price: Low to High</Option>
          <Option value="priceHighToLow">💎 Price: High to Low</Option>
          <Option value="heightLowToHigh">📏 Height: Small to Large</Option>
          <Option value="heightHighToLow">🏛️ Height: Large to Small</Option>
          <Option value="alphabetical">🔤 Alphabetical</Option>
          <Option value="newest">✨ Newest First</Option>
          <Option value="estimatedDays">⏰ Ready Time: Fast to Slow</Option>
        </Select>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <CrownOutlined style={{ color: terracottaColors.ganesh, marginRight: 8 }} />
          Category
        </span>
      ),
      children: (
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: '100%' }}
          placeholder="All Categories"
        >
          <Option value="all">All Categories</Option>
          <Option value="traditional">
            <span>
              <CrownOutlined style={{ color: '#8E24AA', marginRight: 8 }} />
              Traditional
            </span>
          </Option>
          <Option value="modern">
            <span>
              <StarOutlined style={{ color: '#1976D2', marginRight: 8 }} />
              Modern
            </span>
          </Option>
          <Option value="premium">
            <span>
              <FireOutlined style={{ color: '#D32F2F', marginRight: 8 }} />
              Premium
            </span>
          </Option>
        </Select>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <ColumnHeightOutlined style={{ color: terracottaColors.ganesh, marginRight: 8 }} />
          Customization
        </span>
      ),
      children: (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px dashed ${terracottaColors.ganesh}50`,
            backgroundColor: `${terracottaColors.ganesh}08`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong>Customizable Only</Text>
              <Tag 
                style={{ 
                  marginLeft: 8,
                  backgroundColor: customizableOnly ? terracottaColors.ganesh : `${terracottaColors.ganesh}30`,
                  color: customizableOnly ? 'white' : terracottaColors.ganesh,
                  border: 'none'
                }}
              >
                Custom
              </Tag>
            </div>
            <Switch
              checked={customizableOnly}
              onChange={setCustomizableOnly}
            />
          </div>
          <Text type="secondary" style={{ marginTop: '8px', display: 'block' }}>
            Show only idols that can be customized according to your preferences
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ fontWeight: 700, marginBottom: '8px', color: terracottaColors.ganesh }}>
          🕉️ Ganesh Idol Filters
        </Title>
        <Divider style={{ margin: 0 }} />
      </div>

      <Collapse
        defaultActiveKey={['1', '2', '3', '4']}
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
          borderColor: terracottaColors.ganesh,
          color: terracottaColors.ganesh,
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
});

GaneshFilterPanel.displayName = 'GaneshFilterPanel';

export default GaneshFilterPanel;
export { terracottaColors, formatPrice };

