-- ============================================
-- Migration: Update RLS Policy on user_picks
-- ============================================

-- Drop the old view policy (if it exists)
DROP POLICY IF EXISTS "Users can view their own picks" ON user_picks;

-- Create a new policy that allows public SELECT on user_picks.
CREATE POLICY "Public can view user picks"
ON user_picks
FOR SELECT
                    USING (true);

-- (Keep the insert/update policy as-is)
DROP POLICY IF EXISTS "Users can insert or update their own picks" ON user_picks;

CREATE POLICY "Users can insert or update their own picks"
ON user_picks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 1. Insert Short Film Categories (if not already present)
INSERT INTO categories (name, type)
VALUES
    ('Best Live Action Short Film', 'short'),
    ('Best Documentary Short Film', 'short'),
    ('Best Animated Short Film', 'short')
    ON CONFLICT (name) DO NOTHING;

-- 2. Insert Movies for the Short Films (if not already present)
INSERT INTO movies (title)
VALUES
    ('A Lien'),
    ('Anuja'),
    ('I''m Not a Robot'),
    ('The Last Ranger'),
    ('The Man Who Could Not Remain Silent'),
    ('Death by Numbers'),
    ('I Am Ready, Warden'),
    ('Incident'),
    ('Instruments of a Beating Heart'),
    ('The Only Girl in the Orchestra'),
    ('Beautiful Men'),
    ('In the Shadow of the Cypress'),
    ('Magic Candies'),
    ('Wander to Wonder'),
    ('Yuck!')
    ON CONFLICT (title) DO NOTHING;

-- 3. Insert Nominees for Each Short Film Category
WITH
    -- Movies for Best Live Action Short Film
    mlive AS (
        SELECT id, title FROM movies
        WHERE title IN ('A Lien', 'Anuja', 'I''m Not a Robot', 'The Last Ranger', 'The Man Who Could Not Remain Silent')
    ),
    -- Movies for Best Documentary Short Film
    mdoc AS (
        SELECT id, title FROM movies
        WHERE title IN ('Death by Numbers', 'I Am Ready, Warden', 'Incident', 'Instruments of a Beating Heart', 'The Only Girl in the Orchestra')
    ),
    -- Movies for Best Animated Short Film
    manim AS (
        SELECT id, title FROM movies
        WHERE title IN ('Beautiful Men', 'In the Shadow of the Cypress', 'Magic Candies', 'Wander to Wonder', 'Yuck!')
    ),
    -- Get Category IDs
    clive AS (
        SELECT id FROM categories WHERE name = 'Best Live Action Short Film'
    ),
    cdoc AS (
        SELECT id FROM categories WHERE name = 'Best Documentary Short Film'
    ),
    canim AS (
        SELECT id FROM categories WHERE name = 'Best Animated Short Film'
    )
INSERT INTO nominees (name, movie_id, category_id)
-- For Live Action Short Film nominees
SELECT m.title, m.id, cl.id
FROM mlive m CROSS JOIN clive cl
UNION ALL
-- For Documentary Short Film nominees
SELECT m.title, m.id, cd.id
FROM mdoc m CROSS JOIN cdoc cd
UNION ALL
-- For Animated Short Film nominees
SELECT m.title, m.id, ca.id
FROM manim m CROSS JOIN canim ca;


-- ============================================
-- Migration: Update RLS Policies for user_seen_movies
-- ============================================

-- Ensure RLS is enabled on the table.
ALTER TABLE user_seen_movies ENABLE ROW LEVEL SECURITY;

-- Drop any existing policy that might restrict SELECT (optional).
DROP POLICY IF EXISTS "Users can manage their seen movies" ON user_seen_movies;

-- Create a new policy that allows public read access.
CREATE POLICY "Public can read seen movies"
ON user_seen_movies
FOR SELECT
                    USING (true);

-- Create a policy to restrict modifications to the owner.
DROP POLICY IF EXISTS "Users can manage their seen movies (updates)" ON user_seen_movies;

CREATE POLICY "Users can manage their seen movies (updates)"
ON user_seen_movies
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- ============================================
-- Migration: Create user_preferences and update RLS policies
-- ============================================

-- 1. Create a new table for user preferences.
CREATE TABLE IF NOT EXISTS user_preferences (
                                                user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    picks_public BOOLEAN DEFAULT false,
    seen_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );

-- 2. Update RLS on user_seen_movies:
--    Allow public SELECT only if the owner’s preferences allow seen movies to be public.
ALTER TABLE user_seen_movies ENABLE ROW LEVEL SECURITY;

-- Drop the existing public SELECT policy if it exists.
DROP POLICY IF EXISTS "Public can read seen movies" ON user_seen_movies;

CREATE POLICY "Public can read seen movies"
ON user_seen_movies
FOR SELECT
                    USING (
                    EXISTS (
                    SELECT 1
                    FROM user_preferences up
                    WHERE up.user_id = user_seen_movies.user_id
                    AND up.seen_public = true
                    )
                    );

-- 3. Update RLS on user_picks:
--    Allow public SELECT only if the owner’s preferences allow picks to be public.
ALTER TABLE user_picks ENABLE ROW LEVEL SECURITY;

-- Drop the existing public SELECT policy if it exists.
DROP POLICY IF EXISTS "Public can read user picks" ON user_picks;

CREATE POLICY "Public can read user picks"
ON user_picks
FOR SELECT
                    USING (
                    EXISTS (
                    SELECT 1
                    FROM user_preferences up
                    WHERE up.user_id = user_picks.user_id
                    AND up.picks_public = true
                    )
                    );

-- 4. (Optional) If you want to update your existing update/insert policies,
-- you can keep them as-is so that only the owner can modify their data.
DROP POLICY IF EXISTS "Users can manage their seen movies (updates)" ON user_seen_movies;

CREATE POLICY "Users can manage their seen movies (updates)"
ON user_seen_movies
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert or update their own picks" ON user_picks;

CREATE POLICY "Users can insert or update their own picks"
ON user_picks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

