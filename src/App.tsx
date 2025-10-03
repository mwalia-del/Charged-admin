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

// Create a dark theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#2196f3", // Bright blue
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00bcd4", // Cyan blue
      light: "#4dd0e1",
      dark: "#0097a7",
      contrastText: "#ffffff",
    },
    background: {
      default: "#0a0a0a", // Deep black
      paper: "#1a1a1a", // Dark gray for cards
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    divider: "#333333",
    action: {
      active: "#2196f3",
      hover: "#1976d2",
      selected: "#1976d2",
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0a0a0a",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
          border: "1px solid #333333",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
          border: "1px solid #333333",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #333333",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1a1a1a",
          borderRight: "1px solid #333333",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2a2a",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#2a2a2a",
          color: "#ffffff",
          fontWeight: 600,
        },
        body: {
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
          borderBottom: "1px solid #333333",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#2196f3",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#1976d2",
          },
        },
        outlined: {
          borderColor: "#2196f3",
          color: "#2196f3",
          "&:hover": {
            borderColor: "#1976d2",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#2a2a2a",
            "& fieldset": {
              borderColor: "#333333",
            },
            "&:hover fieldset": {
              borderColor: "#2196f3",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2196f3",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2a2a",
          color: "#ffffff",
          border: "1px solid #333333",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#2196f3",
          },
          "&.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#2196f3",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
          border: "1px solid #333333",
        },
        standardError: {
          backgroundColor: "#2d1b1b",
          color: "#f44336",
          border: "1px solid #d32f2f",
        },
        standardSuccess: {
          backgroundColor: "#1b2d1b",
          color: "#4caf50",
          border: "1px solid #388e3c",
        },
        standardWarning: {
          backgroundColor: "#2d2a1b",
          color: "#ff9800",
          border: "1px solid #f57c00",
        },
        standardInfo: {
          backgroundColor: "#1b2a2d",
          color: "#2196f3",
          border: "1px solid #1976d2",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "#333333",
        },
        bar: {
          backgroundColor: "#2196f3",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#2196f3",
        },
      },
    },
  },
});

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({
  element,
}) => {
  const { isAuthenticated, loading } = useAuth();


  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
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
