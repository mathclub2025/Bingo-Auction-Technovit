-- ============================================================================
-- 1. EXTENSIONS & CLEANUP
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if re-initializing
DROP TABLE IF EXISTS public.score_audit_logs CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- ============================================================================
-- 2. TEAMS & ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,                                -- Encrypted via bcrypt
    role TEXT CHECK (role IN ('admin', 'team')) NOT NULL DEFAULT 'team',
    coins INT DEFAULT 50000 CHECK (coins >= 0),                 -- Starts at 50,000 pts
    numbers_collected JSONB NOT NULL DEFAULT '[]'::jsonb,       -- Array of won numbers: [7, 14]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. AUDIT LOG TABLE (Tracks every change made by the Admin)
-- ============================================================================
CREATE TABLE public.score_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    coins_deducted INT NOT NULL,
    bonus_added INT DEFAULT 0,
    number_won INT,
    answer_status TEXT CHECK (answer_status IN ('yes', 'no')),
    previous_coins INT NOT NULL,
    new_coins INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. DISABLE RLS (Permissions enforced strictly via Node.js API Middleware)
-- ============================================================================
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. REALTIME REPLICATION (For instant live updates across screens)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
