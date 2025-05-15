import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  HomeIcon, 
  FireIcon, 
  ChatBubbleLeftIcon as ChatIcon, 
  UserIcon, 
  BellIcon, 
  MagnifyingGlassIcon as SearchIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  Cog6ToothIcon as CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  ArrowLeftOnRectangleIcon as LoginIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import NotificationsModal from './NotificationsModal';
import ProPaymentModal from './ProPaymentModal';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showProPaymentModal, setShowProPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLoginLogout = () => {
    if (user) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleNotificationsModal = () => {
    setShowNotificationsModal(!showNotificationsModal);
    if (!showNotificationsModal) {
      setHasUnreadNotifications(false);
      setNotificationCount(0);
    }
  };

  const handleNotificationsRead = () => {
    setHasUnreadNotifications(false);
    setNotificationCount(0);
  };

  const handleOpenProPayment = () => {
    setShowProPaymentModal(true);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-extrabold text-primary">
                Mentei<span className="text-accent">!</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link 
                to="/" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Início
              </Link>
              <Link 
                to="/trending" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  location.pathname === '/trending' 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <FireIcon className="h-5 w-5 mr-1" />
                Tendências
              </Link>
              <Link 
                to="/chat" 
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  location.pathname === '/chat' 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <ChatIcon className="h-5 w-5 mr-1" />
                Chat
              </Link>
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <form onSubmit={handleSearchSubmit} className="relative mr-4">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <ThemeToggle />

            {user ? (
              <>
                <button
                  onClick={toggleNotificationsModal}
                  className="ml-4 p-2 text-gray-500 hover:text-primary relative"
                >
                  <BellIcon className="h-6 w-6" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                <div className="ml-4 relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center"
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.photoURL || 'https://via.placeholder.com/40'}
                      alt={user.displayName}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Seu Perfil
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Configurações
                      </Link>
                      <button
                        onClick={() => {
                          handleLoginLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/register"
                  className="text-gray-500 hover:text-primary font-medium"
                >
                  Cadastrar
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Abrir menu</span>
              <MenuIcon className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} />
              <XIcon className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 text-base font-medium ${
                location.pathname === '/'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/trending"
              className={`block px-3 py-2 text-base font-medium ${
                location.pathname === '/trending'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Tendências
            </Link>
            <Link
              to="/chat"
              className={`block px-3 py-2 text-base font-medium ${
                location.pathname === '/chat'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Chat
            </Link>
          </div>
        </div>
      )}

      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNotificationsRead={handleNotificationsRead}
      />

      <ProPaymentModal
        isOpen={showProPaymentModal}
        onClose={() => setShowProPaymentModal(false)}
      />
    </nav>
  );
};

export default Navbar; 