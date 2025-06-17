import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-600'
}) => {
  const { isDark } = useThemeStore();

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-50';
      case 'negative':
        return isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-50';
      default:
        return isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-50';
    }
  };

  const getIconBgColor = () => {
    const baseColor = iconColor.replace('text-', '');
    return isDark ? `bg-${baseColor.replace('-600', '-900')}/30` : `bg-${baseColor.replace('-600', '-100')}`;
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-all duration-300 ${
      isDark 
        ? 'bg-dark-800 border-dark-700 hover:shadow-lg hover:shadow-dark-900/20' 
        : 'bg-white border-gray-100 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {change && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${getChangeColor()}`}>
              {change}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl transition-colors ${getIconBgColor()}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;