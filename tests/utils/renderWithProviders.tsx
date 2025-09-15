import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Create a test theme
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Mock auth context value
const mockAuthValue = {
  user: {
    id: 'test-admin-123',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'admin',
    token: 'test-token-123',
  },
  login: jest.fn(),
  logout: jest.fn(),
  getDrivers: jest.fn().mockResolvedValue([]),
  getRiders: jest.fn().mockResolvedValue([]),
  getRides: jest.fn().mockResolvedValue([]),
  getDriverDocs: jest.fn().mockResolvedValue([]),
  getRidesByUserId: jest.fn().mockResolvedValue([]),
  isAuthenticated: true,
  loading: false,
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<typeof mockAuthValue>;
  initialEntries?: string[];
}

const AllTheProviders = ({ 
  children, 
  authValue = mockAuthValue 
}: { 
  children: React.ReactNode;
  authValue?: Partial<typeof mockAuthValue>;
}) => {
  const mergedAuthValue = { ...mockAuthValue, ...authValue };
  
  return (
    <BrowserRouter>
      <ThemeProvider theme={testTheme}>
        <CssBaseline />
        <AuthProvider value={mergedAuthValue}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { authValue, initialEntries, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
