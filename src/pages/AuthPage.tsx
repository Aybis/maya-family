import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/useThemeStore';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { t, i18n } = useTranslation();
  const { theme, isDark, toggleTheme } = useThemeStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  const socialLogins = [
    { name: 'Google', icon: '🔍', color: isDark ? 'bg-dark-800 hover:bg-dark-700 text-white border border-dark-600' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300' },
    { name: 'Apple', icon: '🍎', color: isDark ? 'bg-white hover:bg-gray-100 text-black border border-white' : 'bg-black hover:bg-gray-900 text-white border border-black' },
    { name: 'GitHub', icon: '🐙', color: isDark ? 'bg-dark-700 hover:bg-dark-600 text-white border border-dark-500' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-800' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-emerald-50'
    } flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Theme and Language Controls */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={toggleLanguage}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-dark-800 hover:bg-dark-700 text-white border border-dark-600' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            }`}
          >
            <Globe className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {i18n.language === 'en' ? 'EN' : 'ID'}
            </span>
          </button>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-dark-800 hover:bg-dark-700 text-yellow-400 border border-dark-600' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            }`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg ${
            isDark ? 'shadow-dark-900/50' : ''
          }`}>
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Family Finance AI
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Smart financial management for families
          </p>
        </div>

        {/* Auth Card */}
        <div className={`rounded-2xl shadow-xl p-8 border transition-colors duration-300 ${
          isDark 
            ? 'bg-dark-800 border-dark-700 shadow-dark-900/50' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="mb-8">
            <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('welcome_back')}
            </h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {t('sign_in_subtitle')}
            </p>
          </div>

          {/* Email/Password Form - Primary */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('email_address')}
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={t('enter_email')}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {t('password')}
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark 
                      ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={t('enter_password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 transition-colors ${
                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('remember_me')}
                </span>
              </label>
              <button 
                type="button" 
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                {t('forgot_password')}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              {t('sign_in')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-dark-600' : 'border-gray-300'}`}></div>
            </div>
            <div className={`relative px-4 ${isDark ? 'bg-dark-800' : 'bg-white'}`}>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('or_continue_with')}
              </span>
            </div>
          </div>

          {/* Social Login Buttons - Secondary */}
          <div className="space-y-3 mb-6">
            {socialLogins.map((social) => (
              <button
                key={social.name}
                onClick={onLogin}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] ${social.color}`}
              >
                <span className="mr-3 text-lg">{social.icon}</span>
                {t('continue_with')} {social.name}
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('no_account')}{' '}
              <button className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                {t('sign_up')}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('terms_privacy')}{' '}
            <button className="text-blue-600 hover:text-blue-500 transition-colors">
              {t('terms_of_service')}
            </button>
            {' '}{t('and')}{' '}
            <button className="text-blue-600 hover:text-blue-500 transition-colors">
              {t('privacy_policy')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;