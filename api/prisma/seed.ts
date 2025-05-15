import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seeding do banco de dados...');

  try {
    // Verificar se já existem usuários no banco
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log(`Já existem ${userCount} usuários no banco. Pulando seed.`);
      return;
    }

    // Criar usuário de teste
    const passwordHash = await bcrypt.hash('teste123', 10);
    
    // Usuário de teste regular
    const testUser = await prisma.user.create({
      data: {
        username: 'teste',
        display_name: 'Usuário Teste',
        email: 'teste@teste.com',
        password_hash: passwordHash,
        bio: 'Esta é uma conta de teste pré-criada para facilitar testes.',
        points: 10,
        level: 1,
        is_pro: false,
        settings: {
          create: {} // Configurações padrão
        }
      },
    });
    
    console.log(`Usuário de teste criado com ID: ${testUser.id}`);
    
    // Usuário administrador
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        display_name: 'Administrador',
        email: 'admin@mentei.com',
        password_hash: passwordHash,
        bio: 'Conta de administrador do sistema.',
        points: 100,
        level: 5,
        is_pro: true,
        settings: {
          create: {} // Configurações padrão
        }
      },
    });
    
    console.log(`Usuário administrador criado com ID: ${adminUser.id}`);
    
    console.log('Seeding concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Erro no processo de seed:', error);
  process.exit(1);
}); 