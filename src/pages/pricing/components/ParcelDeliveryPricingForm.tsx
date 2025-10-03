import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Box,
  Avatar,
} from '@mui/material';
import {
  Save as SaveIcon,
  LocalShipping as ParcelIcon,
} from '@mui/icons-material';
import {
  ParcelDeliveryPricing,
  ParcelDeliveryPricingUpdate,
  getParcelDeliveryPricing,
  updateParcelDeliveryPricing,
} from '../../../API/parcelDelivery';
import { websocketService, ParcelDeliveryPricingUpdate as WSParcelDeliveryPricingUpdate } from '../../../services/websocketService';

interface ParcelDeliveryPricingFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ParcelDeliveryPricingForm: React.FC<ParcelDeliveryPricingFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [pricing, setPricing] = useState<ParcelDeliveryPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [justSaved, setJustSaved] = useState(false);

  // Helper function to ensure proper data types for form fields
  const normalizePricingData = (data: any): ParcelDeliveryPricing => {
    // console.log('🔍 Normalizing pricing data:', data);
    const normalized = {
      ...data,
      base_price: String(data.base_price || ''),
      price_per_km: String(data.price_per_km || ''),
      price_per_minute: String(data.price_per_minute || ''),
      service_fee: String(data.service_fee || ''),
      min_fare: String(data.min_fare || ''),
      commission_percentage: String(data.commission_percentage || ''),
      govt_tax_percentage: String(data.govt_tax_percentage || ''),
      description: String(data.description || ''),
      name: String(data.name || 'Standard Delivery'),
      icon: String(data.icon || '📦'),
      created_at: String(data.created_at || ''),
      updated_at: String(data.updated_at || ''),
    };
    // console.log('🔍 Normalized pricing data:', normalized);
    return normalized;
  };

  const loadPricing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getParcelDeliveryPricing();
      
      // console.log('🔍 Load response:', response);
      
      if (response.status) {
        // Backend returns data as an array: { status: true, data: Array(1) }
        // We need to get the first item from the array
        const pricingDataArray = response.data;
        // console.log('🔍 Setting pricing data array:', pricingDataArray);
        // console.log('🔍 Pricing data type:', typeof pricingDataArray);
        // console.log('🔍 Is array:', Array.isArray(pricingDataArray));
        
        if (Array.isArray(pricingDataArray) && pricingDataArray.length > 0) {
          const pricingData = pricingDataArray[0]; // Get the first item
          // console.log('🔍 Extracted pricing data:', pricingData);
          const normalizedData = normalizePricingData(pricingData);
          setPricing(normalizedData);
        } else {
          console.log('🔍 No valid pricing data in array');
          setError('No pricing data available');
        }
      } else {
        console.log('🔍 No valid data in response:', response);
        setError('Failed to load parcel delivery pricing');
      }
    } catch (err: any) {
      console.error('Error loading parcel delivery pricing:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        onError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view parcel delivery pricing.');
        onError('Access denied. You do not have permission to view parcel delivery pricing.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
        onError('Server error. Please try again later.');
      } else {
        setError('Failed to load parcel delivery pricing. Please check your connection.');
        onError('Failed to load parcel delivery pricing. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Load pricing data on component mount
  useEffect(() => {
    loadPricing();
    
    // Set up WebSocket listeners for real-time updates
    const handleParcelDeliveryPricingUpdate = (update: WSParcelDeliveryPricingUpdate) => {
      if (update.type === 'updated' && update.pricing) {
        // Handle both single object and array responses
        let pricingData = update.pricing;
        if (Array.isArray(update.pricing) && update.pricing.length > 0) {
          pricingData = update.pricing[0];
        }
        const normalizedData = normalizePricingData(pricingData);
        setPricing(normalizedData);
        onSuccess('Parcel delivery pricing updated via real-time sync');
      }
    };

    // Subscribe to WebSocket events
    websocketService.onParcelDeliveryPricingUpdate(handleParcelDeliveryPricingUpdate);
    websocketService.onParcelDeliveryPricingCreated(handleParcelDeliveryPricingUpdate);

    // Cleanup on unmount
    return () => {
      // Note: WebSocket service doesn't have unsubscribe methods, 
      // but the socket will be cleaned up when the service is disconnected
    };
  }, [onSuccess, loadPricing]);

  // Debug pricing state changes
  useEffect(() => {
    // console.log('🔍 Pricing state changed:', pricing);
    if (pricing && justSaved) {
      // console.log('🔍 Just saved, preventing reload');
    }
  }, [pricing, justSaved]);

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case 'base_price':
      case 'price_per_km':
      case 'price_per_minute':
      case 'service_fee':
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
    }
    return null;
  };

  const handleFieldChange = (field: keyof ParcelDeliveryPricing, value: any) => {
    if (!pricing) return;

    // console.log('🔍 Field change:', field, 'value:', value, 'type:', typeof value);

    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    // Validate the field
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
      return;
    }

    // Update the pricing state
    setPricing(prev => {
      const updated = prev ? { ...prev, [field]: value } : null;
      // console.log('🔍 Updated pricing state:', updated);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!pricing) return;

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      onError('Please fix validation errors before saving');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: ParcelDeliveryPricingUpdate = {
        base_price: parseFloat(pricing.base_price) || 0,
        price_per_km: parseFloat(pricing.price_per_km) || 0,
        price_per_minute: parseFloat(pricing.price_per_minute) || 0,
        service_fee: parseFloat(pricing.service_fee) || 0,
        min_fare: parseFloat(pricing.min_fare) || 0,
        commission_percentage: parseFloat(pricing.commission_percentage) || 0,
        govt_tax_percentage: parseFloat(pricing.govt_tax_percentage) || 0,
        description: pricing.description,
      };

      const response = await updateParcelDeliveryPricing(updateData);
      
      console.log('🔍 Update response:', response);
      
      if (response.status) {
        // Backend PUT response only returns {id, updated_at}
        // We need to reload the data to get the full pricing information
        console.log('🔍 Update successful, reloading pricing data...');
        
        setJustSaved(true);
        onSuccess('Parcel delivery pricing updated successfully!');
        
        // Reload the pricing data to get the updated values
        await loadPricing();
        
        // Emit WebSocket event to notify other clients
        websocketService.emitParcelDeliveryPricingChange(1, 'updated');
        
        // Reset the justSaved flag after a short delay
        setTimeout(() => setJustSaved(false), 2000);
      } else {
        onError('Failed to update parcel delivery pricing');
      }
    } catch (err: any) {
      console.error('Error updating parcel delivery pricing:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        onError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        onError('Access denied. You do not have permission to update parcel delivery pricing.');
      } else if (err.response?.status === 400) {
        onError(`Validation error: ${err.response?.data?.message || 'Invalid data provided'}`);
      } else if (err.response?.status >= 500) {
        onError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        onError('Network error. Please check your connection and try again.');
      } else {
        onError(`Failed to update parcel delivery pricing: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadPricing}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!pricing) {
    // console.log('🔍 No pricing data available, showing info alert');
    return (
      <Alert severity="info">
        No parcel delivery pricing data available.
      </Alert>
    );
  }

  // console.log('🔍 Rendering form with pricing data:', pricing);

  return (
    <Card elevation={3}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <ParcelIcon />
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{pricing.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {pricing.icon}
            </Typography>
          </Box>
        }
        subheader={`Last updated: ${new Date(pricing.updated_at).toLocaleDateString()}`}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Basic Pricing */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Basic Pricing (CAD)
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Base Price"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
              value={pricing.base_price}
              onChange={(e) => handleFieldChange('base_price', e.target.value)}
              error={!!validationErrors.base_price}
              helperText={validationErrors.base_price}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Price per KM"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
              value={pricing.price_per_km}
              onChange={(e) => handleFieldChange('price_per_km', e.target.value)}
              error={!!validationErrors.price_per_km}
              helperText={validationErrors.price_per_km}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Price per Minute"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
              value={pricing.price_per_minute}
              onChange={(e) => handleFieldChange('price_per_minute', e.target.value)}
              error={!!validationErrors.price_per_minute}
              helperText={validationErrors.price_per_minute}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Service Fee"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
              value={pricing.service_fee}
              onChange={(e) => handleFieldChange('service_fee', e.target.value)}
              error={!!validationErrors.service_fee}
              helperText={validationErrors.service_fee}
            />
          </Grid>

          {/* Minimum Fare */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Minimum Fare"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
              value={pricing.min_fare}
              onChange={(e) => handleFieldChange('min_fare', e.target.value)}
              error={!!validationErrors.min_fare}
              helperText={validationErrors.min_fare}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Description"
              fullWidth
              value={pricing.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Commission & Tax Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Commission Percentage"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              fullWidth
              value={pricing.commission_percentage}
              onChange={(e) => handleFieldChange('commission_percentage', e.target.value)}
              error={!!validationErrors.commission_percentage}
              helperText={validationErrors.commission_percentage || "Percentage of driver earnings that go to the platform"}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Government Tax Percentage"
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              fullWidth
              value={pricing.govt_tax_percentage}
              onChange={(e) => handleFieldChange('govt_tax_percentage', e.target.value)}
              error={!!validationErrors.govt_tax_percentage}
              helperText={validationErrors.govt_tax_percentage || "Percentage of driver earnings that goes to the Government"}
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || Object.keys(validationErrors).length > 0}
              sx={{ mt: 2 }}
            >
              {saving ? "Saving..." : "Save Parcel Delivery Pricing"}
            </Button>
          </Grid>

          {/* Pricing Example */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Example Calculation
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>5.5km delivery, 15 minutes:</strong><br />
                • Base Fare: ${pricing.base_price} CAD<br />
                • Distance Fare: ${(parseFloat(pricing.price_per_km) * 5.5).toFixed(2)} CAD (5.5 × ${pricing.price_per_km})<br />
                • Time Fare: ${(parseFloat(pricing.price_per_minute) * 15).toFixed(2)} CAD (15 × ${pricing.price_per_minute})<br />
                • Service Fee: ${pricing.service_fee} CAD<br />
                • Subtotal: ${(parseFloat(pricing.base_price) + (parseFloat(pricing.price_per_km) * 5.5) + (parseFloat(pricing.price_per_minute) * 15) + parseFloat(pricing.service_fee)).toFixed(2)} CAD<br />
                • Tax: ${((parseFloat(pricing.base_price) + (parseFloat(pricing.price_per_km) * 5.5) + (parseFloat(pricing.price_per_minute) * 15) + parseFloat(pricing.service_fee)) * parseFloat(pricing.govt_tax_percentage) / 100).toFixed(2)} CAD ({pricing.govt_tax_percentage}%)<br />
                • Total Fare: ${((parseFloat(pricing.base_price) + (parseFloat(pricing.price_per_km) * 5.5) + (parseFloat(pricing.price_per_minute) * 15) + parseFloat(pricing.service_fee)) * (1 + parseFloat(pricing.govt_tax_percentage) / 100)).toFixed(2)} CAD<br />
                • Driver Earnings: ${(((parseFloat(pricing.base_price) + (parseFloat(pricing.price_per_km) * 5.5) + (parseFloat(pricing.price_per_minute) * 15) + parseFloat(pricing.service_fee)) * (1 + parseFloat(pricing.govt_tax_percentage) / 100)) * (1 - parseFloat(pricing.commission_percentage) / 100)).toFixed(2)} CAD ({100 - parseFloat(pricing.commission_percentage)}%)<br />
                • Platform Fee: ${(((parseFloat(pricing.base_price) + (parseFloat(pricing.price_per_km) * 5.5) + (parseFloat(pricing.price_per_minute) * 15) + parseFloat(pricing.service_fee)) * (1 + parseFloat(pricing.govt_tax_percentage) / 100)) * parseFloat(pricing.commission_percentage) / 100).toFixed(2)} CAD ({pricing.commission_percentage}%)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ParcelDeliveryPricingForm;
