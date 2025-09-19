import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Money as MoneyIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
// Removed mockApi import - using real API only
import { Ride, Rider, PricingRule } from "../types";
import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatDistance,
} from "../utils/formatters";

const RideDetails: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();

  const [ride, setRide] = useState<Ride | null>(null);
  const [rider] = useState<Rider | null>(null);
  const [pricingRule] = useState<PricingRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchRideDetails = useCallback(async () => {
    if (!rideId) return;

    setLoading(true);
    try {
      // TODO: Replace with real API calls
      console.log('Ride details not implemented - using real API only');
      setError("Ride details functionality not implemented - using real API only");

      setError(null);
    } catch (err) {
      setError(`Failed to load ride details: ${err}`);
      console.error("Error fetching ride details:", err);
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId, fetchRideDetails]);

  const handleOpenRefundDialog = () => {
    setRefundDialogOpen(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialogOpen(false);
    setRefundReason("");
  };

  const handleProcessRefund = async () => {
    if (!ride) return;

    setProcessingRefund(true);
    try {
      // TODO: Replace with real API call
      console.log('Refund update not implemented - using real API only');

      // Update the local state with the refund
      setRide((prev) => (prev ? { ...prev, refunded: true } : null));

      setNotification({
        open: true,
        message: "Refund processed successfully",
        severity: "success",
      });

      handleCloseRefundDialog();
    } catch (err) {
      setNotification({
        open: true,
        message: `Failed to process refund: ${err}`,
        severity: "error",
      });
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getRideStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const isRefundEligible = () => {
    if (!ride) return false;

    // A ride is eligible for refund if:
    // 1. It's cancelled
    // 2. It's not already refunded
    // 3. The driver was further than the refund eligibility distance when cancellation occurred
    return (
      ride.status === "canceled" &&
      !ride.cancellation_fee &&
      ride.driverDistanceAtCancel !== undefined &&
      ride.driverDistanceAtCancel > 70 // 70m is our threshold
    );
  };

  // Calculate driver earnings after commission
  const getDriverEarnings = () => {
    if (!ride || !pricingRule) return 0;

    // Only completed rides generate earnings
    if (ride.status !== "completed") return 0;

    // Calculate driver's earnings after platform commission
    const commissionAmount =
      ride.base_fare * (pricingRule.commissionPercentage / 100);
    return ride.base_fare - commissionAmount;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ride) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Alert severity="error" sx={{ mb: 4 }}>
          {error || "Ride not found"}
        </Alert>

        <Button variant="contained" onClick={fetchRideDetails}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>

        <Typography variant="h4" component="h1">
          Ride Details
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Chip
          label={ride.status}
          color={getRideStatusColor(ride.status)}
          sx={{ textTransform: "capitalize", fontWeight: "medium" }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Left column - Ride Info */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ride Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ride ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {ride.id}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(ride.created_at)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ride Type
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ textTransform: "capitalize" }}
                >
                  {ride.ride_type_id}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Fare
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCurrency(ride.base_fare)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Distance
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDistance(ride.distance_km)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDuration(ride.duration_minutes)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Points Awarded
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {ride.rating > 0 ? (
                    <Chip
                      icon={<StarIcon fontSize="small" />}
                      label={ride.rating}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ) : (
                    "None"
                  )}
                </Typography>
              </Grid>

              {ride.status === "canceled" && (
                <Grid item xs={12}>
                  <Alert
                    severity={ride.cancellation_fee ? "info" : "warning"}
                    icon={
                      ride.cancellation_fee ? <CheckIcon /> : <WarningIcon />
                    }
                    sx={{ mt: 2 }}
                  >
                    {ride.cancellation_fee ? (
                      <>
                        This ride was <strong>refunded</strong>. Cancellation
                        reason: {ride.cancellation_reason || "Not provided"}
                      </>
                    ) : (
                      <>
                        This ride was <strong>cancelled</strong>.
                        {isRefundEligible() ? (
                          <>
                            {" "}
                            Driver was {ride.driverDistanceAtCancel}m away at
                            cancellation (eligible for refund).
                          </>
                        ) : (
                          <>
                            {" "}
                            Driver was nearby at cancellation (not eligible for
                            refund).
                          </>
                        )}
                      </>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Fare Details
              </Typography>

              <Paper
                elevation={2}
                sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}
              >
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          Total Fare
                        </Typography>
                      }
                      secondary={
                        <Typography variant="subtitle1">
                          {formatCurrency(ride.base_fare)}
                        </Typography>
                      }
                    />
                  </ListItem>

                  {pricingRule && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            Distance Calculation
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Total distance: {formatDistance(ride.distance_km)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              First {pricingRule.minimumBillableDistance}km
                              included in base price
                            </Typography>
                            <Typography variant="body2" color="primary.main">
                              Billable distance:{" "}
                              {formatDistance(
                                Math.max(
                                  0,
                                  ride.distance_km -
                                    pricingRule.minimumBillableDistance,
                                ),
                              )}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  )}

                  {ride.status === "completed" && pricingRule && (
                    <>
                      <Divider variant="inset" />
                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="medium">
                              Platform Commission (
                              {pricingRule.commissionPercentage}%)
                            </Typography>
                          }
                          secondary={
                            <Typography variant="subtitle1" color="info.main">
                              {formatCurrency(
                                ride.base_fare *
                                  (pricingRule.commissionPercentage / 100),
                              )}
                            </Typography>
                          }
                        />
                      </ListItem>

                      <Divider variant="inset" />
                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight="medium">
                              Driver Earnings
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="subtitle1"
                              color="success.main"
                            >
                              {formatCurrency(getDriverEarnings())}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </>
                  )}

                  {ride.status === "canceled" && (
                    <ListItem>
                      <ListItemIcon>
                        <CancelIcon
                          color={ride.cancellation_fee ? "error" : "disabled"}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          ride.cancellation_fee ? "Refunded" : "Not Refunded"
                        }
                        secondary={
                          ride.cancellation_fee
                            ? "The fare has been refunded to the rider"
                            : "No refund was processed"
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Grid>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Locations
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Pickup Location"
                  secondary={ride.pickup_address}
                />
              </ListItem>

              <Divider variant="inset" component="li" />

              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Drop-off Location"
                  secondary={ride.dropoff_address}
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 2 }}>
              {ride.started_at && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TimeIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Started: {formatDate(ride.started_at)}
                  </Typography>
                </Box>
              )}

              {ride.arrived_at && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TimeIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Ended: {formatDate(ride.arrived_at)}
                  </Typography>
                </Box>
              )}

              {ride.cancelled_at && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CancelIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Cancelled: {formatDate(ride.cancelled_at)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right column - Rider Info & Actions */}
        <Grid item xs={12} md={4}>
          {/* Rider Information */}
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Rider Information</Typography>
              </Box>

              {rider ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {rider.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {rider.id}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List disablePadding>
                    <ListItem disablePadding sx={{ pb: 1 }}>
                      <ListItemText
                        primary="Email"
                        secondary={rider.email}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary",
                        }}
                      />
                    </ListItem>

                    <ListItem disablePadding sx={{ pb: 1 }}>
                      <ListItemText
                        primary="Phone"
                        secondary={rider.phone}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary",
                        }}
                      />
                    </ListItem>

                    <ListItem disablePadding sx={{ pb: 1 }}>
                      <ListItemText
                        primary="Total Rides"
                        secondary={rider.totalRides}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary",
                        }}
                      />
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemText
                        primary="Reward Points"
                        secondary={
                          <Chip
                            icon={<StarIcon fontSize="small" />}
                            label={rider.rewardPoints}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          color: "text.secondary",
                        }}
                      />
                    </ListItem>
                  </List>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/riders?id=${rider.id}`)}
                    >
                      View Rider Profile
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography color="text.secondary">
                  Rider information not available
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>

              <Box sx={{ mt: 2 }}>
                {isRefundEligible() && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<MoneyIcon />}
                    onClick={handleOpenRefundDialog}
                    sx={{ mb: 2 }}
                  >
                    Process Refund
                  </Button>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => window.print()}
                  sx={{ mb: 2 }}
                >
                  Print Receipt
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Refund Dialog */}
      <Dialog
        open={refundDialogOpen}
        onClose={handleCloseRefundDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Refund</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            You're about to process a refund for this ride. This will mark the
            ride as refunded and the fare amount (
            {formatCurrency(ride.base_fare)}) will be credited back to the
            rider.
          </Typography>

          <TextField
            label="Refund Reason"
            fullWidth
            multiline
            rows={3}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Provide a reason for this refund"
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              This ride is eligible for a refund because the driver was{" "}
              {ride.driverDistanceAtCancel}m away when the ride was cancelled
              (threshold: 70m).
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>Cancel</Button>
          <Button
            onClick={handleProcessRefund}
            variant="contained"
            color="primary"
            disabled={processingRefund || refundReason.trim() === ""}
          >
            {processingRefund ? "Processing..." : "Process Refund"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RideDetails;
