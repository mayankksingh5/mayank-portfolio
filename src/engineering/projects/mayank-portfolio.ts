import type { ProjectEngineering } from '@/engineering/types'

/**
 * Engineering View for this portfolio. Every entry is taken from this
 * repository (source, package.json, supabase/migrations, public/_headers,
 * wrangler.jsonc, README and commit history). Keep it that way: no invented
 * numbers, and nothing that isn't already public in the repository.
 */
const engineering: ProjectEngineering = {
  status: 'production',
  tagline: 'Static React SPA on Cloudflare with a Supabase backend and a CMS-style admin panel.',
  summary:
    'A data-driven single-page application. All content lives in Supabase Postgres behind Row Level Security and is edited through a private, sign-in protected admin panel. The public site is plain static files served from Cloudflare with no server code, so content changes go live without a redeploy.',

  architecture: [
    {
      label: 'Client',
      nodes: [
        {
          id: 'visitor',
          label: 'Visitor browser',
          description: 'Loads the public site and reads published content directly from the Supabase REST API.',
        },
        {
          id: 'admin-user',
          label: 'Admin browser',
          description: 'The site owner signs in to the private admin panel to create, edit, reorder and publish content.',
        },
      ],
    },
    {
      label: 'Edge',
      nodes: [
        {
          id: 'cloudflare',
          label: 'Static hosting',
          tech: 'Cloudflare Workers (static assets)',
          description:
            'Serves the built dist/ folder. Unknown paths fall back to index.html so client-side routes work, and a _headers file adds security and caching headers. No server code runs.',
        },
      ],
    },
    {
      label: 'Application',
      nodes: [
        {
          id: 'public-site',
          label: 'Public site',
          tech: 'React 19 · React Router',
          description:
            'Renders every section from database content. Uses a lightweight PostgREST client instead of the full Supabase SDK.',
        },
        {
          id: 'admin-panel',
          label: 'Admin panel',
          tech: 'React · supabase-js · Zod',
          description:
            'Lazy-loaded route chunks with sign-in, Zod-validated forms, image and resume uploads, and contact message management.',
        },
      ],
    },
    {
      label: 'Backend services',
      nodes: [
        {
          id: 'auth',
          label: 'Authentication',
          tech: 'Supabase Auth',
          description:
            'Email and password sign-in for the admin. After sign-in the app asks the database whether the user is an admin before showing the panel.',
        },
        {
          id: 'rest',
          label: 'REST API',
          tech: 'Supabase (PostgREST)',
          description: 'Auto-generated REST API over Postgres. Every request is checked against Row Level Security policies.',
        },
        {
          id: 'storage',
          label: 'File storage',
          tech: 'Supabase Storage',
          description:
            'Public buckets for images and resume PDFs. Browsers load files by public URL; only an admin can upload or delete.',
        },
      ],
    },
    {
      label: 'Data',
      nodes: [
        {
          id: 'postgres',
          label: 'Database',
          tech: 'PostgreSQL',
          description:
            'Content tables with Row Level Security, check constraints and updated_at triggers. Schema lives in versioned SQL migrations.',
        },
      ],
    },
  ],

  techStack: [
    { category: 'Frontend', items: ['React 19', 'TypeScript', 'React Router 7', 'Tailwind CSS v4'] },
    { category: 'Build', items: ['Vite', 'TypeScript compiler (tsc -b)'] },
    { category: 'Backend', items: ['Supabase (PostgREST API)', 'supabase-js', 'postgrest-js'] },
    { category: 'Database', items: ['PostgreSQL (Supabase)', 'SQL migrations'] },
    { category: 'Authentication', items: ['Supabase Auth'] },
    { category: 'Storage', items: ['Supabase Storage'] },
    { category: 'Validation', items: ['Zod'] },
    { category: 'Deployment', items: ['Cloudflare Workers (static assets)', 'Wrangler'] },
    { category: 'Tooling', items: ['oxlint', 'Fontsource (self-hosted fonts)'] },
  ],

  database: {
    engine: 'PostgreSQL on Supabase',
    summary:
      'Conceptual view of the content model. Most lists share the same shape: a display order and a published flag, so the admin can reorder and hide items without deleting them.',
    entities: [
      {
        name: 'Profile & site settings',
        description: 'Single-row tables for the owner profile, SEO settings and the current resume file.',
        access: 'Public read · admin update',
      },
      {
        name: 'Projects',
        description: 'Title, slug, summary, links, thumbnail, featured flag.',
        access: 'Published rows public · admin write',
      },
      {
        name: 'Technologies',
        description: 'Shared, case-insensitive tag names reused across projects.',
        access: 'Public read · admin write',
      },
      {
        name: 'Skill categories & skills',
        description: 'Skills grouped by category; a skill shows only when its category is published too.',
        access: 'Published rows public · admin write',
      },
      {
        name: 'Experience, education, certifications, achievements',
        description: 'Ordered timeline and credential lists.',
        access: 'Published rows public · admin write',
      },
      {
        name: 'Social links & stats',
        description: 'Contact links and the quick stats under the hero.',
        access: 'Published rows public · admin write',
      },
      {
        name: 'Contact messages',
        description: 'Messages from the contact form, with length and email-format checks in the database.',
        access: 'Visitors insert only · admin read',
      },
      {
        name: 'Admin membership',
        description: 'Links a sign-in account to admin rights. Granted outside the API, so nobody can make themselves admin.',
        access: 'Not writable through the API',
      },
    ],
    relationships: [
      { from: 'Projects', to: 'Technologies', kind: 'Many-to-many, ordered' },
      { from: 'Skill categories', to: 'Skills', kind: 'One-to-many' },
      { from: 'Auth users', to: 'Admin membership', kind: 'One-to-one' },
    ],
  },

  dataFlows: [
    {
      title: 'Visitor opens the site',
      steps: [
        { label: 'Request', detail: 'Cloudflare serves the static app' },
        { label: 'Parallel queries', detail: '11 REST reads run at once' },
        { label: 'Row Level Security', detail: 'Only published rows are returned' },
        { label: 'Render', detail: 'Sections with data render; a failed load shows a retry screen' },
      ],
    },
    {
      title: 'Visitor sends a message',
      steps: [
        { label: 'Form submit', detail: 'Client-side validation and a spam honeypot' },
        { label: 'Insert', detail: 'REST insert with the public key' },
        { label: 'Database checks', detail: 'Insert-only policy and length/format constraints' },
        { label: 'UI update', detail: 'Success or error state' },
      ],
    },
    {
      title: 'Admin edits content',
      steps: [
        { label: 'Sign in', detail: 'Supabase Auth session' },
        { label: 'Admin check', detail: 'Database function confirms admin membership' },
        { label: 'Validate', detail: 'Zod schema on the form' },
        { label: 'Write', detail: 'Row Level Security allows admins only' },
        { label: 'Live', detail: 'Public site shows it on the next load, no redeploy' },
      ],
    },
  ],

  features: [
    {
      name: 'CMS-style admin panel',
      description:
        'Create, edit, delete, reorder and publish/unpublish every section, plus image uploads, resume uploads and a contact inbox.',
      tech: ['React', 'supabase-js', 'Zod'],
    },
    {
      name: 'Route-level code splitting',
      description: 'Every admin page is a lazy route chunk, so public visitors never download admin code.',
      tech: ['React Router lazy routes', 'Vite'],
    },
    {
      name: 'In-browser image compression',
      description:
        'Images are resized to at most 1600px and re-encoded as WebP before upload, keeping the original when WebP is not smaller.',
      tech: ['Canvas API'],
    },
    {
      name: 'Upload progress',
      description: 'Uploads go straight to the Storage REST endpoint with XMLHttpRequest to report real progress.',
      tech: ['XMLHttpRequest', 'Supabase Storage'],
    },
    {
      name: 'Build-time SEO',
      description:
        'A Vite plugin emits robots.txt, sitemap.xml and canonical/Open Graph tags from the site URL; the page adds schema.org Person data.',
      tech: ['Vite plugin', 'JSON-LD'],
    },
    {
      name: 'Fail-fast configuration',
      description: 'Required environment variables are validated at startup with a clear error instead of failing later.',
      tech: ['TypeScript'],
    },
    {
      name: 'Accessibility basics',
      description:
        'Skip link, visible focus outlines, reduced-motion support, and text colors adjusted to meet WCAG AA contrast.',
    },
  ],

  challenges: [
    {
      title: 'Admin preview showed hidden content',
      challenge:
        'Row Level Security lets an admin read unpublished rows, so a signed-in admin viewing the public site would see content visitors cannot.',
      solution: 'Public queries also filter on the published flag explicitly, on top of the database policies.',
      impact: 'The admin sees exactly what visitors see.',
    },
    {
      title: 'Keeping the public bundle light',
      challenge:
        'The full Supabase SDK (auth, storage, realtime) is only needed by the admin panel, but the public page also talks to Supabase.',
      solution:
        'The public page uses the small PostgREST client for reads and contact inserts; supabase-js is only imported by lazy-loaded admin code.',
      impact: 'Visitors do not download authentication or upload code.',
    },
    {
      title: 'No upload progress in the SDK',
      challenge: 'The supabase-js upload method has no progress events, so the admin panel could not show how far an upload had got.',
      solution: 'Uploads call the Storage REST endpoint directly with XMLHttpRequest and the signed-in session token.',
      impact: 'The admin panel shows a real progress bar.',
    },
    {
      title: 'Stale resume downloads',
      challenge: 'Replacing a file at the same URL can leave visitors with a cached old resume.',
      solution:
        'Every upload gets a new unique file name and the settings row points to the current one; files are cached for a year.',
      impact: 'Visitors always get the latest resume while files stay cacheable.',
    },
    {
      title: 'Low-contrast text from the design',
      challenge: 'The design’s subtle gray text did not meet WCAG AA contrast (4.5:1) on the dark background.',
      solution: 'The color token was lightened slightly while keeping the design’s look.',
      impact: 'Secondary text meets WCAG AA contrast.',
    },
  ],

  performance: {
    // TODO: add measured results (Lighthouse, Core Web Vitals) with their source and date.
    metrics: [],
    techniques: [
      { name: 'Code splitting', description: 'Admin pages and this Engineering View load as separate chunks on demand.' },
      { name: 'Parallel data loading', description: 'All home page queries run at the same time instead of one after another.' },
      { name: 'Small data client', description: 'The public page uses the PostgREST client instead of the full Supabase SDK.' },
      {
        name: 'Long-term caching',
        description: 'Hashed build assets and uploaded files (unique names) are cached for a year.',
      },
      { name: 'Image optimization', description: 'Uploads are compressed to WebP; page images use lazy loading and async decoding.' },
      { name: 'Self-hosted fonts', description: 'Fonts ship with the site, with no third-party font requests.' },
    ],
  },

  security: [
    {
      name: 'Row Level Security everywhere',
      description: 'Every table has RLS enabled. Visitors can only read published rows.',
    },
    {
      name: 'Database-enforced authorization',
      description: 'Every write policy checks admin membership in the database, not just in the UI.',
    },
    {
      name: 'Public key only in the browser',
      description: 'The app ships only the public key; no service-role key is used anywhere in the client.',
    },
    {
      name: 'Insert-only contact form',
      description: 'Visitors can send messages but never read them back; the database checks lengths and email format.',
    },
    {
      name: 'Safe links',
      description: 'URL columns only accept http(s) links, so a javascript: URL can never be stored and rendered.',
    },
    {
      name: 'Upload limits',
      description: 'Storage buckets restrict file types and sizes (5 MB images, 10 MB PDFs); only admins can upload.',
    },
    {
      name: 'Security headers',
      description:
        'Content Security Policy, frame blocking, nosniff, referrer and permissions policies; admin pages are no-index and never cached.',
    },
    {
      name: 'Graceful failures',
      description: 'Loading and error states with retry on the public page; invalid configuration fails fast with a clear message.',
    },
  ],

  deployment: {
    steps: [
      { label: 'Developer', detail: 'Push to main' },
      { label: 'GitHub', detail: 'Repository' },
      { label: 'Build', detail: 'tsc -b && vite build' },
      { label: 'Deploy', detail: 'wrangler deploy' },
      { label: 'Production', detail: 'Cloudflare Workers static assets' },
    ],
    facts: [
      { label: 'Hosting', value: 'Cloudflare Workers (static assets)' },
      { label: 'Build', value: 'Type-check, then Vite production build' },
      { label: 'Node', value: '22' },
      { label: 'Branch', value: 'main deploys automatically' },
      { label: 'Server code', value: 'None' },
    ],
    note: 'Content is edited in the database, so content changes go live without a new deployment.',
  },

  timeline: {
    source: 'From the repository commit history, September 2026.',
    milestones: [
      { title: 'Project scaffold', description: 'Vite, React, TypeScript and Tailwind CSS.' },
      { title: 'Database & security', description: 'Schema, Row Level Security policies and storage buckets.' },
      { title: 'Admin authentication', description: 'Sign-in, admin check, layout and dashboard.' },
      { title: 'Content management', description: 'Admin editing for every portfolio section.' },
      { title: 'Public portfolio', description: 'Data-driven sections built from the Figma design.' },
      { title: 'SEO, performance & deployment', description: 'Build-time SEO files, security headers, Cloudflare config.' },
      { title: 'Refinements', description: 'Featured project preview, contact phone, hero photo and Resume section.' },
      { title: 'Engineering View', description: 'This data-driven technical case study.' },
    ],
  },

  repository: {
    url: 'https://github.com/mayankksingh5/mayank-portfolio',
    visibility: 'public',
    language: 'TypeScript',
  },
}

export default engineering
