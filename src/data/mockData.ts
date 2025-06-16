// Mock data for the Family Finance AI application

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
  lastUpdated: string;
}

export interface DashboardMetrics {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  monthlyBudget: number;
}

export const mockTransactions: Transaction[] = [
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
];

export const mockWarehouseItems: WarehouseItem[] = [
  {
    id: '1',
    name: 'Rice',
    currentStock: 5,
    minStock: 10,
    unit: 'kg',
    category: 'Food',
    lastUpdated: '2024-01-14'
  },
  {
    id: '2',
    name: 'Cooking Oil',
    currentStock: 2,
    minStock: 3,
    unit: 'bottles',
    category: 'Food',
    lastUpdated: '2024-01-13'
  },
  {
    id: '3',
    name: 'Tissue Paper',
    currentStock: 15,
    minStock: 5,
    unit: 'packs',
    category: 'Household',
    lastUpdated: '2024-01-12'
  },
  {
    id: '4',
    name: 'Shampoo',
    currentStock: 1,
    minStock: 2,
    unit: 'bottles',
    category: 'Personal Care',
    lastUpdated: '2024-01-11'
  },
  {
    id: '5',
    name: 'Detergent',
    currentStock: 8,
    minStock: 3,
    unit: 'packs',
    category: 'Household',
    lastUpdated: '2024-01-10'
  }
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalIncome: 5500000,
  totalExpenses: 450000,
  totalSavings: 5050000,
  monthlyBudget: 6000000
};

export const categories = [
  'Food',
  'Transportation',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Investment',
  'Others'
];

export const paymentMethods = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'QRIS',
  'E-Wallet',
  'Mobile Banking'
];

export const aiAssistants = [
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖' },
  { id: 'gemini', name: 'Google Gemini', icon: '✨' },
  { id: 'claude', name: 'Claude', icon: '🧠' }
];