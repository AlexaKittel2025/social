import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:grid md:grid-cols-4 md:gap-6">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            <Link
              to="/settings/account"
              className={`${
                location.pathname === '/settings/account'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              } group rounded-md px-3 py-2 flex items-center text-sm font-medium`}
            >
              Conta
            </Link>
            <Link
              to="/settings/profile"
              className={`${
                location.pathname === '/settings/profile'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              } group rounded-md px-3 py-2 flex items-center text-sm font-medium`}
            >
              Perfil
            </Link>
            <Link
              to="/settings/notifications"
              className={`${
                location.pathname === '/settings/notifications'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              } group rounded-md px-3 py-2 flex items-center text-sm font-medium`}
            >
              Notificações
            </Link>
            <Link
              to="/settings/theme"
              className={`${
                location.pathname === '/settings/theme'
                  ? 'bg-gray-100 dark:bg-gray-700 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              } group rounded-md px-3 py-2 flex items-center text-sm font-medium`}
            >
              Tema
            </Link>
          </nav>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-3">
          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <Routes>
              <Route path="account" element={<div>Configurações da Conta</div>} />
              <Route path="profile" element={<div>Configurações do Perfil</div>} />
              <Route path="notifications" element={<div>Configurações de Notificações</div>} />
              <Route path="theme" element={<div>Configurações de Tema</div>} />
              <Route path="" element={<div>Configurações da Conta</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 