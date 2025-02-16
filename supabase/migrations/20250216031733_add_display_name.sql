-- ================================
-- MIGRATION: Add display_name to user_preferences
-- ================================

-- 1) Add the column
ALTER TABLE user_preferences
    ADD COLUMN display_name text;

-- 2) Enable RLS if not already
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 3) Drop old policies if any
DROP POLICY IF EXISTS "Public can read user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage user prefs" ON user_preferences;

-- 4) (Optional) If you want everyone's display_name to be publicly readable:
CREATE POLICY "Public can read user preferences"
ON user_preferences
FOR SELECT
                         USING (true);

-- 5) Restrict modifications to the owner
CREATE POLICY "Users can manage user prefs"
ON user_preferences
FOR ALL
TO authenticated
USING ( auth.uid() = user_id )
WITH CHECK ( auth.uid() = user_id );
