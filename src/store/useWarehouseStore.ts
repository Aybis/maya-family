import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';

export interface WarehouseItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
  lastUpdated: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WarehouseStore {
  items: WarehouseItem[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // API Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<WarehouseItem, 'id' | 'lastUpdated' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, item: Partial<WarehouseItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  
  // Local Actions with null safety
  consumeItem: (itemName: string, quantity: number) => void;
  getLowStockItems: () => WarehouseItem[];
  getItemByName: (name: string) => WarehouseItem | undefined;
  getItemsByCategory: (category: string) => WarehouseItem[];
  getTotalItems: () => number;
  hasItems: () => boolean;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  tryFallbackData: () => Promise<void>;
}

const defaultItems: WarehouseItem[] = [
  {
    id: 'default-1',
    name: 'Rice',
    currentStock: 5,
    minStock: 10,
    unit: 'kg',
    category: 'Food',
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  {
    id: 'default-2',
    name: 'Cooking Oil',
    currentStock: 2,
    minStock: 3,
    unit: 'bottles',
    category: 'Food',
    lastUpdated: new Date().toISOString().split('T')[0]
  }
];

export const useWarehouseStore = create<WarehouseStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      initialized: false,

      // API Actions
      fetchItems: async () => {
        set({ loading: true, error: null });
        try {
          const items = await apiService.getWarehouseItems();
          
          // Handle null or empty response
          const validItems = Array.isArray(items) && items.length > 0
            ? items.filter(item => 
                item && 
                typeof item === 'object' && 
                item.id && 
                item.name && 
                typeof item.currentStock === 'number' &&
                typeof item.minStock === 'number'
              )
            : [];

          set({ 
            items: validItems, 
            loading: false, 
            initialized: true 
          });

          // If no valid items, try fallback
          if (validItems.length === 0) {
            await get().tryFallbackData();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch warehouse items';
          set({ error: errorMessage, loading: false, initialized: true });
          
          // Always try fallback on error
          await get().tryFallbackData();
        }
      },

      tryFallbackData: async () => {
        try {
          // Try dummy API first
          const dummyItems = await apiService.getDummyWarehouse();
          const validDummyItems = Array.isArray(dummyItems) && dummyItems.length > 0
            ? dummyItems.filter(item => 
                item && 
                typeof item === 'object' && 
                item.id && 
                item.name &&
                typeof item.currentStock === 'number' &&
                typeof item.minStock === 'number'
              )
            : [];

          if (validDummyItems.length > 0) {
            set({ 
              items: validDummyItems, 
              error: 'Using demo data - API unavailable' 
            });
          } else {
            // Final fallback to default data
            set({ 
              items: defaultItems, 
              error: 'Using default data - API and demo data unavailable' 
            });
          }
        } catch (dummyError) {
          console.error('Dummy API also failed:', dummyError);
          // Use default items as final fallback
          set({ 
            items: defaultItems, 
            error: 'Using default data - All APIs unavailable' 
          });
        }
      },

      addItem: async (item) => {
        // Validate input
        if (!item || typeof item !== 'object') {
          set({ error: 'Invalid item data' });
          return;
        }

        if (!item.name?.trim()) {
          set({ error: 'Item name is required' });
          return;
        }

        if (typeof item.currentStock !== 'number' || item.currentStock < 0) {
          set({ error: 'Current stock must be a valid number' });
          return;
        }

        if (typeof item.minStock !== 'number' || item.minStock < 0) {
          set({ error: 'Minimum stock must be a valid number' });
          return;
        }

        if (!item.unit?.trim()) {
          set({ error: 'Unit is required' });
          return;
        }

        if (!item.category?.trim()) {
          set({ error: 'Category is required' });
          return;
        }

        set({ loading: true, error: null });
        try {
          const newItem = await apiService.createWarehouseItem({
            ...item,
            lastUpdated: new Date().toISOString().split('T')[0],
          });

          if (newItem && newItem.id) {
            set((state) => ({
              items: [...state.items, newItem],
              loading: false,
            }));
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
          set({ error: errorMessage, loading: false });
          
          // Fallback to local storage
          const localItem: WarehouseItem = {
            ...item,
            id: `local-${Date.now()}`,
            lastUpdated: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            items: [...state.items, localItem],
            error: 'Item saved locally - API unavailable',
          }));
        }
      },

      updateItem: async (id, updatedItem) => {
        if (!id || !updatedItem || typeof updatedItem !== 'object') {
          set({ error: 'Invalid update data' });
          return;
        }

        const existingItem = get().items.find(item => item.id === id);
        if (!existingItem) {
          set({ error: 'Item not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          const updated = await apiService.updateWarehouseItem(id, {
            ...updatedItem,
            lastUpdated: new Date().toISOString().split('T')[0],
          });

          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, ...updated } : item
            ),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
          set({ error: errorMessage, loading: false });
          
          // Fallback to local update
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id 
                ? { 
                    ...item, 
                    ...updatedItem, 
                    lastUpdated: new Date().toISOString().split('T')[0],
                    updatedAt: new Date().toISOString()
                  }
                : item
            ),
            error: 'Item updated locally - API unavailable',
          }));
        }
      },

      deleteItem: async (id) => {
        if (!id) {
          set({ error: 'Invalid item ID' });
          return;
        }

        const existingItem = get().items.find(item => item.id === id);
        if (!existingItem) {
          set({ error: 'Item not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          // API doesn't have delete endpoint, handle locally
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
          set({ error: errorMessage, loading: false });
        }
      },

      updateStock: async (id, newStock) => {
        if (!id || typeof newStock !== 'number' || newStock < 0) {
          set({ error: 'Invalid stock update data' });
          return;
        }

        const item = get().items.find(item => item.id === id);
        if (item) {
          await get().updateItem(id, { currentStock: newStock });
        } else {
          set({ error: 'Item not found for stock update' });
        }
      },

      // Local Actions with null safety
      consumeItem: (itemName, quantity) => {
        if (!itemName || typeof itemName !== 'string' || typeof quantity !== 'number' || quantity <= 0) {
          set({ error: 'Invalid consume item parameters' });
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item && item.name && item.name.toLowerCase().includes(itemName.toLowerCase())) {
              const newStock = Math.max(0, (item.currentStock || 0) - quantity);
              return {
                ...item,
                currentStock: newStock,
                lastUpdated: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          }),
        }));
      },

      getLowStockItems: () => {
        const items = get().items || [];
        return items.filter((item) => 
          item && 
          typeof item.currentStock === 'number' && 
          typeof item.minStock === 'number' &&
          item.currentStock <= item.minStock
        );
      },

      getItemByName: (name) => {
        if (!name || typeof name !== 'string') return undefined;
        const items = get().items || [];
        return items.find((item) => 
          item && 
          item.name && 
          item.name.toLowerCase().includes(name.toLowerCase())
        );
      },

      getItemsByCategory: (category) => {
        if (!category || typeof category !== 'string') return [];
        const items = get().items || [];
        return items.filter((item) => 
          item && item.category === category
        );
      },

      getTotalItems: () => {
        const items = get().items || [];
        return items.filter(item => item && item.id).length;
      },

      hasItems: () => {
        const items = get().items || [];
        return items.length > 0;
      },

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({ 
        items: [], 
        loading: false, 
        error: null, 
        initialized: false 
      }),
    }),
    {
      name: 'warehouse-storage',
      partialize: (state) => ({ 
        items: state.items || [],
        initialized: state.initialized
      }),
    }
  )
);