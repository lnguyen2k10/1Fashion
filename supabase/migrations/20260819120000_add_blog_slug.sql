-- Migration to add slug to blogs
-- Step 1: Add the column as nullable first
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Generate fallback slugs for existing records using their ID
-- Ideally this would be slugified title, but using ID ensures uniqueness and no constraint errors
UPDATE blogs SET slug = id::text WHERE slug IS NULL;

-- Step 3: Make the column NOT NULL and add UNIQUE constraint
ALTER TABLE blogs ALTER COLUMN slug SET NOT NULL;
ALTER TABLE blogs ADD CONSTRAINT blogs_slug_key UNIQUE (slug);
