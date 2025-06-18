import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import MetricCard from '../components/MetricCard';
import { useTransactionStore } from '../store/useTransactionStore';
import { useReportStore } from '../store/useReportStore';

const ReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  
  const { 
    transactions, 
    getTotalIncome, 
    getTotalExpenses, 
    getNetBalance,
    hasTransactions 
  } = useTransactionStore();
  
  const {
    monthlyReport,
    loading,
    error,
    fetchMonthlyReport,
    hasReport,
    getSavingsRate,
    getTopExpenseCategories
  } = useReportStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netBalance = getNetBalance();

  // Fetch report data on component mount
  useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate category data from actual transactions with null safety
  const categoryData = transactions?.reduce((acc: any[], transaction) => {
    if (!transaction || !transaction.category) return acc;
    
    const existingCategory = acc.find(cat => cat.name === transaction.category);
    if (existingCategory) {
      if (transaction.type === 'income') {
        existingCategory.income += (transaction.amount || 0);
      } else {
        existingCategory.expense += (transaction.amount || 0);
      }
    } else {
      acc.push({
        name: transaction.category,
        income: transaction.type === 'income' ? (transaction.amount || 0) : 0,
        expense: transaction.type === 'expense' ? (transaction.amount || 0) : 0,
        color: `bg-${['blue', 'green', 'purple', 'emerald', 'teal', 'indigo', 'pink'][acc.length % 7]}-500`
      });
    }
    return acc;
  }, []) || [];

  const monthlyTrends = [
    { month: 'Oct', income: 4800000, expense: 400000 },
    { month: 'Nov', income: 5200000, expense: 380000 },
    { month: 'Dec', income: 5500000, expense: 420000 },
    { month: 'Jan', income: totalIncome, expense: totalExpenses }
  ];

  const savingsRate = getSavingsRate();
  const topExpenseCategories = getTopExpenseCategories(5);

  const handleRefresh = () => {
    fetchMonthlyReport(selectedPeriod === 'month' ? undefined : selectedPeriod);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Financial Reports
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Analyze your financial performance and trends
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
          <button className="w-full sm:w-auto bg-green-600 text-white px-4 py-3 sm:py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`border rounded-xl p-4 transition-colors duration-300 ${
          isDark 
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Report Data Issue</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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

      {/* No Data Warning */}
      {!hasTransactions() && !loading && (
        <div className={`border rounded-xl p-6 transition-colors duration-300 ${
          isDark 
            ? 'bg-blue-900/20 border-blue-800 text-blue-400' 
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Transaction Data</h3>
            <p className="text-sm">Add some transactions to see detailed financial reports and analytics.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Time Period
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Category
            </label>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                {categoryData.map(cat => (
                  <option key={cat.name} value={cat.name.toLowerCase()}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Report Type
            </label>
            <div className="relative">
              <BarChart3 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <select className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-dark-700 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}>
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="comparison">Comparison</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading report data...</span>
        </div>
      )}

      {/* Key Metrics */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Monthly Income"
            value={formatCurrency(totalIncome)}
            change="+12.5%"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-green-600"
          />
          <MetricCard
            title="Monthly Expenses"
            value={formatCurrency(totalExpenses)}
            change="+8.2%"
            changeType="negative"
            icon={TrendingDown}
            iconColor="text-red-600"
          />
          <MetricCard
            title="Net Savings"
            value={formatCurrency(netBalance)}
            change="+15.3%"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            change="+2.1%"
            changeType="positive"
            icon={BarChart3}
            iconColor="text-purple-600"
          />
        </div>
      )}

      {/* Charts Section */}
      {!loading && hasTransactions() && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Monthly Trends */}
          <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
            isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Monthly Trends
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Income</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Expense</span>
                </div>
              </div>
            </div>
            
            <div className="h-48 sm:h-64 flex items-end justify-between space-x-2">
              {monthlyTrends.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full flex flex-col space-y-1">
                    <div 
                      className="bg-green-500 rounded-t"
                      style={{ height: `${Math.max(10, (data.income / 6000000) * 200)}px` }}
                    ></div>
                    <div 
                      className="bg-red-500 rounded-b"
                      style={{ height: `${Math.max(5, (data.expense / 6000000) * 200)}px` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={`rounded-xl shadow-sm border p-4 sm:p-6 transition-colors duration-300 ${
            isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Category Breakdown
              </h3>
            </div>
            
            {categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.map((category) => {
                  const total = (category.income || 0) + (category.expense || 0);
                  const maxAmount = Math.max(...categoryData.map(c => (c.income || 0) + (c.expense || 0)));
                  const percentage = total > 0 && maxAmount > 0 ? (total / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {category.name}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {category.income > 0 ? `+${formatCurrency(category.income)}` : `-${formatCurrency(category.expense)}`}
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isDark ? 'bg-dark-600' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
                          style={{ width: `${Math.max(2, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No category data available
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Table */}
      {!loading && hasTransactions() && (
        <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`p-4 sm:p-6 border-b transition-colors duration-300 ${
            isDark ? 'border-dark-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Financial Summary
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-dark-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Category
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Income
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Expense
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Net
                  </th>
                  <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-200'}`}>
                {categoryData.map((category) => {
                  const net = (category.income || 0) - (category.expense || 0);
                  const totalTransactions = transactions?.reduce((sum, t) => sum + Math.abs(t?.amount || 0), 0) || 0;
                  const percentage = totalTransactions > 0 ? (((category.income || 0) + (category.expense || 0)) / totalTransactions * 100).toFixed(1) : '0';
                  
                  return (
                    <tr key={category.name} className={`transition-colors ${
                      isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${category.color}`}></div>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {category.income > 0 ? formatCurrency(category.income) : '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {category.expense > 0 ? formatCurrency(category.expense) : '-'}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(net))}
                      </td>
                      <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;