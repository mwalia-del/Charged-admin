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
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  DirectionsCar as VehicleIcon,
} from "@mui/icons-material";
import { rideTypes, VehicleClass, VehicleClassUpdate } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { generateMockVehicleClassesResponse } from "../API/mockVehicleClassesData";
import VehicleClassRow from "./pricing/components/VehicleClassRow";
import toast from "react-hot-toast";

// // Ride type icons mapping
// const rideTypeIcons: Record<string, React.ReactNode> = {
//   electric: <ElectricIcon sx={{ fontSize: 40, color: "success.main" }} />,
//   regular: <CarIcon sx={{ fontSize: 40, color: "primary.main" }} />,
//   suv: <SuvIcon sx={{ fontSize: 40, color: "warning.main" }} />,
// };

const Pricing: React.FC = () => {
  const [pricingRules, setPricingRules] = useState<rideTypes[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleClassesLoading, setVehicleClassesLoading] = useState(false);
  const [savingRules, setSavingRules] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [vehicleClassesError, setVehicleClassesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { getRidetypes, updateRidetype } = useAuth();

  // Load pricing rules on component mount
  useEffect(() => {
    fetchPricingRules();
    fetchVehicleClasses();
    // eslint-disable-next-line
  }, []);

  const fetchPricingRules = async () => {
    setLoading(true);
    try {
      const rules = await getRidetypes();
      setPricingRules(rules);
      setError(null);
    } catch (err) {
      setError("Failed to load pricing rules. Please try again.");
      console.error("Error fetching pricing rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (
    id: number,
    field: keyof rideTypes,
    value: any,
  ) => {
    setPricingRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === id ? { ...rule, [field]: value || 0 } : rule,
      ),
    );
  };

  const handleSaveRule = async (rule: rideTypes) => {
    setSavingRules((prev) => ({ ...prev, [rule.id]: true }));
    try {
      await updateRidetype(rule.id, rule);
      toast.success(`Successfully updated ${rule?.name} pricing rules`);
    } catch (err) {
      toast.error(`Failed to update pricing rules: ${err}`);
    } finally {
      setSavingRules((prev) => ({ ...prev, [rule.id]: false }));
    }
  };

  const fetchVehicleClasses = async () => {
    setVehicleClassesLoading(true);
    try {
      // Use mock data for now
      const response = generateMockVehicleClassesResponse();
      setVehicleClasses(response.vehicle_classes);
      setVehicleClassesError(null);
    } catch (err) {
      setVehicleClassesError("Failed to load vehicle classes. Please try again.");
      console.error("Error fetching vehicle classes:", err);
    } finally {
      setVehicleClassesLoading(false);
    }
  };

  const handleVehicleClassUpdate = (code: string, updates: VehicleClassUpdate) => {
    setVehicleClasses(prev => 
      prev.map(vc => 
        vc.code === code 
          ? { ...vc, ...updates, updated_at: new Date().toISOString() }
          : vc
      )
    );
    toast.success("Vehicle class updated successfully. Changes are live now!");
  };

  const handleVehicleClassError = (error: string) => {
    toast.error(error);
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
      <Typography variant="h4" gutterBottom>
        Pricing & Vehicle Management
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Configure pricing rules for different ride types and manage vehicle class availability across all platforms.
      </Typography>

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
        </Tabs>
      </Box>

      {/* Pricing Rules Tab */}
      {activeTab === 0 && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            {pricingRules.map((rule) => (
            <Grid item xs={12} md={4} key={rule.id}>
              <Card elevation={3}>
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
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveRule(rule)}
                        disabled={savingRules[rule.id]}
                        sx={{ mt: 2 }}
                      >
                        {savingRules[rule.id] ? "Saving..." : "Save Changes"}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
          </Grid>
        </Box>
      )}

      {/* Vehicle Classes Tab */}
      {activeTab === 1 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Charged XL Management
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enable or disable Charged XL across all platforms. Changes take effect immediately.
          </Typography>

          {vehicleClassesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
                  {vehicleClasses
                    .filter(vehicleClass => vehicleClass.code === 'charged_xl')
                    .map((vehicleClass) => (
                      <VehicleClassRow
                        key={vehicleClass.id}
                        vehicleClass={vehicleClass}
                        onUpdate={handleVehicleClassUpdate}
                        onError={handleVehicleClassError}
                      />
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>Realtime Updates:</strong> When you disable a vehicle class, it will be hidden from all rider, driver, and business apps within seconds. 
              Any attempt to book a disabled vehicle class will be rejected by the server.
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Pricing;
