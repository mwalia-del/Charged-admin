import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSimplePricingStore } from '../stores/simplePricingStore';
import { getRidetypesdata, updateRidetypedata } from '../API/axios';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const PricingDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { pricingRules, vehicleClasses } = useSimplePricingStore();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Check store data
      results.push({
        test: 'Store Data Check',
        status: pricingRules.length > 0 ? 'success' : 'warning',
        message: `Found ${pricingRules.length} pricing rules in store`,
        data: pricingRules
      });

      // Test 2: Check localStorage
      const storedRules = localStorage.getItem('pricingRules');
      results.push({
        test: 'LocalStorage Check',
        status: storedRules ? 'success' : 'warning',
        message: storedRules ? 'Data found in localStorage' : 'No data in localStorage',
        data: storedRules ? JSON.parse(storedRules) : null
      });

      // Test 3: Check API connectivity
      try {
        const apiResponse = await getRidetypesdata();
        results.push({
          test: 'API Connectivity',
          status: 'success',
          message: 'Successfully connected to API',
          data: apiResponse
        });
      } catch (error: any) {
        results.push({
          test: 'API Connectivity',
          status: 'error',
          message: `API connection failed: ${error.message}`,
          data: error
        });
      }

      // Test 4: Check data structure
      if (pricingRules.length > 0) {
        const firstRule = pricingRules[0];
        const requiredFields = ['id', 'name', 'base_price', 'price_per_km', 'price_per_minute'];
        const missingFields = requiredFields.filter(field => !(field in firstRule));
        
        results.push({
          test: 'Data Structure',
          status: missingFields.length === 0 ? 'success' : 'error',
          message: missingFields.length === 0 
            ? 'All required fields present' 
            : `Missing fields: ${missingFields.join(', ')}`,
          data: { firstRule, missingFields }
        });
      }

      // Test 5: Check data types
      if (pricingRules.length > 0) {
        const firstRule = pricingRules[0];
        const stringFields = ['base_price', 'price_per_km', 'price_per_minute'];
        const typeIssues = stringFields.filter(field => 
          firstRule[field as keyof typeof firstRule] && 
          typeof firstRule[field as keyof typeof firstRule] !== 'string'
        );
        
        results.push({
          test: 'Data Types',
          status: typeIssues.length === 0 ? 'success' : 'warning',
          message: typeIssues.length === 0 
            ? 'Data types are correct' 
            : `Type issues in fields: ${typeIssues.join(', ')}`,
          data: { typeIssues, firstRule }
        });
      }

      // Test 6: Test update operation
      if (pricingRules.length > 0) {
        try {
          const testData = {
            ...pricingRules[0],
            base_price: "999.99" // Test value
          };
          
          const updateResponse = await updateRidetypedata(pricingRules[0].id, testData);
          results.push({
            test: 'Update Operation',
            status: 'success',
            message: 'Update operation successful',
            data: updateResponse
          });
        } catch (error: any) {
          results.push({
            test: 'Update Operation',
            status: 'error',
            message: `Update operation failed: ${error.message}`,
            data: error
          });
        }
      }

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: `Diagnostic failed: ${error.message}`,
        data: error
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const clearCache = () => {
    localStorage.removeItem('pricingRules');
    localStorage.removeItem('vehicleClasses');
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Pricing Diagnostics
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This diagnostic tool helps identify issues with pricing data synchronization between frontend and backend.
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={runDiagnostics}
          disabled={isRunning}
          sx={{ minWidth: 200 }}
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
        
        <Button
          variant="outlined"
          color="warning"
          onClick={clearCache}
        >
          Clear Cache & Reload
        </Button>
      </Box>

      {diagnostics.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Diagnostic Results
            </Typography>
            
            {diagnostics.map((result, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Chip
                      label={result.status.toUpperCase()}
                      color={getStatusColor(result.status) as any}
                      size="small"
                    />
                    <Typography variant="subtitle1">
                      {getStatusIcon(result.status)} {result.test}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                      {result.message}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Details:
                    </Typography>
                    <pre style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '12px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Store State
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="Pricing Rules Count"
                secondary={pricingRules.length}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Vehicle Classes Count"
                secondary={vehicleClasses.length}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="LocalStorage Keys"
                secondary={Object.keys(localStorage).filter(key => 
                  key.includes('pricing') || key.includes('vehicle')
                ).join(', ') || 'None'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PricingDiagnostics;
