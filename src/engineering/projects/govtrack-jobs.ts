import type { ProjectEngineering } from '@/engineering/types'

/**
 * Engineering View for GovTrack Jobs, from the public repository and its
 * commit history (Jul–Sep 2026). Secrets, env names, admin paths, cron
 * expressions and per-source scraper details are left out.
 */
const engineering: ProjectEngineering = {
  status: 'production',
  tagline: 'Government jobs portal fed by a scheduled scraper, with server-rendered SEO on Vercel',
  summary:
    'GovTrack Jobs lists Indian government recruitments, admit cards, results, answer keys and exam dates, each linked to the official notice. A Node.js scraper runs on GitHub Actions every two hours, collects links from official recruitment sites, removes duplicates, rejects old notices and publishes the rest to Supabase. An Express API serves the data to a React app, and Vercel functions add page-specific titles, Open Graph tags and JSON-LD for search engines and link previews.',

  team: {
    summary:
      'Built with raj5-10, who owns the repository, reviewed and merged the pull requests, and contributed scraper and API fixes. I wrote most of the code.',
    myRole: [
      'Built the first production release: scraper, Express API, public portal and admin panel',
      'Applied the new Figma design with 13 sectors and date-based job status',
      'Built rule-based auto-publishing, the Git-driven seed import and community Q&A',
      'Built the editor review flow and manual job entry',
      'Added the Markdown blog, server-rendered SEO and the live sitemap',
      'Tuned the scraper workflow for Node 22 and the free GitHub Actions quota',
    ],
  },

  architecture: [
    {
      label: 'Client',
      nodes: [
        {
          id: 'spa',
          label: 'Public site',
          tech: 'React 18 · Vite · Tailwind CSS v4',
          description: 'Single-page app with lazy-loaded routes for jobs, search, sector pages, exam calendar, blog and community Q&A.',
        },
        {
          id: 'editor',
          label: 'Editor area',
          tech: 'React (same app)',
          description: 'Role-restricted pages for the review queue, manual job entry, question moderation and the blog editor.',
        },
        {
          id: 'bots',
          label: 'Crawlers & previews',
          description: 'Search engines and chat apps that read the HTML before JavaScript runs.',
        },
      ],
    },
    {
      label: 'Edge (Vercel)',
      nodes: [
        {
          id: 'static',
          label: 'Static hosting',
          tech: 'Vercel',
          description: 'Serves the built app, caches hashed assets for a year and falls back to index.html for client routes.',
        },
        {
          id: 'seo',
          label: 'SEO function',
          tech: 'Vercel Function',
          description: 'Job and blog URLs are rewritten here; it adds title, description, canonical, Open Graph and JSON-LD to the page.',
        },
        {
          id: 'sitemap',
          label: 'Sitemap function',
          tech: 'Vercel Function',
          description: 'Builds sitemap.xml from every published job and article.',
        },
      ],
    },
    {
      label: 'API',
      nodes: [
        {
          id: 'express',
          label: 'Express API',
          tech: 'Express 5 on Vercel',
          description: 'Public job, search, statistics, Q&A and blog endpoints, plus role-checked editorial endpoints.',
        },
        {
          id: 'middleware',
          label: 'Middleware',
          tech: 'Helmet · CORS · rate limiting',
          description: 'Security headers, origin allowlist, rate limits, input validation, JSON request logs and structured errors.',
        },
      ],
    },
    {
      label: 'Data',
      nodes: [
        {
          id: 'pg',
          label: 'Database',
          tech: 'Supabase PostgreSQL',
          description: 'Posts, scraper run log, questions and blog tables, with Row Level Security enabled.',
        },
        {
          id: 'auth',
          label: 'Auth',
          tech: 'Supabase Auth',
          description: 'Editor sign-in; the role is stored in a profile table and checked by the API.',
        },
      ],
    },
    {
      label: 'Automation',
      nodes: [
        {
          id: 'scraper',
          label: 'Scraper',
          tech: 'Node.js · Cheerio · GitHub Actions',
          description: 'Runs every two hours, collects links from official sites and applies the publishing rules.',
        },
        {
          id: 'seed',
          label: 'Seed import',
          tech: 'GitHub Actions',
          description: 'On merge to main, applies hand-checked jobs, reject lists and corrections kept as JSON in the repo.',
        },
        {
          id: 'ci',
          label: 'Test workflow',
          tech: 'Vitest · Supertest · Playwright',
          description: 'Runs backend, frontend and browser tests and builds the apps on every push and pull request.',
        },
      ],
    },
  ],

  techStack: [
    { category: 'Frontend', items: ['React 18', 'Vite 6', 'Tailwind CSS v4', 'React Router 7', 'react-helmet-async', 'marked', 'DOMPurify'] },
    { category: 'Backend', items: ['Node.js', 'Express 5', 'Helmet', 'express-rate-limit', 'compression'] },
    { category: 'Database & auth', items: ['Supabase PostgreSQL', 'Row Level Security', 'Supabase Auth', 'pg_trgm'] },
    { category: 'Scraping', items: ['Cheerio', 'undici', 'Worker-thread PDF text extraction'] },
    { category: 'Automation & hosting', items: ['GitHub Actions (cron, push-triggered, tests)', 'Vercel (static site, functions, rewrites)'] },
    { category: 'Testing', items: ['Vitest', 'Testing Library', 'Supertest', 'Playwright'] },
  ],

  database: {
    engine: 'PostgreSQL on Supabase',
    summary:
      'One posts table holds every notice, with a unique fingerprint for deduplication and a pending, published or rejected status. Visitors can read only published posts; every other table has Row Level Security on with no public policy, so only the server-side API, scraper and import script reach it.',
    entities: [
      {
        name: 'Posts',
        description: 'One row per notice (job, admit card, result, answer key): source fields, editorial fields, dates, official links and status.',
        access: 'Published rows public · writes server-side',
      },
      {
        name: 'Scrape runs',
        description: 'Per-source log of each scraper run: success, links found, new items, error and duration.',
        access: 'Server-side only',
      },
      {
        name: 'Job questions',
        description: 'Visitor questions on a job with a moderation status and an optional answer.',
        access: 'Approved questions shown',
      },
      {
        name: 'Blog posts',
        description: 'Markdown articles with slug, excerpt, tags, draft or published status and an optional related job.',
        access: 'Published articles shown',
      },
      {
        name: 'User profiles',
        description: 'Linked to a Supabase Auth user and holding a user or admin role; created by a trigger on sign-up.',
        access: 'Server-side only',
      },
    ],
    relationships: [
      { from: 'Job questions', to: 'Posts', kind: 'Many-to-one, deleted with the post' },
      { from: 'Blog posts', to: 'Posts', kind: 'Optional many-to-one' },
      { from: 'User profiles', to: 'Auth users', kind: 'One-to-one' },
    ],
  },

  dataFlows: [
    {
      title: 'Scheduled scrape and auto-publish',
      steps: [
        { label: 'Cron', detail: 'GitHub Actions starts the scraper every two hours; one run at a time' },
        { label: 'Fetch sources', detail: 'Each enabled source is fetched with a timeout, retries and a pause between sources' },
        { label: 'Classify', detail: 'Noise such as tenders is dropped; keyword rules label each link' },
        { label: 'Deduplicate', detail: 'Canonical-URL fingerprint, existing-link check and title similarity' },
        { label: 'Publish or hold', detail: 'Old notices rejected, vague titles held for an editor, the rest published' },
      ],
    },
    {
      title: 'Crawler request for a job page',
      steps: [
        { label: 'Rewrite', detail: 'Vercel routes job URLs to the SEO function' },
        { label: 'Load data', detail: 'Cached HTML template plus the job from the API' },
        { label: 'Render tags', detail: 'Title, canonical, Open Graph, JobPosting JSON-LD and a plain-HTML summary' },
        { label: 'Respond', detail: 'Edge-cached; unknown IDs get 404 with noindex' },
        { label: 'App takes over', detail: 'React renders on top and replaces the server tags' },
      ],
    },
    {
      title: 'Curating jobs through Git',
      steps: [
        { label: 'Edit JSON', detail: 'Hand-checked jobs, URLs to reject and corrections' },
        { label: 'Merge to main', detail: 'Starts the seed import workflow' },
        { label: 'Plan', detail: 'Works out inserts and updates; published rows change only on explicit corrections' },
        { label: 'Apply', detail: 'Writes the plan and runs the publishing rules on anything still pending' },
      ],
    },
  ],

  features: [
    {
      name: 'Automatic publishing',
      description: 'Scraped notices are published, held for review or rejected by fixed rules (no AI), each linked to its official source.',
      tech: ['Node.js', 'Cheerio', 'GitHub Actions'],
    },
    {
      name: 'Status from dates',
      description: 'Upcoming, Active, Closing Soon, Closed and Exam are worked out from application and exam dates.',
      tech: ['React'],
    },
    {
      name: 'Sector pages',
      description: '13 sectors such as Banking, SSC, Railway and Defence, inferred from organisation and title.',
      tech: ['React', 'Tailwind CSS'],
    },
    {
      name: 'Exam calendar',
      description: 'Exams grouped by month for the next six months, with an .ics download for calendar apps.',
      tech: ['React'],
    },
    {
      name: 'Community Q&A',
      description: 'Visitors ask questions on a job without an account; questions show only after an editor approves them.',
      tech: ['Express', 'Supabase'],
    },
    {
      name: 'Blog',
      description: 'Markdown articles with live preview, length counters and a search-result preview in the editor.',
      tech: ['marked', 'DOMPurify'],
    },
    {
      name: 'Editorial tools',
      description: 'Review queue with one-click reject and restore, manual job entry that refuses duplicate links, and a crawler health panel.',
      tech: ['React', 'Express'],
    },
    {
      name: 'Server-rendered SEO',
      description: 'Page-specific meta tags and JSON-LD, a live sitemap, and readable job URLs where old links still work.',
      tech: ['Vercel Functions', 'schema.org'],
    },
  ],

  challenges: [
    {
      title: 'Government sites change their markup',
      challenge: 'Per-site CSS selectors break without warning when a site changes its HTML, so a source can quietly return nothing.',
      solution: 'The scraper collects every link on the page and filters by noise patterns, keyword classification and optional year matching, with per-source include and exclude patterns in config.',
    },
    {
      title: 'Silent zero-result runs',
      challenge: 'A project audit found that a successful fetch with zero links was recorded as a success, hiding layout changes.',
      solution: 'A 200 response with zero links now counts as a failure. The scraper diagnoses likely causes such as a CAPTCHA, login page or JavaScript app, and fails the workflow if every source fails.',
    },
    {
      title: 'Duplicate notices',
      challenge: 'Session parameters in URLs created a new fingerprint on every run, and one notice can appear under different links or slightly different titles.',
      solution: 'Fingerprints use a canonical URL that keeps only ID-like parameters, plus checks against existing links and a title-similarity match within the same organisation.',
    },
    {
      title: 'Staying within free GitHub Actions minutes',
      challenge: 'A 30-minute schedule used up the free Actions quota, and PDF parsing took most of each run.',
      solution: 'The schedule moved to every two hours, and PDF parsing is off in scheduled runs but still available locally.',
    },
    {
      title: 'Old notices getting auto-published',
      challenge: 'The first import published old notices: some official URLs carry no year, and some titles were only a language or file size.',
      solution: 'Added an age rule based on upload timestamps in file URLs, a stricter vague-title rule, and a corrections file that can fix or hide published rows.',
      impact: 'The first corrections rejected 18 old result lists and renamed 5 current items (per the commit).',
    },
    {
      title: 'Single-page app invisible to crawlers',
      challenge: 'Search engines and chat apps reading the raw HTML saw only an empty app shell.',
      solution: 'A Vercel function injects page-specific tags, JSON-LD and a plain-HTML summary for job and blog URLs, which the React app then replaces instead of duplicating.',
    },
  ],

  performance: {
    techniques: [
      { name: 'Route-level code splitting', description: 'Every page is lazy-loaded behind a skeleton.' },
      { name: 'Edge caching of SEO pages', description: 'SEO pages and the sitemap are cached at the edge with stale-while-revalidate.' },
      { name: 'Immutable asset caching', description: 'Hashed build assets are cached for a year.' },
      { name: 'Database indexes', description: 'Composite and partial indexes for the common listings, plus a trigram index on titles.' },
      { name: 'Count-only statistics', description: 'Per-category counts run in parallel as head-only count queries.' },
      { name: 'Response compression', description: 'The API gzips its responses.' },
    ],
  },

  security: [
    { name: 'Row Level Security', description: 'Public access is limited to published posts; every other table has RLS on with no public policy.' },
    { name: 'Server-side keys only', description: 'The privileged database key is used only by the API, scraper and import script, never in the browser.' },
    { name: 'Role checks on the server', description: 'Editorial endpoints verify the token and admin role on every request, not just in the UI.' },
    { name: 'Token handling', description: 'The access token lives in memory; the refresh token is an HTTP-only cookie scoped to the auth endpoints.' },
    { name: 'Input validation', description: 'Query and body fields are checked for type, length, format and allowed values; errors return a generic message.' },
    { name: 'Abuse controls', description: 'Global and per-route rate limits, a small body limit, and a honeypot plus moderation on anonymous questions.' },
    { name: 'Safe HTML output', description: 'Blog Markdown is sanitised with DOMPurify, and the SEO renderer escapes HTML and JSON-LD.' },
    { name: 'Production config checks', description: 'The API refuses to start in production with missing credentials, wildcard CORS or non-HTTPS origins.' },
  ],

  deployment: {
    steps: [
      { label: 'Push', detail: 'GitHub Actions runs backend, frontend and browser tests' },
      { label: 'Build site', detail: 'Vite build plus the SEO and sitemap functions on Vercel' },
      { label: 'Deploy API', detail: 'Express app as a serverless function on Vercel' },
      { label: 'Database', detail: 'Schema and migrations in Supabase' },
      { label: 'Scraper', detail: 'Scheduled every two hours; seed import on merge' },
    ],
    facts: [
      { label: 'Hosting', value: 'Vercel' },
      { label: 'Database & auth', value: 'Supabase' },
      { label: 'Scheduler', value: 'GitHub Actions, every 2 hours' },
      { label: 'Node', value: '22' },
      { label: 'License', value: 'MIT' },
    ],
  },

  timeline: {
    source: 'From the git history: 33 commits between July and September 2026.',
    milestones: [
      { date: 'Jul 2026', title: 'First production release', description: 'Scraper, Express API, public portal, admin panel, SQL schemas and tests.' },
      { date: 'Sep 2026', title: 'Figma redesign', description: 'New public UI with 13 sectors and status derived from dates.' },
      { date: 'Sep 2026', title: 'Editor review flow', description: 'Review and publish screens; scraper moved to every two hours.' },
      { date: 'Sep 2026', title: 'Public-only site', description: 'Visitor accounts removed; sign-in kept for editors.' },
      { date: 'Sep 2026', title: 'Auto-publish, seed data and Q&A', description: 'Rule-based publishing, hand-checked recruitments, Git-driven import and community questions.' },
      { date: 'Sep 2026', title: 'Blog and server-rendered SEO', description: 'Markdown blog, SEO function, live sitemap and readable URLs.' },
    ],
  },

  repository: {
    url: 'https://github.com/mayankksingh5/govtrack-jobs',
    visibility: 'public',
    language: 'JavaScript',
  },
}

export default engineering
