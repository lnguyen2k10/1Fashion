-- Enable Storage Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bucket 'public_images' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_images', 'public_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'public_images');

-- Policy to allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public_images');

-- Policy to allow authenticated users to update their own files
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'public_images');

-- Policy to allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'public_images');
