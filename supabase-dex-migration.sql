-- ═══════════════════════════════════════════════════════════════
-- DEX AGENT — Supabase Migration
-- Run this in your Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Persistent conversation memory
--    Stores every message Dex and Dhanush exchange
create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);
create index if not exists conversations_user_created
  on conversations (user_id, created_at desc);

-- 2. Long-term agent memory
--    Key facts, emotional patterns, preferences Dex remembers forever
create table if not exists agent_memory (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  category    text not null default 'general',
  -- categories: emotional_pattern | preference | fact | goal_insight | blocker | win
  content     text not null,
  importance  integer default 5 check (importance between 1 and 10),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists agent_memory_user_importance
  on agent_memory (user_id, importance desc);

-- 3. Multi-step plans Dex creates autonomously
create table if not exists agent_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  title       text not null,
  description text default '',
  steps       jsonb default '[]'::jsonb,
  -- each step: { title, description, done, order }
  status      text default 'active' check (status in ('active', 'completed', 'paused')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists agent_plans_user_status
  on agent_plans (user_id, status);

-- 4. Enable Row Level Security (optional but recommended)
alter table conversations  enable row level security;
alter table agent_memory   enable row level security;
alter table agent_plans    enable row level security;

-- Basic policies — allow all for now (tighten later with auth)
create policy "allow_all_conversations" on conversations  for all using (true);
create policy "allow_all_agent_memory"  on agent_memory   for all using (true);
create policy "allow_all_agent_plans"   on agent_plans    for all using (true);
