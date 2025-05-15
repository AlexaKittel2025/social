import api from './api';
import { User, UserSettings } from '../types';

export const getCurrentUserProStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await api.get<User>(`/users/${userId}/pro-status`);
    return data.isPro || false;
  } catch (error) {
    console.error('Erro ao verificar status PRO:', error);
    return false;
  }
};

export const userService = {
  // Buscar usuário por ID
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Buscar usuário por username
  async getUserByUsername(username: string): Promise<User> {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },

  // Atualizar informações do usuário
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Atualizar configurações do usuário
  async updateUserSettings(id: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put(`/users/${id}/settings`, settings);
    return response.data;
  },

  // Seguir usuário
  async followUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/follow`);
  },

  // Deixar de seguir usuário
  async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/follow`);
  },

  // Buscar seguidores do usuário
  async getUserFollowers(userId: string): Promise<User[]> {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Buscar usuários que o usuário segue
  async getUserFollowing(userId: string): Promise<User[]> {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  // Verificar status PRO do usuário
  async getUserProStatus(userId: string): Promise<boolean> {
    const response = await api.get(`/users/${userId}/pro-status`);
    return response.data.isPro;
  },

  getCurrentUserProStatus
};

export default userService; 