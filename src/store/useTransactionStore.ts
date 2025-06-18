import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Computed values with null safety
  getTransactionsByCategory: (category: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
  getTransactionCount: () => number;
  hasTransactions: () => boolean;
  
  // Local state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const defaultTransactions: Transaction[] = [
  {
    id: 'default-1',
    type: 'income',
    amount: 5000000,
    category: 'Salary',
    description: 'Monthly salary',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'default-2',
    type: 'expense',
    amount: 250000,
    category: 'Food',
    description: 'Groceries at Supermarket',
    paymentMethod: 'QRIS',
    date: new Date().toISOString().split('T')[0]
  }
];

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      error: null,
      initialized: false,

      // API Actions
      fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
          const transactions = await apiService.getTransactions();
          
          // Handle null or empty response
          const validTransactions = Array.isArray(transactions) && transactions.length > 0 
            ? transactions.filter(t => t && typeof t === 'object' && t.id)
            : [];

          set({ 
            transactions: validTransactions, 
            loading: false, 
            initialized: true 
          });

          // If no valid transactions, try fallback
          if (validTransactions.length === 0) {
            await get().tryFallbackData();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
          set({ error: errorMessage, loading: false, initialized: true });
          
          // Always try fallback on error
          await get().tryFallbackData();
        }
      },

      tryFallbackData: async () => {
        try {
          // Try dummy API first
          const dummyTransactions = await apiService.getDummyTransactions();
          const validDummyTransactions = Array.isArray(dummyTransactions) && dummyTransactions.length > 0
            ? dummyTransactions.filter(t => t && typeof t === 'object' && t.id)
            : [];

          if (validDummyTransactions.length > 0) {
            set({ 
              transactions: validDummyTransactions, 
              error: 'Using demo data - API unavailable' 
            });
          } else {
            // Final fallback to default data
            set({ 
              transactions: defaultTransactions, 
              error: 'Using default data - API and demo data unavailable' 
            });
          }
        } catch (dummyError) {
          console.error('Dummy API also failed:', dummyError);
          // Use default transactions as final fallback
          set({ 
            transactions: defaultTransactions, 
            error: 'Using default data - All APIs unavailable' 
          });
        }
      },

      addTransaction: async (transaction) => {
        // Validate input
        if (!transaction || typeof transaction !== 'object') {
          set({ error: 'Invalid transaction data' });
          return;
        }

        if (!transaction.amount || transaction.amount <= 0) {
          set({ error: 'Transaction amount must be greater than 0' });
          return;
        }

        if (!transaction.description?.trim()) {
          set({ error: 'Transaction description is required' });
          return;
        }

        set({ loading: true, error: null });
        try {
          const newTransaction = await apiService.createTransaction(transaction);
          
          if (newTransaction && newTransaction.id) {
            set((state) => ({
              transactions: [newTransaction, ...state.transactions],
              loading: false,
            }));
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction';
          set({ error: errorMessage, loading: false });
          
          // Fallback to local storage
          const localTransaction: Transaction = {
            ...transaction,
            id: `local-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            transactions: [localTransaction, ...state.transactions],
            error: 'Transaction saved locally - API unavailable',
          }));
        }
      },

      updateTransaction: async (id, updatedTransaction) => {
        if (!id || !updatedTransaction || typeof updatedTransaction !== 'object') {
          set({ error: 'Invalid update data' });
          return;
        }

        const existingTransaction = get().transactions.find(t => t.id === id);
        if (!existingTransaction) {
          set({ error: 'Transaction not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          // API doesn't have update endpoint, handle locally
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id 
                ? { 
                    ...transaction, 
                    ...updatedTransaction, 
                    updatedAt: new Date().toISOString() 
                  }
                : transaction
            ),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
          set({ error: errorMessage, loading: false });
        }
      },

      deleteTransaction: async (id) => {
        if (!id) {
          set({ error: 'Invalid transaction ID' });
          return;
        }

        const existingTransaction = get().transactions.find(t => t.id === id);
        if (!existingTransaction) {
          set({ error: 'Transaction not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          // API doesn't have delete endpoint, handle locally
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
          set({ error: errorMessage, loading: false });
        }
      },

      // Computed values with null safety
      getTransactionsByCategory: (category) => {
        const transactions = get().transactions || [];
        if (!category || typeof category !== 'string') return [];
        return transactions.filter((transaction) => 
          transaction && transaction.category === category
        );
      },

      getTotalIncome: () => {
        const transactions = get().transactions || [];
        return transactions
          .filter((transaction) => transaction && transaction.type === 'income' && typeof transaction.amount === 'number')
          .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      },

      getTotalExpenses: () => {
        const transactions = get().transactions || [];
        return transactions
          .filter((transaction) => transaction && transaction.type === 'expense' && typeof transaction.amount === 'number')
          .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
      },

      getNetBalance: () => {
        const transactions = get().transactions || [];
        return transactions.reduce((sum, transaction) => {
          if (!transaction || typeof transaction.amount !== 'number') return sum;
          return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
        }, 0);
      },

      getTransactionCount: () => {
        const transactions = get().transactions || [];
        return transactions.filter(t => t && t.id).length;
      },

      hasTransactions: () => {
        const transactions = get().transactions || [];
        return transactions.length > 0;
      },

      // Local state management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({ 
        transactions: [], 
        loading: false, 
        error: null, 
        initialized: false 
      }),
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({ 
        transactions: state.transactions || [],
        initialized: state.initialized
      }),
    }
  )
);