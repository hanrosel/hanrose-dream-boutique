
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP POLICY "media public read" ON storage.objects;
CREATE POLICY "media public file read" ON storage.objects FOR SELECT
  USING (bucket_id = 'media' AND (auth.role() = 'anon' OR auth.role() = 'authenticated'));
