const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const notificationController = require('./notificationController');

// Seguir um usuário
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.id; // ID do usuário logado
    const { userId: followingId } = req.params; // ID do usuário a ser seguido

    // Verificar se o usuário está tentando seguir a si mesmo
    if (followerId === followingId) {
      return res.status(400).json({ message: 'Você não pode seguir a si mesmo' });
    }

    // Verificar se o usuário a ser seguido existe
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId }
    });

    if (!userToFollow) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se já segue o usuário
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Você já segue este usuário' });
    }

    // Criar a relação de seguidor
    await prisma.userFollow.create({
      data: {
        follower_id: followerId,
        following_id: followingId
      }
    });

    // Criar notificação para o usuário que foi seguido
    await notificationController.createNotification(
      followingId,
      'follow',
      `${req.user.username} começou a seguir você`,
      null,
      followerId
    );

    return res.status(200).json({ message: 'Agora você está seguindo este usuário' });
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    return res.status(500).json({ message: 'Erro ao seguir usuário' });
  }
};

// Deixar de seguir um usuário
exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    // Verificar se a relação de seguidor existe
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    if (!existingFollow) {
      return res.status(400).json({ message: 'Você não segue este usuário' });
    }

    // Remover a relação de seguidor
    await prisma.userFollow.delete({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    return res.status(200).json({ message: 'Você deixou de seguir este usuário' });
  } catch (error) {
    console.error('Erro ao deixar de seguir usuário:', error);
    return res.status(500).json({ message: 'Erro ao deixar de seguir usuário' });
  }
};

// Obter seguidores de um usuário
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await prisma.userFollow.findMany({
      where: { following_id: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            display_name: true,
            photo_url: true,
            bio: true
          }
        }
      }
    });

    return res.status(200).json(followers.map(follow => follow.follower));
  } catch (error) {
    console.error('Erro ao obter seguidores:', error);
    return res.status(500).json({ message: 'Erro ao obter seguidores' });
  }
};

// Obter usuários que um usuário segue
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await prisma.userFollow.findMany({
      where: { follower_id: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            display_name: true,
            photo_url: true,
            bio: true
          }
        }
      }
    });

    return res.status(200).json(following.map(follow => follow.following));
  } catch (error) {
    console.error('Erro ao obter usuários seguidos:', error);
    return res.status(500).json({ message: 'Erro ao obter usuários seguidos' });
  }
};

// Verificar se um usuário segue outro
exports.checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId
        }
      }
    });

    return res.status(200).json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error('Erro ao verificar status de seguidor:', error);
    return res.status(500).json({ message: 'Erro ao verificar status de seguidor' });
  }
}; 