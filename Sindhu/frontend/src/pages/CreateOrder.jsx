import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { orderApi } from '../services/api';

function CreateOrder() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.item_name.trim()) {
      setError('Item name is required');
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return false;
    }
    if (formData.quantity > 1000) {
      setError('Quantity cannot exceed 1000');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        item_name: formData.item_name.trim(),
        quantity: parseInt(formData.quantity, 10),
      };

      const response = await orderApi.createOrder(orderData);
      console.log('Order created:', response);

      // Show success message
      setSuccess(true);

      // Reset form
      setFormData({
        item_name: '',
        quantity: '',
      });

      // Navigate to orders list after a short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      console.error('Error creating order:', err);
      const errorMessage =
        err.response?.data?.detail || 'Failed to create order. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Create New Order
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Item Name"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Laptop, Phone, Headphones"
                disabled={loading}
                inputProps={{ maxLength: 100 }}
                helperText={`${formData.item_name.length}/100 characters`}
              />

              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., 5"
                disabled={loading}
                inputProps={{ min: 1, max: 1000 }}
                helperText="Enter a quantity between 1 and 1000"
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {loading ? 'Creating Order...' : 'Create Order'}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/orders')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Order created successfully! Redirecting to orders list...
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CreateOrder;

