import { User, Post, Comment } from '../types/index';
import { appConfig, getApiUrl } from '../config';
import axios from 'axios';

// URL base da API - agora usando função para permitir alteração em tempo de execução
const getBaseUrl = () => getApiUrl();

// Funções auxiliares
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ocorreu um erro na requisição');
  }
  return response.json();
};

const api = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpar dados de autenticação e redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de Usuários
export const userApi = {
  login: async (email: string, password: string): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  register: async (userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  getProfile: async (username: string): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/${username}`);
    return handleResponse(response);
  },

  updateProfile: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await fetch(`${getBaseUrl()}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// API de Posts
export const postApi = {
  create: async (postData: Partial<Post>): Promise<Post> => {
    const response = await fetch(`${getBaseUrl()}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    return handleResponse(response);
  },

  getAll: async (): Promise<Post[]> => {
    const response = await fetch(`${getBaseUrl()}/posts`);
    return handleResponse(response);
  },

  getByUser: async (userId: string): Promise<Post[]> => {
    const response = await fetch(`${getBaseUrl()}/posts/user/${userId}`);
    return handleResponse(response);
  },

  update: async (postId: string, postData: Partial<Post>): Promise<Post> => {
    const response = await fetch(`${getBaseUrl()}/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    return handleResponse(response);
  },

  delete: async (postId: string): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/posts/${postId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// API de Comentários
export const commentApi = {
  create: async (commentData: Partial<Comment>): Promise<Comment> => {
    const response = await fetch(`${getBaseUrl()}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    return handleResponse(response);
  },

  getByPost: async (postId: string): Promise<Comment[]> => {
    const response = await fetch(`${getBaseUrl()}/comments/post/${postId}`);
    return handleResponse(response);
  },

  update: async (commentId: string, commentData: Partial<Comment>): Promise<Comment> => {
    const response = await fetch(`${getBaseUrl()}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });
    return handleResponse(response);
  },

  delete: async (commentId: string): Promise<void> => {
    const response = await fetch(`${getBaseUrl()}/comments/${commentId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

export default api; 