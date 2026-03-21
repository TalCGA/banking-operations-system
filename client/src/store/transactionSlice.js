import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../api/axiosConfig';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/transactions');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to fetch transactions'
      );
    }
  }
);

export const postTransaction = createAsyncThunk(
  'transactions/post',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/transactions/process', transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to process transaction'
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    list:    [],
    loading: false,
    error:   null,
    latest:  null,   // result of the most recent POST
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearLatest: (state) => { state.latest = null; },
  },
  extraReducers: (builder) => {
    // ── fetchTransactions ──
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
      });

    // ── postTransaction ──
    builder
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
      });
  },
});

export const { clearError, clearLatest } = transactionSlice.actions;
export default transactionSlice.reducer;
