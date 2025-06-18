import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import { safeArray, safeFilter, safeReduce, safeSlice, safeNumber, safeString, isEmpty } from '../utils/safeArrayUtils';

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
  getTransactionsByType: (type: 'income' | 'expense') => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
  getTransactionCount: () => number;
  hasTransactions: () => boolean;
  getAverageTransactionAmount: () => number;
  getCategoryTotals: () => Record<string, { income: number; expense: number; net: number }>;
  
  // Local state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  tryFallbackData: () => Promise<void>;
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
  },
  {
    id: 'default-3',
    type: 'expense',
    amount: 50000,
    category: 'Transportation',
    description: 'Ojek Online',
    paymentMethod: 'E-Wallet',
    date: new Date().toISOString().split('T')[0]
  }
];

const validateTransaction = (transaction: any): transaction is Transaction => {
  return (
    transaction &&
    typeof transaction === 'object' &&
    typeof transaction.id === 'string' &&
    ['income', 'expense'].includes(transaction.type) &&
    typeof transaction.amount === 'number' &&
    transaction.amount > 0 &&
    typeof transaction.category === 'string' &&
    typeof transaction.description === 'string' &&
    typeof transaction.paymentMethod === 'string' &&
    typeof transaction.date === 'string'
  );
};

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
          
          // Handle null or empty response with safe array operations
          const validTransactions = safeFilter(transactions, validateTransaction);

          set({ 
            transactions: validTransactions, 
            loading: false, 
            initialized: true 
          });

          // If no valid transactions, try fallback
          if (isEmpty(validTransactions)) {
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
          const validDummyTransactions = safeFilter(dummyTransactions, validateTransaction);

          if (isNotEmpty(validDummyTransactions)) {
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
        // Validate input with safe operations
        if (!transaction || typeof transaction !== 'object') {
          set({ error: 'Invalid transaction data' });
          return;
        }

        const amount = safeNumber(transaction.amount);
        const description = safeString(transaction.description).trim();
        const category = safeString(transaction.category).trim();
        const paymentMethod = safeString(transaction.paymentMethod).trim();

        if (amount <= 0) {
          set({ error: 'Transaction amount must be greater than 0' });
          return;
        }

        if (!description) {
          set({ error: 'Transaction description is required' });
          return;
        }

        if (!category) {
          set({ error: 'Transaction category is required' });
          return;
        }

        if (!paymentMethod) {
          set({ error: 'Payment method is required' });
          return;
        }

        set({ loading: true, error: null });
        try {
          const newTransaction = await apiService.createTransaction({
            ...transaction,
            amount,
            description,
            category,
            paymentMethod
          });
          
          if (newTransaction && newTransaction.id) {
            set((state) => ({
              transactions: [newTransaction, ...safeArray(state.transactions)],
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
            amount,
            description,
            category,
            paymentMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            transactions: [localTransaction, ...safeArray(state.transactions)],
            error: 'Transaction saved locally - API unavailable',
          }));
        }
      },

      updateTransaction: async (id, updatedTransaction) => {
        if (!id || !updatedTransaction || typeof updatedTransaction !== 'object') {
          set({ error: 'Invalid update data' });
          return;
        }

        const transactions = safeArray(get().transactions);
        const existingTransaction = transactions.find(t => t.id === id);
        if (!existingTransaction) {
          set({ error: 'Transaction not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          // API doesn't have update endpoint, handle locally
          set((state) => ({
            transactions: safeArray(state.transactions).map((transaction) =>
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

        const transactions = safeArray(get().transactions);
        const existingTransaction = transactions.find(t => t.id === id);
        if (!existingTransaction) {
          set({ error: 'Transaction not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          // API doesn't have delete endpoint, handle locally
          set((state) => ({
            transactions: safeFilter(state.transactions, (transaction) => transaction.id !== id),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
          set({ error: errorMessage, loading: false });
        }
      },

      // Computed values with null safety
      getTransactionsByCategory: (category) => {
        const transactions = safeArray(get().transactions);
        if (!category || typeof category !== 'string') return [];
        return safeFilter(transactions, (transaction) => 
          transaction && transaction.category === category
        );
      },

      getTransactionsByType: (type) => {
        const transactions = safeArray(get().transactions);
        return safeFilter(transactions, (transaction) => 
          transaction && transaction.type === type
        );
      },

      getTransactionsByDateRange: (startDate, endDate) => {
        const transactions = safeArray(get().transactions);
        if (!startDate || !endDate) return transactions;
        
        return safeFilter(transactions, (transaction) => {
          if (!transaction || !transaction.date) return false;
          const transactionDate = new Date(transaction.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return transactionDate >= start && transactionDate <= end;
        });
      },

      getRecentTransactions: (limit = 10) => {
        const transactions = safeArray(get().transactions);
        const sortedTransactions = [...transactions].sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB.getTime() - dateA.getTime();
        });
        return safeSlice(sortedTransactions, 0, limit);
      },

      getTotalIncome: () => {
        const transactions = safeArray(get().transactions);
        return safeReduce(
          safeFilter(transactions, (t) => t && t.type === 'income'),
          (sum, transaction) => sum + safeNumber(transaction.amount),
          0
        );
      },

      getTotalExpenses: () => {
        const transactions = safeArray(get().transactions);
        return safeReduce(
          safeFilter(transactions, (t) => t && t.type === 'expense'),
          (sum, transaction) => sum + safeNumber(transaction.amount),
          0
        );
      },

      getNetBalance: () => {
        const transactions = safeArray(get().transactions);
        return safeReduce(transactions, (sum, transaction) => {
          if (!transaction) return sum;
          const amount = safeNumber(transaction.amount);
          return sum + (transaction.type === 'income' ? amount : -amount);
        }, 0);
      },

      getTransactionCount: () => {
        const transactions = safeArray(get().transactions);
        return safeFilter(transactions, t => t && t.id).length;
      },

      hasTransactions: () => {
        const transactions = safeArray(get().transactions);
        return transactions.length > 0;
      },

      getAverageTransactionAmount: () => {
        const transactions = safeArray(get().transactions);
        const validTransactions = safeFilter(transactions, t => t && typeof t.amount === 'number');
        
        if (isEmpty(validTransactions)) return 0;
        
        const total = safeReduce(validTransactions, (sum, t) => sum + safeNumber(t.amount), 0);
        return total / validTransactions.length;
      },

      getCategoryTotals: () => {
        const transactions = safeArray(get().transactions);
        const categoryTotals: Record<string, { income: number; expense: number; net: number }> = {};
        
        transactions.forEach(transaction => {
          if (!transaction || !transaction.category) return;
          
          const category = transaction.category;
          const amount = safeNumber(transaction.amount);
          
          if (!categoryTotals[category]) {
            categoryTotals[category] = { income: 0, expense: 0, net: 0 };
          }
          
          if (transaction.type === 'income') {
            categoryTotals[category].income += amount;
            categoryTotals[category].net += amount;
          } else {
            categoryTotals[category].expense += amount;
            categoryTotals[category].net -= amount;
          }
        });
        
        return categoryTotals;
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
        transactions: safeArray(state.transactions),
        initialized: state.initialized
      }),
    }
  )
);