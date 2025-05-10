const db = require('../db');

// Obter storyments ativos
exports.getActiveStoryments = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Buscar storyments que ainda não expiraram
    const storymentsResult = await db.query(
      `SELECT s.*, u.username, u.display_name, u.photo_url
       FROM storyments s
       JOIN users u ON s.user_id = u.id
       WHERE s.expires_at > NOW()
       ORDER BY s.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const storyments = [];
    
    for (const storyment of storymentsResult.rows) {
      // Verificar se o usuário atual já visualizou este storyment
      const viewResult = await db.query(
        'SELECT 1 FROM storyment_views WHERE storyment_id = $1 AND user_id = $2',
        [storyment.id, req.userId]
      );
      
      const hasViewed = viewResult.rows.length > 0;
      
      // Contar visualizações
      const viewsResult = await db.query(
        'SELECT COUNT(*) AS view_count FROM storyment_views WHERE storyment_id = $1',
        [storyment.id]
      );
      
      const viewCount = parseInt(viewsResult.rows[0].view_count);
      
      storyments.push({
        id: storyment.id.toString(),
        userId: storyment.user_id.toString(),
        content: storyment.content,
        backgroundColor: storyment.background_color,
        textColor: storyment.text_color,
        createdAt: storyment.created_at,
        expiresAt: storyment.expires_at,
        views: viewCount,
        hasViewed,
        user: {
          id: storyment.user_id.toString(),
          username: storyment.username,
          displayName: storyment.display_name,
          photoURL: storyment.photo_url
        }
      });
    }
    
    return res.json(storyments);
  } catch (error) {
    console.error('Erro ao buscar storyments ativos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter storyment por ID
exports.getStorymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storymentResult = await db.query(
      `SELECT s.*, u.username, u.display_name, u.photo_url
       FROM storyments s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    
    if (storymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Storyment não encontrado' });
    }
    
    const storyment = storymentResult.rows[0];
    
    // Contar visualizações
    const viewsResult = await db.query(
      'SELECT COUNT(*) AS view_count FROM storyment_views WHERE storyment_id = $1',
      [id]
    );
    
    const viewCount = parseInt(viewsResult.rows[0].view_count);
    
    // Verificar se o usuário atual já visualizou este storyment
    const viewResult = await db.query(
      'SELECT 1 FROM storyment_views WHERE storyment_id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    const hasViewed = viewResult.rows.length > 0;
    
    return res.json({
      id: storyment.id.toString(),
      userId: storyment.user_id.toString(),
      content: storyment.content,
      backgroundColor: storyment.background_color,
      textColor: storyment.text_color,
      createdAt: storyment.created_at,
      expiresAt: storyment.expires_at,
      views: viewCount,
      hasViewed,
      user: {
        id: storyment.user_id.toString(),
        username: storyment.username,
        displayName: storyment.display_name,
        photoURL: storyment.photo_url
      }
    });
  } catch (error) {
    console.error('Erro ao buscar storyment por ID:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter storyments por usuário
exports.getStorymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, includeExpired = false } = req.query;
    
    let query;
    const queryParams = [userId, limit, offset];
    
    if (includeExpired === 'true') {
      // Buscar todos os storyments do usuário
      query = `SELECT s.*, u.username, u.display_name, u.photo_url
               FROM storyments s
               JOIN users u ON s.user_id = u.id
               WHERE s.user_id = $1
               ORDER BY s.created_at DESC
               LIMIT $2 OFFSET $3`;
    } else {
      // Buscar apenas storyments ativos do usuário
      query = `SELECT s.*, u.username, u.display_name, u.photo_url
               FROM storyments s
               JOIN users u ON s.user_id = u.id
               WHERE s.user_id = $1 AND s.expires_at > NOW()
               ORDER BY s.created_at DESC
               LIMIT $2 OFFSET $3`;
    }
    
    const storymentsResult = await db.query(query, queryParams);
    
    const storyments = [];
    
    for (const storyment of storymentsResult.rows) {
      // Contar visualizações
      const viewsResult = await db.query(
        'SELECT COUNT(*) AS view_count FROM storyment_views WHERE storyment_id = $1',
        [storyment.id]
      );
      
      const viewCount = parseInt(viewsResult.rows[0].view_count);
      
      // Verificar se o usuário atual já visualizou este storyment
      const viewResult = await db.query(
        'SELECT 1 FROM storyment_views WHERE storyment_id = $1 AND user_id = $2',
        [storyment.id, req.userId]
      );
      
      const hasViewed = viewResult.rows.length > 0;
      
      storyments.push({
        id: storyment.id.toString(),
        userId: storyment.user_id.toString(),
        content: storyment.content,
        backgroundColor: storyment.background_color,
        textColor: storyment.text_color,
        createdAt: storyment.created_at,
        expiresAt: storyment.expires_at,
        views: viewCount,
        hasViewed,
        user: {
          id: storyment.user_id.toString(),
          username: storyment.username,
          displayName: storyment.display_name,
          photoURL: storyment.photo_url
        }
      });
    }
    
    return res.json(storyments);
  } catch (error) {
    console.error('Erro ao buscar storyments por usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar um novo storyment
exports.createStoryment = async (req, res) => {
  try {
    const { userId, content, backgroundColor, textColor, expiresAt } = req.body;
    
    // Verificar se o usuário autenticado é o mesmo que está criando o storyment
    if (req.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Não autorizado a criar storyment para este usuário' });
    }
    
    // Definir data de expiração (24 horas por padrão se não for especificado)
    const defaultExpiration = new Date();
    defaultExpiration.setHours(defaultExpiration.getHours() + 24);
    
    const expiration = expiresAt ? new Date(expiresAt) : defaultExpiration;
    
    // Inserir novo storyment
    const result = await db.query(
      `INSERT INTO storyments (
        user_id, content, background_color, text_color, expires_at
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, content, backgroundColor, textColor, expiration]
    );
    
    const storyment = result.rows[0];
    
    // Buscar informações do usuário
    const userResult = await db.query(
      'SELECT username, display_name, photo_url FROM users WHERE id = $1',
      [userId]
    );
    
    const user = userResult.rows[0];
    
    return res.status(201).json({
      id: storyment.id.toString(),
      userId: storyment.user_id.toString(),
      content: storyment.content,
      backgroundColor: storyment.background_color,
      textColor: storyment.text_color,
      createdAt: storyment.created_at,
      expiresAt: storyment.expires_at,
      views: 0,
      hasViewed: false,
      user: {
        id: userId,
        username: user.username,
        displayName: user.display_name,
        photoURL: user.photo_url
      }
    });
  } catch (error) {
    console.error('Erro ao criar storyment:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Excluir storyment
exports.deleteStoryment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o storyment existe
    const storymentResult = await db.query(
      'SELECT * FROM storyments WHERE id = $1',
      [id]
    );
    
    if (storymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Storyment não encontrado' });
    }
    
    const storyment = storymentResult.rows[0];
    
    // Verificar se o usuário autenticado é o dono do storyment
    if (req.userId !== storyment.user_id) {
      return res.status(403).json({ error: 'Não autorizado a excluir este storyment' });
    }
    
    // Excluir o storyment
    await db.query('DELETE FROM storyments WHERE id = $1', [id]);
    
    return res.json({ success: true, message: 'Storyment excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir storyment:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Marcar storyment como visualizado
exports.markAsViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Verificar se o storyment existe
    const storymentExists = await db.query(
      'SELECT 1 FROM storyments WHERE id = $1',
      [id]
    );
    
    if (storymentExists.rows.length === 0) {
      return res.status(404).json({ error: 'Storyment não encontrado' });
    }
    
    // Verificar se o usuário autenticado é o mesmo que está marcando como visualizado
    if (req.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Não autorizado a marcar visualização para este usuário' });
    }
    
    // Verificar se já foi visualizado
    const viewExists = await db.query(
      'SELECT 1 FROM storyment_views WHERE storyment_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (viewExists.rows.length === 0) {
      // Inserir nova visualização
      await db.query(
        'INSERT INTO storyment_views (storyment_id, user_id) VALUES ($1, $2)',
        [id, userId]
      );
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar storyment como visualizado:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Verificar se um usuário visualizou um storyment
exports.hasUserViewed = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // Verificar se o storyment existe
    const storymentExists = await db.query(
      'SELECT 1 FROM storyments WHERE id = $1',
      [id]
    );
    
    if (storymentExists.rows.length === 0) {
      return res.status(404).json({ error: 'Storyment não encontrado' });
    }
    
    // Verificar se foi visualizado pelo usuário
    const viewResult = await db.query(
      'SELECT 1 FROM storyment_views WHERE storyment_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    const hasViewed = viewResult.rows.length > 0;
    
    return res.json({ hasViewed });
  } catch (error) {
    console.error('Erro ao verificar visualização de storyment:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 