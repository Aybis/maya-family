import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search, Bell, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { useWarehouseStore } from '../store/useWarehouseStore';

const WarehousePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
    if (current === 0) return { status: 'empty', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (current <= min) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Warehouse Inventory</h1>
          <p className="text-gray-600">Monitor household items and stock levels</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Send Reminders
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Stock Alert</h3>
              <p className="text-red-700 mb-3">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.slice(0, 3).map(item => (
                  <span key={item.id} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.name}
                  </span>
                ))}
                {lowStockItems.length > 3 && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    +{lowStockItems.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h3>
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="currentStock"
              type="number"
              placeholder="Current stock"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="minStock"
              type="number"
              placeholder="Min stock"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="unit"
              type="text"
              placeholder="Unit (kg, pcs, etc.)"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              name="category"
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
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
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={item.name}
                      className="font-semibold text-gray-900 mb-1 w-full border border-gray-300 rounded px-2 py-1"
                      onBlur={(e) => handleSaveEdit({ ...item, name: e.target.value })}
                    />
                  ) : (
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  )}
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit item"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color} mb-4 inline-block`}>
                {stockStatus.text}
              </span>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value) || 0)}
                        className="text-lg font-bold text-gray-900 w-16 text-right border border-gray-300 rounded px-1"
                      />
                      <span className="text-sm text-gray-600">{item.unit}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: {item.minStock} {item.unit}</span>
                    <span>Updated: {new Date(item.lastUpdated).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Update
                  </button>
                  {item.currentStock <= item.minStock && (
                    <button className="flex-1 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;