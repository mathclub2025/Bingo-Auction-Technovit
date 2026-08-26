-- ============================================================================
-- 1. EXTENSIONS & CLEANUP
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if re-initializing
DROP TABLE IF EXISTS public.score_audit_logs CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- ============================================================================
-- 2. ADMIN USERS (Password-Protected Admin Accounts Only)
-- ============================================================================
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,                                -- Encrypted via bcrypt
    display_name TEXT NOT NULL DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. TEAMS TABLE (Passwordless - Identified by Team Name)
-- ============================================================================
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT UNIQUE NOT NULL,
    captain_name TEXT NOT NULL,
    captain_reg_no TEXT NOT NULL,
    coins INT DEFAULT 50000 CHECK (coins >= 0),                 -- Starts with 50,000 coins
    numbers_collected JSONB NOT NULL DEFAULT '[]'::jsonb,       -- Array of won numbers e.g. [7, 14]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TEAM MEMBERS TABLE (Captain & Directly Entered Teammates)
-- ============================================================================
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    reg_no TEXT NOT NULL UNIQUE,                                -- Prevents duplicate student registrations
    role TEXT CHECK (role IN ('Captain', 'Teammate')) NOT NULL DEFAULT 'Teammate',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by team
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_reg_no ON public.team_members(reg_no);

-- ============================================================================
-- 5. SCORE AUDIT LOG TABLE (Tracks Point Deductions & Bonuses by Admin)
-- ============================================================================
CREATE TABLE public.score_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    coins_deducted INT NOT NULL,
    bonus_added INT DEFAULT 0,
    number_won INT,
    answer_status TEXT CHECK (answer_status IN ('yes', 'no')),
    previous_coins INT NOT NULL,
    new_coins INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 6. DISABLE RLS (Security Enforced via Node.js API Middleware)
-- ============================================================================
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_audit_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. REALTIME REPLICATION (For Instant Live Dashboard Updates)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
