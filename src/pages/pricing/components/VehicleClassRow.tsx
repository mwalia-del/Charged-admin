import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Switch,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { VehicleClass, VehicleClassUpdate } from '../../../types';
// import { updateVehicleClass } from '../../../API/vehicleClasses';

interface VehicleClassRowProps {
  vehicleClass: VehicleClass;
  onUpdate: (code: string, updates: VehicleClassUpdate) => void;
  onError: (error: string) => void;
  canToggle?: boolean;
}

const VehicleClassRow: React.FC<VehicleClassRowProps> = ({
  vehicleClass,
  onUpdate,
  onError,
  canToggle = true,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(vehicleClass.is_enabled);

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
    const originalValue = vehicleClass[field];
    
    try {
      console.log(`🌐 Updating vehicle class ${vehicleClass.code}:`, { [field]: value });
      // Use the onUpdate callback instead of direct API call
      await onUpdate(vehicleClass.code, { [field]: value });
      console.log('✅ Vehicle class updated successfully');
    } catch (error) {
      console.error('❌ Failed to update vehicle class:', error);
      // Rollback local state on error
      if (field === 'is_enabled') {
        setPendingEnabled(originalValue as boolean);
      }
      onError(`Failed to update ${field}: ${error}`);
    } finally {
      setIsUpdating(false);
    }
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
          {canToggle ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title={vehicleClass.is_enabled ? `Disable ${vehicleClass.display_name}` : `Enable ${vehicleClass.display_name}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Switch
                    checked={vehicleClass.is_enabled}
                    onChange={(e) => handleToggleEnabled(e.target.checked)}
                    disabled={isUpdating}
                    size="small"
                  />
                  {isUpdating && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={16} />
                    </Box>
                  )}
                </Box>
              </Tooltip>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Always Active
            </Typography>
          )}
        </TableCell>
      </TableRow>

      {/* Disable Confirmation Dialog */}
      <Dialog
        open={showDisableDialog}
        onClose={cancelDisable}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Disable {vehicleClass.display_name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disable {vehicleClass.display_name}? This will:
            <br />
            • Hide {vehicleClass.display_name} from all rider, driver, and business apps
            <br />
            • Block any new bookings for {vehicleClass.display_name}
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
            Disable {vehicleClass.display_name}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VehicleClassRow;
