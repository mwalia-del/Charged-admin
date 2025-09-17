import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import { ReferralFilters as ReferralFiltersType, ReferralSummary, ReferralIssuancesResponse } from '../../types';
import { getIssuances, getSummary, exportReferralsToCSV } from '../../API/referrals';
import { useAuth } from '../../contexts/AuthContext';
import ReferralSummaryCards from './components/ReferralSummaryCards';
import ReferralFilters from './components/ReferralFilters';
import ReferralTable from './components/ReferralTable';

const ReferralsPage: React.FC = () => {
  const { getDrivers, getRiders } = useAuth();
  
  // State
  const [issuances, setIssuances] = useState<ReferralIssuancesResponse | null>(null);
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
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
  const [filters, setFilters] = useState<ReferralFiltersType>({
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

  const loadIssuances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [issuancesData, summaryData] = await Promise.all([
        getIssuances(filters),
        getSummary(filters)
      ]);
      
      setIssuances(issuancesData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load referral data');
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load issuances when filters change
  useEffect(() => {
    loadIssuances();
  }, [filters, loadIssuances]);

  const handleFiltersChange = useCallback((newFilters: ReferralFiltersType) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const handleSearch = useCallback(() => {
    loadIssuances();
  }, [loadIssuances]);

  const handleClear = useCallback(() => {
    setFilters({
      actor_type: 'ride',
      range: 'this_month',
      page: 1,
      page_size: 25,
      referral_id: undefined
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters(prev => ({ ...prev, page_size: pageSize, page: 1 }));
  }, []);

  const handleViewRide = useCallback((rideId: string) => {
    window.open(`/rides/${rideId}`, '_blank');
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      const blob = await exportReferralsToCSV(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `referrals-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Referrals exported successfully',
        severity: 'success'
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to export referrals',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleRefresh = useCallback(() => {
    loadIssuances();
  }, [loadIssuances]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Referral Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track referral rewards, monitor issuance patterns, and manage referral abuse.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ReferralSummaryCards summary={summary} loading={loading} />

      <ReferralFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClear={handleClear}
        drivers={drivers}
        riders={riders}
        loading={loading}
      />

      <ReferralTable
        issuances={issuances}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewRide={handleViewRide}
        onExport={handleExport}
        onRefresh={handleRefresh}
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

export default ReferralsPage;
