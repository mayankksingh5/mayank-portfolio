-- Public contact phone number shown in the contact section.
alter table public.profile
  add column contact_phone text
  check (contact_phone is null or contact_phone ~ '^\+?[0-9][0-9 ()-]{6,19}$');
