INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'helper-documents',
  'helper-documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg', 
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Policy für authentifizierte Benutzer zum Hochladen von Dateien
CREATE POLICY "Allow authenticated uploads to helper-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'helper-documents'
);

-- Policy für authentifizierte Benutzer zum Anzeigen von Dateien
CREATE POLICY "Allow authenticated users to view helper documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'helper-documents'
);

-- Policy für authentifizierte Benutzer zum Aktualisieren von Dateien
CREATE POLICY "Allow authenticated users to update helper documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'helper-documents'
)
WITH CHECK (
  bucket_id = 'helper-documents'
);

-- Policy für authentifizierte Benutzer zum Löschen von Dateien
CREATE POLICY "Allow authenticated users to delete helper documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'helper-documents'
);