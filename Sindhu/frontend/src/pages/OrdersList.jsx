import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { orderApi } from '../services/api';

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'error',
  };
  return colors[status] || 'default';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await orderApi.getAllOrders(statusFilter || null);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please check if the backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 3 seconds to show live status updates
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Orders List</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : orders.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No orders found
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Create your first order to get started!
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Item Name</strong></TableCell>
                    <TableCell align="center"><strong>Quantity</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell><strong>Created At</strong></TableCell>
                    <TableCell><strong>Updated At</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {order.id.slice(-8)}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.item_name}</TableCell>
                      <TableCell align="center">{order.quantity}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={order.status.toUpperCase()}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: 100 }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{formatDate(order.updated_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Paper sx={{ p: 2, mt: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="textSecondary">
          <strong>Total Orders:</strong> {orders.length}
          {refreshing && ' • Refreshing...'}
          {!refreshing && ' • Auto-refreshes every 3 seconds'}
        </Typography>
      </Paper>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}

export default OrdersList;

