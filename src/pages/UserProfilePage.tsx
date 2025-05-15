import React from 'react';
import { useParams } from 'react-router-dom';

const UserProfilePage: React.FC = () => {
  const { username } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Perfil de {username}
        </h1>
        {/* Conteúdo do perfil do usuário */}
      </div>
    </div>
  );
};

export default UserProfilePage; 