import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { ScheduledRide, ScheduledRideFilters, ScheduledRideSummary } from '../../types';
import { getScheduledRides, getScheduledRideSummary, assignDriver, cancelScheduledRide, exportScheduledRidesCSV } from '../../API/scheduled';
import ScheduledSummary from './components/ScheduledSummary';
import ScheduledFilters from './components/ScheduledFilters';
import ScheduledTable from './components/ScheduledTable';

const ScheduledRidesPage: React.FC = () => {
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>([]);
  const [summary, setSummary] = useState<ScheduledRideSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ScheduledRideFilters>({
    page: 1,
    page_size: 10
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadScheduledRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ridesData, summaryData] = await Promise.all([
        getScheduledRides(filters),
        getScheduledRideSummary(filters)
      ]);
      setScheduledRides(ridesData.data);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduled rides');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadSummary = useCallback(async () => {
    try {
      const summaryData = await getScheduledRideSummary(filters);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Failed to load summary:', err);
    }
  }, [filters]);

  const handleFiltersChange = (newFilters: ScheduledRideFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, page_size: pageSize, page: 1 }));
  };

  const handleRefresh = () => {
    loadScheduledRides();
  };

  const handleAssignDriver = async (scheduledRideId: string, driverId: string) => {
    try {
      const result = await assignDriver(scheduledRideId, { driver_id: driverId });
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        loadScheduledRides();
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to assign driver',
        severity: 'error'
      });
    }
  };

  const handleCancelRide = async (scheduledRideId: string, reason: string) => {
    try {
      const result = await cancelScheduledRide(scheduledRideId, { reason });
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success'
        });
        loadScheduledRides();
      } else {
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to cancel scheduled ride',
        severity: 'error'
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await exportScheduledRidesCSV(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scheduled-rides-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'CSV export completed',
        severity: 'success'
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to export CSV',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    loadScheduledRides();
  }, [loadScheduledRides]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (loading && scheduledRides.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Scheduled Rides
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage scheduled rides for riders and business accounts.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {summary && (
        <ScheduledSummary 
          summary={summary} 
          onRefresh={loadSummary}
        />
      )}

      <Paper elevation={3} sx={{ mb: 3 }}>
        <ScheduledFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
        />
      </Paper>

      <Paper elevation={3}>
        <ScheduledTable
          scheduledRides={scheduledRides}
          loading={loading}
          filters={filters}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onAssignDriver={handleAssignDriver}
          onCancelRide={handleCancelRide}
        />
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ScheduledRidesPage;
