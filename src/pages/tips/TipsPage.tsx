import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import { TipsFilters as TipsFiltersType, TipSummary, TipsResponse } from '../../types';
import { getTips, getTipsSummary, exportTipsToCSV } from '../../API/tips';
import { useAuth } from '../../contexts/AuthContext';
import TipsSummaryCards from './components/TipsSummaryCards';
import TipsFilters from './components/TipsFilters';
import TipsTable from './components/TipsTable';

const TipsPage: React.FC = () => {
  const { getDrivers, getRiders } = useAuth();
  
  // State
  const [tips, setTips] = useState<TipsResponse | null>(null);
  const [summary, setSummary] = useState<TipSummary | null>(null);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string }>>([]);
  const [riders, setRiders] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filters state
  const [filters, setFilters] = useState<TipsFiltersType>({
    actor_type: 'ride',
    range: 'this_month',
    page: 1,
    page_size: 25
  });

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [driversData, ridersData] = await Promise.all([
        getDrivers(),
        getRiders()
      ]);
      
      setDrivers(driversData.map(d => ({ id: d.id, name: d.name })));
      setRiders(ridersData.map(r => ({ id: r.id, name: r.name })));
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [getDrivers, getRiders]);

  const loadTips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tipsData, summaryData] = await Promise.all([
        getTips(filters),
        getTipsSummary(filters)
      ]);
      
      setTips(tipsData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tips');
      console.error('Error loading tips:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load tips when filters change
  useEffect(() => {
    loadTips();
  }, [filters, loadTips]);

  const handleFiltersChange = useCallback((newFilters: TipsFiltersType) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const handleSearch = useCallback(() => {
    loadTips();
  }, [loadTips]);

  const handleClear = useCallback(() => {
    setFilters({
      actor_type: 'ride',
      range: 'this_month',
      page: 1,
      page_size: 25
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters(prev => ({ ...prev, page_size: pageSize, page: 1 }));
  }, []);

  const handleViewRide = useCallback((rideId: string) => {
    // Navigate to ride details page
    window.open(`/rides/${rideId}`, '_blank');
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await exportTipsToCSV(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tips-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Tips exported successfully',
        severity: 'success'
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to export tips',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tips Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage rider tips, track driver earnings, and analyze tip patterns.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TipsSummaryCards summary={summary} loading={loading} />

      <TipsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClear={handleClear}
        drivers={drivers}
        riders={riders}
        loading={loading}
      />

      <TipsTable
        tips={tips}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewRide={handleViewRide}
        onExport={handleExport}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default TipsPage;
