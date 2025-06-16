import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useWarehouseStore } from '../store/useWarehouseStore';

interface StockWarningProps {
  onDismiss?: () => void;
}

const StockWarning: React.FC<StockWarningProps> = ({ onDismiss }) => {
  const lowStockItems = useWarehouseStore((state) => state.getLowStockItems());

  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-red-900">Low Stock Alert</h3>
            <p className="text-sm text-red-700 mt-1">
              {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {lowStockItems.slice(0, 3).map(item => (
                <span key={item.id} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                  {item.name} ({item.currentStock} {item.unit})
                </span>
              ))}
              {lowStockItems.length > 3 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                  +{lowStockItems.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-red-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StockWarning;