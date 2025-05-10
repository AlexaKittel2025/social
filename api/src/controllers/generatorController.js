const db = require('../db');

// Gerar uma mentira (recurso PRO)
exports.generateLie = async (req, res) => {
  try {
    const { userId, customTopic } = req.body;
    
    // Verificar se o usuário tem status PRO
    const userResult = await db.query(
      'SELECT is_pro FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const isPro = userResult.rows[0].is_pro;
    
    // Verificar se o usuário tem acesso PRO
    if (!isPro) {
      return res.status(403).json({ 
        error: 'Recurso exclusivo para usuários PRO',
        message: 'Assine o plano PRO para acessar o gerador de mentiras'
      });
    }
    
    // Conjunto de mentiras pré-definidas baseadas em tópicos
    const lieTemplates = [
      // Mentiras gerais
      "Uma vez encontrei um gato que falava três idiomas diferentes e me ensinou a resolver equações matemáticas.",
      "Tenho um parente distante que inventou o garfo de plástico depois de um sonho com um alienígena.",
      "Durante uma viagem, conheci um viajante do tempo que me mostrou fotos do Brasil em 2050.",
      "Na semana passada, ganhei um concurso de dança improvisada quando meu celular tocou no meio de uma entrevista de emprego.",
      "Moro ao lado de um cientista aposentado da NASA que construiu um mini foguete no quintal.",
      
      // Mentiras sobre viagens
      "Quando estava viajando, me perdi nas catacumbas de Paris e fui resgatado por um grupo de atores fantasiados de vampiros.",
      "Durante um voo, o piloto pediu minha ajuda para navegar quando os instrumentos falharam momentaneamente.",
      "Fiquei preso em um elevador por 6 horas com um chef famoso e aprendi a fazer o melhor risoto do mundo.",
      "Na minha viagem para o Japão, acidentalmente entrei em um torneio de sumo e ganhei uma medalha honorária.",
      "Enquanto visitava uma pequena vila na Itália, fui confundido com um ator de Hollywood e recebi refeições gratuitas por uma semana.",
      
      // Mentiras sobre tecnologia
      "Meu computador antigo ganhou consciência após uma atualização e agora me manda e-mails com conselhos de vida.",
      "Desenvolvi um app que traduz o que os pets estão pensando, mas perdi o código fonte durante uma atualização do sistema.",
      "Meu celular consegue prever o clima com 100% de precisão depois que caiu na água do mar e foi consertado.",
      "Fui beta tester de uma rede social que permitia compartilhar sonhos, mas o projeto foi cancelado por questões éticas.",
      "Hackiei acidentalmente o sistema de tráfego da minha cidade quando tentava configurar meu controle remoto universal.",
      
      // Mentiras sobre encontros sobrenaturais
      "Vi um fantasma no meu apartamento que só aparece para organizar minha estante de livros por ordem alfabética.",
      "Tenho um vizinho que consegue prever exatamente quando vai chover e empresta guarda-chuvas antes mesmo do céu ficar nublado.",
      "Durante uma caminhada noturna, encontrei uma porta misteriosa em uma árvore que levava a uma biblioteca interdimensional.",
      "Meu relógio antigo parou exatamente no momento do nascimento do meu sobrinho e voltou a funcionar sozinho no dia seguinte.",
      "Consigo me comunicar com plantas, e minha samambaia me deu a ideia para resolver um problema complexo no trabalho."
    ];
    
    // Mentiras específicas por tópico
    const topicLies = {
      aliens: [
        "Fui abduzido por aliens que só queriam aprender a fazer brigadeiro e depois me devolveram com uma receita intergaláctica.",
        "Tenho um detector de OVNIs caseiro que apita toda vez que alguém na vizinhança faz pipoca de micro-ondas.",
        "Meu gato consegue ver aliens invisíveis e sempre fica arrepiado quando eles visitam nosso apartamento às terças-feiras."
      ],
      viagem: [
        "Peguei um voo para São Paulo mas o avião pousou em Buenos Aires por engano, e ninguém percebeu até o dia seguinte.",
        "Durante uma viagem à Europa, acidentalmente entrei no palácio real e tomei café da manhã com a família real antes de ser escoltado para fora.",
        "Perdi meu passaporte durante um mergulho e um golfinho o devolveu para mim na praia no dia seguinte."
      ],
      família: [
        "Minha avó foi campeã secreta de pôquer nos anos 70 e ainda guarda seus troféus escondidos no forro do sofá.",
        "Meu tio-avô inventou o método para deixar o pão de queijo mais crocante, mas vendeu a patente por apenas R$50.",
        "Tenho um primo que consegue adivinhar o sabor de qualquer sorvete de olhos vendados com 100% de precisão."
      ],
      esporte: [
        "Fui convidado para treinar com a seleção brasileira por um dia depois que me viram jogando futebol no parque.",
        "Inventei uma nova modalidade de esporte que mistura xadrez com corrida de obstáculos que foi quase incluída nas Olimpíadas.",
        "Durante uma maratona, tomei o caminho errado e acidentalmente estabeleci um novo recorde porque o atalho era na verdade mais longo."
      ],
      comida: [
        "Criei uma receita de bolo que, quando assada, forma automaticamente desenhos de animais na cobertura.",
        "Uma vez fiz um churrasco tão bom que meus vizinhos vegetarianos pediram a receita mesmo sem provar.",
        "Meu café da manhã acidentalmente criou uma nova forma de cultivar abacates que crescem duas vezes mais rápido."
      ]
    };
    
    // Selecionar uma mentira baseada no tópico personalizado ou escolher uma aleatória
    let lie = '';
    
    if (customTopic && topicLies[customTopic.toLowerCase()]) {
      const topicSpecificLies = topicLies[customTopic.toLowerCase()];
      lie = topicSpecificLies[Math.floor(Math.random() * topicSpecificLies.length)];
    } else if (customTopic) {
      // Criar uma mentira personalizada baseada no tópico fornecido
      const customLieTemplates = [
        `Durante um evento sobre ${customTopic}, descobri que tenho um talento natural que impressionou até os especialistas.`,
        `Tenho um objeto raro relacionado a ${customTopic} que foi passado na minha família por gerações.`,
        `Uma vez sonhei com ${customTopic} e no dia seguinte aconteceu exatamente o que tinha sonhado, mas com um final inesperado.`,
        `Conheci uma celebridade por acaso enquanto pesquisava sobre ${customTopic} e acabamos conversando por horas.`,
        `Desenvolvi um método revolucionário relacionado a ${customTopic} que quase me fez famoso, mas perdi as anotações durante uma mudança.`
      ];
      
      lie = customLieTemplates[Math.floor(Math.random() * customLieTemplates.length)];
    } else {
      // Escolher uma mentira aleatória do conjunto geral
      lie = lieTemplates[Math.floor(Math.random() * lieTemplates.length)];
    }
    
    // Registrar o uso do gerador
    await db.query(
      'INSERT INTO lie_generations (user_id, custom_topic, generated_lie) VALUES ($1, $2, $3)',
      [userId, customTopic || null, lie]
    );
    
    return res.json({ lie });
  } catch (error) {
    console.error('Erro ao gerar mentira:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 