const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const transactionService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/api/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  create: async (transaction) => {
    const res = await fetch(`${API_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },
};
