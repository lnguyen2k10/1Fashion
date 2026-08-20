CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION slugify(value TEXT) RETURNS TEXT AS $$
BEGIN
  -- remove accents, lower case, replace spaces/special chars with hyphens
  RETURN trim(both '-' from regexp_replace(lower(unaccent(value)), '[^a-z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

UPDATE public.blogs
SET slug = slugify(title)
WHERE slug IS NULL OR slug ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

