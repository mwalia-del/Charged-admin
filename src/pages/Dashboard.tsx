import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material";
import {
  DirectionsCar as CarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { DashboardStats, Ride } from "../types";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useAuth } from "../contexts/AuthContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { getrecentRides, getDashboardStats } = useAuth();
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        const recentRides = await getrecentRides();

        dashboardStats.recentRides = recentRides;
        setStats(dashboardStats);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  // Prepare chart data
  const chartData = {
    labels: stats?.rideTypeCounts.map((item) => item.name) || [],
    datasets: [
      {
        label: "Number of Rides",
        data: stats?.rideTypeCounts.map((item) => item.count) || [],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Rides by Type",
      },
    },
  };

  const renderRecentRides = () => {
    if (!stats?.recentRides || stats.recentRides.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No recent rides to display.
        </Typography>
      );
    }

    const getStatusColor = (status: Ride["status"]) => {
      switch (status) {
        case "completed":
          return "success.main";
        case "accepted":
          return "info.main";
        case "request":
          return "warning.main";
        case "canceled":
          return "error.main";
        default:
          return "text.secondary";
      }
    };

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Distance</TableCell>
              <TableCell>Fare</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(stats?.recentRides ?? []).map((ride) => (
              <TableRow key={ride.id}>
                <TableCell>{ride.id}</TableCell>
                <TableCell>{formatDate(ride.created_at)}</TableCell>
                <TableCell>{ride.distance_km} km</TableCell>
                <TableCell>{formatCurrency(ride.base_fare)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getStatusColor(ride.status),
                      textTransform: "capitalize",
                      fontWeight: "medium",
                    }}
                  >
                    {ride.status}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <CarIcon fontSize="large" />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" component="div">
                    {stats?.rideCount || 0}
                  </Typography>
                  <Typography variant="body2">Total Rides</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "success.main",
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <PeopleIcon fontSize="large" />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" component="div">
                    {stats?.activeDrivers || 0}
                  </Typography>
                  <Typography variant="body2">Active Drivers</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "warning.main",
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <MoneyIcon fontSize="large" />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" component="div">
                    {formatCurrency(Number(stats?.totalRevenue) || 0)}
                  </Typography>
                  <Typography variant="body2">Total Revenue</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "info.main",
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <StarIcon fontSize="large" />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" component="div">
                    {formatCurrency(Number(stats?.platformCommission) || 0)}
                  </Typography>
                  <Typography variant="body2">
                    Platform Commission ({stats?.platformCommission || 0}%)
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart and Recent Rides */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 400,
            }}
          >
            <Bar options={chartOptions} data={chartData} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 400,
              overflow: "auto",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Rides
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderRecentRides()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
