import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import { safeArray, safeFilter, safeSlice, safeFind, safeNumber, safeString, isEmpty, isNotEmpty } from '../utils/safeArrayUtils';

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
  getCategories: () => string[];
  getTotalItems: () => number;
  getTotalStockValue: () => number;
  hasItems: () => boolean;
  getStockStatus: (item: WarehouseItem) => 'empty' | 'low' | 'good';
  
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
  },
  {
    id: 'default-3',
    name: 'Tissue Paper',
    currentStock: 15,
    minStock: 5,
    unit: 'packs',
    category: 'Household',
    lastUpdated: new Date().toISOString().split('T')[0]
  }
];

const validateWarehouseItem = (item: any): item is WarehouseItem => {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    typeof item.currentStock === 'number' &&
    item.currentStock >= 0 &&
    typeof item.minStock === 'number' &&
    item.minStock >= 0 &&
    typeof item.unit === 'string' &&
    item.unit.trim().length > 0 &&
    typeof item.category === 'string' &&
    item.category.trim().length > 0
  );
};

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
          
          // Handle null or empty response with safe array operations
          const validItems = safeFilter(items, validateWarehouseItem);

          set({ 
            items: validItems, 
            loading: false, 
            initialized: true 
          });

          // If no valid items, try fallback
          if (isEmpty(validItems)) {
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
          const validDummyItems = safeFilter(dummyItems, validateWarehouseItem);

          if (isNotEmpty(validDummyItems)) {
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
        // Validate input with safe operations
        if (!item || typeof item !== 'object') {
          set({ error: 'Invalid item data' });
          return;
        }

        const name = safeString(item.name).trim();
        const currentStock = safeNumber(item.currentStock);
        const minStock = safeNumber(item.minStock);
        const unit = safeString(item.unit).trim();
        const category = safeString(item.category).trim();

        if (!name) {
          set({ error: 'Item name is required' });
          return;
        }

        if (currentStock < 0) {
          set({ error: 'Current stock must be a non-negative number' });
          return;
        }

        if (minStock < 0) {
          set({ error: 'Minimum stock must be a non-negative number' });
          return;
        }

        if (!unit) {
          set({ error: 'Unit is required' });
          return;
        }

        if (!category) {
          set({ error: 'Category is required' });
          return;
        }

        set({ loading: true, error: null });
        try {
          const newItem = await apiService.createWarehouseItem({
            ...item,
            name,
            currentStock,
            minStock,
            unit,
            category,
            lastUpdated: new Date().toISOString().split('T')[0],
          });

          if (newItem && newItem.id) {
            set((state) => ({
              items: [...safeArray(state.items), newItem],
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
            name,
            currentStock,
            minStock,
            unit,
            category,
            lastUpdated: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            items: [...safeArray(state.items), localItem],
            error: 'Item saved locally - API unavailable',
          }));
        }
      },

      updateItem: async (id, updatedItem) => {
        if (!id || !updatedItem || typeof updatedItem !== 'object') {
          set({ error: 'Invalid update data' });
          return;
        }

        const items = safeArray(get().items);
        const existingItem = safeFind(items, item => item.id === id);
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
            items: safeArray(state.items).map((item) =>
              item.id === id ? { ...item, ...updated } : item
            ),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
          set({ error: errorMessage, loading: false });
          
          // Fallback to local update
          set((state) => ({
            items: safeArray(state.items).map((item) =>
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

        const items = safeArray(get().items);
        const existingItem = safeFind(items, item => item.id === id);
        if (!existingItem) {
          set({ error: 'Item not found' });
          return;
        }

        set({ loading: true, error: null });
        try {
          // API doesn't have delete endpoint, handle locally
          set((state) => ({
            items: safeFilter(state.items, (item) => item.id !== id),
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
          set({ error: errorMessage, loading: false });
        }
      },

      updateStock: async (id, newStock) => {
        const stockValue = safeNumber(newStock);
        if (!id || stockValue < 0) {
          set({ error: 'Invalid stock update data' });
          return;
        }

        const items = safeArray(get().items);
        const item = safeFind(items, item => item.id === id);
        if (item) {
          await get().updateItem(id, { currentStock: stockValue });
        } else {
          set({ error: 'Item not found for stock update' });
        }
      },

      // Local Actions with null safety
      consumeItem: (itemName, quantity) => {
        const name = safeString(itemName).trim();
        const qty = safeNumber(quantity);
        
        if (!name || qty <= 0) {
          set({ error: 'Invalid consume item parameters' });
          return;
        }

        set((state) => ({
          items: safeArray(state.items).map((item) => {
            if (item && item.name && item.name.toLowerCase().includes(name.toLowerCase())) {
              const newStock = Math.max(0, safeNumber(item.currentStock) - qty);
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
        const items = safeArray(get().items);
        return safeFilter(items, (item) => 
          item && 
          typeof item.currentStock === 'number' && 
          typeof item.minStock === 'number' &&
          item.currentStock <= item.minStock
        );
      },

      getItemByName: (name) => {
        const searchName = safeString(name).trim().toLowerCase();
        if (!searchName) return undefined;
        
        const items = safeArray(get().items);
        return safeFind(items, (item) => 
          item && 
          item.name && 
          item.name.toLowerCase().includes(searchName)
        );
      },

      getItemsByCategory: (category) => {
        const searchCategory = safeString(category).trim();
        if (!searchCategory) return [];
        
        const items = safeArray(get().items);
        return safeFilter(items, (item) => 
          item && item.category === searchCategory
        );
      },

      getCategories: () => {
        const items = safeArray(get().items);
        const categories = new Set<string>();
        
        items.forEach(item => {
          if (item && item.category) {
            categories.add(item.category);
          }
        });
        
        return Array.from(categories).sort();
      },

      getTotalItems: () => {
        const items = safeArray(get().items);
        return safeFilter(items, item => item && item.id).length;
      },

      getTotalStockValue: () => {
        const items = safeArray(get().items);
        return items.reduce((total, item) => {
          if (!item) return total;
          return total + safeNumber(item.currentStock);
        }, 0);
      },

      hasItems: () => {
        const items = safeArray(get().items);
        return items.length > 0;
      },

      getStockStatus: (item) => {
        if (!item) return 'empty';
        
        const current = safeNumber(item.currentStock);
        const min = safeNumber(item.minStock);
        
        if (current === 0) return 'empty';
        if (current <= min) return 'low';
        return 'good';
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
        items: safeArray(state.items),
        initialized: state.initialized
      }),
    }
  )
);