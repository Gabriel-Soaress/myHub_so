-- Criação das tabelas para o MyHub (Neon Postgres)

-- Extensão para UUIDs (se necessário, Neon já costuma ter)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários (Tenants)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  landing_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Nós (Pastas e Arquivos Estruturais)
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_slug VARCHAR(255) NOT NULL REFERENCES users(slug) ON DELETE CASCADE,
  parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'folder', 'richtext', 'image', 'pdf', 'code', 'download'
  metadata JSONB DEFAULT '{}'::jsonb, -- color, password, description, downloadBlocked, etc.
  content JSONB DEFAULT '{}'::jsonb, -- body for richtext, language for code, etc.
  item_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Arquivos (Conteúdos binários codificados em Base64 ou texto longo)
CREATE TABLE IF NOT EXISTS files (
  node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_nodes_user_slug ON nodes(user_slug);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON nodes(parent_id);
