const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

// Função auxiliar para converter um usuário do Prisma para o formato da API
const mapPrismaUserToApiUser = (prismaUser) => {
  return {
    id: prismaUser.id,
    username: prismaUser.username,
    displayName: prismaUser.display_name,
    email: prismaUser.email,
    photoURL: prismaUser.photo_url || '',
    bio: prismaUser.bio || '',
    points: prismaUser.points,
    level: prismaUser.level,
    isPro: prismaUser.is_pro,
    createdAt: prismaUser.created_at
  };
};

// Registrar um novo usuário
exports.register = async (req, res) => {
  console.log('Recebida requisição de registro com dados:', {
    username: req.body.username,
    email: req.body.email,
    hasPassword: !!req.body.password
  });
  
  try {
    const { username, displayName, email, password, photoURL, bio } = req.body;

    console.log('Validando dados recebidos para registro');
    
    // Verificar se temos todos os campos obrigatórios
    if (!username || !email || !password) {
      console.log('Erro: Campos obrigatórios ausentes', { 
        hasUsername: !!username, 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }
    
    // Se não estamos em modo mock, tentamos usar Prisma
    if (!db.isMockMode) {
      try {
        console.log('Verificando usuário existente com Prisma');
        // Verificar se o usuário já existe no Prisma
        const existingUser = await db.prisma.user.findFirst({
          where: {
            OR: [
              { username },
              { email }
            ]
          }
        });

        if (existingUser) {
          console.log('Usuário existente encontrado com Prisma:', {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email
          });

          if (existingUser.username === username && existingUser.email === email) {
            return res.status(400).json({ error: 'Nome de usuário e email já estão cadastrados' });
          } else if (existingUser.username === username) {
            return res.status(400).json({ error: 'Nome de usuário já cadastrado' });
          } else if (existingUser.email === email) {
            return res.status(400).json({ error: 'Email já cadastrado' });
          }
          return res.status(400).json({ error: 'Nome de usuário ou email já existe' });
        }

        // Criar o hash da senha
        console.log('Criando hash da senha com Prisma');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Criar o usuário usando Prisma
        console.log('Inserindo novo usuário no banco de dados com Prisma');
        const newUser = await db.prisma.user.create({
          data: {
            username,
            display_name: displayName || username,
            email,
            password_hash: passwordHash,
            photo_url: photoURL || null,
            bio: bio || null,
            // Valores padrão já definidos no schema
            settings: {
              create: {} // Criar as configurações padrão
            }
          },
          include: {
            settings: true
          }
        });

        console.log('Usuário criado com Prisma:', {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        });

        // Gerar token JWT
        console.log('Gerando token JWT');
        const token = jwt.sign({ id: newUser.id }, config.jwt.secret, {
          expiresIn: config.jwt.expiresIn
        });

        // Retornar usuário e token
        return res.status(201).json({
          user: mapPrismaUserToApiUser(newUser),
          token
        });
      } catch (prismaError) {
        console.error('Erro ao usar Prisma para registro:', prismaError);
        console.log('Caindo para o modo SQL tradicional');
        // Continuar com o método SQL tradicional abaixo
      }
    }
    
    // Modo mock ou fallback do Prisma: usar o método SQL tradicional
    // Verificar se o usuário já existe
    console.log('Verificando se usuário já existe:', { username, email });
    const userExists = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    console.log('Resultado da verificação:', { encontrados: userExists.rows.length });
    
    if (userExists.rows.length > 0) {
      // Verificar específicamente qual campo já existe
      const existingUser = userExists.rows[0];
      console.log('Usuário existente encontrado:', { 
        id: existingUser.id, 
        username: existingUser.username, 
        email: existingUser.email 
      });
      
      if (existingUser.username === username && existingUser.email === email) {
        return res.status(400).json({ error: 'Nome de usuário e email já estão cadastrados' });
      } else if (existingUser.username === username) {
        return res.status(400).json({ error: 'Nome de usuário já cadastrado' });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      return res.status(400).json({ error: 'Nome de usuário ou email já existe' });
    }

    console.log('Criando hash da senha');
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('Inserindo novo usuário no banco de dados');
    // Inserir o novo usuário
    const result = await db.query(
      `INSERT INTO users (
        username, display_name, email, photo_url, bio, points, level, is_pro, password_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [username, displayName || username, email, photoURL || null, bio || null, 0, 1, false, passwordHash]
    );

    console.log('Usuário criado com ID:', result.rows[0]?.id);
    const newUser = result.rows[0];
    
    console.log('Criando configurações para o usuário');
    // Criar configurações padrão para o usuário
    await db.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [newUser.id]
    );

    console.log('Gerando token JWT');
    // Gerar token JWT
    const token = jwt.sign({ id: newUser.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    console.log('Registro completo com sucesso');
    // Retornar usuário e token
    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.display_name,
        email: newUser.email,
        photoURL: newUser.photo_url || '',
        bio: newUser.bio || '',
        points: newUser.points,
        level: newUser.level,
        isPro: newUser.is_pro,
        createdAt: newUser.created_at
      },
      token
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Se não estamos em modo mock, tentamos usar Prisma
    if (!db.isMockMode) {
      try {
        console.log('Buscando usuário para login com Prisma');
        // Buscar usuário pelo email
        const user = await db.prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Verificar a senha
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.id }, config.jwt.secret, {
          expiresIn: config.jwt.expiresIn
        });

        // Retornar usuário e token
        return res.json({
          user: mapPrismaUserToApiUser(user),
          token
        });
      } catch (prismaError) {
        console.error('Erro ao usar Prisma para login:', prismaError);
        console.log('Caindo para o modo SQL tradicional');
        // Continuar com o método SQL tradicional abaixo
      }
    }

    // Modo mock ou fallback do Prisma: usar o método SQL tradicional
    // Verificar se o usuário existe
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];

    // Verificar a senha - adaptação para modo mock onde o campo pode ser password ou password_hash
    const passwordField = user.password_hash ? 'password_hash' : 'password';
    console.log(`Campo de senha encontrado: ${passwordField}`);
    
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user[passwordField]);
    } catch (err) {
      console.error('Erro ao comparar senha:', err);
      // Para fins de teste, permitir login se senha for teste123
      if (db.isMockMode && password === 'teste123') {
        console.log('Modo mock: Login permitido com senha de teste');
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar token JWT
    const token = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    // Retornar usuário e token
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name || user.displayName,
        email: user.email,
        photoURL: user.photo_url || user.avatarUrl || '',
        bio: user.bio || '',
        points: user.points || 0,
        level: user.level || 1,
        isPro: user.is_pro || user.premium || false,
        createdAt: user.created_at || user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter usuário por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Se não estamos em modo mock, tentamos usar Prisma
    if (!db.isMockMode) {
      try {
        console.log('Buscando usuário por ID com Prisma');
        // Buscar usuário pelo ID, incluindo configurações e conquistas
        const user = await db.prisma.user.findUnique({
          where: { id },
          include: {
            settings: true,
            achievements: true
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Formatar as conquistas
        const achievements = user.achievements.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          earnedAt: achievement.earned_at
        }));

        // Formatar as configurações
        const settings = user.settings ? {
          notifications: {
            email: user.settings.notifications_email,
            push: user.settings.notifications_in_app,
            newFollowers: user.settings.notifications_followers,
            reactions: user.settings.notifications_reactions,
            comments: user.settings.notifications_comments,
            mentions: user.settings.notifications_mentions
          },
          privacy: {
            profileVisibility: user.settings.privacy_profile,
            activityVisibility: user.settings.privacy_online_status,
            allowMessageRequests: user.settings.privacy_mentions
          },
          appearance: {
            theme: user.settings.theme,
            fontSize: user.settings.appearance_font_size
          },
          language: user.settings.language,
          contentPreferences: {
            adultContent: user.settings.adult_content,
            violentContent: user.settings.violent_content,
            sensitiveContent: user.settings.sensitive_content
          }
        } : null;

        // Retornar usuário formatado
        return res.json({
          ...mapPrismaUserToApiUser(user),
          location: (user.city || user.state) ? {
            city: user.city || '',
            state: user.state || ''
          } : undefined,
          achievements,
          settings
        });
      } catch (prismaError) {
        console.error('Erro ao usar Prisma para buscar usuário:', prismaError);
        console.log('Caindo para o modo SQL tradicional');
        // Continuar com o método SQL tradicional abaixo
      }
    }

    // Modo mock ou fallback do Prisma: usar o método SQL tradicional
    // Buscar usuário no banco
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Buscar conquistas do usuário
    const achievementsResult = await db.query(
      `SELECT a.id, a.title, a.description, a.icon, ua.earned_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = $1`,
      [id]
    );

    const achievements = achievementsResult.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      icon: row.icon,
      earnedAt: row.earned_at
    }));

    // Buscar configurações do usuário
    const settingsResult = await db.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [id]
    );

    const settings = settingsResult.rows.length > 0 ? {
      notifications: {
        email: settingsResult.rows[0].notifications_email,
        push: settingsResult.rows[0].notifications_push,
        newFollowers: settingsResult.rows[0].notifications_new_followers,
        reactions: settingsResult.rows[0].notifications_reactions,
        comments: settingsResult.rows[0].notifications_comments,
        mentions: settingsResult.rows[0].notifications_mentions
      },
      privacy: {
        profileVisibility: settingsResult.rows[0].privacy_profile_visibility,
        activityVisibility: settingsResult.rows[0].privacy_activity_visibility,
        allowMessageRequests: settingsResult.rows[0].privacy_allow_message_requests
      },
      appearance: {
        theme: settingsResult.rows[0].appearance_theme,
        fontSize: settingsResult.rows[0].appearance_font_size
      },
      language: settingsResult.rows[0].language,
      contentPreferences: {
        adultContent: settingsResult.rows[0].content_preferences_adult,
        violentContent: settingsResult.rows[0].content_preferences_violent,
        sensitiveContent: settingsResult.rows[0].content_preferences_sensitive
      }
    } : null;

    // Retornar usuário formatado
    return res.json({
      id: user.id.toString(),
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      photoURL: user.photo_url || '',
      bio: user.bio || undefined,
      points: user.points,
      level: user.level,
      isPro: user.is_pro,
      createdAt: user.created_at,
      location: (user.city || user.state) ? {
        city: user.city || '',
        state: user.state || ''
      } : undefined,
      achievements,
      settings
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter usuário por nome de usuário
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Buscar usuário no banco
    const userResult = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Buscar conquistas do usuário
    const achievementsResult = await db.query(
      `SELECT a.id, a.title, a.description, a.icon, ua.earned_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = $1`,
      [user.id]
    );

    const achievements = achievementsResult.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      icon: row.icon,
      earnedAt: row.earned_at
    }));

    // Retornar usuário formatado
    return res.json({
      id: user.id.toString(),
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      photoURL: user.photo_url || '',
      bio: user.bio || undefined,
      points: user.points,
      level: user.level,
      isPro: user.is_pro,
      createdAt: user.created_at,
      location: (user.city || user.state) ? {
        city: user.city || '',
        state: user.state || ''
      } : undefined,
      achievements
    });
  } catch (error) {
    console.error('Erro ao buscar usuário por username:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar usuário
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, photoURL, bio, location } = req.body;

    // Verificar se o usuário existe
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário autenticado é o dono do perfil
    if (req.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Não autorizado a atualizar este perfil' });
    }

    const user = userResult.rows[0];

    // Atualizar usuário
    const result = await db.query(
      `UPDATE users SET 
        display_name = $1,
        photo_url = $2,
        bio = $3,
        city = $4,
        state = $5
      WHERE id = $6 RETURNING *`,
      [
        displayName || user.display_name,
        photoURL !== undefined ? photoURL : user.photo_url,
        bio !== undefined ? bio : user.bio,
        location?.city || user.city,
        location?.state || user.state,
        id
      ]
    );

    const updatedUser = result.rows[0];

    // Retornar usuário atualizado
    return res.json({
      id: updatedUser.id.toString(),
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      email: updatedUser.email,
      photoURL: updatedUser.photo_url || '',
      bio: updatedUser.bio || undefined,
      points: updatedUser.points,
      level: updatedUser.level,
      isPro: updatedUser.is_pro,
      createdAt: updatedUser.created_at,
      location: (updatedUser.city || updatedUser.state) ? {
        city: updatedUser.city || '',
        state: updatedUser.state || ''
      } : undefined
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Verificar status PRO
exports.checkProStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const userResult = await db.query(
      'SELECT is_pro FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json({ isPro: userResult.rows[0].is_pro });
  } catch (error) {
    console.error('Erro ao verificar status PRO:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar para PRO
exports.upgradeToPro = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const userResult = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário autenticado é o dono do perfil
    if (req.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Não autorizado a atualizar este perfil' });
    }

    // Atualizar para PRO
    const result = await db.query(
      'UPDATE users SET is_pro = true WHERE id = $1 RETURNING is_pro',
      [id]
    );

    return res.json({ success: true, isPro: result.rows[0].is_pro });
  } catch (error) {
    console.error('Erro ao atualizar para PRO:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter perfil do usuário autenticado
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Se não estamos em modo mock, tentamos usar Prisma
    if (!db.isMockMode) {
      try {
        console.log('Buscando perfil do usuário com Prisma');
        // Buscar usuário pelo ID, incluindo configurações e conquistas
        const user = await db.prisma.user.findUnique({
          where: { id: userId },
          include: {
            settings: true,
            achievements: true
          }
        });

        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Formatar as conquistas
        const achievements = user.achievements.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          earnedAt: achievement.earned_at
        }));

        // Retornar usuário formatado
        return res.json({
          ...mapPrismaUserToApiUser(user),
          location: (user.city || user.state) ? {
            city: user.city || '',
            state: user.state || ''
          } : undefined,
          achievements
        });
      } catch (prismaError) {
        console.error('Erro ao usar Prisma para buscar perfil:', prismaError);
        console.log('Caindo para o modo SQL tradicional');
        // Continuar com o método SQL tradicional abaixo
      }
    }

    // Modo mock ou fallback do Prisma: usar o método SQL tradicional
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Buscar conquistas do usuário
    const achievementsResult = await db.query(
      `SELECT a.id, a.title, a.description, a.icon, ua.earned_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = $1`,
      [userId]
    );

    const achievements = achievementsResult.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      icon: row.icon,
      earnedAt: row.earned_at
    }));

    // Retornar usuário formatado
    return res.json({
      id: user.id.toString(),
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      photoURL: user.photo_url || '',
      bio: user.bio || undefined,
      points: user.points,
      level: user.level,
      isPro: user.is_pro,
      createdAt: user.created_at,
      location: (user.city || user.state) ? {
        city: user.city || '',
        state: user.state || ''
      } : undefined,
      achievements
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 