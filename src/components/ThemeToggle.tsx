import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-500 hover:text-primary transition-colors duration-200"
      title="Alternar tema"
    >
      {theme === 'light' && <SunIcon className="h-6 w-6" />}
      {theme === 'dark' && <MoonIcon className="h-6 w-6" />}
      {theme === 'system' && <ComputerDesktopIcon className="h-6 w-6" />}
    </button>
  );
};

export default ThemeToggle; 