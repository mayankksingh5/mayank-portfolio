# mayank-portfolio

Personal portfolio website of Mayank Kumar Singh, with a private admin panel
for managing all content without touching code.

- **Public site** (`/`): data-driven sections built from the Figma design.
- **Admin panel** (`/admin`): sign-in protected CRUD for every section,
  image uploads, resume uploads and contact form messages.

This project uses its own Supabase project, environment variables and
deployment. It shares no configuration with any other project.

## Stack

- React 19, Vite, TypeScript, Tailwind CSS v4, React Router
- Supabase: Postgres, Auth, Storage, with Row Level Security
- Static build deployed to Cloudflare Workers (static assets)

The public page uses a lightweight PostgREST client; the full `supabase-js`
bundle (auth, uploads) is only loaded by the admin panel.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:5173
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Project URL, e.g. `https://<ref>.supabase.co` (no `/rest/v1`) |
| `VITE_SUPABASE_ANON_KEY` | yes | Publishable (or legacy anon) key |
| `VITE_SITE_URL` | for production | Public site URL, e.g. `https://example.com`. Enables `sitemap.xml`, canonical URL and link-preview image tags. Set in the committed `.env.production`; a build variable overrides it |

Never put the Supabase **secret / service-role** key in any `VITE_` variable:
those values are bundled into the browser.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Supabase setup (new project)

1. Create a Supabase project for this portfolio.
2. Run the migrations in order in the SQL editor (or with the Supabase CLI):
   1. `supabase/migrations/20260923000001_schema.sql` – tables, RLS
   2. `supabase/migrations/20260923000002_storage.sql` – `media` and `resumes` buckets
   3. `supabase/migrations/20260923000003_design_fields.sql` – stats, contact messages, design fields
   4. `supabase/migrations/20260923000004_contact_phone.sql` – contact phone on the profile
3. Optional: run `supabase/seed/initial_content.sql` once for starter content.
4. **Authentication → Users → Add user**: create the admin account.
5. Run `supabase/admin/grant_admin.sql` with that email to grant admin access.
6. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up".

### Security model

- Visitors can only read rows where `is_published = true`.
- Visitors can insert contact messages but never read them.
- Create, update and delete require the signed-in user to be in
  `public.admin_users` (checked by `public.is_admin()` in every policy).
- Storage buckets are publicly readable; only admins can upload or delete.

## Project structure

```
src/
  admin/       Admin panel (lazy-loaded): auth, layout, forms, pages
  components/  Shared public UI (icons, headings, tags, buttons)
  engineering/ Engineering View: data model, per-project data, components
  sections/    Public page sections (Hero, Experience, Projects, ...)
  pages/       Route-level pages
  hooks/       React hooks
  lib/         Clients, env validation, formatting helpers
  services/    Data access (public and admin)
  types/       Database types
public/        Static files, Cloudflare _headers, og-image.png
supabase/
  migrations/  Schema, RLS policies and storage setup
  seed/        Optional starter content
  admin/       Script to grant admin access
seo-plugin.ts  Build-time robots.txt, sitemap.xml and canonical/OG tags
wrangler.jsonc Cloudflare deployment config
```

## Engineering View

Projects can have a technical case study at `/projects/<slug>/engineering`
(architecture, stack, data model, data flow, challenges, performance,
security, deployment, timeline). A "View Engineering Details" link appears on
the project card only when a view is enabled.

To add one for a project:

1. Create `src/engineering/projects/<slug>.ts` exporting a `ProjectEngineering`
   object (see `src/engineering/types.ts`). Every section is optional and is
   hidden when empty; only add information you can verify.
2. Register it in `src/engineering/registry.ts` with `enabled: true`.
3. The slug must match a **published** project in Admin > Projects. The title,
   live URL and GitHub URL come from that project.

Never put secrets, private URLs, private repositories or unmeasured numbers in
these files: they ship to the browser.

## Deployment (Cloudflare Workers, static assets)

`wrangler.jsonc` serves the built `dist/` folder as static assets with
single-page-app fallback (so `/admin` and other client routes work). No
server code runs.

1. Cloudflare dashboard → **Workers & Pages → Create → Import a repository**
   and pick `mayank-portfolio` (grant the GitHub app access to this repository only).
2. Settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
3. **Advanced settings → Build variables** (Vite reads these at build time):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and later `VITE_SITE_URL`.
   Node version is read from `.node-version` (22).
4. Deploy. Once the final URL (`*.workers.dev` or a custom domain) is known,
   set `VITE_SITE_URL` to it and redeploy so the sitemap and preview tags use it.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to the
   deployed URL.

Every push to `main` redeploys automatically. Content edited in the admin
panel shows up immediately without a redeploy.

`public/_headers` sets security headers (CSP, frame blocking), `noindex` for
`/admin`, and long-term caching for hashed assets.

To test the production build locally in the Cloudflare runtime:
`npm run build && npx wrangler dev`.
