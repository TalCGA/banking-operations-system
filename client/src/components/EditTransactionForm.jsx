import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Typography, TextField, Button, Stack, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { updateTransaction, clearEditingTransaction } from '../store/transactionSlice';

function formatDate(dateString) {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  return `${d}/${m}/${y}`;
}

function EditTransactionForm() {
  const dispatch = useDispatch();
  const loading  = useSelector((state) => state.transactions.loading);
  const tx       = useSelector((state) => state.transactions.editingTransaction);

  const [amount,      setAmount]      = useState(tx?.amount?.toString() ?? '');
  const [amountError, setAmountError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const validateAmount = () => {
    if (!amount) return 'Required';
    if (isNaN(Number(amount)) || Number(amount) < 0.01) return 'Must be a positive number';
    if (Number(amount) > 9999999999.99) return 'Exceeds maximum allowed amount';
    return '';
  };

  const handleUpdateClick = () => {
    const err = validateAmount();
    if (err) { setAmountError(err); return; }
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      await dispatch(updateTransaction({ id: tx.id, amount: parseFloat(amount) })).unwrap();
    } catch {
    }
  };

  if (!tx) return null;

  const disabledProps = { size: 'small', fullWidth: true, disabled: true };

  return (
    <Paper
      sx={{
        p: 3,
        flex: { md: 1 },
        display: 'flex',
        flexDirection: 'column',
        overflow: { xs: 'auto', md: 'hidden' },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Edit Transaction
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Only the amount can be modified.
      </Typography>

      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="Full Name (Hebrew)"
          value={tx.fullNameHebrew}
          slotProps={{ htmlInput: { dir: 'rtl' } }}
          {...disabledProps}
        />

        <TextField
          label="Full Name (English)"
          value={tx.fullNameEnglish}
          {...disabledProps}
        />

        <TextField
          label="Birth Date"
          value={formatDate(tx.birthDate)}
          slotProps={{ inputLabel: { shrink: true } }}
          {...disabledProps}
        />

        <TextField
          label="Personal ID"
          value={tx.personalId}
          {...disabledProps}
        />

        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
          error={!!amountError}
          helperText={amountError || 'Up to 10 digits'}
          size="small"
          required
          fullWidth
          autoFocus
          slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
        />

        <TextField
          label="Account Number"
          value={tx.accountNumber}
          {...disabledProps}
        />

        <TextField
          label="Action Type"
          value={tx.actionType}
          {...disabledProps}
        />
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mt: 'auto', pt: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<CloseIcon />}
          onClick={() => dispatch(clearEditingTransaction())}
          disabled={loading}
          fullWidth
        >
          Cancel
        </Button>

        <Button
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditOutlinedIcon />}
          onClick={handleUpdateClick}
          disabled={loading}
          fullWidth
        >
          Update
        </Button>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{tx.status === 'Failed' ? 'Confirm Retry' : 'Confirm Update'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {tx.status === 'Failed'
              ? <>Retry this failed transaction with amount <strong>₪{Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>? A new bank request will be made.</>
              : <>Update the amount to <strong>₪{Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>?</>
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={() => setConfirmOpen(false)}>
            Back
          </Button>
          <Button onClick={handleConfirm} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default EditTransactionForm;
