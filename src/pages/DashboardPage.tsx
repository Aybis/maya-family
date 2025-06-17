import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import MetricCard from '../components/MetricCard';
import StockWarning from '../components/StockWarning';
import TransactionModal from '../components/TransactionModal';
import { useTransactionStore } from '../store/useTransactionStore';

const DashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(true);
  
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  
  const transactions = useTransactionStore((state) => state.transactions);
  const totalIncome = useTransactionStore((state) => state.getTotalIncome());
  const totalExpenses = useTransactionStore((state) => state.getTotalExpenses());
  const netBalance = useTransactionStore((state) => state.getNetBalance());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const recentTransactions = transactions.slice(0, 5);
  const monthlyBudget = 6000000;
  
  const expenseCategories = [
    { name: 'Food', amount: 250000, percentage: 55 },
    { name: 'Transportation', amount: 50000, percentage: 11 },
    { name: 'Bills', amount: 150000, percentage: 34 }
  ];

  return (
    <div className="space-y-8">
      {/* Stock Warning */}
      {showStockWarning && (
        <StockWarning onDismiss={() => setShowStockWarning(false)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard')}
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {t('welcome_overview')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('quick_add')}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Income vs Expenses Chart */}
        <div className={`xl:col-span-2 rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('income_vs_expenses')}
            </h3>
            <select className={`border rounded-lg px-3 py-1 text-sm transition-colors ${
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
          <div className={`h-64 rounded-lg flex items-end justify-center p-4 transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-t from-dark-700 to-transparent' 
              : 'bg-gradient-to-t from-blue-50 to-transparent'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isDark ? 'bg-dark-600' : 'bg-blue-100'
              }`}>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                Chart Visualization
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Income vs Expenses Over Time
              </p>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
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
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('recent_transactions')}
          </h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
            {t('view_all')}
          </button>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
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
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.description}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transaction.category} • {transaction.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(transaction.date).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DashboardPage;