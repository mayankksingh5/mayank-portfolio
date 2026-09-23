# mayank-portfolio

Personal portfolio website of Mayank Kumar Singh, with a private admin panel
for managing content.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase (Postgres, Auth, Storage) with Row Level Security
- Deployed on Cloudflare Pages (static build)

This project uses its own Supabase project, environment variables and
deployment. It shares no configuration with any other project.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in your portfolio Supabase values
npm run dev
```

Only the public anon key goes in `.env.local`. Never put the Supabase
service-role key in any `VITE_` variable.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |

## Project structure

```
src/
  admin/       Admin panel (lazy-loaded, requires login)
  components/  Reusable UI components
  sections/    Public page sections (Hero, About, Projects, ...)
  pages/       Route-level pages
  hooks/       React hooks
  lib/         Supabase client, env validation, helpers
  services/    Data access functions (Supabase queries)
  types/       Shared TypeScript types
public/        Static files, including Cloudflare _headers and _redirects
supabase/
  migrations/  Database schema, RLS policies and storage setup
```

## Deployment (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

`public/_redirects` handles client-side routing and `public/_headers` sets
security and caching headers.
