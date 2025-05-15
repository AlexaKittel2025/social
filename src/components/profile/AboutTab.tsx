import React from 'react';
import { User } from '../../types';
import { UsersIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface AboutTabProps {
  user: User;
}

const AboutTab: React.FC<AboutTabProps> = ({ user }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Bio */}
      {user.bio && (
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">{user.bio}</p>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-center">
            <UsersIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
            {user.stats.followers || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Seguidores</p>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-center">
            <UsersIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
            {user.stats.following || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Seguindo</p>
        </div>
      </div>

      {/* Conquistas */}
      <div className="border-t dark:border-gray-700 pt-6">
        <div className="flex items-center mb-4">
          <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conquistas
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.level}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nível</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.points}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pontos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab; 