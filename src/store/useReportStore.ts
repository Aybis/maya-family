import { create } from 'zustand';
import { apiService } from '../services/api';

interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryBreakdown: Array<{
    category: string;
    income: number;
    expense: number;
  }>;
  transactionCount: number;
  savingsRate: number;
}

interface ReportStore {
  monthlyReport: MonthlyReport | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMonthlyReport: (month?: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useReportStore = create<ReportStore>((set, get) => ({
  monthlyReport: null,
  loading: false,
  error: null,

  fetchMonthlyReport: async (month) => {
    set({ loading: true, error: null });
    try {
      const report = await apiService.getMonthlyReport(month);
      set({ monthlyReport: report, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch monthly report';
      set({ error: errorMessage, loading: false });
      
      // Fallback to dummy data
      try {
        const dummyReport = await apiService.getDummyReports('user1', month);
        set({ monthlyReport: dummyReport, error: null });
      } catch (dummyError) {
        console.error('Failed to fetch dummy report data:', dummyError);
      }
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));