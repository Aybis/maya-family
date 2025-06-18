import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useWarehouseStore } from '../store/useWarehouseStore';
import { safeArray, safeSlice, isEmpty } from '../utils/safeArrayUtils';

interface StockWarningProps {
  onDismiss?: () => void;
}

const StockWarning: React.FC<StockWarningProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const { getLowStockItems } = useWarehouseStore();
  
  const lowStockItems = getLowStockItems();

  if (isEmpty(lowStockItems)) return null;

  // Safe slice operation for displaying limited items
  const displayItems = safeSlice(lowStockItems, 0, 3);
  const remainingCount = Math.max(0, lowStockItems.length - 3);

  return (
    <div className={`border rounded-xl p-4 mb-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-red-900/20 border-red-800' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
            isDark ? 'text-red-400' : 'text-red-600'
          }`} />
          <div className="ml-3">
            <h3 className={`text-sm font-semibold ${
              isDark ? 'text-red-300' : 'text-red-900'
            }`}>
              {t('low_stock_alert')}
            </h3>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-red-400' : 'text-red-700'
            }`}>
              {lowStockItems.length} {t('items_running_low')}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {displayItems.map(item => (
                <span key={item.id} className={`px-2 py-1 rounded text-xs font-medium ${
                  isDark 
                    ? 'bg-red-800/50 text-red-300' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.name || 'Unknown item'} ({item.currentStock || 0} {item.unit || 'units'})
                </span>
              ))}
              {remainingCount > 0 && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  isDark 
                    ? 'bg-red-800/50 text-red-300' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  +{remainingCount} more
                </span>
              )}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded transition-colors ${
              isDark 
                ? 'hover:bg-red-800/50 text-red-400' 
                : 'hover:bg-red-100 text-red-500'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StockWarning;