import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { ScheduledRideFilters } from '../../../types';

interface ScheduledFiltersProps {
  filters: ScheduledRideFilters;
  onFiltersChange: (filters: ScheduledRideFilters) => void;
  onRefresh: () => void;
  onExportCSV: () => void;
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'dispatching', label: 'Dispatching' },
  { value: 'converted', label: 'Converted' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' }
];

const sourceOptions = [
  { value: 'rider', label: 'Rider' },
  { value: 'business', label: 'Business' }
];

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'custom', label: 'Custom Range' }
];

const mockRiders = [
  { id: 'rider-1', name: 'John Smith' },
  { id: 'rider-2', name: 'Sarah Johnson' },
  { id: 'rider-3', name: 'Mike Chen' },
  { id: 'rider-4', name: 'Emily Davis' },
  { id: 'rider-5', name: 'David Wilson' }
];

const mockOrgs = [
  { id: 'org-1', name: 'Acme Corporation' },
  { id: 'org-2', name: 'Tech Solutions Inc' },
  { id: 'org-3', name: 'Global Industries Ltd' },
  { id: 'org-4', name: 'Innovation Partners' },
  { id: 'org-5', name: 'Premier Services Co' }
];

const ScheduledFilters: React.FC<ScheduledFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  onExportCSV
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<ScheduledRideFilters>(filters);

  const handleFilterChange = (key: keyof ScheduledRideFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { page: 1, page_size: 10 };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleDateRangeChange = (range: string) => {
    const now = new Date();
    let from: string | undefined;
    let to: string | undefined;

    switch (range) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
        break;
      case 'this_week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        from = startOfWeek.toISOString();
        to = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'this_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        break;
      case 'last_3_months':
        from = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
        to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
        break;
      default:
        from = undefined;
        to = undefined;
    }

    handleFilterChange('from', from);
    handleFilterChange('to', to);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon color="action" />
          <TextField
            placeholder="Search scheduled rides..."
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Filters
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton onClick={onExportCSV}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Filters">
            <IconButton onClick={handleClearFilters}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showAdvanced && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Source</InputLabel>
              <Select
                value={localFilters.source || ''}
                onChange={(e) => handleFilterChange('source', e.target.value || undefined)}
                label="Source"
              >
                <MenuItem value="">All Sources</MenuItem>
                {sourceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={mockRiders}
              getOptionLabel={(option) => option.name}
              value={mockRiders.find(rider => rider.id === localFilters.rider_id) || null}
              onChange={(_, value) => handleFilterChange('rider_id', value?.id || undefined)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Rider"
                  size="small"
                  placeholder="Select rider..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={mockOrgs}
              getOptionLabel={(option) => option.name}
              value={mockOrgs.find(org => org.id === localFilters.org_id) || null}
              onChange={(_, value) => handleFilterChange('org_id', value?.id || undefined)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Organization"
                  size="small"
                  placeholder="Select organization..."
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={localFilters.dateRange || ''}
                onChange={(e) => {
                  handleFilterChange('dateRange', e.target.value);
                  handleDateRangeChange(e.target.value);
                }}
                label="Date Range"
              >
                <MenuItem value="">All Dates</MenuItem>
                {dateRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="From Date"
              type="datetime-local"
              size="small"
              fullWidth
              value={localFilters.from ? new Date(localFilters.from).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleFilterChange('from', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="To Date"
              type="datetime-local"
              size="small"
              fullWidth
              value={localFilters.to ? new Date(localFilters.to).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleFilterChange('to', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      )}

      {/* Active Filters Display */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {localFilters.status && (
          <Chip
            label={`Status: ${statusOptions.find(s => s.value === localFilters.status)?.label}`}
            onDelete={() => handleFilterChange('status', undefined)}
            color="primary"
            variant="outlined"
          />
        )}
        {localFilters.source && (
          <Chip
            label={`Source: ${sourceOptions.find(s => s.value === localFilters.source)?.label}`}
            onDelete={() => handleFilterChange('source', undefined)}
            color="primary"
            variant="outlined"
          />
        )}
        {localFilters.rider_id && (
          <Chip
            label={`Rider: ${mockRiders.find(r => r.id === localFilters.rider_id)?.name}`}
            onDelete={() => handleFilterChange('rider_id', undefined)}
            color="primary"
            variant="outlined"
          />
        )}
        {localFilters.org_id && (
          <Chip
            label={`Org: ${mockOrgs.find(o => o.id === localFilters.org_id)?.name}`}
            onDelete={() => handleFilterChange('org_id', undefined)}
            color="primary"
            variant="outlined"
          />
        )}
        {localFilters.from && (
          <Chip
            label={`From: ${new Date(localFilters.from).toLocaleDateString()}`}
            onDelete={() => handleFilterChange('from', undefined)}
            color="primary"
            variant="outlined"
          />
        )}
        {localFilters.to && (
          <Chip
            label={`To: ${new Date(localFilters.to).toLocaleDateString()}`}
            onDelete={() => handleFilterChange('to', undefined)}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};

export default ScheduledFilters;
