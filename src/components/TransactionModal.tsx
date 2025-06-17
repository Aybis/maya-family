import React, { useState } from 'react';
import { X, Camera, Plus, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { categories, paymentMethods } from '../data/mockData';
import { useTransactionStore } from '../store/useTransactionStore';
import { useWarehouseStore } from '../store/useWarehouseStore';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: any;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, editTransaction }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'camera'>('manual');
  const [formData, setFormData] = useState({
    type: editTransaction?.type || 'expense',
    amount: editTransaction?.amount?.toString() || '',
    category: editTransaction?.category || '',
    description: editTransaction?.description || '',
    paymentMethod: editTransaction?.paymentMethod || '',
    cashGiven: '',
    calculateChange: false
  });

  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const consumeItem = useWarehouseStore((state) => state.consumeItem);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      type: formData.type as 'income' | 'expense',
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      paymentMethod: formData.paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
      
      // Auto-consume warehouse items for food purchases
      if (formData.category === 'Food' && formData.type === 'expense') {
        const description = formData.description.toLowerCase();
        
        // Simple keyword matching for common items
        const itemMappings = [
          { keywords: ['rice', 'beras'], quantity: 1 },
          { keywords: ['oil', 'minyak'], quantity: 1 },
          { keywords: ['tissue', 'tisu'], quantity: 2 },
          { keywords: ['shampoo'], quantity: 1 },
          { keywords: ['detergent', 'deterjen'], quantity: 1 }
        ];

        itemMappings.forEach(({ keywords, quantity }) => {
          if (keywords.some(keyword => description.includes(keyword))) {
            consumeItem(keywords[0], quantity);
          }
        });
      }
    }

    onClose();
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      paymentMethod: '',
      cashGiven: '',
      calculateChange: false
    });
  };

  const calculatedChange = formData.cashGiven && formData.amount 
    ? (parseFloat(formData.cashGiven) - parseFloat(formData.amount)).toLocaleString('id-ID')
    : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-dark-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? isDark 
                  ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-900/20'
                  : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Manual Input
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'camera'
                ? isDark 
                  ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-900/20'
                  : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="h-4 w-4 inline mr-2" />
            Camera Scan
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Transaction Type
                </label>
                <div className="flex space-x-4">
                  {['income', 'expense'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={formData.type === type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Rp
                  </span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isDark 
                        ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Transaction description"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Cash Change Calculator */}
              {formData.paymentMethod === 'Cash' && (
                <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                  isDark 
                    ? 'bg-amber-900/20 border-amber-800' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center mb-3">
                    <Calculator className={`h-4 w-4 mr-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                      Cash Change Calculator
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      Cash Given
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        Rp
                      </span>
                      <input
                        type="number"
                        value={formData.cashGiven}
                        onChange={(e) => setFormData({...formData, cashGiven: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                          isDark 
                            ? 'bg-dark-700 border-amber-700 text-white placeholder-gray-400' 
                            : 'bg-white border-amber-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  {formData.cashGiven && formData.amount && (
                    <div className={`mt-3 p-3 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-dark-700 border-amber-700' 
                        : 'bg-white border-amber-200'
                    }`}>
                      <span className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                        Change: Rp {calculatedChange}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg"
              >
                {editTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className={`rounded-2xl p-8 mb-6 transition-colors duration-300 ${
                isDark ? 'bg-dark-700' : 'bg-gray-100'
              }`}>
                <Camera className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Take a photo of your receipt
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Open Camera
                </button>
              </div>
              
              <div className={`border rounded-lg p-4 transition-colors duration-300 ${
                isDark 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                  AI Preview (Mock)
                </h4>
                <div className={`text-left space-y-2 text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  <p><strong>Amount:</strong> Rp 125,000</p>
                  <p><strong>Items:</strong> Milk, Bread, Eggs</p>
                  <p><strong>Category:</strong> Food</p>
                  <p><strong>Date:</strong> Today</p>
                </div>
                <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Confirm & Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;