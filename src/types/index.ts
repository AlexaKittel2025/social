export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string;
  coverImage: string;
  bio: string;
  points: number;
  level: number;
  isPro: boolean;
  createdAt: string;
  stats: {
    followers: number;
    following: number;
    posts: number;
    battles: number;
  };
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  reactions: {
    quaseAcreditei: number;
    hahaha: number;
    mentiraEpica: number;
  };
  userReactions: Record<string, string>;
  judgements: {
    crivel: number;
    inventiva: number;
    totalmentePirada: number;
  };
  userJudgements: Record<string, string>;
  createdAt: string;
  commentCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reaction' | 'comment' | 'follow' | 'battle';
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId: string;
  senderId: string;
}

export interface Battle {
  id: string;
  title: string;
  status: 'active' | 'voting' | 'finished';
  startDate: string;
  createdAt: string;
  participants: {
    id: string;
    userId: string;
    postId: string;
    votes: number;
  }[];
}

export interface Storyment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  reactions: {
    [key: string]: number;
  };
  user?: User;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    comments: boolean;
    reactions: boolean;
    messages: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'followers';
    showOnlineStatus: boolean;
    allowMessages: boolean;
    showActivity: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    allowAccountRecovery: boolean;
  };
}

export type NotificationType = 'reaction' | 'comment' | 'follow' | 'mention' | 'battle' | 'system';
export type BattleStatus = 'draft' | 'active' | 'voting' | 'finished' | 'cancelled';
export type ReactionType = 'quaseAcreditei' | 'hahaha' | 'mentiraEpica';
export type JudgementType = 'crivel' | 'inventiva' | 'totalmentePirada';

export const judgementLabels = {
  likes: 'Gostei',
  dislikes: 'Não Gostei',
  almostBelieved: 'Quase Acreditei',
  totallyFake: 'Totalmente Fake'
}; 