import React, { useState } from 'react';
import { User, Mail, Bell, Shield, Palette, Globe, Save, ChevronRight, Sun, Moon, Monitor, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';
import { useAIStore } from '../store/useAIStore';
import { aiAssistants } from '../data/mockData';
import AISettingsModal from '../components/AISettingsModal';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, isDark, setTheme } = useThemeStore();
  const { settings: aiSettings } = useAIStore();
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+62 812 3456 7890'
    },
    preferences: {
      aiAssistant: 'chatgpt',
      currency: 'IDR',
      language: i18n.language,
      theme: theme
    },
    notifications: {
      email: true,
      whatsapp: false,
      pushNotifications: true,
      lowStockAlerts: true,
      budgetAlerts: true,
      monthlyReports: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      marketing: false
    }
  });

  const handleSave = () => {
    console.log('Settings saved:', settings);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));

    // Handle special cases
    if (section === 'preferences') {
      if (key === 'language') {
        i18n.changeLanguage(value);
      } else if (key === 'theme') {
        setTheme(value);
      }
    }
  };

  const themeOptions = [
    { value: 'light', label: t('light'), icon: Sun },
    { value: 'dark', label: t('dark'), icon: Moon },
    { value: 'auto', label: t('auto'), icon: Monitor }
  ];

  const getAIProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI GPT-4 Vision';
      case 'gemini': return 'Google Gemini Pro Vision';
      case 'mock': return 'Demo Mode';
      default: return 'Not configured';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('settings')}
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {t('manage_preferences')}
          </p>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {t('save_changes')}
        </button>
      </div>

      {/* Profile Section */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <User className={`h-5 w-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('profile_information')}
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                {t('change_photo')}
              </button>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('full_name')}
              </label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('email_address')}
              </label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('phone_number')}
              </label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Scanner Settings */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-blue-600 mr-3" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Receipt Scanner
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <button
            onClick={() => setIsAISettingsOpen(true)}
            className={`w-full flex items-center justify-between p-4 text-left rounded-lg transition-colors ${
              isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
            }`}
          >
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Provider Configuration
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Current: {getAIProviderName(aiSettings.provider)}
              </p>
            </div>
            <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* AI Assistant Preferences */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded mr-3"></div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('ai_assistant')}
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('choose_ai_assistant')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {aiAssistants.map((assistant) => (
              <div
                key={assistant.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  settings.preferences.aiAssistant === assistant.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isDark
                      ? 'border-dark-600 hover:border-dark-500 bg-dark-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => updateSetting('preferences', 'aiAssistant', assistant.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{assistant.icon}</div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {assistant.name}
                  </h4>
                  {settings.preferences.aiAssistant === assistant.id && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {t('selected')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Preferences */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Palette className={`h-5 w-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('preferences')}
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('currency')}
              </label>
              <select
                value={settings.preferences.currency}
                onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDark 
                    ? 'bg-dark-700 border-dark-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="IDR">Indonesian Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('language')}
              </label>
              <div className="relative">
                <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                  className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-dark-700 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('theme')}
            </label>
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={settings.preferences.theme === option.value}
                      onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                      settings.preferences.theme === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isDark
                          ? 'border-dark-600 hover:border-dark-500 bg-dark-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                      <Icon className={`h-5 w-5 mr-2 ${
                        settings.preferences.theme === option.value 
                          ? 'text-blue-600' 
                          : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        settings.preferences.theme === option.value 
                          ? 'text-blue-600' 
                          : isDark ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Bell className={`h-5 w-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('notifications')}
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            { key: 'email', label: t('email_notifications'), description: t('receive_email_updates') },
            { key: 'whatsapp', label: t('whatsapp_notifications'), description: t('get_whatsapp_alerts') },
            { key: 'pushNotifications', label: t('push_notifications'), description: t('browser_notifications') },
            { key: 'lowStockAlerts', label: t('low_stock_alerts'), description: t('when_items_low') },
            { key: 'budgetAlerts', label: t('budget_alerts'), description: t('approaching_budget') },
            { key: 'monthlyReports', label: t('monthly_reports'), description: t('automated_summaries') }
          ].map((notification) => (
            <div key={notification.key} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
            }`}>
              <div className="flex-1">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {notification.label}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notification.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                  onChange={(e) => updateSetting('notifications', notification.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Security */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Shield className={`h-5 w-5 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('privacy_security')}
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            { key: 'dataSharing', label: t('data_sharing'), description: t('share_anonymized_data') },
            { key: 'analytics', label: t('analytics'), description: t('help_improve_app') },
            { key: 'marketing', label: t('marketing_communications'), description: t('receive_product_updates') }
          ].map((privacy) => (
            <div key={privacy.key} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
            }`}>
              <div className="flex-1">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {privacy.label}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {privacy.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy[privacy.key as keyof typeof settings.privacy]}
                  onChange={(e) => updateSetting('privacy', privacy.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className={`rounded-xl shadow-sm border transition-colors duration-300 ${
        isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-100'
      }`}>
        <div className="p-6 space-y-4">
          <button className={`w-full flex items-center justify-between p-4 text-left rounded-lg transition-colors ${
            isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
          }`}>
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('change_password')}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('update_account_password')}
              </p>
            </div>
            <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </button>

          <button className={`w-full flex items-center justify-between p-4 text-left rounded-lg transition-colors ${
            isDark ? 'hover:bg-dark-700' : 'hover:bg-gray-50'
          }`}>
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('export_data')}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('download_financial_data')}
              </p>
            </div>
            <ChevronRight className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </button>

          <button className={`w-full flex items-center justify-between p-4 text-left rounded-lg transition-colors text-red-600 ${
            isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
          }`}>
            <div>
              <h4 className="font-medium">{t('delete_account')}</h4>
              <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                {t('permanently_delete')}
              </p>
            </div>
            <ChevronRight className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-400'}`} />
          </button>
        </div>
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal 
        isOpen={isAISettingsOpen} 
        onClose={() => setIsAISettingsOpen(false)} 
      />
    </div>
  );
};

export default SettingsPage;