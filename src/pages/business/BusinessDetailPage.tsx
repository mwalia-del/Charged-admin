import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Business as BusinessIcon,
  DirectionsCar as RidesIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as InvoicesIcon,
  CardGiftcard as RewardsIcon,
} from '@mui/icons-material';
import { Business, BusinessFilters } from '../../types';
import { getBusiness, getBusinessRides } from '../../API/business';
import BusinessHeader from './components/BusinessHeader';
import BusinessOverview from './components/BusinessOverview';
import BusinessRideFilters from './components/BusinessRideFilters';
import BusinessRideTable from './components/BusinessRideTable';
import BusinessWalletCard from './components/BusinessWalletCard';
import BusinessInvoicesTable from './components/BusinessInvoicesTable';
import BusinessRewardsPage from './components/BusinessRewardsPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`business-tabpanel-${index}`}
      aria-labelledby={`business-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BusinessDetailPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [rides, setRides] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Filters state
  const [filters, setFilters] = useState<BusinessFilters>({
    range: 'this_month',
    page: 1,
    page_size: 25
  });

  const loadBusiness = useCallback(async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await getBusiness(orgId);
      setBusiness(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const loadRides = useCallback(async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      setError(null);
      
      const ridesData = await getBusinessRides(orgId, filters);
      setRides(ridesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rides data');
    } finally {
      setLoading(false);
    }
  }, [orgId, filters]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  useEffect(() => {
    if (activeTab === 1) { // Rides tab
      loadRides();
    }
  }, [loadRides, activeTab]);

  const handleBusinessUpdate = (updatedBusiness: Business) => {
    setBusiness(updatedBusiness);
  };

  const handleFiltersChange = useCallback((newFilters: BusinessFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const handleSearch = useCallback(() => {
    loadRides();
  }, [loadRides]);

  const handleClear = useCallback(() => {
    setFilters({
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
    navigate(`/rides/${rideId}`);
  }, [navigate]);

  const handleExport = useCallback(() => {
    // TODO: Implement CSV export
    console.log('Export rides to CSV');
  }, []);

  const handleRefresh = useCallback(() => {
    loadBusiness();
    if (activeTab === 1) {
      loadRides();
    }
  }, [loadBusiness, loadRides, activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading && !business) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading business details...
        </Typography>
      </Container>
    );
  }

  if (error && !business) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!business) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Business not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <BusinessHeader
        business={business}
        onBusinessUpdate={handleBusinessUpdate}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="business tabs">
          <Tab
            icon={<BusinessIcon />}
            label="Overview"
            id="business-tab-0"
            aria-controls="business-tabpanel-0"
          />
          <Tab
            icon={<RidesIcon />}
            label="Rides"
            id="business-tab-1"
            aria-controls="business-tabpanel-1"
          />
          <Tab
            icon={<WalletIcon />}
            label="Wallet"
            id="business-tab-2"
            aria-controls="business-tabpanel-2"
          />
          <Tab
            icon={<InvoicesIcon />}
            label="Invoices"
            id="business-tab-3"
            aria-controls="business-tabpanel-3"
          />
          <Tab
            icon={<RewardsIcon />}
            label="Rewards"
            id="business-tab-4"
            aria-controls="business-tabpanel-4"
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        {business ? (
          <BusinessOverview business={business} />
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading business overview...
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <BusinessRideFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          onClear={handleClear}
          loading={loading}
        />

        <BusinessRideTable
          rides={rides}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onViewRide={handleViewRide}
          onExport={handleExport}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <BusinessWalletCard
          orgId={business.org_id}
          walletBalance={business.wallet_balance_cents}
          onRefresh={handleRefresh}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <BusinessInvoicesTable
          orgId={business.org_id}
          onRefresh={handleRefresh}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <BusinessRewardsPage
          orgId={business.org_id}
          businessName={business.name}
        />
      </TabPanel>
    </Container>
  );
};

export default BusinessDetailPage;
