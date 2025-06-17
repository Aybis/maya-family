import React, { useState } from 'react';
import { X, Key, Zap, Shield, Info } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { useAIStore } from '../store/useAIStore';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useThemeStore();
  const { settings, updateSettings } = useAIStore();
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (tempApiKey.trim()) {
      updateSettings({ apiKey: tempApiKey.trim() });
    }
    onClose();
  };

  const providers = [
    {
      id: 'mock',
      name: 'Demo Mode',
      description: 'Use mock AI responses for testing',
      icon: '🎭',
      requiresKey: false
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4 Vision',
      description: 'Advanced image recognition with GPT-4',
      icon: '🤖',
      requiresKey: true
    },
    {
      id: 'gemini',
      name: 'Google Gemini Pro Vision',
      description: 'Google\'s multimodal AI model',
      icon: '✨',
      requiresKey: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-dark-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center">
            <Zap className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Settings
            </h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-96">
          {/* Provider Selection */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Provider
            </h3>
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    settings.provider === provider.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDark
                        ? 'border-dark-600 hover:border-dark-500 bg-dark-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => updateSettings({ provider: provider.id as any })}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{provider.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {provider.name}
                      </h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {provider.description}
                      </p>
                      {provider.requiresKey && (
                        <div className="flex items-center mt-2">
                          <Key className="h-4 w-4 mr-1 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Requires API Key
                          </span>
                        </div>
                      )}
                    </div>
                    {settings.provider === provider.id && (
                      <div className="ml-2">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          {settings.provider !== 'mock' && (
            <div>
              <div className="flex items-center mb-3">
                <Key className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  API Key
                </h3>
              </div>
              
              <div className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-amber-900/20 border-amber-800' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start mb-3">
                  <Info className={`h-4 w-4 mt-0.5 mr-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <div className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    <p className="font-medium mb-1">API Key Required</p>
                    <p>
                      {settings.provider === 'openai' 
                        ? 'Get your API key from OpenAI Platform (platform.openai.com)'
                        : 'Get your API key from Google AI Studio (makersuite.google.com)'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={`Enter your ${settings.provider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isDark 
                        ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div>
            <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Advanced Settings
            </h3>
            
            <div className="space-y-4">
              {/* Auto Process */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Auto Process
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Automatically process receipts after capture
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoProcess}
                    onChange={(e) => updateSettings({ autoProcess: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Confidence Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Confidence Threshold
                  </h4>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Math.round(settings.confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Minimum confidence required to auto-accept results
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className={`p-4 rounded-lg border ${
            isDark 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start">
              <Shield className={`h-4 w-4 mt-0.5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                <p className="font-medium mb-1">Privacy & Security</p>
                <p>
                  API keys are stored locally and never sent to our servers. 
                  Images are processed directly by the AI provider you choose.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t transition-colors duration-300 ${
          isDark ? 'border-dark-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;