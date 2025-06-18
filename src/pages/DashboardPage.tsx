import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import MetricCard from '../components/MetricCard';
import StockWarning from '../components/StockWarning';
import TransactionModal from '../components/TransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';
import { useWarehouseStore } from '../store/useWarehouseStore';
import { safeArray, safeSlice, isEmpty } from '../utils/safeArrayUtils';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(true);
  
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  
  const { 
    transactions, 
    loading: transactionsLoading, 
    error: transactionsError,
    fetchTransactions,
    getTotalIncome,
    getTotalExpenses,
    getNetBalance,
    getRecentTransactions
  } = useTransactionStore();
  
  const { 
    loading: warehouseLoading, 
    error: warehouseError,
    fetchItems 
  } = useWarehouseStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netBalance = getNetBalance();

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchItems();
  }, [fetchTransactions, fetchItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Safe recent transactions with fallback
  const recentTransactions = getRecentTransactions(5);
  const monthlyBudget = 6000000;
  
  // Safe expense categories calculation
  const expenseCategories = [
    { name: 'Food', amount: 250000, percentage: 55 },
    { name: 'Transportation', amount: 50000, percentage: 11 },
    { name: 'Bills', amount: 150000, percentage: 34 }
  ];

  const handleRefresh = async () => {
    await Promise.all([
      fetchTransactions(),
      fetchItems()
    ]);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Stock Warning */}
      {showStockWarning && (
        <StockWarning onDismiss={() => setShowStockWarning(false)} />
      )}

      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard')}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('welcome_overview')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={transactionsLoading || warehouseLoading}
            className={`px-4 py-3 sm:py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isDark 
                ? 'bg-dark-600 text-gray-300 hover:bg-dark-500 disabled:opacity-50' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${transactionsLoading || warehouseLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('quick_add')}
          </button>
        </div>
      </div>

      {/* Error Messages */}
      {(transactionsError || warehouseError) && (
        <div className={`border rounded-xl p-4 transition-colors duration-300 ${
          isDark 
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="font-medium">API Connection Issues</p>
              <p className="text-sm mt-1">
                {transactionsError && `Transactions: ${transactionsError}`}
                {transactionsError && warehouseError && ' | '}
                {warehouseError && `Warehouse: ${warehouseError}`}
              </p>
              <p className="text-xs mt-1 opacity-75">Using cached data and fallback to demo mode.</p>
            </div>
            <button
              onClick={handleRefresh}
              className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-yellow-800/50 hover:bg-yellow-800/70' 
                  : 'bg-yellow-100 hover:bg-yellow-200'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title={t('total_income')}
          value={formatCurrency(totalIncome)}
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <MetricCard
          title={t('total_expenses')}
          value={formatCurrency(totalExpenses)}
          change="+8.2%"
          changeType="negative"
          icon={TrendingDown}
          iconColor="text-red-600"
        />
        <MetricCard
          title={t('total_savings')}
          value={formatCurrency(netBalance)}
          change="+15.3%"
          changeType="positive"
          icon={PiggyBank}
          iconColor="text-blue-600"
        />
        <MetricCard
          title={t('monthly_budget')}
          value={formatCurrency(monthlyBudget)}
          change={`${Math.round((totalExpenses / monthlyBudget) * 100)}% used`}
          changeType="neutral"
          icon={Wallet}
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Income vs Expenses Chart */}
        <div className={`xl:col-span-2 rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('income_vs_expenses')}
            </h3>
            <select className={`w-full sm:w-auto border rounded-lg px-3 py-2 text-sm transition-colors ${
              isDark 
                ? 'bg-dark-700 border-dark-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 6 months</option>
            </select>
          </div>
          
          {/* Mock Chart */}
          <div className={`h-48 sm:h-64 rounded-lg flex items-end justify-center p-4 transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-t from-dark-700 to-transparent' 
              : 'bg-gradient-to-t from-blue-50 to-transparent'
          }`}>
            <div className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isDark ? 'bg-dark-600' : 'bg-blue-100'
              }`}>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <p className={`font-medium text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Chart Visualization
              </p>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Income vs Expenses Over Time
              </p>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('expense_categories')}
          </h3>
          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {category.name}
                  </span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(category.amount)}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-dark-600' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.max(5, category.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('recent_transactions')}
          </h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors self-start sm:self-auto">
            {t('view_all')}
          </button>
        </div>
        
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading transactions...</span>
          </div>
        ) : isEmpty(recentTransactions) ? (
          <div className="text-center py-8">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? 'bg-dark-700' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`h-6 w-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No transactions yet
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Start by adding your first transaction
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Transaction
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    transaction.type === 'income' 
                      ? isDark ? 'bg-green-900/30' : 'bg-green-100'
                      : isDark ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.description || 'No description'}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {transaction.category || 'No category'} • {transaction.paymentMethod || 'No payment method'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`font-semibold text-sm sm:text-base ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount || 0)}
                  </p>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transaction.date ? new Date(transaction.date).toLocaleDateString('id-ID') : 'No date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;