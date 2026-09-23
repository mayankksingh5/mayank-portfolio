-- Grants admin access to an existing Supabase Auth user.
-- Run in the Supabase SQL editor AFTER the migrations, replacing the email.
-- Create the user first under Authentication -> Users -> Add user.

insert into public.admin_users (user_id)
select id from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;

-- Check: should return exactly one row with your email.
select u.email, a.created_at
from public.admin_users a
join auth.users u on u.id = a.user_id;
