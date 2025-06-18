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
  
  // API Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<WarehouseItem, 'id' | 'lastUpdated' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, item: Partial<WarehouseItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  
  // Local Actions
  consumeItem: (itemName: string, quantity: number) => void;
  getLowStockItems: () => WarehouseItem[];
  getItemByName: (name: string) => WarehouseItem | undefined;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWarehouseStore = create<WarehouseStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      // API Actions
      fetchItems: async () => {
        set({ loading: true, error: null });
        try {
          const items = await apiService.getWarehouseItems();
          set({ items, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch warehouse items';
          set({ error: errorMessage, loading: false });
          
          // Fallback to dummy data if API fails
          try {
            const dummyItems = await apiService.getDummyWarehouse();
            set({ items: dummyItems, error: null });
          } catch (dummyError) {
            console.error('Failed to fetch dummy warehouse data:', dummyError);
          }
        }
      },

      addItem: async (item) => {
        set({ loading: true, error: null });
        try {
          const newItem = await apiService.createWarehouseItem({
            ...item,
            lastUpdated: new Date().toISOString().split('T')[0],
          });
          set((state) => ({
            items: [...state.items, newItem],
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
          set({ error: errorMessage, loading: false });
          
          // Fallback to local storage
          const localItem: WarehouseItem = {
            ...item,
            id: Date.now().toString(),
            lastUpdated: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            items: [...state.items, localItem],
            error: null,
          }));
        }
      },

      updateItem: async (id, updatedItem) => {
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
            error: null,
          }));
        }
      },

      deleteItem: async (id) => {
        set({ loading: true, error: null });
        try {
          // Note: API doesn't have delete endpoint, handle locally
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
        const item = get().items.find(item => item.id === id);
        if (item) {
          await get().updateItem(id, { currentStock: newStock });
        }
      },

      // Local Actions
      consumeItem: (itemName, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
              const newStock = Math.max(0, item.currentStock - quantity);
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
        return get().items.filter((item) => item.currentStock <= item.minStock);
      },

      getItemByName: (name) => {
        return get().items.find((item) => 
          item.name.toLowerCase().includes(name.toLowerCase())
        );
      },

      // State management
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'warehouse-storage',
      partialize: (state) => ({ 
        items: state.items 
      }),
    }
  )
);