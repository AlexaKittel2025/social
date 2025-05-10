const db = require('../db');

// Obter todos os posts
exports.getAllPosts = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const postsResult = await db.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    const posts = [];
    
    for (const post of postsResult.rows) {
      // Buscar tags
      const tagsResult = await db.query(
        `SELECT t.name FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [post.id]
      );
      
      const tags = tagsResult.rows.map(tag => tag.name);
      
      // Buscar reações
      const reactionsResult = await db.query(
        `SELECT reaction_type, COUNT(*) as count
         FROM reactions
         WHERE post_id = $1
         GROUP BY reaction_type`,
        [post.id]
      );
      
      const reactions = {
        quaseAcreditei: 0,
        hahaha: 0,
        mentiraEpica: 0
      };
      
      reactionsResult.rows.forEach(row => {
        reactions[row.reaction_type] = parseInt(row.count);
      });
      
      // Buscar julgamentos
      const judgementsResult = await db.query(
        `SELECT judgement_type, COUNT(*) as count
         FROM judgements
         WHERE post_id = $1
         GROUP BY judgement_type`,
        [post.id]
      );
      
      const judgements = {
        crivel: 0,
        inventiva: 0,
        totalmentePirada: 0
      };
      
      judgementsResult.rows.forEach(row => {
        judgements[row.judgement_type] = parseInt(row.count);
      });
      
      // Buscar reações do usuário atual
      const userReactionsResult = await db.query(
        `SELECT user_id, reaction_type
         FROM reactions
         WHERE post_id = $1`,
        [post.id]
      );
      
      const userReactions = {};
      userReactionsResult.rows.forEach(row => {
        userReactions[row.user_id] = row.reaction_type;
      });
      
      // Buscar julgamentos do usuário atual
      const userJudgementsResult = await db.query(
        `SELECT user_id, judgement_type
         FROM judgements
         WHERE post_id = $1`,
        [post.id]
      );
      
      const userJudgements = {};
      userJudgementsResult.rows.forEach(row => {
        userJudgements[row.user_id] = row.judgement_type;
      });
      
      posts.push({
        id: post.id.toString(),
        userId: post.user_id.toString(),
        content: post.content,
        imageURL: post.image_url || undefined,
        tags,
        reactions,
        userReactions,
        judgements,
        userJudgements,
        createdAt: post.created_at,
        isGenerated: post.is_generated
      });
    }
    
    return res.json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter post por ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const postResult = await db.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    const post = postResult.rows[0];
    
    // Buscar tags
    const tagsResult = await db.query(
      `SELECT t.name FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = $1`,
      [id]
    );
    
    const tags = tagsResult.rows.map(tag => tag.name);
    
    // Buscar reações
    const reactionsResult = await db.query(
      `SELECT reaction_type, COUNT(*) as count
       FROM reactions
       WHERE post_id = $1
       GROUP BY reaction_type`,
      [id]
    );
    
    const reactions = {
      quaseAcreditei: 0,
      hahaha: 0,
      mentiraEpica: 0
    };
    
    reactionsResult.rows.forEach(row => {
      reactions[row.reaction_type] = parseInt(row.count);
    });
    
    // Buscar julgamentos
    const judgementsResult = await db.query(
      `SELECT judgement_type, COUNT(*) as count
       FROM judgements
       WHERE post_id = $1
       GROUP BY judgement_type`,
      [id]
    );
    
    const judgements = {
      crivel: 0,
      inventiva: 0,
      totalmentePirada: 0
    };
    
    judgementsResult.rows.forEach(row => {
      judgements[row.judgement_type] = parseInt(row.count);
    });
    
    // Buscar reações do usuário atual
    const userReactionsResult = await db.query(
      `SELECT user_id, reaction_type
       FROM reactions
       WHERE post_id = $1`,
      [id]
    );
    
    const userReactions = {};
    userReactionsResult.rows.forEach(row => {
      userReactions[row.user_id] = row.reaction_type;
    });
    
    // Buscar julgamentos do usuário atual
    const userJudgementsResult = await db.query(
      `SELECT user_id, judgement_type
       FROM judgements
       WHERE post_id = $1`,
      [id]
    );
    
    const userJudgements = {};
    userJudgementsResult.rows.forEach(row => {
      userJudgements[row.user_id] = row.judgement_type;
    });
    
    return res.json({
      id: post.id.toString(),
      userId: post.user_id.toString(),
      content: post.content,
      imageURL: post.image_url || undefined,
      tags,
      reactions,
      userReactions,
      judgements,
      userJudgements,
      createdAt: post.created_at,
      isGenerated: post.is_generated
    });
  } catch (error) {
    console.error('Erro ao buscar post por ID:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter posts por usuário
exports.getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const postsResult = await db.query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    
    const posts = [];
    
    for (const post of postsResult.rows) {
      // Buscar tags
      const tagsResult = await db.query(
        `SELECT t.name FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [post.id]
      );
      
      const tags = tagsResult.rows.map(tag => tag.name);
      
      // Buscar reações
      const reactionsResult = await db.query(
        `SELECT reaction_type, COUNT(*) as count
         FROM reactions
         WHERE post_id = $1
         GROUP BY reaction_type`,
        [post.id]
      );
      
      const reactions = {
        quaseAcreditei: 0,
        hahaha: 0,
        mentiraEpica: 0
      };
      
      reactionsResult.rows.forEach(row => {
        reactions[row.reaction_type] = parseInt(row.count);
      });
      
      // Buscar julgamentos
      const judgementsResult = await db.query(
        `SELECT judgement_type, COUNT(*) as count
         FROM judgements
         WHERE post_id = $1
         GROUP BY judgement_type`,
        [post.id]
      );
      
      const judgements = {
        crivel: 0,
        inventiva: 0,
        totalmentePirada: 0
      };
      
      judgementsResult.rows.forEach(row => {
        judgements[row.judgement_type] = parseInt(row.count);
      });
      
      // Buscar reações do usuário atual
      const userReactionsResult = await db.query(
        `SELECT user_id, reaction_type
         FROM reactions
         WHERE post_id = $1`,
        [post.id]
      );
      
      const userReactions = {};
      userReactionsResult.rows.forEach(row => {
        userReactions[row.user_id] = row.reaction_type;
      });
      
      // Buscar julgamentos do usuário atual
      const userJudgementsResult = await db.query(
        `SELECT user_id, judgement_type
         FROM judgements
         WHERE post_id = $1`,
        [post.id]
      );
      
      const userJudgements = {};
      userJudgementsResult.rows.forEach(row => {
        userJudgements[row.user_id] = row.judgement_type;
      });
      
      posts.push({
        id: post.id.toString(),
        userId: post.user_id.toString(),
        content: post.content,
        imageURL: post.image_url || undefined,
        tags,
        reactions,
        userReactions,
        judgements,
        userJudgements,
        createdAt: post.created_at,
        isGenerated: post.is_generated
      });
    }
    
    return res.json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts por usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter posts por tag
exports.getPostsByTag = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const postsResult = await db.query(
      `SELECT p.* FROM posts p
       JOIN post_tags pt ON p.id = pt.post_id
       JOIN tags t ON pt.tag_id = t.id
       WHERE t.name = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [tagName, limit, offset]
    );
    
    const posts = [];
    
    for (const post of postsResult.rows) {
      // Buscar tags
      const tagsResult = await db.query(
        `SELECT t.name FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = $1`,
        [post.id]
      );
      
      const tags = tagsResult.rows.map(tag => tag.name);
      
      // Buscar reações
      const reactionsResult = await db.query(
        `SELECT reaction_type, COUNT(*) as count
         FROM reactions
         WHERE post_id = $1
         GROUP BY reaction_type`,
        [post.id]
      );
      
      const reactions = {
        quaseAcreditei: 0,
        hahaha: 0,
        mentiraEpica: 0
      };
      
      reactionsResult.rows.forEach(row => {
        reactions[row.reaction_type] = parseInt(row.count);
      });
      
      // Buscar julgamentos
      const judgementsResult = await db.query(
        `SELECT judgement_type, COUNT(*) as count
         FROM judgements
         WHERE post_id = $1
         GROUP BY judgement_type`,
        [post.id]
      );
      
      const judgements = {
        crivel: 0,
        inventiva: 0,
        totalmentePirada: 0
      };
      
      judgementsResult.rows.forEach(row => {
        judgements[row.judgement_type] = parseInt(row.count);
      });
      
      // Buscar reações do usuário atual
      const userReactionsResult = await db.query(
        `SELECT user_id, reaction_type
         FROM reactions
         WHERE post_id = $1`,
        [post.id]
      );
      
      const userReactions = {};
      userReactionsResult.rows.forEach(row => {
        userReactions[row.user_id] = row.reaction_type;
      });
      
      // Buscar julgamentos do usuário atual
      const userJudgementsResult = await db.query(
        `SELECT user_id, judgement_type
         FROM judgements
         WHERE post_id = $1`,
        [post.id]
      );
      
      const userJudgements = {};
      userJudgementsResult.rows.forEach(row => {
        userJudgements[row.user_id] = row.judgement_type;
      });
      
      posts.push({
        id: post.id.toString(),
        userId: post.user_id.toString(),
        content: post.content,
        imageURL: post.image_url || undefined,
        tags,
        reactions,
        userReactions,
        judgements,
        userJudgements,
        createdAt: post.created_at,
        isGenerated: post.is_generated
      });
    }
    
    return res.json(posts);
  } catch (error) {
    console.error('Erro ao buscar posts por tag:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar um novo post
exports.createPost = async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { userId, content, imageURL, tags, isGenerated } = req.body;
    
    // Inserir o post
    const postResult = await client.query(
      `INSERT INTO posts (
        user_id, content, image_url, is_generated
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, content, imageURL || null, isGenerated || false]
    );

    const post = postResult.rows[0];
    
    // Adicionar tags se fornecidas
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Verificar se a tag existe, caso contrário, criar
        let tagId;
        const tagResult = await client.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );
        
        if (tagResult.rows.length === 0) {
          // Criar nova tag
          const newTagResult = await client.query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id',
            [tagName]
          );
          tagId = newTagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        // Associar tag ao post
        await client.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
          [post.id, tagId]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return res.status(201).json({
      id: post.id.toString(),
      userId: post.user_id.toString(),
      content: post.content,
      imageURL: post.image_url || undefined,
      tags: tags || [],
      reactions: {
        quaseAcreditei: 0,
        hahaha: 0,
        mentiraEpica: 0
      },
      userReactions: {},
      judgements: {
        crivel: 0,
        inventiva: 0,
        totalmentePirada: 0
      },
      userJudgements: {},
      createdAt: post.created_at,
      isGenerated: post.is_generated
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar post:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Atualizar um post
exports.updatePost = async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { content, imageURL, tags, isGenerated } = req.body;
    
    // Verificar se o post existe
    const postResult = await client.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );
    
    if (postResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    const post = postResult.rows[0];
    
    // Verificar se o usuário autenticado é o dono do post
    if (req.userId !== post.user_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Não autorizado a atualizar este post' });
    }
    
    // Atualizar o post
    const updateResult = await client.query(
      `UPDATE posts SET 
        content = $1,
        image_url = $2,
        is_generated = $3
      WHERE id = $4 RETURNING *`,
      [
        content !== undefined ? content : post.content,
        imageURL !== undefined ? imageURL : post.image_url,
        isGenerated !== undefined ? isGenerated : post.is_generated,
        id
      ]
    );
    
    const updatedPost = updateResult.rows[0];
    
    // Atualizar tags se fornecidas
    if (tags) {
      // Remover tags existentes
      await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);
      
      // Adicionar novas tags
      for (const tagName of tags) {
        // Verificar se a tag existe, caso contrário, criar
        let tagId;
        const tagResult = await client.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );
        
        if (tagResult.rows.length === 0) {
          // Criar nova tag
          const newTagResult = await client.query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id',
            [tagName]
          );
          tagId = newTagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        // Associar tag ao post
        await client.query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
          [id, tagId]
        );
      }
    }
    
    // Buscar tags atualizadas
    const tagsResult = await client.query(
      `SELECT t.name FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = $1`,
      [id]
    );
    
    const updatedTags = tagsResult.rows.map(tag => tag.name);
    
    // Buscar reações
    const reactionsResult = await client.query(
      `SELECT reaction_type, COUNT(*) as count
       FROM reactions
       WHERE post_id = $1
       GROUP BY reaction_type`,
      [id]
    );
    
    const reactions = {
      quaseAcreditei: 0,
      hahaha: 0,
      mentiraEpica: 0
    };
    
    reactionsResult.rows.forEach(row => {
      reactions[row.reaction_type] = parseInt(row.count);
    });
    
    // Buscar julgamentos
    const judgementsResult = await client.query(
      `SELECT judgement_type, COUNT(*) as count
       FROM judgements
       WHERE post_id = $1
       GROUP BY judgement_type`,
      [id]
    );
    
    const judgements = {
      crivel: 0,
      inventiva: 0,
      totalmentePirada: 0
    };
    
    judgementsResult.rows.forEach(row => {
      judgements[row.judgement_type] = parseInt(row.count);
    });
    
    // Buscar reações do usuário atual
    const userReactionsResult = await client.query(
      `SELECT user_id, reaction_type
       FROM reactions
       WHERE post_id = $1`,
      [id]
    );
    
    const userReactions = {};
    userReactionsResult.rows.forEach(row => {
      userReactions[row.user_id] = row.reaction_type;
    });
    
    // Buscar julgamentos do usuário atual
    const userJudgementsResult = await client.query(
      `SELECT user_id, judgement_type
       FROM judgements
       WHERE post_id = $1`,
      [id]
    );
    
    const userJudgements = {};
    userJudgementsResult.rows.forEach(row => {
      userJudgements[row.user_id] = row.judgement_type;
    });
    
    await client.query('COMMIT');
    
    return res.json({
      id: updatedPost.id.toString(),
      userId: updatedPost.user_id.toString(),
      content: updatedPost.content,
      imageURL: updatedPost.image_url || undefined,
      tags: updatedTags,
      reactions,
      userReactions,
      judgements,
      userJudgements,
      createdAt: updatedPost.created_at,
      isGenerated: updatedPost.is_generated
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar post:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Excluir um post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o post existe
    const postResult = await db.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    const post = postResult.rows[0];
    
    // Verificar se o usuário autenticado é o dono do post
    if (req.userId !== post.user_id) {
      return res.status(403).json({ error: 'Não autorizado a excluir este post' });
    }
    
    // Excluir o post (as triggers do PostgreSQL cuidarão das tabelas relacionadas)
    await db.query('DELETE FROM posts WHERE id = $1', [id]);
    
    return res.json({ success: true, message: 'Post excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Adicionar uma reação a um post
exports.addReaction = async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { userId, reactionType } = req.body;
    
    // Verificar se o post existe
    const postExists = await client.query(
      'SELECT 1 FROM posts WHERE id = $1',
      [id]
    );
    
    if (postExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    // Verificar se o usuário já reagiu a este post
    const existingReaction = await client.query(
      'SELECT reaction_type FROM reactions WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (existingReaction.rows.length > 0) {
      // Se a reação for a mesma, remover a reação
      if (existingReaction.rows[0].reaction_type === reactionType) {
        await client.query(
          'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2',
          [id, userId]
        );
      } else {
        // Se for diferente, atualizar para a nova reação
        await client.query(
          'UPDATE reactions SET reaction_type = $1 WHERE post_id = $2 AND user_id = $3',
          [reactionType, id, userId]
        );
      }
    } else {
      // Adicionar nova reação
      await client.query(
        'INSERT INTO reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3)',
        [id, userId, reactionType]
      );
    }
    
    // Buscar contagem atualizada de reações
    const reactionsResult = await client.query(
      `SELECT reaction_type, COUNT(*) as count
       FROM reactions
       WHERE post_id = $1
       GROUP BY reaction_type`,
      [id]
    );
    
    const reactions = {
      quaseAcreditei: 0,
      hahaha: 0,
      mentiraEpica: 0
    };
    
    reactionsResult.rows.forEach(row => {
      reactions[row.reaction_type] = parseInt(row.count);
    });
    
    await client.query('COMMIT');
    
    return res.json({ success: true, reactions });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar reação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
};

// Adicionar um julgamento a um post
exports.addJudgement = async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { userId, judgementType } = req.body;
    
    // Verificar se o post existe
    const postExists = await client.query(
      'SELECT 1 FROM posts WHERE id = $1',
      [id]
    );
    
    if (postExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    
    // Verificar se o usuário já julgou este post
    const existingJudgement = await client.query(
      'SELECT judgement_type FROM judgements WHERE post_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (existingJudgement.rows.length > 0) {
      // Se o julgamento for o mesmo, remover o julgamento
      if (existingJudgement.rows[0].judgement_type === judgementType) {
        await client.query(
          'DELETE FROM judgements WHERE post_id = $1 AND user_id = $2',
          [id, userId]
        );
      } else {
        // Se for diferente, atualizar para o novo julgamento
        await client.query(
          'UPDATE judgements SET judgement_type = $1 WHERE post_id = $2 AND user_id = $3',
          [judgementType, id, userId]
        );
      }
    } else {
      // Adicionar novo julgamento
      await client.query(
        'INSERT INTO judgements (post_id, user_id, judgement_type) VALUES ($1, $2, $3)',
        [id, userId, judgementType]
      );
    }
    
    // Buscar contagem atualizada de julgamentos
    const judgementsResult = await client.query(
      `SELECT judgement_type, COUNT(*) as count
       FROM judgements
       WHERE post_id = $1
       GROUP BY judgement_type`,
      [id]
    );
    
    const judgements = {
      crivel: 0,
      inventiva: 0,
      totalmentePirada: 0
    };
    
    judgementsResult.rows.forEach(row => {
      judgements[row.judgement_type] = parseInt(row.count);
    });
    
    await client.query('COMMIT');
    
    return res.json({ success: true, judgements });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao adicionar julgamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    client.release();
  }
}; 