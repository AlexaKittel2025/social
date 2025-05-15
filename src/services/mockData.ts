import { User, Post, Notification, Storyment, Battle } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'joaosilva',
    displayName: 'João Silva',
    email: 'joao@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=joao',
    coverImage: 'https://picsum.photos/1000/300',
    bio: 'Contador de histórias profissional',
    points: 1500,
    level: 5,
    isPro: true,
    createdAt: new Date(2022, 8, 15).toISOString(),
    stats: { followers: 142, following: 89, posts: 0, battles: 0 }
  },
  {
    id: 'user2',
    username: 'mariasilva',
    displayName: 'Maria Silva',
    email: 'maria@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=maria',
    coverImage: 'https://picsum.photos/1000/300',
    bio: 'Amante de boas histórias',
    points: 800,
    level: 3,
    isPro: false,
    createdAt: new Date(2023, 1, 22).toISOString(),
    stats: { followers: 87, following: 120, posts: 0, battles: 0 }
  }
];

export const mockPosts: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    content: 'Uma história incrível sobre como eu encontrei um tesouro perdido...',
    tags: ['aventura', 'tesouro'],
    reactions: {
      quaseAcreditei: 15,
      hahaha: 8,
      mentiraEpica: 12
    },
    userReactions: {},
    judgements: {
      crivel: 10,
      inventiva: 8,
      totalmentePirada: 5
    },
    userJudgements: {},
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    commentCount: 5
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user1',
    type: 'reaction',
    content: 'Usuário reagiu com "Quase Acreditei" na sua mentira',
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    relatedId: 'post1',
    senderId: 'user2'
  }
];

export const mockStoryments: Storyment[] = [
  {
    id: 'story1',
    userId: 'user1',
    content: 'Acabei de contar a maior mentira da minha vida e meus pais acreditaram! 😂',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  }
];

export const mockBattles: Battle[] = [
  {
    id: 'battle1',
    title: 'Batalha de Mentiras Épicas',
    status: 'active',
    startDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    participants: []
  }
]; 