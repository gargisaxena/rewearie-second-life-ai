CREATE POLICY "Users can read their own piece photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'piece-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own piece photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'piece-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own piece photos" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'piece-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own piece photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'piece-photos' AND auth.uid()::text = (storage.foldername(name))[1]);