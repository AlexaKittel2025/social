-- Script de inicialização do banco de dados para Mentei

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  photo_url TEXT,
  bio TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_pro BOOLEAN DEFAULT FALSE,
  city VARCHAR(100),
  state VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações de usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  notifications_email BOOLEAN DEFAULT TRUE,
  notifications_push BOOLEAN DEFAULT TRUE,
  notifications_new_followers BOOLEAN DEFAULT TRUE,
  notifications_reactions BOOLEAN DEFAULT TRUE,
  notifications_comments BOOLEAN DEFAULT TRUE,
  notifications_mentions BOOLEAN DEFAULT TRUE,
  privacy_profile_visibility VARCHAR(20) DEFAULT 'public',
  privacy_activity_visibility VARCHAR(20) DEFAULT 'public',
  privacy_allow_message_requests BOOLEAN DEFAULT TRUE,
  appearance_theme VARCHAR(20) DEFAULT 'light',
  appearance_font_size VARCHAR(10) DEFAULT 'medium',
  language VARCHAR(10) DEFAULT 'pt-BR',
  content_preferences_adult BOOLEAN DEFAULT FALSE,
  content_preferences_violent BOOLEAN DEFAULT FALSE,
  content_preferences_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de seguidores
CREATE TABLE IF NOT EXISTS followers (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255),
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conquistas de usuários
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Tabela de posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  is_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relação entre posts e tags
CREATE TABLE IF NOT EXISTS post_tags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, tag_id)
);

-- Tabela de reações aos posts
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,  -- quaseAcreditei, hahaha, mentiraEpica
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Tabela de julgamentos dos posts
CREATE TABLE IF NOT EXISTS judgements (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  judgement_type VARCHAR(20) NOT NULL,  -- crivel, inventiva, totalmentePirada
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de storyments (histórias temporárias)
CREATE TABLE IF NOT EXISTS storyments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  background_color VARCHAR(20) NOT NULL,
  text_color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Tabela de visualizações de storyments
CREATE TABLE IF NOT EXISTS storyment_views (
  id SERIAL PRIMARY KEY,
  storyment_id INTEGER REFERENCES storyments(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(storyment_id, user_id)
);

-- Tabela de batalhas
CREATE TABLE IF NOT EXISTS battles (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de participantes da batalha
CREATE TABLE IF NOT EXISTS battle_participants (
  id SERIAL PRIMARY KEY,
  battle_id INTEGER REFERENCES battles(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(battle_id, user_id)
);

-- Tabela de votos em batalhas
CREATE TABLE IF NOT EXISTS battle_votes (
  id SERIAL PRIMARY KEY,
  battle_id INTEGER REFERENCES battles(id) ON DELETE CASCADE,
  voter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  participant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(battle_id, voter_id)
);

-- Tabela de geração de mentiras (recurso PRO)
CREATE TABLE IF NOT EXISTS lie_generations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  custom_topic TEXT,
  generated_lie TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- new_follower, reaction, comment, mention, achievement, etc
  content TEXT NOT NULL,
  related_id INTEGER, -- ID do objeto relacionado (post, comentário, usuário, etc)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_judgements_post_id ON judgements(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_storyments_user_id ON storyments(user_id);
CREATE INDEX IF NOT EXISTS idx_storyments_expires_at ON storyments(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Inserir alguns dados iniciais para testes

-- Inserir tags populares
INSERT INTO tags (name) VALUES 
('viagem'), ('família'), ('aliens'), ('comida'), ('esporte'),
('trabalho'), ('relacionamento'), ('política'), ('medo'), ('infância')
ON CONFLICT (name) DO NOTHING;

-- Inserir conquistas
INSERT INTO achievements (title, description, icon, points) VALUES
('Primeiro Post', 'Criou seu primeiro post no Mentei', 'post_icon', 10),
('Mentiroso Criativo', 'Recebeu 10 reações "mentiraEpica"', 'creative_icon', 20),
('Contador de Histórias', 'Criou 5 storyments', 'story_icon', 15),
('Tá Mentindo!', 'Teve um post julgado como "totalmentePirada" por 5 pessoas', 'liar_icon', 25),
('Rei da Batalha', 'Venceu uma batalha de mentiras', 'battle_icon', 50)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_posts_modtime
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_comments_modtime
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Trigger para atualizar pontos do usuário quando ganhar uma conquista
CREATE OR REPLACE FUNCTION update_user_points_on_achievement()
RETURNS TRIGGER AS $$
DECLARE
  achievement_points INTEGER;
BEGIN
  SELECT points INTO achievement_points FROM achievements WHERE id = NEW.achievement_id;
  
  UPDATE users 
  SET points = points + achievement_points
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER add_points_on_achievement
AFTER INSERT ON user_achievements
FOR EACH ROW
EXECUTE PROCEDURE update_user_points_on_achievement();

-- Trigger para criar notificação quando um usuário ganhar uma conquista
CREATE OR REPLACE FUNCTION create_achievement_notification()
RETURNS TRIGGER AS $$
DECLARE
  achievement_title TEXT;
BEGIN
  SELECT title INTO achievement_title FROM achievements WHERE id = NEW.achievement_id;
  
  INSERT INTO notifications (user_id, type, content, related_id)
  VALUES (NEW.user_id, 'achievement', 'Você desbloqueou a conquista: ' || achievement_title, NEW.achievement_id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER notify_on_achievement
AFTER INSERT ON user_achievements
FOR EACH ROW
EXECUTE PROCEDURE create_achievement_notification();

-- Trigger para criar notificação quando um usuário receber uma reação em seu post
CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id INTEGER;
  reactor_name TEXT;
BEGIN
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  SELECT display_name INTO reactor_name FROM users WHERE id = NEW.user_id;
  
  -- Não notificar o usuário sobre suas próprias reações
  IF NEW.user_id <> post_owner_id THEN
    INSERT INTO notifications (user_id, type, content, related_id)
    VALUES (post_owner_id, 'reaction', reactor_name || ' reagiu ao seu post com ' || NEW.reaction_type, NEW.post_id);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER notify_on_reaction
AFTER INSERT ON reactions
FOR EACH ROW
EXECUTE PROCEDURE create_reaction_notification();

-- Trigger para criar notificação quando um usuário receber um julgamento em seu post
CREATE OR REPLACE FUNCTION create_judgement_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id INTEGER;
  judger_name TEXT;
BEGIN
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  SELECT display_name INTO judger_name FROM users WHERE id = NEW.user_id;
  
  -- Não notificar o usuário sobre seus próprios julgamentos
  IF NEW.user_id <> post_owner_id THEN
    INSERT INTO notifications (user_id, type, content, related_id)
    VALUES (post_owner_id, 'judgement', judger_name || ' julgou seu post como ' || NEW.judgement_type, NEW.post_id);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER notify_on_judgement
AFTER INSERT ON judgements
FOR EACH ROW
EXECUTE PROCEDURE create_judgement_notification();

-- Trigger para criar notificação quando um usuário ganhar um novo seguidor
CREATE OR REPLACE FUNCTION create_follower_notification()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
BEGIN
  SELECT display_name INTO follower_name FROM users WHERE id = NEW.follower_id;
  
  INSERT INTO notifications (user_id, type, content, related_id)
  VALUES (NEW.following_id, 'new_follower', follower_name || ' começou a seguir você', NEW.follower_id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER notify_on_new_follower
AFTER INSERT ON followers
FOR EACH ROW
EXECUTE PROCEDURE create_follower_notification();

-- Trigger para atualizar nível do usuário com base nos pontos
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Simples fórmula de nível: para cada 100 pontos, sobe um nível
  NEW.level = GREATEST(1, FLOOR(NEW.points / 100) + 1)::INTEGER;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_level_on_points_change
BEFORE UPDATE OF points ON users
FOR EACH ROW
EXECUTE PROCEDURE update_user_level(); 