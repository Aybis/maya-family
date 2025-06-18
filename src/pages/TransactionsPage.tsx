import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowUp, ArrowDown, Calendar, CreditCard, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import TransactionModal from '../components/TransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';

const TransactionsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  
  const { 
    transactions, 
    loading, 
    error,
    fetchTransactions,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getNetBalance 
  } = useTransactionStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netBalance = getNetBalance();

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return '💵';
      case 'bank transfer':
        return '🏦';
      case 'credit card':
        return '💳';
      case 'qris':
        return '📱';
      case 'e-wallet':
        return '📲';
      default:
        return '💳';
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('transactions')}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Track and manage all your financial transactions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isDark 
                ? 'bg-dark-600 text-gray-300 hover:bg-dark-500 disabled:opacity-50' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`border rounded-xl p-4 transition-colors duration-300 ${
          isDark 
            ? 'bg-red-900/20 border-red-800 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Failed to load transactions</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-red-800/50 hover:bg-red-800/70' 
                  : 'bg-red-100 hover:bg-red-200'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={`w-full lg:w-auto pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <select className={`w-full lg:w-auto pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isDark 
                ? 'bg-dark-700 border-dark-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Income
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className={`p-3 rounded-xl flex-shrink-0 ml-2 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <ArrowUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Expenses
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 truncate">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className={`p-3 rounded-xl flex-shrink-0 ml-2 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
              <ArrowDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Net Balance
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 truncate">
                {formatCurrency(netBalance)}
              </p>
            </div>
            <div className={`p-3 rounded-xl flex-shrink-0 ml-2 ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-4 sm:p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Transaction History ({filteredTransactions.length})
          </h3>
        </div>

        <div className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className={`p-4 sm:p-6 transition-colors group ${
                isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                      transaction.type === 'income' 
                        ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                        : isDark ? 'bg-red-900/30' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.description}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {transaction.category}
                        </span>
                        <span className={`hidden sm:inline ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                        <span className={`text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="mr-1">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <div className="text-right">
                      <p className={`text-sm sm:text-lg font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className={`p-1 sm:p-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'text-blue-400 hover:bg-blue-900/30' 
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Edit transaction"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className={`p-1 sm:p-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'text-red-400 hover:bg-red-900/30' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete transaction"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-dark-700' : 'bg-gray-100'
              }`}>
                <Search className={`h-6 w-6 sm:h-8 sm:w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No transactions found
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditTransactionModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default TransactionsPage;