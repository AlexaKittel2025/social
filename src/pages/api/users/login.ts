import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { User } from '../../../types/index';

const prisma = new PrismaClient();

const comparePasswords = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body;

    // Validar campos obrigatórios
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('Erro de autenticação: usuário não encontrado');
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
    
    // Verificar se a senha está correta usando bcrypt
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log('Erro de autenticação: senha inválida');
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Remover senha do retorno
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
} 