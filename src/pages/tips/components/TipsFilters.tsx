import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Autocomplete,
  Paper,
} from '@mui/material';
// Using simple TextField for date input instead of DatePicker
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { TipsFilters as TipsFiltersType } from '../../../types';

interface TipsFiltersProps {
  filters: TipsFiltersType;
  onFiltersChange: (filters: TipsFiltersType) => void;
  onSearch: () => void;
  onClear: () => void;
  drivers: Array<{ id: string; name: string }>;
  riders: Array<{ id: string; name: string }>;
  loading?: boolean;
}

const TipsFilters: React.FC<TipsFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear,
  drivers,
  riders,
  loading = false
}) => {
  const [actorType, setActorType] = useState<string>(filters.actor_type || 'ride');
  const [actorId, setActorId] = useState<string>(filters.actor_id || '');
  const [range, setRange] = useState<string>(filters.range || 'this_month');
  const [startDate, setStartDate] = useState<Date | null>(
    filters.start_date ? new Date(filters.start_date) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filters.end_date ? new Date(filters.end_date) : null
  );

  const rangeOptions = [
    { value: 'last_ride', label: 'Last Ride' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const actorOptions = [
    { value: 'ride', label: 'All' },
    { value: 'driver', label: 'Driver' },
    { value: 'rider', label: 'Rider' }
  ];

  const getActorOptions = () => {
    if (actorType === 'driver') return drivers;
    if (actorType === 'rider') return riders;
    return [];
  };

  const handleActorTypeChange = (value: string) => {
    setActorType(value);
    setActorId('');
    onFiltersChange({
      ...filters,
      actor_type: value as any,
      actor_id: undefined
    });
  };

  const handleActorChange = (value: string) => {
    setActorId(value);
    onFiltersChange({
      ...filters,
      actor_id: value || undefined
    });
  };

  const handleRangeChange = (value: string) => {
    setRange(value);
    if (value !== 'custom') {
      setStartDate(null);
      setEndDate(null);
      onFiltersChange({
        ...filters,
        range: value as any,
        start_date: undefined,
        end_date: undefined
      });
    }
  };

  const handleDateChange = (field: 'start_date' | 'end_date', date: Date | null) => {
    if (field === 'start_date') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    
    onFiltersChange({
      ...filters,
      [field]: date ? date.toISOString().split('T')[0] : undefined
    });
  };

  const handleSearch = () => {
    onSearch();
  };

  const handleClear = () => {
    setActorType('ride');
    setActorId('');
    setRange('this_month');
    setStartDate(null);
    setEndDate(null);
    onClear();
  };

  const isCustomRange = range === 'custom';
  const canSearch = !isCustomRange || (startDate && endDate);

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter By</InputLabel>
              <Select
                value={actorType}
                label="Filter By"
                onChange={(e) => handleActorTypeChange(e.target.value)}
              >
                {actorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {actorType !== 'ride' && (
            <Grid item xs={12} md={3}>
              <Autocomplete
                size="small"
                options={getActorOptions()}
                getOptionLabel={(option) => option.name}
                value={getActorOptions().find(option => option.id === actorId) || null}
                onChange={(_, newValue) => handleActorChange(newValue?.id || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Select ${actorType === 'driver' ? 'Driver' : 'Rider'}`}
                    placeholder={`Search ${actorType === 'driver' ? 'drivers' : 'riders'}...`}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>
          )}

          <Grid item xs={12} md={2}>
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
              <Grid item xs={12} md={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  fullWidth
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('start_date', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  fullWidth
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('end_date', e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} md={1}>
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

export default TipsFilters;
