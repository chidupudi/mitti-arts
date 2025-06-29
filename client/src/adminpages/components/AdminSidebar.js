// client/src/adminpages/components/AdminSidebar.js - Updated with Season Management
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Collapse,
  Badge,
  Tooltip,
  Alert
} from '@mui/material';
import {
  DashboardOutlined,
  InventoryOutlined,
  ShoppingCartOutlined,
  MenuOpen,
  Menu,
  Logout,
  StorefrontOutlined,
  ExpandLess,
  ExpandMore,
  PeopleOutlined,
  BarChartOutlined,
  SettingsOutlined,
  // Ganesh Season Icons
  TempleHinduOutlined,
  GroupOutlined,
  RequestQuoteOutlined,
  CelebrationOutlined,
  SwapHorizOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Season Management
import { useSeason } from '../../hooks/useSeason';

const AdminSidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentSeason, isGaneshSeason, loading: seasonLoading } = useSeason();

  const [openSubMenu, setOpenSubMenu] = useState({
    products: false,
    ganeshSeason: false,
    settings: false
  });

  const [collapsed, setCollapsed] = useState(false);

  const [adminInfo] = useState({
    name: 'Admin',
    role: 'Administrator',
    avatar: null
  });

  // Navigation items that change based on season
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        icon: <DashboardOutlined />,
        path: '/dashboard',
        badge: null
      },
      {
        title: 'Orders',
        icon: <ShoppingCartOutlined />,
        path: '/adminorders',
        badge: 5
      }
    ];

    // Season-specific inventory and management
    if (isGaneshSeason) {
      return [
        ...baseItems,
        {
          title: 'Ganesh Season',
          icon: <TempleHinduOutlined />,
          path: '/ganesh-season',
          hasSubMenu: true,
          key: 'ganeshSeason',
          badge: 'ACTIVE',
          subItems: [
            { 
              title: 'Ganesh Idols', 
              path: '/ganesh-inventory',
              icon: <TempleHinduOutlined />,
              description: 'Manage Ganesh idol inventory'
            },
            { 
              title: 'Customer Leads', 
              path: '/ganesh-leads',
              icon: <GroupOutlined />,
              description: 'Track interested customers',
              badge: 12
            },
            { 
              title: 'Ganesh Orders', 
              path: '/ganesh-orders',
              icon: <RequestQuoteOutlined />,
              description: 'Manage advance payments',
              badge: 3
            },
          ]
        },
        {
          title: 'Regular Inventory',
          icon: <StorefrontOutlined />,
          path: '/inventory',
          subtitle: 'Hidden during Ganesh season',
          disabled: false // Still accessible for management
        },
        {
          title: 'Customers',
          icon: <PeopleOutlined />,
          path: '/customers',
          badge: null
        },
        {
          title: 'Analytics',
          icon: <BarChartOutlined />,
          path: '/analytics',
          badge: null
        },
        {
          title: 'Settings',
          icon: <SettingsOutlined />,
          path: '/settings',
          hasSubMenu: true,
          key: 'settings',
          subItems: [
            { title: 'Store Settings', path: '/store-settings' },
            { title: 'Season Management', path: '/dashboard', highlight: true },
            { title: 'Admin Users', path: '/admin-users' },
            { title: 'Appearance', path: '/appearance' },
          ]
        }
      ];
    } else {
      // Normal season navigation
      return [
        ...baseItems,
        {
          title: 'Products',
          icon: <StorefrontOutlined />,
          path: '/products',
          hasSubMenu: true,
          key: 'products',
          subItems: [
            { title: 'All Products', path: '/inventory' },
            { title: 'Categories', path: '/categories' },
            { title: 'Add Product', path: '/add-product' },
          ]
        },
        {
          title: 'Customers',
          icon: <PeopleOutlined />,
          path: '/customers',
          badge: null
        },
        {
          title: 'Analytics',
          icon: <BarChartOutlined />,
          path: '/analytics',
          badge: null
        },
        {
          title: 'Settings',
          icon: <SettingsOutlined />,
          path: '/settings',
          hasSubMenu: true,
          key: 'settings',
          subItems: [
            { title: 'Store Settings', path: '/store-settings' },
            { title: 'Season Management', path: '/dashboard', highlight: true },
            { title: 'Admin Users', path: '/admin-users' },
            { title: 'Appearance', path: '/appearance' },
          ]
        }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  const handleToggleSubMenu = (key) => {
    setOpenSubMenu({
      ...openSubMenu,
      [key]: !openSubMenu[key]
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/supercontrollogin');
    if (isMobile) {
      onToggle();
    }
  };

  const isPathActive = (path) => location.pathname === path;

  const drawerWidth = collapsed ? 80 : 280;

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      {/* Sidebar Header */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        background: isGaneshSeason 
          ? 'linear-gradient(135deg, #FF8F00 0%, #FFB74D 100%)'
          : 'linear-gradient(135deg, #D2691E 0%, #8B4513 100%)',
        color: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {!collapsed && (
          <Box>
            <Typography variant="h6" fontWeight="bold">
              MittiArts
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {isGaneshSeason ? '🕉️ Ganesh Season' : '🏺 Normal Season'}
            </Typography>
          </Box>
        )}
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: 'white' }}>
          {collapsed ? <Menu /> : <MenuOpen />}
        </IconButton>
      </Box>

      {/* Season Status */}
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Alert 
            severity={isGaneshSeason ? "warning" : "success"}
            variant="outlined"
            sx={{ 
              fontSize: '12px',
              '& .MuiAlert-message': { 
                fontSize: '12px' 
              }
            }}
            icon={isGaneshSeason ? <CelebrationOutlined /> : <StorefrontOutlined />}
          >
            <Typography variant="caption" fontWeight="bold">
              {isGaneshSeason ? 'Ganesh Season Active' : 'Normal Season Active'}
            </Typography>
            <br />
            <Typography variant="caption">
              {isGaneshSeason 
                ? 'Lead capture & advance payments' 
                : 'Regular e-commerce mode'
              }
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Admin Info */}
      {!collapsed && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Avatar
            src={adminInfo.avatar}
            alt={adminInfo.name}
            sx={{
              width: 40,
              height: 40,
              bgcolor: isGaneshSeason ? 'rgba(255, 143, 0, 0.2)' : 'rgba(210, 105, 30, 0.2)',
              border: `2px solid ${isGaneshSeason ? '#FF8F00' : '#D2691E'}`
            }}
          >
            {adminInfo.name[0]}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">{adminInfo.name}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>{adminInfo.role}</Typography>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <List sx={{ p: 1, flexGrow: 1 }}>
        {navigationItems.map((item) => (
          <React.Fragment key={item.path || item.key}>
            <ListItem
              button
              onClick={item.hasSubMenu
                ? () => handleToggleSubMenu(item.key)
                : () => handleNavigation(item.path)}
              disabled={item.disabled}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                p: '8px 12px',
                color: isPathActive(item.path) 
                  ? (isGaneshSeason ? '#FF8F00' : '#D2691E') 
                  : item.disabled 
                    ? 'text.disabled'
                    : 'text.primary',
                backgroundColor: isPathActive(item.path) 
                  ? (isGaneshSeason ? 'rgba(255, 143, 0, 0.1)' : 'rgba(210, 105, 30, 0.1)') 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: item.disabled 
                    ? 'transparent'
                    : 'action.hover',
                  transform: item.disabled ? 'none' : 'translateX(5px)',
                  transition: 'all 0.3s ease',
                },
                transition: 'all 0.2s ease',
                fontWeight: isPathActive(item.path) ? 600 : 400,
                opacity: item.disabled ? 0.6 : 1,
              }}
            >
              <Tooltip title={collapsed ? item.title : ''} placement="right">
                <ListItemIcon
                  sx={{
                    color: isPathActive(item.path) 
                      ? (isGaneshSeason ? '#FF8F00' : '#D2691E') 
                      : item.disabled 
                        ? 'text.disabled'
                        : 'text.secondary',
                    minWidth: '36px'
                  }}
                >
                  {item.badge && typeof item.badge === 'string' ? (
                    <Badge 
                      badgeContent={item.badge} 
                      color={item.badge === 'ACTIVE' ? 'warning' : 'error'}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '10px',
                          height: '16px',
                          minWidth: '16px'
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                </ListItemIcon>
              </Tooltip>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isPathActive(item.path) ? 600 : 400
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      style: { fontSize: '10px' }
                    }}
                  />
                  {item.hasSubMenu && (
                    openSubMenu[item.key] ? <ExpandLess /> : <ExpandMore />
                  )}
                </>
              )}
            </ListItem>

            {/* Submenu */}
            {item.hasSubMenu && !collapsed && (
              <Collapse in={openSubMenu[item.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      button
                      key={subItem.path}
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        pl: 4,
                        borderRadius: 2,
                        mb: 0.5,
                        p: '6px 16px',
                        color: isPathActive(subItem.path) 
                          ? (isGaneshSeason ? '#FF8F00' : '#D2691E') 
                          : 'text.secondary',
                        backgroundColor: isPathActive(subItem.path) 
                          ? (isGaneshSeason ? 'rgba(255, 143, 0, 0.05)' : 'rgba(210, 105, 30, 0.05)') 
                          : subItem.highlight 
                            ? 'rgba(25, 118, 210, 0.05)'
                            : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateX(5px)',
                        },
                        transition: 'all 0.2s ease',
                        fontWeight: isPathActive(subItem.path) ? 600 : 400,
                        border: subItem.highlight ? '1px solid rgba(25, 118, 210, 0.3)' : 'none',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        {subItem.icon || (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isPathActive(subItem.path) 
                                ? (isGaneshSeason ? '#FF8F00' : '#D2691E') 
                                : 'text.disabled',
                            }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.title}
                        secondary={subItem.description}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: isPathActive(subItem.path) ? 600 : 400
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          style: { fontSize: '10px' }
                        }}
                      />
                      {subItem.badge && (
                        <Badge badgeContent={subItem.badge} color="error" />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Quick Season Switch */}
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItem
            button
            onClick={() => handleNavigation('/dashboard')}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px', color: '#1976D2' }}>
              <SwapHorizOutlined />
            </ListItemIcon>
            <ListItemText
              primary="Switch Season"
              secondary={`Currently: ${isGaneshSeason ? 'Ganesh' : 'Normal'}`}
              primaryTypographyProps={{ 
                variant: 'body2', 
                fontWeight: 600,
                color: '#1976D2'
              }}
              secondaryTypographyProps={{ 
                variant: 'caption',
                style: { fontSize: '10px' }
              }}
            />
          </ListItem>
        </Box>
      )}

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px', color: 'text.secondary' }}>
              <Logout />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            )}
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && !open && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1199 }}>
          <IconButton
            color="primary"
            onClick={onToggle}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'background.paper',
              },
            }}
          >
            <Menu />
          </IconButton>
        </Box>
      )}

      {isMobile ? (
        <Drawer
          anchor="left"
          open={open}
          onClose={onToggle}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: 280,
              borderRight: '1px solid #e0e0e0',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid #e0e0e0',
              boxShadow: 2,
              transition: 'width 0.3s ease',
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default AdminSidebar;