import api from './api';
import { User } from '../types';

export interface RankingUser {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
  points: number;
  postCount: number;
}

export type RankingPeriod = 'all-time' | 'month' | 'week';

export const rankingService = {
  // Buscar ranking por período
  async getRanking(period: RankingPeriod): Promise<RankingUser[]> {
    const response = await api.get(`/ranking/${period}`);
    return response.data;
  },

  // Buscar ranking geral
  async getGeneralRanking(): Promise<RankingUser[]> {
    const response = await api.get('/ranking/general');
    return response.data;
  },

  // Buscar ranking por categoria
  async getCategoryRanking(category: string): Promise<RankingUser[]> {
    const response = await api.get(`/ranking/category/${category}`);
    return response.data;
  },

  // Buscar posição do usuário no ranking
  async getUserRankingPosition(userId: string): Promise<{
    position: number;
    points: number;
    total: number;
  }> {
    const response = await api.get(`/ranking/user/${userId}`);
    return response.data;
  }
}; 