const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obter todas as notificações de um usuário
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return res.status(500).json({ message: 'Erro ao buscar notificações' });
  }
};

// Marcar uma notificação como lida
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para marcar esta notificação como lida' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true }
    });

    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return res.status(500).json({ message: 'Erro ao marcar notificação como lida' });
  }
};

// Marcar todas as notificações como lidas
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true
      }
    });

    return res.status(200).json({ message: 'Todas as notificações foram marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return res.status(500).json({ message: 'Erro ao marcar todas as notificações como lidas' });
  }
};

// Criar uma nova notificação (geralmente chamado por outros controladores)
exports.createNotification = async (userId, type, content, relatedId = null, senderId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        type,
        content,
        related_id: relatedId,
        sender_id: senderId
      }
    });
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

// Deletar uma notificação
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }

    if (notification.user_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir esta notificação' });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    return res.status(200).json({ message: 'Notificação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    return res.status(500).json({ message: 'Erro ao excluir notificação' });
  }
}; 