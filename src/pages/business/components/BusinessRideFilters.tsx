import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { BusinessFilters } from '../../../types';

interface BusinessRideFiltersProps {
  filters: BusinessFilters;
  onFiltersChange: (filters: BusinessFilters) => void;
  onSearch: () => void;
  onClear: () => void;
  loading?: boolean;
}

const BusinessRideFilters: React.FC<BusinessRideFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  loading = false
}) => {
  const [range, setRange] = useState<string>(filters.range || 'this_month');
  const [startDate, setStartDate] = useState<string>(
    filters.start_date || ''
  );
  const [endDate, setEndDate] = useState<string>(
    filters.end_date || ''
  );

  const rangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleRangeChange = (value: string) => {
    setRange(value);
    if (value !== 'custom') {
      setStartDate('');
      setEndDate('');
      onFiltersChange({
        ...filters,
        range: value as any,
        start_date: undefined,
        end_date: undefined
      });
    }
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    if (field === 'start_date') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  const handleSearch = () => {
    onSearch();
  };

  const handleClear = () => {
    setRange('this_month');
    setStartDate('');
    setEndDate('');
    onClear();
  };

  const isCustomRange = range === 'custom';
  const canSearch = !isCustomRange || (startDate && endDate);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={range}
              label="Time Range"
              onChange={(e) => handleRangeChange(e.target.value)}
            >
              {rangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {isCustomRange && (
          <>
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                fullWidth
                value={startDate}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                size="small"
                fullWidth
                value={endDate}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={!canSearch || loading}
            fullWidth
          >
            Search
          </Button>
        </Grid>

        <Grid item xs={12} md={1}>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={loading}
            fullWidth
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BusinessRideFilters;
