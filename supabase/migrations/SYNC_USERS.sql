-- Check existing users in public.users and auth.users
SELECT 'auth.users' as source, id, email, created_at FROM auth.users WHERE email = '214seenuraja@gmail.com'
UNION ALL
SELECT 'public.users' as source, id, email, created_at FROM public.users WHERE email = '214seenuraja@gmail.com';

-- Delete duplicate from public.users if exists
DELETE FROM public.users WHERE email = '214seenuraja@gmail.com' AND id NOT IN (
  SELECT id FROM auth.users WHERE email = '214seenuraja@gmail.com'
);

-- If user exists in auth but not in public.users, insert them
INSERT INTO public.users (id, email, full_name, created_at)
SELECT 
  auth.users.id,
  auth.users.email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
  NOW()
FROM auth.users
WHERE email = '214seenuraja@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.users WHERE id = auth.users.id
);
