import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  HourglassEmpty,
  CheckCircle,
  Error,
  Autorenew,
} from '@mui/icons-material';
import { orderApi } from '../services/api';

function StatCard({ title, value, icon, color, loading }) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await orderApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const health = await orderApi.healthCheck();
      setHealthStatus(health);
    } catch (err) {
      console.error('Health check failed:', err);
      setHealthStatus({ api: 'unhealthy' });
    }
  };

  useEffect(() => {
    fetchStats();
    checkHealth();

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: <ShoppingCart />,
      color: '#1976d2',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <HourglassEmpty />,
      color: '#ed6c02',
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: <Autorenew />,
      color: '#0288d1',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <CheckCircle />,
      color: '#2e7d32',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: <Error />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {healthStatus && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                API:{' '}
                <strong
                  style={{
                    color: healthStatus.api === 'healthy' ? '#2e7d32' : '#d32f2f',
                  }}
                >
                  {healthStatus.api}
                </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                MongoDB:{' '}
                <strong
                  style={{
                    color:
                      healthStatus.mongodb === 'healthy' ? '#2e7d32' : '#d32f2f',
                  }}
                >
                  {healthStatus.mongodb}
                </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="textSecondary">
                Redis:{' '}
                <strong
                  style={{
                    color: healthStatus.redis === 'healthy' ? '#2e7d32' : '#d32f2f',
                  }}
                >
                  {healthStatus.redis}
                </strong>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          Statistics refresh automatically every 5 seconds
        </Typography>
      </Box>
    </Box>
  );
}

export default Dashboard;

