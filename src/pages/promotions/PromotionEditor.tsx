import React, { useState, useEffect } from 'react';
import {
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
  Grid,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { Promotion } from '../../types';

interface PromotionEditorProps {
  open: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onSave: () => void;
}

const PromotionEditor: React.FC<PromotionEditorProps> = ({ open, onClose, promotion, onSave }) => {
  const [formData, setFormData] = useState<Partial<Promotion>>({
    title: '',
    description: '',
    audience: 'rider',
    reward_type: 'fixed_discount',
    value_cents: 0,
    percent_off: 0,
    start_at: new Date().toISOString(),
    end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 0,
    is_active: false,
    max_uses_per_user: undefined,
    global_cap: undefined,
    code: '',
    criteria_json: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (promotion) {
      setFormData(promotion);
    } else {
      setFormData({
        title: '',
        description: '',
        audience: 'rider',
        reward_type: 'fixed_discount',
        value_cents: 0,
        percent_off: 0,
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 0,
        is_active: false,
        max_uses_per_user: undefined,
        global_cap: undefined,
        code: '',
        criteria_json: {},
      });
    }
    setErrors({});
  }, [promotion, open]);

  const handleInputChange = (field: keyof Promotion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.audience) {
      newErrors.audience = 'Audience is required';
    }

    if (!formData.reward_type) {
      newErrors.reward_type = 'Reward type is required';
    }

    if (formData.reward_type === 'percent_discount' && (!formData.percent_off || formData.percent_off < 1 || formData.percent_off > 100)) {
      newErrors.percent_off = 'Percent off must be between 1 and 100';
    }

    if ((formData.reward_type === 'fixed_discount' || formData.reward_type === 'ride_credit' || formData.reward_type === 'cash_bonus') && (!formData.value_cents || formData.value_cents <= 0)) {
      newErrors.value_cents = 'Value must be greater than 0';
    }

    if (!formData.start_at) {
      newErrors.start_at = 'Start date is required';
    }

    if (!formData.end_at) {
      newErrors.end_at = 'End date is required';
    }

    if (formData.start_at && formData.end_at && new Date(formData.start_at) >= new Date(formData.end_at)) {
      newErrors.end_at = 'End date must be after start date';
    }

    if (formData.max_uses_per_user !== undefined && formData.max_uses_per_user <= 0) {
      newErrors.max_uses_per_user = 'Max uses per user must be greater than 0';
    }

    if (formData.global_cap !== undefined && formData.global_cap <= 0) {
      newErrors.global_cap = 'Global cap must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Implement API call
      console.log('Saving promotion:', formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const isValueFieldVisible = ['fixed_discount', 'ride_credit', 'cash_bonus'].includes(formData.reward_type || '');
  const isPercentFieldVisible = ['percent_discount', 'org_credit'].includes(formData.reward_type || '');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {promotion ? 'Edit Promotion' : 'Create New Promotion'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.audience}>
                  <InputLabel>Audience</InputLabel>
                  <Select
                    value={formData.audience || ''}
                    onChange={(e) => handleInputChange('audience', e.target.value)}
                    label="Audience"
                  >
                    <MenuItem value="rider">Riders</MenuItem>
                    <MenuItem value="driver">Drivers</MenuItem>
                    <MenuItem value="business">Businesses</MenuItem>
                  </Select>
                  {errors.audience && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.audience}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.reward_type}>
                  <InputLabel>Reward Type</InputLabel>
                  <Select
                    value={formData.reward_type || ''}
                    onChange={(e) => handleInputChange('reward_type', e.target.value)}
                    label="Reward Type"
                  >
                    <MenuItem value="fixed_discount">Fixed Discount</MenuItem>
                    <MenuItem value="percent_discount">Percent Discount</MenuItem>
                    <MenuItem value="ride_credit">Ride Credit</MenuItem>
                    <MenuItem value="cash_bonus">Cash Bonus</MenuItem>
                    <MenuItem value="org_credit">Organization Credit</MenuItem>
                  </Select>
                  {errors.reward_type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.reward_type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {isValueFieldVisible && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Value (cents)"
                    type="number"
                    value={formData.value_cents || ''}
                    onChange={(e) => handleInputChange('value_cents', parseInt(e.target.value) || 0)}
                    error={!!errors.value_cents}
                    helperText={errors.value_cents || 'Enter value in cents (e.g., 500 for $5.00)'}
                  />
                </Grid>
              )}

              {isPercentFieldVisible && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Percent Off"
                    type="number"
                    value={formData.percent_off || ''}
                    onChange={(e) => handleInputChange('percent_off', parseInt(e.target.value) || 0)}
                    error={!!errors.percent_off}
                    helperText={errors.percent_off || 'Enter percentage (1-100)'}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date & Time"
                  type="datetime-local"
                  value={formData.start_at ? new Date(formData.start_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('start_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  error={!!errors.start_at}
                  helperText={errors.start_at}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date & Time"
                  type="datetime-local"
                  value={formData.end_at ? new Date(formData.end_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('end_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  error={!!errors.end_at}
                  helperText={errors.end_at}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Priority"
                  type="number"
                  value={formData.priority || 0}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                  helperText="Higher priority promotions are applied first"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active || false}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Uses Per User"
                  type="number"
                  value={formData.max_uses_per_user || ''}
                  onChange={(e) => handleInputChange('max_uses_per_user', e.target.value ? parseInt(e.target.value) : undefined)}
                  error={!!errors.max_uses_per_user}
                  helperText={errors.max_uses_per_user || 'Leave empty for unlimited'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Global Cap"
                  type="number"
                  value={formData.global_cap || ''}
                  onChange={(e) => handleInputChange('global_cap', e.target.value ? parseInt(e.target.value) : undefined)}
                  error={!!errors.global_cap}
                  helperText={errors.global_cap || 'Leave empty for unlimited'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Promo Code"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  helperText="Leave empty for auto-apply promotions"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Criteria (Optional)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Advanced targeting criteria can be configured here. This is a placeholder for future implementation.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {promotion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default PromotionEditor;
