// pages/productscomponents/CompactSearchFilter.js
import React, { memo } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  FilterOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

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

// Height filter options
const heightOptions = [
  { label: '3ft', value: [3, 3.5], range: '3-3.5' },
  { label: '4ft', value: [4, 4.5], range: '4-4.5' },
  { label: '5ft', value: [5, 5.5], range: '5-5.5' },
  { label: '6ft', value: [6, 6.5], range: '6-6.5' },
  { label: '7ft', value: [7, 7.5], range: '7-7.5' },
  { label: '8ft', value: [8, 8.5], range: '8-8.5' },
];

const CompactSearchFilter = memo(({ 
  searchQuery, 
  setSearchQuery, 
  filteredGaneshIdols, 
  isGaneshSearching, 
  handleGaneshDrawerToggle,
  // NEW: Height filter props
  selectedHeightFilter,
  setSelectedHeightFilter,
  isMobile 
}) => {
  
  const handleHeightFilterClick = (heightOption) => {
    if (selectedHeightFilter === heightOption.label) {
      // If clicking the same filter, remove it
      setSelectedHeightFilter(null);
    } else {
      // Set new height filter
      setSelectedHeightFilter(heightOption.label);
    }
  };

  const customStyles = `
    .compact-search-filter {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid ${terracottaColors.ganesh}30;
      border-radius: 12px;
      padding: ${isMobile ? '10px' : '14px'};
      box-shadow: 0 4px 12px rgba(255, 143, 0, 0.1);
    }
    
    .compact-search-input .ant-input {
      border-radius: 8px;
      border-color: ${terracottaColors.ganesh}40;
      height: ${isMobile ? '38px' : '42px'};
    }
    
    .compact-search-input .ant-input:focus,
    .compact-search-input .ant-input-focused {
      border-color: ${terracottaColors.ganesh};
      box-shadow: 0 0 0 2px ${terracottaColors.ganesh}20;
    }
    
    .compact-filter-btn {
      border-radius: 8px;
      height: ${isMobile ? '38px' : '42px'};
      background: ${terracottaColors.ganesh};
      border-color: ${terracottaColors.ganesh};
      font-weight: 600;
    }
    
    .compact-filter-btn:hover {
      background: ${terracottaColors.primaryDark};
      border-color: ${terracottaColors.primaryDark};
    }
    
    .height-filter-btn {
      border-radius: 6px;
      height: ${isMobile ? '32px' : '36px'};
      font-size: ${isMobile ? '11px' : '12px'};
      font-weight: 600;
      padding: 0 ${isMobile ? '8px' : '12px'};
      border: 1px solid ${terracottaColors.ganesh}40;
      color: ${terracottaColors.ganesh};
      background: transparent;
      transition: all 0.2s ease;
    }
    
    .height-filter-btn:hover {
      border-color: ${terracottaColors.ganesh};
      color: ${terracottaColors.ganesh};
      background: ${terracottaColors.ganesh}10;
    }
    
    .height-filter-btn.active {
      background: ${terracottaColors.ganesh};
      border-color: ${terracottaColors.ganesh};
      color: white;
    }
    
    .height-filter-btn.active:hover {
      background: ${terracottaColors.primaryDark};
      border-color: ${terracottaColors.primaryDark};
      color: white;
    }
    
    .compact-results-tag {
      background: ${terracottaColors.ganesh}15;
      color: ${terracottaColors.ganesh};
      border: none;
      padding: ${isMobile ? '6px 10px' : '8px 12px'};
      border-radius: 6px;
      font-weight: 600;
      height: ${isMobile ? '32px' : '36px'};
      display: flex;
      align-items: center;
      font-size: ${isMobile ? '11px' : '12px'};
    }

    .height-filters-row {
      margin-top: ${isMobile ? '6px' : '8px'};
    }

    .height-filters-scroll {
      display: flex;
      gap: ${isMobile ? '6px' : '8px'};
      overflow-x: auto;
      padding: ${isMobile ? '2px 0' : '4px 0'};
      scrollbar-width: none;
      -ms-overflow-style: none;
      align-items: center;
    }

    .height-filters-scroll::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      <div className="compact-search-filter" style={{ marginBottom: '16px' }}>
        {/* Row 1: Search Input and Filter Button */}
        <Row gutter={[8, 8]} align="middle">
          <Col xs={16} sm={17} md={18} lg={19}>
            <Input
              className="compact-search-input"
              placeholder={isMobile ? "Search idols..." : "Search Ganesh idols..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined style={{ color: terracottaColors.ganesh }} />}
              suffix={searchQuery && (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseOutlined />}
                  onClick={() => setSearchQuery('')}
                  style={{ 
                    color: terracottaColors.textSecondary,
                    minWidth: 'auto',
                    padding: '0 4px'
                  }}
                />
              )}
            />
          </Col>

          <Col xs={8} sm={7} md={6} lg={5}>
            <Button
              type="primary"
              className="compact-filter-btn"
              icon={<FilterOutlined />}
              onClick={handleGaneshDrawerToggle}
              block
              style={{ padding: '0 8px' }}
            >
              {!isMobile && 'Filter'}
            </Button>
          </Col>
        </Row>

        {/* Row 2: Height Filters with inline Results Count */}
        <div className="height-filters-row">
          <div className="height-filters-scroll">
            {heightOptions.map((option) => (
              <Button
                key={option.label}
                className={`height-filter-btn ${selectedHeightFilter === option.label ? 'active' : ''}`}
                onClick={() => handleHeightFilterClick(option)}
                size="small"
              >
                {option.label}
                {isMobile ? '' : ` [${option.range}]`}
              </Button>
            ))}
            {selectedHeightFilter && (
              <Button
                className="height-filter-btn"
                onClick={() => setSelectedHeightFilter(null)}
                size="small"
                style={{ 
                  color: terracottaColors.textSecondary,
                  borderColor: terracottaColors.textSecondary + '40'
                }}
              >
                Clear
              </Button>
            )}
            
            {/* Results Count - Inline with height filters */}
            <Tag
              className="compact-results-tag"
              icon={<AppstoreOutlined />}
              style={{ 
                marginLeft: isMobile ? '4px' : '8px',
                flexShrink: 0
              }}
            >
              {filteredGaneshIdols.length} Idols
              {isGaneshSearching && '...'}
            </Tag>
          </div>
        </div>
      </div>
    </>
  );
});

CompactSearchFilter.displayName = 'CompactSearchFilter';

export default CompactSearchFilter;