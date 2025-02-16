-- ============================================
-- Migration: Rename categories and add sort_order
-- ============================================
BEGIN;

-- 1) Add the sort_order column
ALTER TABLE categories
    ADD COLUMN sort_order INT;

-- 2) Rename categories & set sort_order
UPDATE categories
SET name = 'Best Picture', sort_order = 1
WHERE name = 'Best Picture';

UPDATE categories
SET name = 'Best Director', sort_order = 2
WHERE name = 'Achievement in Directing';

UPDATE categories
SET name = 'Best Actor', sort_order = 3
WHERE name = 'Performance by an Actor in a Leading Role';

UPDATE categories
SET name = 'Best Actress', sort_order = 4
WHERE name = 'Performance by an Actress in a Leading Role';

UPDATE categories
SET name = 'Best Supporting Actor', sort_order = 5
WHERE name = 'Performance by an Actor in a Supporting Role';

UPDATE categories
SET name = 'Best Supporting Actress', sort_order = 6
WHERE name = 'Performance by an Actress in a Supporting Role';

UPDATE categories
SET name = 'Best Original Screenplay', sort_order = 7
WHERE name = 'Original Screenplay';

UPDATE categories
SET name = 'Best Adapted Screenplay', sort_order = 8
WHERE name = 'Adapted Screenplay';

UPDATE categories
SET name = 'Best Animated Feature', sort_order = 9
WHERE name = 'Best Animated Feature Film';

UPDATE categories
SET name = 'Best International Feature Film', sort_order = 10
WHERE name = 'Best International Feature Film';

UPDATE categories
SET name = 'Best Documentary Feature', sort_order = 11
WHERE name = 'Best Documentary Feature Film';

UPDATE categories
SET name = 'Best Documentary Short Film', sort_order = 12
WHERE name = 'Best Documentary Short Film';

UPDATE categories
SET name = 'Best Live Action Short Film', sort_order = 13
WHERE name = 'Best Live Action Short Film';

UPDATE categories
SET name = 'Best Animated Short Film', sort_order = 14
WHERE name = 'Best Animated Short Film';

UPDATE categories
SET name = 'Best Original Score', sort_order = 15
WHERE name = 'Original Score';

UPDATE categories
SET name = 'Best Original Song', sort_order = 16
WHERE name = 'Original Song';

UPDATE categories
SET name = 'Best Sound', sort_order = 17
WHERE name = 'Achievement in Sound';

UPDATE categories
SET name = 'Best Production Design', sort_order = 18
WHERE name = 'Achievement in Production Design';

UPDATE categories
SET name = 'Best Cinematography', sort_order = 19
WHERE name = 'Achievement in Cinematography';

UPDATE categories
SET name = 'Best Makeup and Hairstyling', sort_order = 20
WHERE name = 'Achievement in Makeup and Hairstyling';

UPDATE categories
SET name = 'Best Costume Design', sort_order = 21
WHERE name = 'Achievement in Costume Design';

UPDATE categories
SET name = 'Best Film Editing', sort_order = 22
WHERE name = 'Achievement in Film Editing';

UPDATE categories
SET name = 'Best Visual Effects', sort_order = 23
WHERE name = 'Achievement in Visual Effects';

COMMIT;

-- ============================================
-- (Optional) Update Row-Level Security (RLS)
-- if you want public read access to categories
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop any old policy
DROP POLICY IF EXISTS "Public can read categories" ON categories;

-- Let everyone select from categories
CREATE POLICY "Public can read categories"
ON categories
FOR SELECT
                    USING (true);
