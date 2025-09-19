import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Pricing from "./pages/Pricing";
import Riders from "./pages/Riders";
import Drivers from "./pages/Drivers";
import RideDetails from "./pages/RideDetails";
import NotFound from "./pages/NotFound";
import Rewards from "./pages/Rewards";
import { Toaster } from "react-hot-toast";
import Documents from "./pages/Documents";
import TipsPage from "./pages/tips/TipsPage";
import BusinessListPage from "./pages/business/BusinessListPage";
import BusinessDetailPage from "./pages/business/BusinessDetailPage";
import ReferralsPage from "./pages/referrals/ReferralsPage";
import DriverReferralWalletsPage from "./pages/referrals/DriverReferralWalletsPage";
import RiderReferralWalletsPage from "./pages/referrals/RiderReferralWalletsPage";
import ScheduledRidesPage from "./pages/scheduled/ScheduledRidesPage";
import PromotionsPage from "./pages/promotions/PromotionsPage";
import Messages from "./pages/Messages";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#f50057",
      light: "#ff4081",
      dark: "#c51162",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, loading } = useAuth();

  console.log("🛡️ ProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated);

  if (loading) {
    console.log("🛡️ ProtectedRoute - showing loading...");
    return <div>Loading...</div>;
  }

  console.log("🛡️ ProtectedRoute - redirecting to:", isAuthenticated ? "protected content" : "login");
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  console.log("🚀 App component rendering...");
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
              <Route index element={<Dashboard />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="riders" element={<Riders />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="documents" element={<Documents />} />
              <Route path="tips" element={<TipsPage />} />
              <Route path="businesses" element={<BusinessListPage />} />
              <Route path="businesses/:orgId" element={<BusinessDetailPage />} />
              <Route path="referrals" element={<ReferralsPage />} />
              <Route path="referrals/drivers" element={<DriverReferralWalletsPage />} />
              <Route path="referrals/riders" element={<RiderReferralWalletsPage />} />
              <Route path="scheduled" element={<ScheduledRidesPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="messages" element={<Messages />} />
              <Route path="rides/:rideId" element={<RideDetails />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster/>
    </ThemeProvider>
  );
};

export default App;
