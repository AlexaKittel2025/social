import React, { useState, useEffect } from 'react';
import { AchievementsSystemProps } from '../types/AchievementsSystemProps';

const AchievementsSystem: React.FC<AchievementsSystemProps> = ({ 
  user: userProp, 
  onLevelUp, 
  onNewAchievement 
}) => {
  const [user, setUser] = useState(userProp);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    checkAchievements();
  }, [user]);

  const checkAchievements = () => {
    // Lógica para verificar conquistas
    // Por enquanto retorna vazio
  };

  return (
    <div className="hidden">
      {/* Componente invisível que apenas processa conquistas */}
    </div>
  );
};

export default AchievementsSystem; 