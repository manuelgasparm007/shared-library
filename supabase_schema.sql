-- SQL Schema for Gestão de Biblioteca (Supabase PostgreSQL Setup)
-- Copy and paste this script into the Supabase SQL Editor to initialize your cloud database.

-- 1. Genres Table
CREATE TABLE IF NOT EXISTS public.genres (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Book Statuses Table
CREATE TABLE IF NOT EXISTS public.book_statuses (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL UNIQUE
);

-- 3. Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY, -- e.g. B001
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    pub_year INTEGER,
    status TEXT NOT NULL DEFAULT 'Disponível',
    cover_url TEXT,
    isbn TEXT,
    publisher TEXT,
    synopsis TEXT,
    shelf_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Members / Patrons Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY, -- e.g. M001
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    role TEXT DEFAULT 'patron', -- 'librarian' or 'patron'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Loans / Transactions Table
CREATE TABLE IF NOT EXISTS public.loans (
    id TEXT PRIMARY KEY, -- e.g. T001
    book_id TEXT REFERENCES public.books(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_email TEXT,
    checkout_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Emprestado', -- 'Emprestado', 'Devolvido', 'Atrasado'
    return_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) & Public Access Policies for Demo Simplicity
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for books" ON public.books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
