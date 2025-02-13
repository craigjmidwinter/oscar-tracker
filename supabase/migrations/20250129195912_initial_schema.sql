-- Movies table
CREATE TABLE movies (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        title TEXT NOT NULL UNIQUE,
                        created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name TEXT NOT NULL UNIQUE,
                            type TEXT CHECK (type IN (
                                                      'picture',
                                                      'performance',
                                                      'technical',
                                                      'creative',
                                                      'documentary',
                                                      'international',
                                                      'writing',
                                                      'short'
                                )),
                            created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nominees table
CREATE TABLE nominees (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name TEXT NOT NULL,
                          movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
                          category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
                          is_winner BOOLEAN DEFAULT false,
                          created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nominees_movie ON nominees(movie_id);
CREATE INDEX idx_nominees_category ON nominees(category_id);

-- User Seen Movies table (References Supabase Auth users instead of a separate users table)
CREATE TABLE user_seen_movies (
                                  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                                  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
                                  PRIMARY KEY (user_id, movie_id)
);

-- Enable Row Level Security (RLS) on user_seen_movies
ALTER TABLE user_seen_movies ENABLE ROW LEVEL SECURITY;

-- User Picks Table: Tracks "think will win" and "hope will win" for each category
CREATE TABLE user_picks (
                            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                            category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
                            think_will_win UUID REFERENCES nominees(id) ON DELETE CASCADE,
                            hope_will_win UUID REFERENCES nominees(id) ON DELETE CASCADE,
                            created_at TIMESTAMPTZ DEFAULT NOW(),
                            PRIMARY KEY (user_id, category_id)
);

-- Foreign Key Constraint for movie_id
ALTER TABLE user_seen_movies
    ADD CONSTRAINT fk_movie
        FOREIGN KEY (movie_id)
            REFERENCES movies(id)
            ON DELETE CASCADE;

-- Indexes for faster lookups
CREATE INDEX idx_user_seen_movies_movie ON user_seen_movies(movie_id);
CREATE INDEX idx_user_seen_movies_user ON user_seen_movies(user_id);

-- Enable Row Level Security (RLS) on movies and categories
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Read-only access to movies and categories for all users
CREATE POLICY "Users can read movies"
ON movies
FOR SELECT
               USING (TRUE);

CREATE POLICY "Users can read categories"
ON categories
FOR SELECT
               USING (TRUE);

-- Policy allowing users to manage their own seen movies
CREATE POLICY "Users can manage their seen movies"
ON user_seen_movies
FOR ALL
USING (auth.uid() = user_id);

-- Policy allowing users to see movies they have marked as seen
CREATE POLICY "Users can view seen movie details"
ON movies
FOR SELECT
                      USING (
                      EXISTS (
                      SELECT 1 FROM user_seen_movies
                      WHERE user_seen_movies.movie_id = movies.id
                      AND user_seen_movies.user_id = auth.uid()
                      )
                      );

-- Enable Row Level Security (RLS) on user_picks
ALTER TABLE user_picks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own picks
CREATE POLICY "Users can view their own picks"
ON user_picks
FOR SELECT
               USING (auth.uid() = user_id);

-- Policy: Users can insert or update only their own picks
CREATE POLICY "Users can insert or update their own picks"
ON user_picks
FOR ALL
                       TO authenticated
                       USING (auth.uid() = user_id)  -- Controls which rows are visible for UPDATE
            WITH CHECK (auth.uid() = user_id);  -- Validates new/updated rows for INSERT/UPDATE