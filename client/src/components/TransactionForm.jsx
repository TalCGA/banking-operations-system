import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Stack, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { postTransaction, fetchTransactions } from '../store/transactionSlice';

const INITIAL_FORM = {
  fullNameHebrew:  '',
  fullNameEnglish: '',
  birthDate:       '',
  personalId:      '',
  amount:          '',
  accountNumber:   '',
  actionType:      'Deposit',
};

const HEBREW_REGEX  = /^[\u05D0-\u05EA\s\-']+$/;
const ENGLISH_REGEX = /^[A-Za-z\s\-']+$/;

function validate(form) {
  const errors = {};

  if (!form.fullNameHebrew.trim()) {
    errors.fullNameHebrew = 'Required';
  } else if (form.fullNameHebrew.length > 20) {
    errors.fullNameHebrew = 'Max 20 characters';
  } else if (!HEBREW_REGEX.test(form.fullNameHebrew)) {
    errors.fullNameHebrew = 'Hebrew letters, spaces, hyphens and apostrophes only';
  }

  if (!form.fullNameEnglish.trim()) {
    errors.fullNameEnglish = 'Required';
  } else if (form.fullNameEnglish.length > 15) {
    errors.fullNameEnglish = 'Max 15 characters';
  } else if (!ENGLISH_REGEX.test(form.fullNameEnglish)) {
    errors.fullNameEnglish = 'English letters, spaces, hyphens and apostrophes only';
  }

  if (!form.birthDate) {
    errors.birthDate = 'Required';
  } else if (new Date(form.birthDate) >= new Date(new Date().toDateString())) {
    errors.birthDate = 'Must be a past date.';
  }

  if (!form.personalId) {
    errors.personalId = 'Required';
  } else if (!/^\d{9}$/.test(form.personalId)) {
    errors.personalId = 'Must be exactly 9 digits';
  }

  if (!form.amount) {
    errors.amount = 'Required';
  } else if (isNaN(Number(form.amount)) || Number(form.amount) < 0.01) {
    errors.amount = 'Must be a positive number';
  } else if (Number(form.amount) > 9999999999.99) {
    errors.amount = 'Exceeds maximum allowed amount';
  }

  if (!form.accountNumber) {
    errors.accountNumber = 'Required';
  } else if (!/^\d{1,10}$/.test(form.accountNumber)) {
    errors.accountNumber = 'Up to 10 digits, numbers only';
  }

  return errors;
}

function TransactionForm() {
  const dispatch = useDispatch();
  const loading  = useSelector((state) => state.transactions.loading);

  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await dispatch(postTransaction({
        fullNameHebrew:  form.fullNameHebrew.trim(),
        fullNameEnglish: form.fullNameEnglish.trim(),
        birthDate:       form.birthDate,
        personalId:      form.personalId,
        amount:          parseFloat(form.amount),
        accountNumber:   form.accountNumber,
        actionType:      form.actionType,
      })).unwrap();
      dispatch(fetchTransactions());
      setForm(INITIAL_FORM);
      setErrors({});
    } catch {
    }
  };

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
        New Transaction
      </Typography>

      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        spacing={1.5}
        sx={{ mt: 1 }}
      >
        <TextField
          label="Full Name (Hebrew)"
          name="fullNameHebrew"
          value={form.fullNameHebrew}
          onChange={handleChange}
          error={!!errors.fullNameHebrew}
          helperText={errors.fullNameHebrew || 'Max 20 chars — Hebrew only'}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { dir: 'rtl', maxLength: 20 } }}
        />

        <TextField
          label="Full Name (English)"
          name="fullNameEnglish"
          value={form.fullNameEnglish}
          onChange={handleChange}
          error={!!errors.fullNameEnglish}
          helperText={errors.fullNameEnglish || 'Max 15 chars — English only'}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 15 } }}
        />

        <TextField
          label="Birth Date"
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={handleChange}
          error={!!errors.birthDate}
          helperText={errors.birthDate || ' '}
          size="small"
          required
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { max: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
          }}
        />

        <TextField
          label="Personal ID"
          name="personalId"
          value={form.personalId}
          onChange={handleChange}
          error={!!errors.personalId}
          helperText={errors.personalId || 'Exactly 9 digits'}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 9, inputMode: 'numeric' } }}
        />

        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          error={!!errors.amount}
          helperText={errors.amount || 'Up to 10 digits'}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { min: 0.01, step: '0.01' } }}
        />

        <TextField
          label="Account Number"
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber || 'Up to 10 digits'}
          size="small"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric' } }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Action Type</InputLabel>
          <Select
            name="actionType"
            value={form.actionType}
            label="Action Type"
            onChange={handleChange}
          >
            <MenuItem value="Deposit">Deposit</MenuItem>
            <MenuItem value="Withdrawal">Withdrawal</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          size="large"
          disabled={loading}
          endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          fullWidth
          sx={{ mt: 1 }}
        >
          {loading ? 'Processing…' : 'Submit Transaction'}
        </Button>
      </Stack>
    </Paper>
  );
}

export default TransactionForm;
