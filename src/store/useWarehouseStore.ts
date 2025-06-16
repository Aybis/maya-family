import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WarehouseItem } from '../data/mockData';

interface WarehouseStore {
  items: WarehouseItem[];
  addItem: (item: Omit<WarehouseItem, 'id' | 'lastUpdated'>) => void;
  updateItem: (id: string, item: Partial<WarehouseItem>) => void;
  deleteItem: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;
  consumeItem: (itemName: string, quantity: number) => void;
  getLowStockItems: () => WarehouseItem[];
  getItemByName: (name: string) => WarehouseItem | undefined;
}

export const useWarehouseStore = create<WarehouseStore>()(
  persist(
    (set, get) => ({
      items: [
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
      ],

      addItem: (item) => {
        const newItem: WarehouseItem = {
          ...item,
          id: Date.now().toString(),
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, updatedItem) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, ...updatedItem, lastUpdated: new Date().toISOString().split('T')[0] }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateStock: (id, newStock) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, currentStock: newStock, lastUpdated: new Date().toISOString().split('T')[0] }
              : item
          ),
        }));
      },

      consumeItem: (itemName, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
              const newStock = Math.max(0, item.currentStock - quantity);
              return {
                ...item,
                currentStock: newStock,
                lastUpdated: new Date().toISOString().split('T')[0],
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
    }),
    {
      name: 'warehouse-storage',
    }
  )
);