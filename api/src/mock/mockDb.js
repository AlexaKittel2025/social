/**
 * Arquivo de banco de dados mock para testes
 * Separado para facilitar a manutenção
 */

// Mock database - usuários apenas com dados essenciais
let mockUsers = [
  {
    id: 1,
    username: 'teste',
    email: 'teste@teste.com',
    password: '$2a$10$aBcDeFgHiJkLmNoPqRsTuVwXyZ/A1bcDefGhiJkL.mno/PQRSTU', // senha: teste123
    display_name: 'Usuário Teste',
    bio: 'Esta é uma conta de teste pré-criada para facilitar testes de login.',
    photo_url: 'https://i.pravatar.cc/150?img=1',
    role: 'USER',
    is_pro: false,
    points: 0,
    level: 1,
    created_at: new Date('2023-01-01').toISOString(),
    updated_at: new Date('2023-01-01').toISOString()
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@mentei.com',
    password: '$2a$10$aBcDeFgHiJkLmNoPqRsTuVwXyZ/A1bcDefGhiJkL.mno/PQRSTU', // senha: teste123
    display_name: 'Administrador',
    bio: 'Conta de administrador do sistema.',
    photo_url: 'https://i.pravatar.cc/150?img=2',
    role: 'ADMIN',
    is_pro: true,
    points: 1000,
    level: 10,
    created_at: new Date('2023-01-01').toISOString(),
    updated_at: new Date('2023-01-01').toISOString()
  }
];

// Mock de posts
let mockPosts = [
  {
    id: 1,
    user_id: 1,
    content: 'Este é um post de exemplo feito pelo usuário teste',
    image_url: null,
    is_generated: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 2,
    content: 'Este é um post de exemplo feito pelo administrador',
    image_url: null,
    is_generated: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Exportamos os dados e funções de manipulação
module.exports = {
  getUsers: () => mockUsers,
  getPosts: () => mockPosts,
  getUserById: (id) => mockUsers.find(u => u.id === id),
  getUserByUsername: (username) => mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase()),
  getUserByEmail: (email) => mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()),
  addUser: (user) => {
    const newUser = {
      id: mockUsers.length > 0 ? Math.max(...mockUsers.map(u => u.id)) + 1 : 1,
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  },
  clearUsers: () => {
    // Para testes, permite limpar todos os usuários exceto os dois iniciais
    const originalUsers = mockUsers.filter(u => u.id <= 2);
    mockUsers = originalUsers;
    console.log('Lista de usuários limpa para testes, mantendo apenas os originais');
    console.log('Usuários restantes:', mockUsers.map(u => ({ id: u.id, username: u.username })));
    return originalUsers;
  },
  clearUserByUsername: (username) => {
    // Remove um usuário específico pelo username
    const beforeCount = mockUsers.length;
    mockUsers = mockUsers.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    const afterCount = mockUsers.length;
    console.log(`Usuário ${username} removido: ${beforeCount !== afterCount ? 'SIM' : 'NÃO'}`);
    return beforeCount !== afterCount;
  },
  resetData: () => {
    // Resetar todos os dados para o estado inicial
    mockUsers = mockUsers.filter(u => u.id <= 2);
    mockPosts = mockPosts.filter(p => p.id <= 2);
    console.log('Dados resetados para o estado inicial');
    return true;
  }
}; 