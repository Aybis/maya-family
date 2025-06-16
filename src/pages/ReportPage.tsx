import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useTransactionStore } from '../store/useTransactionStore';

const ReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // Calculate category data from actual transactions
  const categoryData = transactions.reduce((acc: any[], transaction) => {
    const existingCategory = acc.find(cat => cat.name === transaction.category);
    if (existingCategory) {
      if (transaction.type === 'income') {
        existingCategory.income += transaction.amount;
      } else {
        existingCategory.expense += transaction.amount;
      }
    } else {
      acc.push({
        name: transaction.category,
        income: transaction.type === 'income' ? transaction.amount : 0,
        expense: transaction.type === 'expense' ? transaction.amount : 0,
        color: `bg-${['blue', 'green', 'purple', 'emerald', 'teal', 'indigo', 'pink'][acc.length % 7]}-500`
      });
    }
    return acc;
  }, []);

  const monthlyTrends = [
    { month: 'Oct', income: 4800000, expense: 400000 },
    { month: 'Nov', income: 5200000, expense: 380000 },
    { month: 'Dec', income: 5500000, expense: 420000 },
    { month: 'Jan', income: totalIncome, expense: totalExpenses }
  ];

  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Analyze your financial performance and trends</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categoryData.map(cat => (
                  <option key={cat.name} value={cat.name.toLowerCase()}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="relative">
              <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="comparison">Comparison</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          value={`${savingsRate}%`}
          change="+2.1%"
          changeType="positive"
          icon={BarChart3}
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Expense</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyTrends.map((data, index) => (
              <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full flex flex-col space-y-1">
                  <div 
                    className="bg-green-500 rounded-t"
                    style={{ height: `${(data.income / 6000000) * 200}px` }}
                  ></div>
                  <div 
                    className="bg-red-500 rounded-b"
                    style={{ height: `${(data.expense / 6000000) * 200}px` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
          </div>
          
          <div className="space-y-4">
            {categoryData.map((category) => {
              const total = category.income + category.expense;
              const maxAmount = Math.max(...categoryData.map(c => c.income + c.expense));
              const percentage = total > 0 ? (total / maxAmount) * 100 : 0;
              
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-600">
                      {category.income > 0 ? `+${formatCurrency(category.income)}` : `-${formatCurrency(category.expense)}`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${category.color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category) => {
                const net = category.income - category.expense;
                const totalTransactions = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const percentage = totalTransactions > 0 ? ((category.income + category.expense) / totalTransactions * 100).toFixed(1) : '0';
                
                return (
                  <tr key={category.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${category.color}`}></div>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {category.income > 0 ? formatCurrency(category.income) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {category.expense > 0 ? formatCurrency(category.expense) : '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(net))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;