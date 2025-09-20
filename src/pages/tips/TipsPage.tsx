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
    // Show all tips by default
    actor_type: undefined,
    actor_id: undefined,
    range: 'this_month',
    start_date: undefined,
    end_date: undefined,
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
      
      console.log('🔍 Tips Page - Raw drivers data:', driversData);
      console.log('🔍 Tips Page - Raw riders data:', ridersData);
      
      const mappedDrivers = driversData.map(d => ({ id: d.id, name: d.name }));
      const mappedRiders = ridersData.map(r => ({ id: r.id, name: r.name }));
      
      console.log('🔍 Tips Page - Mapped drivers:', mappedDrivers);
      console.log('🔍 Tips Page - Mapped riders:', mappedRiders);
      
      setDrivers(mappedDrivers);
      setRiders(mappedRiders);
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
      
      // TEMPORARY FIX: Client-side filtering until backend filtering is fixed
      let filteredTips = tipsData;
      if (filters.actor_type === 'driver' && filters.actor_id) {
        console.log('🔍 Tips Page - Applying client-side driver filter:', filters.actor_id);
        filteredTips = {
          ...tipsData,
          rows: tipsData.rows.filter(tip => tip.driver_id === filters.actor_id)
        };
        console.log('🔍 Tips Page - Filtered tips count:', filteredTips.rows.length);
      } else if (filters.actor_type === 'rider' && filters.actor_id) {
        console.log('🔍 Tips Page - Applying client-side rider filter:', filters.actor_id);
        filteredTips = {
          ...tipsData,
          rows: tipsData.rows.filter(tip => tip.rider_id === filters.actor_id)
        };
        console.log('🔍 Tips Page - Filtered tips count:', filteredTips.rows.length);
      }
      
      setTips(filteredTips);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('❌ Tips Page - Error loading tips:', err);
      console.error('❌ Tips Page - Error response:', err.response);
      console.error('❌ Tips Page - Error message:', err.message);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view tips.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load tips');
      }
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
    console.log('🔍 Tips Page - Filter change:', newFilters);
    setFilters(prev => {
      const updated = {
        ...prev,
        ...newFilters,
        page: 1 // Reset to first page when filters change
      };
      console.log('🔍 Tips Page - Updated filters:', updated);
      return updated;
    });
  }, []);

  const handleSearch = useCallback(() => {
    loadTips();
  }, [loadTips]);

  const handleClear = useCallback(() => {
    setFilters({
      // Reset to default state - show all tips
      actor_type: undefined,
      actor_id: undefined,
      range: 'this_month',
      start_date: undefined,
      end_date: undefined,
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
