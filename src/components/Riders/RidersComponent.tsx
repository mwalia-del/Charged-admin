import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Chip,
} from "@mui/material";
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Check as ActiveIcon,
  Close as InactiveIcon,
} from "@mui/icons-material";
import { RewardPointDetail, Ride, Rider } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import RidersTable from "./RidersTable/RidersTable";
import RiderRidesDialog from "./RiderRides/RiderRidesDialog";

const RidersComponent: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<boolean | "all">("all");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [riderRides, setRiderRides] = useState<Ride[]>([]);
  const [rideDialogOpen, setRideDialogOpen] = useState(false);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [RewardPointDetails, setRewardPointDetails] = useState<
    RewardPointDetail[]
  >([]);
  const [rideDialogLoading, setRideDialogLoading] = useState(false);
  const [lastDataFetch, setLastDataFetch] = useState<Date | null>(null);

  const { getRiders, getRidesByUserId, getRewardPointsData } = useAuth();

  // Load riders on component mount
  useEffect(() => {
    fetchRiders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enhanced filtering with useCallback
  const applyFilters = useCallback(() => {
    let result = [...riders];
    console.log("🔍 Applying rider filters:", { 
      totalRiders: riders.length, 
      searchQuery, 
      selectedStatusFilter 
    });

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const beforeSearch = result.length;
      result = result.filter(
        (rider) =>
          rider?.name?.toLowerCase()?.includes(query) ||
          rider?.email?.toLowerCase()?.includes(query) ||
          rider?.phone?.toString()?.includes(query) ||
          rider?.id?.toString()?.includes(query)
      );
      console.log("🔍 Search filter:", { query, before: beforeSearch, after: result.length });
      setPage(0);
    }

    // Apply status filter
    if (selectedStatusFilter !== "all") {
      const beforeStatus = result.length;
      result = result.filter(
        (rider) => rider.is_active === selectedStatusFilter
      );
      console.log("📊 Status filter:", { 
        status: selectedStatusFilter, 
        before: beforeStatus, 
        after: result.length 
      });
      setPage(0);
    }

    console.log("✅ Final filtered riders:", result.length);
    setFilteredRiders(result);
  }, [riders, searchQuery, selectedStatusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching fresh riders data...");
      const data = await getRiders();
      console.log("📊 Fresh riders data received:", data.length, "riders");
      setRiders(data);
      setFilteredRiders(data);
      setLastDataFetch(new Date());
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching riders:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewRiderRides = async (rider: Rider) => {
    setSelectedRider(rider);
    setRideDialogOpen(true);
    setRideDialogLoading(true);
    await fetchRewardPoints(Number(rider.id));

    try {
      const rides = await getRidesByUserId(Number(rider.id));
      rides.length > 0 ? setRiderRides(rides) : setRiderRides([]);
    } catch (err) {
      console.error("Error fetching rider rides:", err);
    } finally {
      setRideDialogLoading(false);
    }
  };

  const fetchRewardPoints = async (riderId: number) => {
    try {
      const data = await getRewardPointsData(riderId);
      let totalPoints: number = 0;
      data?.forEach((rewardPoint) => {
        totalPoints += rewardPoint?.amount ? Number(rewardPoint.amount) : 0;
      });
      setTotalPoints(totalPoints);
      setRewardPointDetails(data?.length > 0 ? data : []);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
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
        <Button variant="contained" onClick={fetchRiders}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Rider Management
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View and manage riders, track their rides and reward points.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRiders}
            disabled={loading}
            sx={{ ml: 2 }}
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
          {lastDataFetch && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Last updated: {lastDataFetch.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search riders"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, email, phone, or ID"
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Status
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setSelectedStatusFilter("all")}
                  color={selectedStatusFilter === "all" ? "primary" : "default"}
                  variant={
                    selectedStatusFilter === "all" ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<ActiveIcon />}
                  label="Active"
                  onClick={() => setSelectedStatusFilter(true)}
                  color={selectedStatusFilter === true ? "primary" : "default"}
                  variant={
                    selectedStatusFilter === true ? "filled" : "outlined"
                  }
                />
                <Chip
                  icon={<InactiveIcon />}
                  label="Inactive"
                  onClick={() => setSelectedStatusFilter(false)}
                  color={selectedStatusFilter === false ? "primary" : "default"}
                  variant={
                    selectedStatusFilter === false ? "filled" : "outlined"
                  }
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Total Riders
              </Typography>
              <Typography variant="h6" color="primary">
                {filteredRiders.length} / {riders.length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>


      <RidersTable
        filteredRiders={filteredRiders}
        handleViewRiderRides={handleViewRiderRides}
        page={page}
        setPage={setPage}
        fetchRiders={fetchRiders}
      />

      {/* Rider Rides Dialog */}
      {selectedRider && (
        <RiderRidesDialog
          setRideDialogOpen={setRideDialogOpen}
          setSelectedRider={setSelectedRider}
          setRiderRides={setRiderRides}
          rideDialogOpen={rideDialogOpen}
          riderRides={riderRides}
          selectedRider={selectedRider}
          totalPoints={totalPoints}
          rideDialogLoading={rideDialogLoading}
          RewardPointDetails={RewardPointDetails}
          fetchRewardPoints={fetchRewardPoints}
        />
      )}
    </Container>
  );
};

export default RidersComponent;
