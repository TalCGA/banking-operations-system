import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Box, Alert, Skeleton,
  TablePagination, IconButton, Tooltip, TextField, InputAdornment,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { fetchTransactions } from '../store/transactionSlice';

const ROWS_PER_PAGE = 8;

const COLUMNS = ['Date', 'Name (HE)', 'Name (EN)', 'Personal ID', 'Amount', 'Account', 'Type', 'Status'];

const STATUS_CONFIG = {
  Success: { color: 'success', label: 'Success' },
  Failed:  { color: 'error',   label: 'Failed'  },
};

const ACTION_CONFIG = {
  Deposit:    { color: 'default' },
  Withdrawal: { color: 'default' },
};

const NAVY_TOOLTIP_PROPS = {
  tooltip: {
    sx: {
      bgcolor: '#1A237E',
      fontSize: '0.8rem',
      '& .MuiTooltip-arrow': { color: '#1A237E' },
    },
  },
};

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatAmount(amount) {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {COLUMNS.map((col) => (
        <TableCell key={col}>
          <Skeleton variant="rectangular" height={20} sx={{ borderRadius: 1 }} />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function TransactionList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.transactions);

  const [page,   setPage]   = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchTransactions()); }, [dispatch]);

  const query    = search.trim().toLowerCase();
  const filtered = query
    ? list.filter((tx) =>
        tx.fullNameEnglish?.toLowerCase().includes(query) ||
        tx.fullNameHebrew?.toLowerCase().includes(query)  ||
        tx.accountNumber?.toString().includes(query)
      )
    : list;

  const visibleRows = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ flex: { md: 1 }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2,
          px: 3, py: 3,
          borderBottom: '1px solid', borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h6">Transaction History</Typography>
          {list.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {filtered.length}{query ? ` of ${list.length}` : ''} record{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        <TextField
          size="small"
          placeholder="Search name or account…"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: 250 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.1rem', color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {error && !loading && (
        <Alert severity="error" sx={{ mx: 3, mt: 2, flexShrink: 0 }}>
          {typeof error === 'string' ? error : 'Failed to load transactions. Is the server running?'}
        </Alert>
      )}

      <TableContainer sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 700, whiteSpace: 'nowrap', bgcolor: '#f8f9fa' }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center" sx={{ color: 'text.secondary', py: 8 }}>
                  {query ? 'No transactions match your search.' : 'No transactions yet. Submit one using the form.'}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((tx) => {
                const statusCfg = STATUS_CONFIG[tx.status] ?? { color: 'default', label: tx.status };
                const actionCfg = ACTION_CONFIG[tx.actionType] ?? { color: 'default' };

                return (
                  <TableRow key={tx.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(tx.transactionDate)}</TableCell>
                    <TableCell sx={{ direction: 'rtl' }}>{tx.fullNameHebrew}</TableCell>
                    <TableCell>{tx.fullNameEnglish}</TableCell>
                    <TableCell>{tx.personalId}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatAmount(tx.amount)}</TableCell>
                    <TableCell>{tx.accountNumber}</TableCell>
                    <TableCell>
                      <Chip label={tx.actionType} size="small" color={actionCfg.color} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip label={statusCfg.label} size="small" color={statusCfg.color} />
                        {tx.status === 'Failed' && tx.failureReason && (
                          <Tooltip
                            title={tx.failureReason}
                            placement="top"
                            arrow
                            componentsProps={NAVY_TOOLTIP_PROPS}
                          >
                            <IconButton size="small" color="error" sx={{ p: 0.2 }}>
                              <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[ROWS_PER_PAGE]}
        onPageChange={(_, newPage) => setPage(newPage)}
        sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}
      />
    </Paper>
  );
}

export default TransactionList;
