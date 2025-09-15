import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { PromotionFilters as PromotionFiltersType } from '../../../types';

interface PromotionFiltersProps {
  filters: PromotionFiltersType;
  onFiltersChange: (filters: Partial<PromotionFiltersType>) => void;
}

const PromotionFilters: React.FC<PromotionFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: keyof PromotionFiltersType, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      audience: undefined,
      status: undefined,
      search: undefined,
      from: undefined,
      to: undefined,
    });
  };

  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          label="Search"
          placeholder="Title, description, or code"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          size="small"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Audience</InputLabel>
          <Select
            value={filters.audience || ''}
            onChange={(e) => handleFilterChange('audience', e.target.value || undefined)}
            label="Audience"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="rider">Riders</MenuItem>
            <MenuItem value="driver">Drivers</MenuItem>
            <MenuItem value="business">Businesses</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="ended">Ended</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          label="From Date"
          type="date"
          value={filters.from || ''}
          onChange={(e) => handleFilterChange('from', e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2}>
        <TextField
          fullWidth
          label="To Date"
          type="date"
          value={filters.to || ''}
          onChange={(e) => handleFilterChange('to', e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={1}>
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          fullWidth
          size="small"
        >
          Clear
        </Button>
      </Grid>
    </Grid>
  );
};

export default PromotionFilters;
