import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Image as ImageIcon,
  LocationOn,
  ColorLens,
  Straighten,
  Scale,
} from '@mui/icons-material';

const ProductTable = ({ 
  products, 
  page, 
  rowsPerPage, 
  totalCount,
  onEdit, 
  onDelete, 
  onToggleHide,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Specifications</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {product.images?.[0] ? (
                    <Avatar
                      src={product.images[0]}
                      alt={product.name}
                      sx={{ width: 48, height: 48, borderRadius: 2 }}
                      variant="rounded"
                    />
                  ) : (
                    <Avatar
                      sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'grey.100' }}
                      variant="rounded"
                    >
                      <ImageIcon color="disabled" />
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {product.name}
                      {product.hyderabadOnly && (
                        <Chip 
                          icon={<LocationOn sx={{ fontSize: '0.7rem' }} />}
                          label="Hyderabad Only" 
                          size="small"
                          color="secondary"
                          sx={{ ml: 1, height: 20, '& .MuiChip-icon': { fontSize: '1rem' } }}
                        />
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {product.code || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  {product.color && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ColorLens fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.color}
                      </Typography>
                    </Box>
                  )}
                  
                  {product.dimensions && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Straighten fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.dimensions}
                      </Typography>
                    </Box>
                  )}
                  
                  {product.weight && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Scale fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.weight}
                      </Typography>
                    </Box>
                  )}
                  
                  {!product.color && !product.dimensions && !product.weight && (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>
                  ₹{product.price?.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={product.stock}
                  size="small"
                  color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {product.hidden && (
                    <Chip label="Hidden" size="small" color="warning" variant="outlined" />
                  )}
                  <Chip 
                    label={product.inStock ? "In Stock" : "Out of Stock"} 
                    size="small"
                    color={product.inStock ? "success" : "error"}
                    variant="outlined"
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(product)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={product.hidden ? "Show" : "Hide"}>
                    <IconButton size="small" onClick={() => onToggleHide(product.id)}>
                      {product.hidden ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(product)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[12, 24, 48, 96]}
      />
    </TableContainer>
  );
};

export default ProductTable;