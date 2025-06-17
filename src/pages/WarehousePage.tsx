import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, Bell, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useWarehouseStore } from '../store/useWarehouseStore';

const WarehousePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  
  const items = useWarehouseStore((state) => state.items);
  const updateStock = useWarehouseStore((state) => state.updateStock);
  const updateItem = useWarehouseStore((state) => state.updateItem);
  const deleteItem = useWarehouseStore((state) => state.deleteItem);
  const addItem = useWarehouseStore((state) => state.addItem);
  const getLowStockItems = useWarehouseStore((state) => state.getLowStockItems);

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];
  const lowStockItems = getLowStockItems();
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return { 
      status: 'empty', 
      color: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800', 
      text: 'Out of Stock' 
    };
    if (current <= min) return { 
      status: 'low', 
      color: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800', 
      text: 'Low Stock' 
    };
    return { 
      status: 'good', 
      color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800', 
      text: 'In Stock' 
    };
  };

  const handleStockUpdate = (itemId: string, newStock: number) => {
    updateStock(itemId, newStock);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (updatedItem: any) => {
    updateItem(editingItem.id, updatedItem);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  const handleAddItem = (newItem: any) => {
    addItem(newItem);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('warehouse')} Inventory
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Monitor household items and stock levels
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center shadow-lg">
            <Bell className="h-4 w-4 mr-2" />
            Send Reminders
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      {lowStockItems.length > 0 && (
        <div className={`border rounded-xl p-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-red-900/20 border-red-800' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <AlertTriangle className={`h-6 w-6 mt-1 flex-shrink-0 ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`} />
            <div className="ml-3 flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${
                isDark ? 'text-red-300' : 'text-red-900'
              }`}>
                Stock Alert
              </h3>
              <p className={`mb-3 ${
                isDark ? 'text-red-400' : 'text-red-700'
              }`}>
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.slice(0, 3).map(item => (
                  <span key={item.id} className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark 
                      ? 'bg-red-800/50 text-red-300' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.name}
                  </span>
                ))}
                {lowStockItems.length > 3 && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark 
                      ? 'bg-red-800/50 text-red-300' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    +{lowStockItems.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="relative">
            <Package className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Add New Item
          </h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleAddItem({
              name: formData.get('name'),
              currentStock: parseInt(formData.get('currentStock') as string),
              minStock: parseInt(formData.get('minStock') as string),
              unit: formData.get('unit'),
              category: formData.get('category')
            });
          }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              name="name"
              type="text"
              placeholder="Item name"
              required
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <input
              name="currentStock"
              type="number"
              placeholder="Current stock"
              required
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <input
              name="minStock"
              type="number"
              placeholder="Min stock"
              required
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <input
              name="unit"
              type="text"
              placeholder="Unit (kg, pcs, etc.)"
              required
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <select
              name="category"
              required
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Household">Household</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Others">Others</option>
            </select>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item.currentStock, item.minStock);
          const isEditing = editingItem?.id === item.id;
          
          return (
            <div key={item.id} className={`rounded-xl shadow-sm border p-6 transition-all duration-300 group ${
              isDark 
                ? 'bg-dark-800 border-dark-700 hover:shadow-lg hover:shadow-dark-900/20' 
                : 'bg-white border-gray-100 hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={item.name}
                      className={`font-semibold mb-1 w-full border rounded px-2 py-1 transition-colors ${
                        isDark 
                          ? 'bg-dark-700 border-dark-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      onBlur={(e) => handleSaveEdit({ ...item, name: e.target.value })}
                    />
                  ) : (
                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </h3>
                  )}
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.category}
                  </p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className={`p-1 rounded transition-colors ${
                      isDark 
                        ? 'text-blue-400 hover:bg-blue-900/30' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Edit item"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={`p-1 rounded transition-colors ${
                      isDark 
                        ? 'text-red-400 hover:bg-red-900/30' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <span className={`px-2 py-1 rounded-full text-xs font-medium mb-4 inline-block ${stockStatus.color}`}>
                {stockStatus.text}
              </span>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Current Stock
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value) || 0)}
                        className={`text-lg font-bold w-16 text-right border rounded px-1 transition-colors ${
                          isDark 
                            ? 'bg-dark-700 border-dark-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-dark-600' : 'bg-gray-200'}`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stockStatus.status === 'good' ? 'bg-green-500' :
                        stockStatus.status === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((item.currentStock / (item.minStock * 2)) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className={`flex justify-between text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Min: {item.minStock} {item.unit}</span>
                    <span>Updated: {new Date(item.lastUpdated).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    isDark 
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Update
                  </button>
                  {item.currentStock <= item.minStock && (
                    <button className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                      isDark 
                        ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' 
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}>
                      <Bell className="h-4 w-4 mr-1" />
                      Remind
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className={`rounded-xl shadow-sm border p-12 text-center transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-dark-700' : 'bg-gray-100'
          }`}>
            <Package className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No items found
          </h3>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;