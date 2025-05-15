import api from './api';
import { Post, Comment, ReactionType, JudgementType } from '../types';

export const postService = {
  // Buscar posts
  async getPosts(page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Buscar posts de um usuário
  async getUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
    const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Criar novo post
  async createPost(data: { content: string; imageURL?: string; tags?: string[] }): Promise<Post> {
    const response = await api.post('/posts', data);
    return response.data;
  },

  // Atualizar post
  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  // Deletar post
  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },

  // Adicionar reação
  async addReaction(postId: string, type: ReactionType): Promise<Post> {
    const response = await api.post(`/posts/${postId}/reactions`, { type });
    return response.data;
  },

  // Remover reação
  async removeReaction(postId: string, type: ReactionType): Promise<Post> {
    const response = await api.delete(`/posts/${postId}/reactions/${type}`);
    return response.data;
  },

  // Adicionar julgamento
  async addJudgement(postId: string, type: JudgementType): Promise<Post> {
    const response = await api.post(`/posts/${postId}/judgements`, { type });
    return response.data;
  },

  // Remover julgamento
  async removeJudgement(postId: string, type: JudgementType): Promise<Post> {
    const response = await api.delete(`/posts/${postId}/judgements/${type}`);
    return response.data;
  },

  // Buscar comentários de um post
  async getComments(postId: string, page: number = 1, limit: number = 10): Promise<{ comments: Comment[]; total: number }> {
    const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Adicionar comentário
  async addComment(postId: string, content: string): Promise<Comment> {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  // Deletar comentário
  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  }
}; 