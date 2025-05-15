const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Cria uma nova batalha
 */
const createBattle = async (req, res) => {
  try {
    const { title, description, end_date } = req.body;
    const creator_id = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    // Cria uma nova batalha
    const battle = await prisma.battle.create({
      data: {
        title,
        description,
        status: 'active',
        start_date: new Date(),
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    res.status(201).json(battle);
  } catch (error) {
    console.error('Erro ao criar batalha:', error);
    res.status(500).json({
      error: 'Erro ao criar batalha.',
      details: error.message,
    });
  }
};

/**
 * Busca todas as batalhas com paginação
 */
const getAllBattles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'active'; // Por padrão, busca batalhas ativas
    const skip = (page - 1) * limit;

    // Busca batalhas com paginação
    const battles = await prisma.battle.findMany({
      where: {
        status,
      },
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    });

    // Conta o total de batalhas para calcular a paginação
    const totalBattles = await prisma.battle.count({
      where: {
        status,
      },
    });

    // Verifica se há mais batalhas para carregar
    const hasMore = totalBattles > skip + limit;

    res.status(200).json({
      battles,
      total: totalBattles,
      hasMore,
    });
  } catch (error) {
    console.error('Erro ao buscar batalhas:', error);
    res.status(500).json({
      error: 'Erro ao buscar batalhas.',
      details: error.message,
    });
  }
};

/**
 * Busca uma batalha específica pelo ID
 */
const getBattleById = async (req, res) => {
  try {
    const { battleId } = req.params;

    const battle = await prisma.battle.findUnique({
      where: {
        id: battleId,
      },
      include: {
        participations: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });

    if (!battle) {
      return res.status(404).json({
        error: 'Batalha não encontrada.',
      });
    }

    res.status(200).json(battle);
  } catch (error) {
    console.error('Erro ao buscar batalha:', error);
    res.status(500).json({
      error: 'Erro ao buscar batalha.',
      details: error.message,
    });
  }
};

/**
 * Participa de uma batalha
 */
const participateInBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }

    // Verifica se a batalha existe e está ativa
    const battle = await prisma.battle.findUnique({
      where: {
        id: battleId,
      },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Batalha não encontrada' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ error: 'Esta batalha não está mais ativa' });
    }

    // Verifica se o usuário já está participando desta batalha
    const existingParticipation = await prisma.battleParticipation.findFirst({
      where: {
        battle_id: battleId,
        user_id: userId,
      },
    });

    if (existingParticipation) {
      return res.status(400).json({ error: 'Você já está participando desta batalha' });
    }

    // Cria uma nova participação
    const participation = await prisma.battleParticipation.create({
      data: {
        battle_id: battleId,
        user_id: userId,
        content,
        votes: 0,
      },
      include: {
        battle: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    res.status(201).json(participation);
  } catch (error) {
    console.error('Erro ao participar da batalha:', error);
    res.status(500).json({
      error: 'Erro ao participar da batalha.',
      details: error.message,
    });
  }
};

/**
 * Vota em uma participação de batalha
 */
const voteOnParticipation = async (req, res) => {
  try {
    const { participationId } = req.params;
    const userId = req.user.id;

    // Verifica se a participação existe
    const participation = await prisma.battleParticipation.findUnique({
      where: {
        id: participationId,
      },
      include: {
        battle: true,
      },
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participação não encontrada' });
    }

    // Verifica se a batalha está ativa
    if (participation.battle.status !== 'active') {
      return res.status(400).json({ error: 'Esta batalha não está mais ativa' });
    }

    // Verifica se o usuário é o dono da participação
    if (participation.user_id === userId) {
      return res.status(400).json({ error: 'Você não pode votar em sua própria participação' });
    }

    // Verifica se o usuário já votou nesta participação
    const existingVote = await prisma.battleVote.findFirst({
      where: {
        participation_id: participationId,
        user_id: userId,
      },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'Você já votou nesta participação' });
    }

    // Cria um novo voto
    await prisma.battleVote.create({
      data: {
        participation_id: participationId,
        user_id: userId,
      },
    });

    // Incrementa o contador de votos da participação
    const updatedParticipation = await prisma.battleParticipation.update({
      where: {
        id: participationId,
      },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    res.status(200).json(updatedParticipation);
  } catch (error) {
    console.error('Erro ao votar na participação:', error);
    res.status(500).json({
      error: 'Erro ao votar na participação.',
      details: error.message,
    });
  }
};

/**
 * Finaliza uma batalha e determina o vencedor
 */
const finishBattle = async (req, res) => {
  try {
    const { battleId } = req.params;

    // Verifica se a batalha existe
    const battle = await prisma.battle.findUnique({
      where: {
        id: battleId,
      },
    });

    if (!battle) {
      return res.status(404).json({ error: 'Batalha não encontrada' });
    }

    // Verifica se a batalha já está completa
    if (battle.status === 'completed') {
      return res.status(400).json({ error: 'Esta batalha já foi finalizada' });
    }

    // Busca a participação com mais votos
    const participations = await prisma.battleParticipation.findMany({
      where: {
        battle_id: battleId,
      },
      orderBy: {
        votes: 'desc',
      },
    });

    let winnerId = null;
    
    // Se houver participações, o vencedor é aquele com mais votos
    if (participations.length > 0) {
      winnerId = participations[0].user_id;
    }

    // Atualiza a batalha para completa e define o vencedor
    const updatedBattle = await prisma.battle.update({
      where: {
        id: battleId,
      },
      data: {
        status: 'completed',
        winner_id: winnerId,
        end_date: new Date(),
      },
    });

    res.status(200).json(updatedBattle);
  } catch (error) {
    console.error('Erro ao finalizar batalha:', error);
    res.status(500).json({
      error: 'Erro ao finalizar batalha.',
      details: error.message,
    });
  }
};

module.exports = {
  createBattle,
  getAllBattles,
  getBattleById,
  participateInBattle,
  voteOnParticipation,
  finishBattle,
}; 