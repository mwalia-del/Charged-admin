import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  Snackbar,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  DirectionsCar as VehicleIcon,
  LocalShipping as ParcelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { rideTypes, VehicleClass, VehicleClassUpdate } from "../types";
import { usePricingStore } from "../stores/simplePricingStore";
import VehicleClassRow from "./pricing/components/VehicleClassRow";
import ParcelDeliveryPricingForm from "./pricing/components/ParcelDeliveryPricingForm";

// // Ride type icons mapping
// const rideTypeIcons: Record<string, React.ReactNode> = {
//   electric: <ElectricIcon sx={{ fontSize: 40, color: "success.main" }} />,
//   regular: <CarIcon sx={{ fontSize: 40, color: "primary.main" }} />,
//   suv: <SuvIcon sx={{ fontSize: 40, color: "warning.main" }} />,
// };

const Pricing: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Simple store
  const {
    pricingRules = [],
    vehicleClasses = [],
    loading,
    vehicleClassesLoading,
    error,
    vehicleClassesError,
    savingRules = {},
    isWebSocketConnected,
    serverSyncStatus,
    fetchPricingRules,
    fetchVehicleClasses,
    updatePricingRule,
    savePricingRule,
    updateVehicleClass,
    connectWebSocket,
    disconnectWebSocket,
    clearErrors,
    syncWithServer,
    checkServerConnection,
  } = usePricingStore();

  // Load data and connect WebSocket on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check server connection first
        await checkServerConnection();
        
        await Promise.all([
          fetchPricingRules(),
          fetchVehicleClasses(),
        ]);
        
        // Connect to WebSocket for real-time updates
        await connectWebSocket();
      } catch (error) {
        console.error('Failed to initialize pricing data:', error);
        showSnackbar('Failed to load pricing data', 'error');
      }
    };

    initializeData();

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [fetchPricingRules, fetchVehicleClasses, connectWebSocket, disconnectWebSocket, checkServerConnection]);

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'base_price':
      case 'price_per_km':
      case 'price_per_minute':
      case 'min_fare':
      case 'cancel_fee':
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Must be a positive number';
        }
        break;
      case 'commission_percentage':
      case 'govt_tax_percentage':
        if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
          return 'Must be between 0 and 100';
        }
        break;
      case 'refund_distance_in_m':
      case 'minimum_billable_distance':
        if (isNaN(Number(value)) || Number(value) < 0) {
          return 'Must be a positive number';
        }
        break;
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Name is required';
        }
        break;
    }
    return null;
  };

  const handlePricingChange = (
    id: number,
    field: keyof rideTypes,
    value: any,
  ) => {
    // Clear validation error for this field
    const errorKey = `${id}-${field}`;
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });

    // Validate the field
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: error
      }));
      return;
    }

    // Update the store with the new value
    updatePricingRule(id, { [field]: value });
  };

  const handleSaveRule = async (rule: rideTypes) => {
    try {
      // Check for validation errors
      const ruleErrors = Object.keys(validationErrors).filter(key => key.startsWith(`${rule.id}-`));
      if (ruleErrors.length > 0) {
        showSnackbar('Please fix validation errors before saving', 'error');
        return;
      }

      // Get the latest rule from the store to ensure we have the updated values
      const latestRule = pricingRules.find((r: any) => r.id === rule.id);
      if (!latestRule) {
        showSnackbar('Rule not found', 'error');
        return;
      }


      await savePricingRule(latestRule.id, latestRule);
      showSnackbar(`Successfully updated ${latestRule.name} pricing rules`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update pricing rules';
      showSnackbar(errorMessage, 'error');
    }
  };



  const handleVehicleClassUpdate = async (code: string, updates: VehicleClassUpdate) => {
    try {
      // Use the store's updateVehicleClass method
      await updateVehicleClass(code, updates);
      
      // Show specific success message based on the update
      if (updates.is_enabled !== undefined) {
        const status = updates.is_enabled ? 'enabled' : 'disabled';
        showSnackbar(`Charged XL ${status} successfully! Changes are live across all platforms.`, 'success');
      } else {
        showSnackbar("Vehicle class updated successfully. Changes are live now!", 'success');
      }
    } catch (error) {
      console.error('❌ Failed to update vehicle class:', error);
      showSnackbar(`Failed to update vehicle class: ${error}`, 'error');
    }
  };

  const handleVehicleClassError = (error: string) => {
    showSnackbar(error, 'error');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<RefreshIcon />}
          variant="contained"
          onClick={fetchPricingRules}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Pricing & Vehicle Management
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Configure pricing rules for different ride types and manage vehicle class availability across all platforms.
          </Typography>
        </Box>
        
        {/* Status Indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Server Sync Status */}
          <Chip
            icon={serverSyncStatus.isOnline ? <CheckCircleIcon /> : <ErrorIcon />}
            label={serverSyncStatus.isOnline ? 'Server Online' : 'Server Offline'}
            color={serverSyncStatus.isOnline ? 'success' : 'error'}
            size="small"
            onClick={checkServerConnection}
            sx={{ cursor: 'pointer' }}
          />
          
          {/* WebSocket Status */}
          <Chip
            icon={isWebSocketConnected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={isWebSocketConnected ? 'Live Updates' : 'Offline'}
            color={isWebSocketConnected ? 'success' : 'error'}
            size="small"
          />
          
          {/* Sync Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={syncWithServer}
            disabled={loading || !serverSyncStatus.isOnline}
          >
            Sync
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            icon={<SettingsIcon />} 
            label="Pricing Rules" 
            iconPosition="start"
          />
          <Tab 
            icon={<VehicleIcon />} 
            label="Vehicle Classes" 
            iconPosition="start"
          />
          <Tab 
            icon={<ParcelIcon />} 
            label="Parcel Delivery" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Pricing Rules Tab */}
      {activeTab === 0 && (
        <Box sx={{ mt: 4 }}>
          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => {
                    clearErrors();
                    fetchPricingRules();
                  }}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Pricing Rules ({pricingRules.length})
            </Typography>
          </Box>

          {pricingRules.length === 0 && !loading ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              No pricing rules found.
            </Alert>
          ) : (
            <Grid container spacing={4}>
              {Array.isArray(pricingRules) && pricingRules.map((rule: rideTypes) => (
            <Grid item xs={12} md={4} key={rule.id}>
              <Card elevation={3}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={rule?.icon}
                      alt={rule?.name}
                      sx={{ ml: 2, width: 40, height: 40 }}
                    />
                    <CardHeader
                      title={<Typography variant="h6">{rule.name}</Typography>}
                      subheader={`Last updated: ${new Date(rule.updated_at).toLocaleDateString()}`}
                    />
                  </Box>
                  
                </Box>
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Base Price"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.base_price}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "base_price",
                            e.target.value,
                          )
                        }
                        error={!!validationErrors[`${rule.id}-base_price`]}
                        helperText={validationErrors[`${rule.id}-base_price`]}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Per km"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.price_per_km}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "price_per_km",
                            e.target.value,
                          )
                        }
                        error={!!validationErrors[`${rule.id}-price_per_km`]}
                        helperText={validationErrors[`${rule.id}-price_per_km`]}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Per minute"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.price_per_minute}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "price_per_minute",
                            e.target.value,
                          )
                        }
                        error={!!validationErrors[`${rule.id}-price_per_minute`]}
                        helperText={validationErrors[`${rule.id}-price_per_minute`]}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Cancellation & Refund Policy
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Cancel Fee"
                        type="number"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.cancel_fee}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "cancel_fee",
                            e.target.value,
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Refund Distance"
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">m</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.refund_distance_in_m}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "refund_distance_in_m",
                            e.target.value,
                          )
                        }
                        helperText="Refund if driver is further than this"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Distance Pricing Rules
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Minimum Billable Distance"
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">km</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.minimum_billable_distance}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "minimum_billable_distance",
                            e.target.value,
                          )
                        }
                        helperText="First N kilometers included in base price (no extra charge)"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Commission Settings
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Commission Percentage"
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={rule?.commission_percentage}
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "commission_percentage",
                            e.target.value.toString(),
                          )
                        }
                        helperText="Percentage of driver earnings that go to the platform"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Government Tax
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Tax Percentage"
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                        fullWidth
                        value={
                          rule.govt_tax_percentage
                            ? rule.govt_tax_percentage
                            : undefined
                        }
                        onChange={(e) =>
                          handlePricingChange(
                            rule.id,
                            "govt_tax_percentage",
                            e.target.value.toString(),
                          )
                        }
                        helperText="Percentage of driver earnings that goes to the Government"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={savingRules[rule.id.toString()] ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={() => handleSaveRule(rule)}
                        disabled={savingRules[rule.id.toString()] || Object.keys(validationErrors).some(key => key.startsWith(`${rule.id}-`))}
                        sx={{ mt: 2 }}
                      >
                        {savingRules[rule.id.toString()] ? "Saving..." : "Save Changes"}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Vehicle Classes Tab */}
      {activeTab === 1 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Vehicle Classes Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage vehicle class availability. Only Charged XL can be disabled to prevent rider bookings.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchVehicleClasses}
              disabled={vehicleClassesLoading}
              size="small"
            >
              Refresh
            </Button>
          </Box>

          {vehicleClassesError && (
            <Alert 
              severity={vehicleClassesError.includes('offline') ? 'warning' : 'error'} 
              sx={{ mb: 2 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={fetchVehicleClasses}
                  disabled={vehicleClassesLoading}
                >
                  Retry
                </Button>
              }
            >
              {vehicleClassesError}
            </Alert>
          )}

          {vehicleClassesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vehicle Class</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Toggle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(vehicleClasses) && vehicleClasses
                    .map((vehicleClass: VehicleClass) => (
                      <VehicleClassRow
                        key={vehicleClass.id}
                        vehicleClass={vehicleClass}
                        onUpdate={handleVehicleClassUpdate}
                        onError={handleVehicleClassError}
                        canToggle={vehicleClass.code === 'charged_xl'}
                      />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.primary">
              <strong>Realtime Updates:</strong> When you disable a vehicle class, it will be hidden from all rider, driver, and business apps within seconds. 
              Any attempt to book a disabled vehicle class will be rejected by the server.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Parcel Delivery Tab */}
      {activeTab === 2 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Parcel Delivery Pricing Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure pricing rules for parcel delivery services. All pricing is in Canadian Dollars (CAD).
              </Typography>
            </Box>
          </Box>

          <ParcelDeliveryPricingForm
            onSuccess={(message) => showSnackbar(message, 'success')}
            onError={(message) => showSnackbar(message, 'error')}
          />

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.primary">
              <strong>Real-time Updates:</strong> Changes to parcel delivery pricing are applied immediately across all platforms. 
              The pricing rules affect all parcel delivery bookings and driver earnings calculations.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Pricing;
