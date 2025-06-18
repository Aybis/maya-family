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
  
  // Actions
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Computed values
  getTransactionsByCategory: (category: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
  
  // Local state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      error: null,

      // API Actions
      fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
          const transactions = await apiService.getTransactions();
          set({ transactions, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
          set({ error: errorMessage, loading: false });
          
          // Fallback to dummy data if API fails
          try {
            const dummyTransactions = await apiService.getDummyTransactions();
            set({ transactions: dummyTransactions, error: null });
          } catch (dummyError) {
            console.error('Failed to fetch dummy data:', dummyError);
          }
        }
      },

      addTransaction: async (transaction) => {
        set({ loading: true, error: null });
        try {
          const newTransaction = await apiService.createTransaction(transaction);
          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add transaction';
          set({ error: errorMessage, loading: false });
          
          // Fallback to local storage
          const localTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            transactions: [localTransaction, ...state.transactions],
            error: null,
          }));
        }
      },

      updateTransaction: async (id, updatedTransaction) => {
        set({ loading: true, error: null });
        try {
          // Note: API doesn't have update endpoint, so we'll handle locally
          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id 
                ? { ...transaction, ...updatedTransaction, updatedAt: new Date().toISOString() }
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
        set({ loading: true, error: null });
        try {
          // Note: API doesn't have delete endpoint, so we'll handle locally
          set((state) => ({
            transactions: state.transactions.filter((transaction) => transaction.id !== id),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
          set({ error: errorMessage, loading: false });
        }
      },

      // Computed values
      getTransactionsByCategory: (category) => {
        return get().transactions.filter((transaction) => transaction.category === category);
      },

      getTotalIncome: () => {
        return get().transactions
          .filter((transaction) => transaction.type === 'income')
          .reduce((sum, transaction) => sum + transaction.amount, 0);
      },

      getTotalExpenses: () => {
        return get().transactions
          .filter((transaction) => transaction.type === 'expense')
          .reduce((sum, transaction) => sum + transaction.amount, 0);
      },

      getNetBalance: () => {
        return get().transactions.reduce(
          (sum, transaction) => sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
          0
        );
      },

      // Local state management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({ 
        transactions: state.transactions 
      }),
    }
  )
);