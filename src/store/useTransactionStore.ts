import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '../data/mockData';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByCategory: (category: string) => Transaction[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetBalance: () => number;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [
        {
          id: '1',
          type: 'income',
          amount: 5000000,
          category: 'Salary',
          description: 'Monthly salary',
          paymentMethod: 'Bank Transfer',
          date: '2024-01-15'
        },
        {
          id: '2',
          type: 'expense',
          amount: 250000,
          category: 'Food',
          description: 'Groceries at Supermarket',
          paymentMethod: 'QRIS',
          date: '2024-01-14'
        },
        {
          id: '3',
          type: 'expense',
          amount: 50000,
          category: 'Transportation',
          description: 'Ojek Online',
          paymentMethod: 'E-Wallet',
          date: '2024-01-14'
        },
        {
          id: '4',
          type: 'expense',
          amount: 150000,
          category: 'Bills',
          description: 'Electricity Bill',
          paymentMethod: 'Bank Transfer',
          date: '2024-01-13'
        },
        {
          id: '5',
          type: 'income',
          amount: 500000,
          category: 'Freelance',
          description: 'Web design project',
          paymentMethod: 'Bank Transfer',
          date: '2024-01-12'
        }
      ],

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },

      updateTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
        }));
      },

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
    }),
    {
      name: 'transaction-storage',
    }
  )
);