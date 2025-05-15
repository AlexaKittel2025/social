import { User } from './index';

export interface AchievementsSystemProps {
  user: User;
  onLevelUp: (newLevel: number) => void;
  onNewAchievement: (achievementId: string) => void;
} 