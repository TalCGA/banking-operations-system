import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../api/axiosConfig';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/transactions');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Failed to fetch transactions');
    }
  }
);

export const postTransaction = createAsyncThunk(
  'transactions/post',
  async (data, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/transactions/process', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Failed to process transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/transactions/${id}`, { amount });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || 'Failed to delete transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    list:               [],
    loading:            false,
    error:              null,
    latest:             null,
    editingTransaction: null,
    operationFeedback:  null,
  },
  reducers: {
    clearError:              (state)         => { state.error             = null; },
    clearLatest:             (state)         => { state.latest            = null; },
    clearOperationFeedback:  (state)         => { state.operationFeedback = null; },
    setEditingTransaction:   (state, action) => { state.editingTransaction = action.payload; },
    clearEditingTransaction: (state)         => { state.editingTransaction = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(postTransaction.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.latest  = null;
      })
      .addCase(postTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.latest  = action.payload;
        state.list    = [action.payload, ...state.list];
      })
      .addCase(postTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.editingTransaction = null;
        state.operationFeedback  = action.payload.status === 'Success'
          ? { message: 'Transaction updated successfully!',                                    severity: 'success' }
          : { message: 'Simulated Provider Rejection: The bank declined this operation.',      severity: 'warning' };
      })
      .addCase(updateTransaction.rejected, (state) => {
        state.loading           = false;
        state.operationFeedback = { message: 'System Error: A technical issue occurred. Please check the logs.', severity: 'error' };
      })

      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = state.list.filter((t) => t.id !== action.payload);
        if (state.editingTransaction?.id === action.payload) state.editingTransaction = null;
        state.operationFeedback = { message: 'Transaction cancelled and removed.', severity: 'success' };
      })
      .addCase(deleteTransaction.rejected, (state) => {
        state.loading           = false;
        state.operationFeedback = { message: 'System Error: A technical issue occurred. Please check the logs.', severity: 'error' };
      });
  },
});

export const {
  clearError,
  clearLatest,
  clearOperationFeedback,
  setEditingTransaction,
  clearEditingTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;
