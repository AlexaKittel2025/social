import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.photoURL || 'https://via.placeholder.com/100'}
            alt={user?.displayName || 'Usuário'}
            className="h-20 w-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.displayName || 'Usuário'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 