import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, AppBar, Toolbar, Typography, Snackbar, Alert } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TransactionForm from './components/TransactionForm';
import EditTransactionForm from './components/EditTransactionForm';
import TransactionList from './components/TransactionList';
import { clearError, clearLatest, clearOperationFeedback } from './store/transactionSlice';

function App() {
  const dispatch = useDispatch();
  const { error, latest, editingTransaction, operationFeedback } = useSelector((state) => state.transactions);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!latest) return;
    const isSuccess = latest.status === 'Success';
    setSnackbar({
      open:     true,
      severity: isSuccess ? 'success' : 'warning',
      message:  isSuccess
        ? `${latest.actionType} of ₪${Number(latest.amount).toLocaleString()} processed successfully`
        : 'Simulated Provider Rejection: The bank declined this operation.',
    });
  }, [latest]);

  useEffect(() => {
    if (!error) return;
    setSnackbar({ open: true, severity: 'error', message: 'System Error: A technical issue occurred. Please check the logs.' });
  }, [error]);

  useEffect(() => {
    if (!operationFeedback) return;
    setSnackbar({ open: true, severity: operationFeedback.severity, message: operationFeedback.message });
  }, [operationFeedback]);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
    dispatch(clearError());
    dispatch(clearLatest());
    dispatch(clearOperationFeedback());
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>

      <AppBar position="static" elevation={0} sx={{ flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1">Banking Operations System</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: { xs: 'auto', md: 'hidden' }, p: { xs: 1.5, md: 2.5 } }}>
        <Box
          sx={{
            flex: { md: 1 },
            minHeight: { md: 0 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            gap: 3,
          }}
        >
          <Box sx={{ width: { xs: '100%', md: '25%' }, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            {editingTransaction ? <EditTransactionForm /> : <TransactionForm />}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <TransactionList />
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
