import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import App from './App.jsx';
import './index.css';

const SYSTEM_FONT = [
  '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
  '"Helvetica Neue"', 'Arial', 'sans-serif',
].join(',');

const theme = createTheme({
  typography: {
    fontFamily: SYSTEM_FONT,
    h1: { fontWeight: 600 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 },
    h4: { fontWeight: 600 }, h5: { fontWeight: 600 }, h6: { fontWeight: 600 },
  },
  palette: {
    primary:    { main: '#1A237E' },
    secondary:  { main: '#00C853' },
    error:      { main: '#D32F2F' },
    background: { default: '#F4F6F8', paper: '#FFFFFF' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps:   { variant: 'contained' },
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiPaper: {
      defaultProps:   { elevation: 1 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
