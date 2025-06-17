import React from 'react';
import { Home, Receipt, Package, BarChart3, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();

  const navItems = [
    { id: 'dashboard', label: t('home'), icon: Home },
    { id: 'transactions', label: t('transactions'), icon: Receipt },
    { id: 'warehouse', label: t('warehouse'), icon: Package },
    { id: 'report', label: t('report'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-dark-900' : 'bg-gray-50'
    }`}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className={`flex flex-col flex-grow shadow-lg transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-r border-dark-700' : 'bg-white'
        }`}>
          <div className={`flex items-center flex-shrink-0 px-6 py-6 border-b transition-colors duration-300 ${
            isDark ? 'border-dark-700' : 'border-gray-200'
          }`}>
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Maya - Family
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                AI Powered
              </p>
            </div>
          </div>
          <nav className="mt-6 flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? isDark 
                        ? 'bg-blue-900/50 text-blue-400 border-r-2 border-blue-500'
                        : 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : isDark
                        ? 'text-gray-300 hover:bg-dark-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className={`lg:hidden shadow-sm border-b px-4 py-3 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Maya - Family
              </h1>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-4 py-2 transition-colors duration-300 ${
          isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'text-blue-600'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;