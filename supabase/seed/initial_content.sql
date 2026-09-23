-- =============================================================================
-- One-time starter content taken from the portfolio design brief.
-- Run ONCE in the Supabase SQL editor after all migrations. Everything here
-- can be edited or deleted later from the admin panel.
-- The script stops without changing anything if content already exists.
-- =============================================================================

begin;

do $$
begin
  if exists (select 1 from public.experiences)
     or exists (select 1 from public.projects)
     or exists (select 1 from public.stats) then
    raise exception 'Portfolio content already exists; seed skipped so nothing is duplicated.';
  end if;
end;
$$;

-- Profile ---------------------------------------------------------------------
update public.profile set
  full_name = 'Mayank Kumar Singh',
  headline = 'Associate DevOps Engineer | Software Developer | Cloud & Automation Enthusiast',
  summary = 'I build, automate and maintain reliable software systems while working across DevOps, cloud infrastructure and modern web development.',
  about = 'I am a Computer Science Engineering graduate and Associate DevOps Engineer with hands-on experience working with CI/CD pipelines, cloud infrastructure, Docker, Kubernetes, Git and software development.

I enjoy building reliable systems, automating development workflows and working at the intersection of software engineering and DevOps.',
  location = 'India',
  contact_email = 'mayankksingh1999@gmail.com',
  is_open_to_work = true,
  interests = array['DevOps', 'Cloud Computing', 'Software Development', 'Automation']
where id = 1;

update public.site_settings set
  site_title = 'Mayank Kumar Singh | DevOps Engineer & Software Developer',
  meta_description = 'Associate DevOps Engineer and Software Developer working across CI/CD, Docker, Kubernetes, AWS and full-stack development.'
where id = 1;

-- Quick stats -----------------------------------------------------------------
insert into public.stats (value, unit, label, display_order) values
  ('1+', 'Year', 'Professional Experience', 0),
  ('93', 'Days', 'LeetCode Completion Streak', 1),
  ('4★', null, 'HackerRank Java', 2),
  ('574', null, 'CoCubes Score', 3);

-- Experience ------------------------------------------------------------------
insert into public.experiences
  (role, company, employment_type, location, start_date, end_date, is_current, description, technologies, display_order)
values
  ('Associate DevOps Engineer', 'KnowledgeGate Eduventure LLP', 'Full-time', 'Ghaziabad, Uttar Pradesh',
   '2025-02-01', null, true,
   'Building and maintaining CI/CD pipelines with Jenkins & GitHub Actions
Managing source code and release workflows using Git
Supporting AWS cloud infrastructure provisioning and management
Containerizing applications using Docker, basic Kubernetes operations
Monitoring application and infrastructure logs, troubleshooting issues
Managing access controls and environment variables',
   array['AWS', 'Docker', 'Kubernetes', 'Git', 'GitHub Actions', 'Jenkins', 'Linux'], 0),
  ('Software Developer Intern', 'KnowledgeGate Eduventure LLP', 'Internship', 'Ghaziabad, Uttar Pradesh',
   '2024-06-01', '2025-01-31', false,
   'Developed and maintained web application features
Collaborated on software development and testing workflows
Worked across frontend and backend development tasks',
   array['JavaScript', 'Git', 'Web Development'], 1),
  ('Java Developer Intern', 'Pinnacle Labs', 'Internship', 'Remote',
   '2023-12-01', '2024-01-31', false,
   'Worked on Java-based applications and implemented new features
Collaborated on application development and maintenance',
   array['Java', 'OOP', 'Git'], 2),
  ('Data Engineering Virtual Internship', 'AICTE EduSkills', 'Internship', 'Virtual',
   '2023-09-01', '2023-11-30', false,
   'Worked on data engineering concepts including processing, transformation and storage
Completed virtual projects on structured data workflows',
   array['Data Engineering', 'Python', 'SQL'], 3);

-- Projects --------------------------------------------------------------------
insert into public.projects (title, slug, summary, description, is_featured, display_order) values
  ('Capita1', 'capita1', 'IPO & Market Intelligence Platform',
   'Developed and managed a financial intelligence platform focused on IPO insights, market news, company fundamentals, listing updates and stock comparison tools.',
   true, 0),
  ('Spotify Clone', 'spotify-clone', 'Music streaming web interface',
   'A Spotify-inspired web interface developed using HTML, CSS and JavaScript with interactive functionality.',
   false, 1);

insert into public.technologies (name)
select name from unnest(array[
  'Full Stack', 'Financial Technology', 'Market Data', 'UI/UX', 'SEO', 'HTML', 'CSS', 'JavaScript'
]) as name
on conflict do nothing;

insert into public.project_technologies (project_id, technology_id, display_order)
select p.id, t.id, tags.ord - 1
from (values
  ('capita1', array['Full Stack', 'Financial Technology', 'Market Data', 'UI/UX', 'SEO']),
  ('spotify-clone', array['HTML', 'CSS', 'JavaScript'])
) as project_tags(slug, names)
cross join lateral unnest(project_tags.names) with ordinality as tags(name, ord)
join public.projects p on p.slug = project_tags.slug
join public.technologies t on lower(t.name) = lower(tags.name);

-- Skills ----------------------------------------------------------------------
insert into public.skill_categories (name, display_order) values
  ('DevOps', 0), ('Cloud', 1), ('Programming', 2), ('Web Development', 3), ('Tools', 4);

insert into public.skills (category_id, name, display_order)
select c.id, s.name, s.ord - 1
from (values
  ('DevOps', array['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Git', 'Linux']),
  ('Cloud', array['AWS', 'Google Cloud']),
  ('Programming', array['Java', 'JavaScript', 'C', 'SQL']),
  ('Web Development', array['HTML', 'CSS', 'JavaScript', 'MERN Stack']),
  ('Tools', array['GitHub', 'VS Code', 'Figma', 'DialogFlow'])
) as groups(category, names)
cross join lateral unnest(groups.names) with ordinality as s(name, ord)
join public.skill_categories c on c.name = groups.category;

-- Education -------------------------------------------------------------------
insert into public.education
  (degree, field_of_study, institution, location, start_date, end_date, display_order)
values
  ('B.Tech', 'Computer Science & Engineering', 'JIS College of Engineering', 'Kalyani, West Bengal',
   '2020-08-01', '2024-06-30', 0),
  ('Higher Secondary (Class XII)', null, 'Allahabad Public School', 'Prayagraj, Uttar Pradesh',
   '2017-04-01', '2018-03-31', 1),
  ('Secondary Education (Class X)', null, 'Allahabad Public School', 'Prayagraj, Uttar Pradesh',
   '2015-04-01', '2016-03-31', 2);

-- Certifications --------------------------------------------------------------
insert into public.certifications (name, issuer, icon, display_order) values
  ('MERN Stack Full Stack Development', 'Complete Coding', '⚛️', 0),
  ('Cloud Computing with AWS', 'JIS College / Ardent Computech — 30hr', '☁️', 1),
  ('Blue Prism Foundation Training', 'SS&C', '🤖', 2);

-- Achievements ----------------------------------------------------------------
insert into public.achievements (title, description, icon, display_order) values
  ('4 Star Java', 'HackerRank', '⭐', 0),
  ('93-Day Streak', 'LeetCode', '🔥', 1),
  ('NASSCOM Hackathon', 'Application Security Vulnerability Hackathon — 2021', '🛡️', 2),
  ('574 Score', 'CoCubes Assessment', '📊', 3);

-- Social links ----------------------------------------------------------------
insert into public.social_links (platform, label, url, display_order) values
  ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/mayank-singh-298718204', 0),
  ('github', 'GitHub', 'https://github.com/mayankksingh5', 1),
  ('email', 'Email', 'mailto:mayankksingh1999@gmail.com', 2);

commit;
