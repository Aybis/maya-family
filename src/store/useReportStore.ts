import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';

interface CategoryBreakdown {
  category: string;
  income: number;
  expense: number;
  net: number;
  percentage: number;
}

interface MonthlyReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryBreakdown: CategoryBreakdown[];
  transactionCount: number;
  savingsRate: number;
  averageTransactionAmount: number;
  topCategories: CategoryBreakdown[];
}

interface ReportStore {
  monthlyReport: MonthlyReport | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  fetchMonthlyReport: (month?: string) => Promise<void>;
  generateLocalReport: () => MonthlyReport | null;
  
  // Computed values with null safety
  hasReport: () => boolean;
  getSavingsRate: () => number;
  getTopExpenseCategories: (limit?: number) => CategoryBreakdown[];
  getIncomeVsExpenseRatio: () => number;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  tryFallbackData: (month?: string) => Promise<void>;
}

const generateDefaultReport = (): MonthlyReport => {
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return {
    month,
    year,
    totalIncome: 5500000,
    totalExpenses: 450000,
    netBalance: 5050000,
    categoryBreakdown: [
      {
        category: 'Food',
        income: 0,
        expense: 250000,
        net: -250000,
        percentage: 55.6
      },
      {
        category: 'Transportation',
        income: 0,
        expense: 50000,
        net: -50000,
        percentage: 11.1
      },
      {
        category: 'Bills',
        income: 0,
        expense: 150000,
        net: -150000,
        percentage: 33.3
      },
      {
        category: 'Salary',
        income: 5000000,
        expense: 0,
        net: 5000000,
        percentage: 90.9
      },
      {
        category: 'Freelance',
        income: 500000,
        expense: 0,
        net: 500000,
        percentage: 9.1
      }
    ],
    transactionCount: 5,
    savingsRate: 91.8,
    averageTransactionAmount: 1100000,
    topCategories: []
  };
};

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      monthlyReport: null,
      loading: false,
      error: null,
      initialized: false,

      fetchMonthlyReport: async (month) => {
        set({ loading: true, error: null });
        try {
          const report = await apiService.getMonthlyReport(month);
          
          // Validate report data
          if (report && typeof report === 'object') {
            const validatedReport: MonthlyReport = {
              month: report.month || new Date().toLocaleString('default', { month: 'long' }),
              year: report.year || new Date().getFullYear(),
              totalIncome: typeof report.totalIncome === 'number' ? report.totalIncome : 0,
              totalExpenses: typeof report.totalExpenses === 'number' ? report.totalExpenses : 0,
              netBalance: typeof report.netBalance === 'number' ? report.netBalance : 0,
              categoryBreakdown: Array.isArray(report.categoryBreakdown) ? report.categoryBreakdown : [],
              transactionCount: typeof report.transactionCount === 'number' ? report.transactionCount : 0,
              savingsRate: typeof report.savingsRate === 'number' ? report.savingsRate : 0,
              averageTransactionAmount: typeof report.averageTransactionAmount === 'number' ? report.averageTransactionAmount : 0,
              topCategories: Array.isArray(report.topCategories) ? report.topCategories : []
            };

            set({ 
              monthlyReport: validatedReport, 
              loading: false, 
              initialized: true 
            });
          } else {
            throw new Error('Invalid report data received');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch monthly report';
          set({ error: errorMessage, loading: false, initialized: true });
          
          // Try fallback data
          await get().tryFallbackData(month);
        }
      },

      tryFallbackData: async (month) => {
        try {
          // Try dummy API first
          const dummyReport = await apiService.getDummyReports('user1', month);
          
          if (dummyReport && typeof dummyReport === 'object') {
            const validatedReport: MonthlyReport = {
              month: dummyReport.month || new Date().toLocaleString('default', { month: 'long' }),
              year: dummyReport.year || new Date().getFullYear(),
              totalIncome: typeof dummyReport.totalIncome === 'number' ? dummyReport.totalIncome : 0,
              totalExpenses: typeof dummyReport.totalExpenses === 'number' ? dummyReport.totalExpenses : 0,
              netBalance: typeof dummyReport.netBalance === 'number' ? dummyReport.netBalance : 0,
              categoryBreakdown: Array.isArray(dummyReport.categoryBreakdown) ? dummyReport.categoryBreakdown : [],
              transactionCount: typeof dummyReport.transactionCount === 'number' ? dummyReport.transactionCount : 0,
              savingsRate: typeof dummyReport.savingsRate === 'number' ? dummyReport.savingsRate : 0,
              averageTransactionAmount: typeof dummyReport.averageTransactionAmount === 'number' ? dummyReport.averageTransactionAmount : 0,
              topCategories: Array.isArray(dummyReport.topCategories) ? dummyReport.topCategories : []
            };

            set({ 
              monthlyReport: validatedReport, 
              error: 'Using demo data - API unavailable' 
            });
          } else {
            // Final fallback to default data
            set({ 
              monthlyReport: generateDefaultReport(), 
              error: 'Using default data - API and demo data unavailable' 
            });
          }
        } catch (dummyError) {
          console.error('Dummy API also failed:', dummyError);
          // Use default report as final fallback
          set({ 
            monthlyReport: generateDefaultReport(), 
            error: 'Using default data - All APIs unavailable' 
          });
        }
      },

      generateLocalReport: () => {
        try {
          // This would integrate with transaction store to generate a report
          // For now, return default report
          return generateDefaultReport();
        } catch (error) {
          console.error('Failed to generate local report:', error);
          return null;
        }
      },

      // Computed values with null safety
      hasReport: () => {
        const report = get().monthlyReport;
        return report !== null && typeof report === 'object';
      },

      getSavingsRate: () => {
        const report = get().monthlyReport;
        if (!report || typeof report.savingsRate !== 'number') return 0;
        return Math.max(0, Math.min(100, report.savingsRate));
      },

      getTopExpenseCategories: (limit = 5) => {
        const report = get().monthlyReport;
        if (!report || !Array.isArray(report.categoryBreakdown)) return [];
        
        return report.categoryBreakdown
          .filter(category => category && typeof category.expense === 'number' && category.expense > 0)
          .sort((a, b) => (b.expense || 0) - (a.expense || 0))
          .slice(0, limit);
      },

      getIncomeVsExpenseRatio: () => {
        const report = get().monthlyReport;
        if (!report || typeof report.totalIncome !== 'number' || typeof report.totalExpenses !== 'number') {
          return 0;
        }
        
        if (report.totalExpenses === 0) return report.totalIncome > 0 ? Infinity : 0;
        return report.totalIncome / report.totalExpenses;
      },

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({ 
        monthlyReport: null, 
        loading: false, 
        error: null, 
        initialized: false 
      }),
    }),
    {
      name: 'report-storage',
      partialize: (state) => ({ 
        monthlyReport: state.monthlyReport,
        initialized: state.initialized
      }),
    }
  )
);