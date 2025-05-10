const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

// Registrar um novo usuário
exports.register = async (req, res) => {
  try {
    const { username, displayName, email, password, photoURL, bio } = req.body;

    // Verificar se o usuário já existe
    const userExists = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Nome de usuário ou email já existe' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Inserir o novo usuário
    const result = await db.query(
      `INSERT INTO users (
        username, display_name, email, photo_url, bio, points, level, is_pro, password_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [username, displayName, email, photoURL || null, bio || null, 0, 1, false, passwordHash]
    );

    const newUser = result.rows[0];
    
    // Criar configurações padrão para o usuário
    await db.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [newUser.id]
    );

    // Gerar token JWT
    const token = jwt.sign({ id: newUser.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

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

    // Verificar se o usuário existe
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = result.rows[0];

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
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        photoURL: user.photo_url || '',
        bio: user.bio || '',
        points: user.points,
        level: user.level,
        isPro: user.is_pro,
        createdAt: user.created_at
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