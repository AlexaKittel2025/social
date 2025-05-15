import api from './api';
import { Battle, Post } from '../types';

export interface BattleWithPosts extends Omit<Battle, 'votes'> {
  posts: Post[];
  votes: Record<string, number>;
  userVotes: Record<string, string>;
}

export const battleService = {
  // Buscar todas as batalhas
  async getBattles(page: number = 1, limit: number = 10): Promise<{ battles: Battle[]; total: number }> {
    const response = await api.get(`/battles?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Buscar batalhas PRO
  async getProBattles(): Promise<BattleWithPosts[]> {
    const { data } = await api.get<BattleWithPosts[]>('/battles/pro');
    return data;
  },

  // Buscar batalha por ID
  async getBattleById(id: string): Promise<BattleWithPosts> {
    const { data } = await api.get<BattleWithPosts>(`/battles/${id}`);
    return data;
  },

  // Criar nova batalha
  async createBattle(data: { title: string; description: string }): Promise<Battle> {
    const response = await api.post('/battles', data);
    return response.data;
  },

  // Participar de uma batalha
  async joinBattle(battleId: string): Promise<Battle> {
    const response = await api.post(`/battles/${battleId}/join`);
    return response.data;
  },

  // Sair de uma batalha
  async leaveBattle(battleId: string): Promise<Battle> {
    const response = await api.delete(`/battles/${battleId}/join`);
    return response.data;
  },

  // Votar em um post da batalha
  async voteInBattle(battleId: string, postId: string): Promise<BattleWithPosts> {
    const { data } = await api.post<BattleWithPosts>(`/battles/${battleId}/vote`, { postId });
    return data;
  },

  // Remover voto de um post da batalha
  async removeVoteFromBattle(battleId: string): Promise<BattleWithPosts> {
    const { data } = await api.delete<BattleWithPosts>(`/battles/${battleId}/vote`);
    return data;
  },

  // Buscar votos de uma batalha
  async getBattleVotes(battleId: string): Promise<{
    [postId: string]: number;
    total: number;
  }> {
    const response = await api.get(`/battles/${battleId}/votes`);
    return response.data;
  },

  // Buscar batalhas ativas
  async getActiveBattles(page: number = 1, limit: number = 10): Promise<{ battles: Battle[]; total: number }> {
    const response = await api.get(`/battles/active?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Buscar batalhas finalizadas
  async getFinishedBattles(page: number = 1, limit: number = 10): Promise<{ battles: Battle[]; total: number }> {
    const response = await api.get(`/battles/finished?page=${page}&limit=${limit}`);
    return response.data;
  }
};

export default battleService; 