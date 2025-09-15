import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Switch,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { VehicleClass, VehicleClassUpdate } from '../../../types';
import { updateVehicleClass } from '../../../API/vehicleClasses';
import { formatCurrency } from '../../../utils/formatters';

interface VehicleClassRowProps {
  vehicleClass: VehicleClass;
  onUpdate: (code: string, updates: VehicleClassUpdate) => void;
  onError: (error: string) => void;
}

const VehicleClassRow: React.FC<VehicleClassRowProps> = ({
  vehicleClass,
  onUpdate,
  onError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(vehicleClass.is_enabled);
  const [edits, setEdits] = useState<VehicleClassUpdate>({});

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!enabled && vehicleClass.code === 'charged_xl') {
      setPendingEnabled(enabled);
      setShowDisableDialog(true);
      return;
    }

    await updateVehicleClassField('is_enabled', enabled);
  };

  const updateVehicleClassField = async (field: keyof VehicleClassUpdate, value: any) => {
    setIsUpdating(true);
    try {
      await updateVehicleClass(vehicleClass.code, { [field]: value });
      onUpdate(vehicleClass.code, { [field]: value });
    } catch (error) {
      onError(`Failed to update ${field}: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEdits({});
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateVehicleClass(vehicleClass.code, edits);
      onUpdate(vehicleClass.code, edits);
      setIsEditing(false);
      setEdits({});
    } catch (error) {
      onError(`Failed to update vehicle class: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEdits({});
  };

  const handleFieldChange = (field: keyof VehicleClassUpdate, value: any) => {
    setEdits(prev => ({ ...prev, [field]: value }));
  };

  const confirmDisable = async () => {
    setShowDisableDialog(false);
    await updateVehicleClassField('is_enabled', pendingEnabled);
  };

  const cancelDisable = () => {
    setShowDisableDialog(false);
    setPendingEnabled(vehicleClass.is_enabled);
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'success' : 'error';
  };

  const getStatusLabel = (enabled: boolean) => {
    return enabled ? 'Enabled' : 'Disabled';
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {vehicleClass.display_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {vehicleClass.code}
          </Typography>
        </TableCell>
        
        <TableCell>
          {isEditing ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Base:</Typography>
              <input
                type="number"
                value={edits.base_fare_cents ?? vehicleClass.base_fare_cents}
                onChange={(e) => handleFieldChange('base_fare_cents', parseInt(e.target.value))}
                style={{ width: '80px', padding: '4px' }}
              />
              <Typography variant="body2">¢</Typography>
            </Box>
          ) : (
            <Typography variant="body2">
              {formatCurrency(vehicleClass.base_fare_cents / 100)}
            </Typography>
          )}
        </TableCell>

        <TableCell>
          {isEditing ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Per km:</Typography>
              <input
                type="number"
                value={edits.per_km_cents ?? vehicleClass.per_km_cents}
                onChange={(e) => handleFieldChange('per_km_cents', parseInt(e.target.value))}
                style={{ width: '80px', padding: '4px' }}
              />
              <Typography variant="body2">¢</Typography>
            </Box>
          ) : (
            <Typography variant="body2">
              {formatCurrency(vehicleClass.per_km_cents / 100)}/km
            </Typography>
          )}
        </TableCell>

        <TableCell>
          {isEditing ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Per min:</Typography>
              <input
                type="number"
                value={edits.per_min_cents ?? vehicleClass.per_min_cents}
                onChange={(e) => handleFieldChange('per_min_cents', parseInt(e.target.value))}
                style={{ width: '80px', padding: '4px' }}
              />
              <Typography variant="body2">¢</Typography>
            </Box>
          ) : (
            <Typography variant="body2">
              {formatCurrency(vehicleClass.per_min_cents / 100)}/min
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Chip
            label={getStatusLabel(vehicleClass.is_enabled)}
            color={getStatusColor(vehicleClass.is_enabled)}
            size="small"
          />
        </TableCell>

        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {new Date(vehicleClass.updated_at).toLocaleDateString()}
          </Typography>
        </TableCell>

        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Switch
              checked={vehicleClass.is_enabled}
              onChange={(e) => handleToggleEnabled(e.target.checked)}
              disabled={isUpdating}
              size="small"
            />
            
            {isEditing ? (
              <>
                <Tooltip title="Save">
                  <IconButton
                    size="small"
                    onClick={handleSave}
                    disabled={isUpdating}
                    color="primary"
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton
                    size="small"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Edit Pricing">
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  disabled={isUpdating}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {/* Disable Confirmation Dialog */}
      <Dialog
        open={showDisableDialog}
        onClose={cancelDisable}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Disable Charged XL</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disable Charged XL? This will:
            <br />
            • Hide Charged XL from all rider, driver, and business apps
            <br />
            • Block any new bookings for Charged XL
            <br />
            • Apply changes immediately across all platforms
            <br />
            <br />
            You can re-enable it at any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDisable} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDisable} color="error" variant="contained">
            Disable Charged XL
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VehicleClassRow;
