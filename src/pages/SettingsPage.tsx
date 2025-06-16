import React, { useState } from 'react';
import { User, Mail, Bell, Shield, Palette, Globe, Save, ChevronRight } from 'lucide-react';
import { aiAssistants } from '../data/mockData';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+62 812 3456 7890'
    },
    preferences: {
      aiAssistant: 'chatgpt',
      currency: 'IDR',
      language: 'id',
      theme: 'light'
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
    // Mock save functionality
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
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-1">
              <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                Change Photo
              </button>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">Choose your preferred AI assistant for financial insights</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {aiAssistants.map((assistant) => (
              <div
                key={assistant.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  settings.preferences.aiAssistant === assistant.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateSetting('preferences', 'aiAssistant', assistant.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{assistant.icon}</div>
                  <h4 className="font-medium text-gray-900">{assistant.name}</h4>
                  {settings.preferences.aiAssistant === assistant.id && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'whatsapp', label: 'WhatsApp Notifications', description: 'Get alerts on WhatsApp' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser notifications' },
            { key: 'lowStockAlerts', label: 'Low Stock Alerts', description: 'When items are running low' },
            { key: 'budgetAlerts', label: 'Budget Alerts', description: 'When approaching budget limits' },
            { key: 'monthlyReports', label: 'Monthly Reports', description: 'Automated monthly summaries' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{notification.label}</h4>
                <p className="text-sm text-gray-500">{notification.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                  onChange={(e) => updateSetting('notifications', notification.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Application Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Palette className="h-5 w-5 text-gray-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.preferences.currency}
                onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="IDR">Indonesian Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
            <div className="flex space-x-4">
              {['light', 'dark', 'auto'].map((theme) => (
                <label key={theme} className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.preferences.theme === theme}
                    onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            { key: 'dataSharing', label: 'Data Sharing', description: 'Share anonymized data for research' },
            { key: 'analytics', label: 'Analytics', description: 'Help improve the app with usage analytics' },
            { key: 'marketing', label: 'Marketing Communications', description: 'Receive product updates and offers' }
          ].map((privacy) => (
            <div key={privacy.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{privacy.label}</h4>
                <p className="text-sm text-gray-500">{privacy.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privacy[privacy.key as keyof typeof settings.privacy]}
                  onChange={(e) => updateSetting('privacy', privacy.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-4">
          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div>
              <h4 className="font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div>
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-500">Download your financial data</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-red-500">Permanently delete your account and data</p>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;