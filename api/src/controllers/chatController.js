const db = require('../db');
const { validationResult } = require('express-validator');

// Função para gerar ID único
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Salas e mensagens mockadas para teste
let mockChatRooms = [
  {
    id: 'global',
    name: 'Chat Global',
    type: 'global',
    participantIds: [],
    createdAt: new Date().toISOString()
  }
];

let mockChatMessages = [
  {
    id: 'msg1',
    senderId: 'user1',
    receiverId: 'global',
    content: 'Olá a todos!',
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    isRead: true,
    roomId: 'global'
  }
];

// Controlador para obter salas de chat de um usuário
exports.getUserChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Em um ambiente real, buscaríamos no banco de dados
    // Simulando resposta com mock
    const userRooms = mockChatRooms.filter(room => 
      room.type === 'global' || (room.participantIds && room.participantIds.includes(userId))
    );
    
    res.json({
      success: true,
      data: userRooms
    });
  } catch (error) {
    console.error('Erro ao buscar salas de chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar salas de chat'
    });
  }
};

// Controlador para obter a sala de chat global
exports.getGlobalChatRoom = async (req, res) => {
  try {
    const globalRoom = mockChatRooms.find(room => room.id === 'global');
    
    if (!globalRoom) {
      return res.status(404).json({
        success: false,
        error: 'Sala global não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: globalRoom
    });
  } catch (error) {
    console.error('Erro ao buscar sala global:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar sala global'
    });
  }
};

// Controlador para obter ou criar um chat privado
exports.getOrCreatePrivateRoom = async (req, res) => {
  try {
    const { userId, receiverId } = req.body;
    
    // Verificar se a sala já existe
    let privateRoom = mockChatRooms.find(room => 
      room.type === 'private' && 
      room.participantIds && 
      room.participantIds.includes(userId) && 
      room.participantIds.includes(receiverId)
    );
    
    // Se não existe, criar uma nova sala
    if (!privateRoom) {
      privateRoom = {
        id: `chat-${userId}-${receiverId}`,
        name: `Chat Privado`,
        type: 'private',
        participantIds: [userId, receiverId],
        createdAt: new Date().toISOString()
      };
      
      mockChatRooms.push(privateRoom);
    }
    
    res.json({
      success: true,
      data: privateRoom
    });
  } catch (error) {
    console.error('Erro ao obter/criar sala privada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter/criar sala privada'
    });
  }
};

// Controlador para criar uma nova sala de chat
exports.createChatRoom = async (req, res) => {
  try {
    const { name, type, participantIds } = req.body;
    
    const newRoom = {
      id: generateId(),
      name: name || 'Nova Sala',
      type: type || 'group',
      participantIds: participantIds || [],
      createdAt: new Date().toISOString()
    };
    
    mockChatRooms.push(newRoom);
    
    res.json({
      success: true,
      data: newRoom
    });
  } catch (error) {
    console.error('Erro ao criar sala de chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar sala de chat'
    });
  }
};

// Controlador para buscar mensagens de uma sala
exports.getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Em um ambiente real, buscaríamos no banco de dados
    // Simulando resposta com mock
    const messages = mockChatMessages.filter(msg => msg.roomId === roomId);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar mensagens'
    });
  }
};

// Controlador para enviar mensagem
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, roomId } = req.body;
    
    // Validar dados
    if (!senderId || !content || !roomId) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos'
      });
    }
    
    // Verificar se a sala existe
    const room = mockChatRooms.find(r => r.id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Sala não encontrada'
      });
    }
    
    // Criar nova mensagem
    const newMessage = {
      id: generateId(),
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      isRead: false,
      roomId
    };
    
    mockChatMessages.push(newMessage);
    
    // Emitir evento via socket (isso será tratado no index.js)
    
    res.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem'
    });
  }
};

// Controlador para marcar mensagens como lidas
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { roomId, receiverId } = req.body;
    
    // Marcar mensagens como lidas
    mockChatMessages = mockChatMessages.map(msg => {
      if (msg.roomId === roomId && msg.receiverId === receiverId && !msg.isRead) {
        return { ...msg, isRead: true };
      }
      return msg;
    });
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao marcar mensagens como lidas'
    });
  }
}; 