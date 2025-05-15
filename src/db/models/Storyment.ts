import { Storyment } from '../../types';

export type { Storyment };

export const createStoryment = (data: Partial<Storyment>): Storyment => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  return {
    id: data.id || crypto.randomUUID(),
    userId: data.userId || '',
    content: data.content || '',
    createdAt: data.createdAt || now.toISOString(),
    expiresAt: data.expiresAt || expiresAt.toISOString()
  };
}; 