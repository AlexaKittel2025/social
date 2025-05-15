import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { User } from '../../../types/index';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { username, displayName, email, password } = req.body;

    // Validar campos obrigatórios
    if (!username || !displayName || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Usuário ou email já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        email,
        passwordHash: hashedPassword,
        photoURL: `https://avatars.dicebear.com/api/initials/${displayName.substring(0, 2)}.svg`,
        createdAt: new Date().toISOString(),
        points: 0,
        isPro: false
      }
    });

    // Remover senha do retorno
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
} 