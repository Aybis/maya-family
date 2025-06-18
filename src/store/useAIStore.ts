import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AISettings {
  provider: 'openai' | 'gemini' | 'mock';
  apiKey: string;
  autoProcess: boolean;
  confidenceThreshold: number;
}

interface AIProcessingResult {
  amount: number;
  description: string;
  category: string;
  items: string[];
  merchant?: string;
  date?: string;
  confidence: number;
  timestamp: string;
}

interface AIStore {
  settings: AISettings;
  isProcessing: boolean;
  lastProcessedResult: AIProcessingResult | null;
  processingHistory: AIProcessingResult[];
  error: string | null;
  
  // Actions
  updateSettings: (settings: Partial<AISettings>) => void;
  setProcessing: (processing: boolean) => void;
  setLastResult: (result: AIProcessingResult | null) => void;
  addToHistory: (result: AIProcessingResult) => void;
  clearHistory: () => void;
  clearApiKey: () => void;
  setError: (error: string | null) => void;
  
  // Computed values with null safety
  hasValidSettings: () => boolean;
  getProcessingHistory: (limit?: number) => AIProcessingResult[];
  getAverageConfidence: () => number;
  isConfigured: () => boolean;
  
  // Validation
  validateSettings: () => string | null;
  reset: () => void;
}

const defaultSettings: AISettings = {
  provider: 'mock',
  apiKey: '',
  autoProcess: true,
  confidenceThreshold: 0.7
};

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isProcessing: false,
      lastProcessedResult: null,
      processingHistory: [],
      error: null,

      // Actions
      updateSettings: (newSettings) => {
        if (!newSettings || typeof newSettings !== 'object') {
          set({ error: 'Invalid settings data' });
          return;
        }

        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          
          // Validate settings
          const validationError = get().validateSettings();
          if (validationError) {
            return { error: validationError };
          }

          return {
            settings: updatedSettings,
            error: null
          };
        });
      },

      setProcessing: (processing) => {
        if (typeof processing !== 'boolean') {
          set({ error: 'Invalid processing state' });
          return;
        }
        set({ isProcessing: processing, error: null });
      },

      setLastResult: (result) => {
        if (result !== null && (!result || typeof result !== 'object')) {
          set({ error: 'Invalid result data' });
          return;
        }

        set({ lastProcessedResult: result, error: null });
        
        if (result) {
          get().addToHistory(result);
        }
      },

      addToHistory: (result) => {
        if (!result || typeof result !== 'object') {
          set({ error: 'Invalid result for history' });
          return;
        }

        const validatedResult: AIProcessingResult = {
          amount: typeof result.amount === 'number' ? result.amount : 0,
          description: typeof result.description === 'string' ? result.description : 'Unknown',
          category: typeof result.category === 'string' ? result.category : 'Others',
          items: Array.isArray(result.items) ? result.items.filter(item => typeof item === 'string') : [],
          merchant: typeof result.merchant === 'string' ? result.merchant : undefined,
          date: typeof result.date === 'string' ? result.date : undefined,
          confidence: typeof result.confidence === 'number' ? Math.max(0, Math.min(1, result.confidence)) : 0,
          timestamp: result.timestamp || new Date().toISOString()
        };

        set((state) => ({
          processingHistory: [validatedResult, ...(state.processingHistory || [])].slice(0, 50), // Keep last 50 results
          error: null
        }));
      },

      clearHistory: () => {
        set({ processingHistory: [], error: null });
      },

      clearApiKey: () => {
        set((state) => ({
          settings: { ...state.settings, apiKey: '' },
          error: null
        }));
      },

      setError: (error) => {
        set({ error });
      },

      // Computed values with null safety
      hasValidSettings: () => {
        const { settings } = get();
        if (!settings || typeof settings !== 'object') return false;
        
        if (settings.provider === 'mock') return true;
        
        return !!(settings.apiKey && settings.apiKey.trim().length > 0);
      },

      getProcessingHistory: (limit = 10) => {
        const history = get().processingHistory || [];
        if (typeof limit !== 'number' || limit <= 0) return history;
        return history.slice(0, limit);
      },

      getAverageConfidence: () => {
        const history = get().processingHistory || [];
        if (history.length === 0) return 0;
        
        const validResults = history.filter(result => 
          result && typeof result.confidence === 'number'
        );
        
        if (validResults.length === 0) return 0;
        
        const sum = validResults.reduce((acc, result) => acc + result.confidence, 0);
        return sum / validResults.length;
      },

      isConfigured: () => {
        const { settings } = get();
        if (!settings || typeof settings !== 'object') return false;
        
        return settings.provider === 'mock' || 
               (settings.apiKey && settings.apiKey.trim().length > 0);
      },

      // Validation
      validateSettings: () => {
        const { settings } = get();
        
        if (!settings || typeof settings !== 'object') {
          return 'Settings object is invalid';
        }

        if (!['openai', 'gemini', 'mock'].includes(settings.provider)) {
          return 'Invalid AI provider selected';
        }

        if (settings.provider !== 'mock' && (!settings.apiKey || settings.apiKey.trim().length === 0)) {
          return 'API key is required for selected provider';
        }

        if (typeof settings.autoProcess !== 'boolean') {
          return 'Auto process setting must be boolean';
        }

        if (typeof settings.confidenceThreshold !== 'number' || 
            settings.confidenceThreshold < 0 || 
            settings.confidenceThreshold > 1) {
          return 'Confidence threshold must be between 0 and 1';
        }

        return null; // No validation errors
      },

      reset: () => {
        set({
          settings: defaultSettings,
          isProcessing: false,
          lastProcessedResult: null,
          processingHistory: [],
          error: null
        });
      }
    }),
    {
      name: 'ai-settings-storage',
      partialize: (state) => ({
        settings: {
          ...state.settings,
          apiKey: '' // Never persist API keys for security
        },
        processingHistory: state.processingHistory || []
      })
    }
  )
);