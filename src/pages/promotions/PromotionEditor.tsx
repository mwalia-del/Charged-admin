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
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Promotion } from '../../types';
import { createPromotion, updatePromotion } from '../../API/promotions';

interface PromotionEditorProps {
  open: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onSave: () => void;
}

// Simple date and time helpers
const formatDateForAPI = (dateStr: string, timeStr: string): string => {
  if (!dateStr || !timeStr) return '';
  try {
    const dateTime = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(dateTime.getTime())) return '';
    // Ensure we return proper ISO 8601 format with Z suffix
    return dateTime.toISOString();
  } catch (error) {
    console.error('Error parsing date/time:', error);
    return '';
  }
};

const parseDateFromAPI = (dateString: string | undefined): { date: string; time: string } => {
  if (!dateString) return { date: '', time: '' };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: '', time: '' };
    
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].slice(0, 5);
    
    return { date: dateStr, time: timeStr };
  } catch (error) {
    console.error('Error parsing date:', error);
    return { date: '', time: '' };
  }
};

const getDefaultStartDateTime = (): { date: string; time: string } => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);
  return { date: dateStr, time: timeStr };
};

const getDefaultEndDateTime = (): { date: string; time: string } => {
  const future = new Date();
  future.setDate(future.getDate() + 7);
  const dateStr = future.toISOString().split('T')[0];
  const timeStr = future.toTimeString().split(' ')[0].slice(0, 5);
  return { date: dateStr, time: timeStr };
};

const PromotionEditor: React.FC<PromotionEditorProps> = ({ open, onClose, promotion, onSave }) => {
  const [formData, setFormData] = useState<Partial<Promotion>>({
    title: '',
    description: '',
    audience: 'rider',
    reward_type: 'fixed_discount',
    value_cents: 0,
    percent_off: 0,
    start_at: '',
    end_at: '',
    priority: 0,
    is_active: false,
    max_uses_per_user: undefined,
    global_cap: undefined,
    code: '',
    criteria_json: {},
  });

  // Separate state for date/time inputs
  const [startDateTime, setStartDateTime] = useState<{ date: string; time: string }>({ date: '', time: '' });
  const [endDateTime, setEndDateTime] = useState<{ date: string; time: string }>({ date: '', time: '' });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (promotion) {
      setFormData(promotion);
      // Parse existing dates
      const startParsed = parseDateFromAPI(promotion.start_at);
      const endParsed = parseDateFromAPI(promotion.end_at);
      setStartDateTime(startParsed);
      setEndDateTime(endParsed);
    } else {
      const defaultStart = getDefaultStartDateTime();
      const defaultEnd = getDefaultEndDateTime();
      
      setFormData({
        title: '',
        description: '',
        audience: 'rider',
        reward_type: 'fixed_discount',
        value_cents: 0,
        percent_off: 0,
        start_at: formatDateForAPI(defaultStart.date, defaultStart.time),
        end_at: formatDateForAPI(defaultEnd.date, defaultEnd.time),
        priority: 0,
        is_active: false,
        max_uses_per_user: undefined,
        global_cap: undefined,
        code: '',
        criteria_json: {},
      });
      
      setStartDateTime(defaultStart);
      setEndDateTime(defaultEnd);
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

  const handleDateTimeChange = (type: 'start' | 'end', field: 'date' | 'time', value: string) => {
    if (type === 'start') {
      const newStartDateTime = { ...startDateTime, [field]: value };
      setStartDateTime(newStartDateTime);
      
      // Update form data
      const apiValue = formatDateForAPI(newStartDateTime.date, newStartDateTime.time);
      setFormData(prev => ({ ...prev, start_at: apiValue }));
      
      // Auto-adjust end date if needed
      if (field === 'date' && newStartDateTime.date && endDateTime.date) {
        const startDate = new Date(`${newStartDateTime.date}T${newStartDateTime.time}`);
        const endDate = new Date(`${endDateTime.date}T${endDateTime.time}`);
        
        if (endDate <= startDate) {
          const newEndDate = new Date(startDate);
          newEndDate.setDate(newEndDate.getDate() + 7);
          const newEndDateTime = {
            date: newEndDate.toISOString().split('T')[0],
            time: newEndDate.toTimeString().split(' ')[0].slice(0, 5)
          };
          setEndDateTime(newEndDateTime);
          setFormData(prev => ({ 
            ...prev, 
            end_at: formatDateForAPI(newEndDateTime.date, newEndDateTime.time) 
          }));
        }
      }
    } else {
      const newEndDateTime = { ...endDateTime, [field]: value };
      setEndDateTime(newEndDateTime);
      
      // Update form data
      const apiValue = formatDateForAPI(newEndDateTime.date, newEndDateTime.time);
      setFormData(prev => ({ ...prev, end_at: apiValue }));
    }
    
    // Clear errors
    if (errors.start_at) setErrors(prev => ({ ...prev, start_at: '' }));
    if (errors.end_at) setErrors(prev => ({ ...prev, end_at: '' }));
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

    // Validate start date
    if (!formData.start_at) {
      newErrors.start_at = 'Start date is required';
    } else {
      const startDate = new Date(formData.start_at);
      if (isNaN(startDate.getTime())) {
        newErrors.start_at = 'Invalid start date format';
      } else if (startDate < new Date()) {
        newErrors.start_at = 'Start date cannot be in the past';
      } else {
        // Validate ISO format
        const isoString = startDate.toISOString();
        if (!isoString.includes('T') || !isoString.endsWith('Z')) {
          newErrors.start_at = 'Invalid date format - must be ISO 8601';
        }
      }
    }

    // Validate end date
    if (!formData.end_at) {
      newErrors.end_at = 'End date is required';
    } else {
      const endDate = new Date(formData.end_at);
      if (isNaN(endDate.getTime())) {
        newErrors.end_at = 'Invalid end date format';
      } else {
        // Validate ISO format
        const isoString = endDate.toISOString();
        if (!isoString.includes('T') || !isoString.endsWith('Z')) {
          newErrors.end_at = 'Invalid date format - must be ISO 8601';
        }
      }
    }

    // Validate date relationship
    if (formData.start_at && formData.end_at && !newErrors.start_at && !newErrors.end_at) {
      const startDate = new Date(formData.start_at);
      const endDate = new Date(formData.end_at);
      
      if (startDate >= endDate) {
        newErrors.end_at = 'End date must be after start date';
      }
      
      // Check if promotion duration is too long (more than 1 year)
      const durationMs = endDate.getTime() - startDate.getTime();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      if (durationMs > oneYearMs) {
        newErrors.end_at = 'Promotion duration cannot exceed 1 year';
      }
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

    setLoading(true);
    try {

      if (promotion) {
        // Update existing promotion
        await updatePromotion(promotion.id, formData);
        setSnackbar({
          open: true,
          message: 'Promotion updated successfully',
          severity: 'success'
        });
      } else {
        // Create new promotion
        await createPromotion(formData as Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'redemptions_count' | 'global_redemptions_count'>);
        setSnackbar({
          open: true,
          message: 'Promotion created successfully',
          severity: 'success'
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving promotion:', error);
      setSnackbar({
        open: true,
        message: `Failed to save promotion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const isValueFieldVisible = ['fixed_discount', 'ride_credit', 'cash_bonus'].includes(formData.reward_type || '');
  const isPercentFieldVisible = ['percent_discount', 'org_credit'].includes(formData.reward_type || '');

  return (
    <>
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
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  Start Date & Time
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Date"
                    type="date"
                    value={startDateTime.date}
                    onChange={(e) => handleDateTimeChange('start', 'date', e.target.value)}
                    error={!!errors.start_at}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Time"
                    type="time"
                    value={startDateTime.time}
                    onChange={(e) => handleDateTimeChange('start', 'time', e.target.value)}
                    error={!!errors.start_at}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const now = getDefaultStartDateTime();
                      setStartDateTime(now);
                      setFormData(prev => ({ ...prev, start_at: formatDateForAPI(now.date, now.time) }));
                    }}
                  >
                    Now
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const tomorrowDateTime = {
                        date: tomorrow.toISOString().split('T')[0],
                        time: '09:00'
                      };
                      setStartDateTime(tomorrowDateTime);
                      setFormData(prev => ({ ...prev, start_at: formatDateForAPI(tomorrowDateTime.date, tomorrowDateTime.time) }));
                    }}
                  >
                    Tomorrow 9 AM
                  </Button>
                </Box>
                {errors.start_at && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.start_at}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  End Date & Time
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    label="Date"
                    type="date"
                    value={endDateTime.date}
                    onChange={(e) => handleDateTimeChange('end', 'date', e.target.value)}
                    error={!!errors.end_at}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Time"
                    type="time"
                    value={endDateTime.time}
                    onChange={(e) => handleDateTimeChange('end', 'time', e.target.value)}
                    error={!!errors.end_at}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (startDateTime.date && startDateTime.time) {
                        const startDate = new Date(`${startDateTime.date}T${startDateTime.time}`);
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + 7);
                        const endDateTime = {
                          date: endDate.toISOString().split('T')[0],
                          time: endDate.toTimeString().split(' ')[0].slice(0, 5)
                        };
                        setEndDateTime(endDateTime);
                        setFormData(prev => ({ ...prev, end_at: formatDateForAPI(endDateTime.date, endDateTime.time) }));
                      }
                    }}
                    disabled={!startDateTime.date || !startDateTime.time}
                  >
                    +7 days
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (startDateTime.date && startDateTime.time) {
                        const startDate = new Date(`${startDateTime.date}T${startDateTime.time}`);
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + 30);
                        const endDateTime = {
                          date: endDate.toISOString().split('T')[0],
                          time: endDate.toTimeString().split(' ')[0].slice(0, 5)
                        };
                        setEndDateTime(endDateTime);
                        setFormData(prev => ({ ...prev, end_at: formatDateForAPI(endDateTime.date, endDateTime.time) }));
                      }
                    }}
                    disabled={!startDateTime.date || !startDateTime.time}
                  >
                    +30 days
                  </Button>
                </Box>
                {errors.end_at && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.end_at}
                  </Typography>
                )}
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
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Saving...' : (promotion ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PromotionEditor;
