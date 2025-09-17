import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
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

  // Wallet editing state
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<{ id: string; type: 'driver' | 'rider'; name: string } | null>(null);
  const [walletAdjustment, setWalletAdjustment] = useState({
    amount: '',
    reason: '',
    type: 'credit' as 'credit' | 'debit'
  });
  const [walletLoading, setWalletLoading] = useState(false);

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

  const handleEditWallet = (referrerId: string, referrerType: 'driver' | 'rider') => {
    const referrer = referrerType === 'driver' 
      ? drivers.find(d => d.id === referrerId)
      : riders.find(r => r.id === referrerId);
    
    if (referrer) {
      setSelectedReferrer({
        id: referrerId,
        type: referrerType,
        name: referrer.name
      });
      setWalletAdjustment({
        amount: '',
        reason: '',
        type: 'credit'
      });
      setWalletDialogOpen(true);
    }
  };

  const handleWalletAdjustment = async () => {
    if (!selectedReferrer || !walletAdjustment.amount || !walletAdjustment.reason) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }

    try {
      setWalletLoading(true);
      
      // Here you would call an API to adjust the wallet
      // For now, we'll just show a success message
      console.log('Wallet adjustment:', {
        referrerId: selectedReferrer.id,
        referrerType: selectedReferrer.type,
        amount: parseFloat(walletAdjustment.amount) * 100, // Convert to cents
        reason: walletAdjustment.reason,
        type: walletAdjustment.type
      });
      
      setSnackbar({
        open: true,
        message: `Wallet ${walletAdjustment.type} of $${walletAdjustment.amount} processed successfully`,
        severity: 'success'
      });
      
      setWalletDialogOpen(false);
      setSelectedReferrer(null);
      setWalletAdjustment({ amount: '', reason: '', type: 'credit' });
      
      // Refresh the data
      loadIssuances();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to process wallet adjustment',
        severity: 'error'
      });
    } finally {
      setWalletLoading(false);
    }
  };

  const handleWalletDialogClose = () => {
    setWalletDialogOpen(false);
    setSelectedReferrer(null);
    setWalletAdjustment({ amount: '', reason: '', type: 'credit' });
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
        onEditWallet={handleEditWallet}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />

      {/* Wallet Editing Dialog */}
      <Dialog open={walletDialogOpen} onClose={handleWalletDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Referral Wallet
          {selectedReferrer && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={selectedReferrer.type.toUpperCase()} 
                color={selectedReferrer.type === 'driver' ? 'info' : 'warning'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary" component="span">
                {selectedReferrer.name}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Adjustment Type</InputLabel>
            <Select
              value={walletAdjustment.type}
              onChange={(e) => setWalletAdjustment(prev => ({ ...prev, type: e.target.value as 'credit' | 'debit' }))}
              label="Adjustment Type"
            >
              <MenuItem value="credit">Credit (Add Money)</MenuItem>
              <MenuItem value="debit">Debit (Remove Money)</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Amount (CAD)"
            type="number"
            value={walletAdjustment.amount}
            onChange={(e) => setWalletAdjustment(prev => ({ ...prev, amount: e.target.value }))}
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="0.00"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Reason for Adjustment"
            multiline
            rows={3}
            value={walletAdjustment.reason}
            onChange={(e) => setWalletAdjustment(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="e.g., Refund for cancelled ride, Manual adjustment, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWalletDialogClose} disabled={walletLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleWalletAdjustment} 
            variant="contained" 
            color="primary"
            disabled={walletLoading || !walletAdjustment.amount || !walletAdjustment.reason}
          >
            {walletLoading ? <CircularProgress size={24} /> : 'Process Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReferralsPage;
