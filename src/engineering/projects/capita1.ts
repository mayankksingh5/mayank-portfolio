import type { ProjectEngineering } from '@/engineering/types'

/**
 * Engineering View for CAPITA1. The code is private and co-developed, so this
 * describes design and approach only: no repository link, secrets, internal
 * URLs, admin paths or limits. Every entry was checked against the repository
 * and its commit history (Jun–Sep 2026).
 */
const engineering: ProjectEngineering = {
  status: 'production',
  tagline: 'Indian-markets research platform: CI-scraped datasets, ISR Next.js app, cached multi-LLM AI, Android app',
  summary:
    'CAPITA1 is an Indian-markets research site covering IPOs, market data, news, learning tools and a members-only stock screener. NSE and Yahoo Finance block cloud IPs, so scrapers run on GitHub Actions, commit JSON datasets and redeploy, and the Next.js app serves those files with incremental static regeneration. A Gemini-first AI layer with a Groq fallback writes analysis in English and Hindi, including page-cited reads of IPO prospectus PDFs, with results cached in MongoDB and rate-limited per IP. An Expo Android app reuses the site’s IPO logic for offline data and deadline alerts.',

  team: {
    summary:
      'Built by two developers. I started the project in June 2026 and built the core web platform; Aditya Srivastava joined in July, built the Android app and led much of the IPO Center and news pipeline work. We shared the data pipelines, blog and learning tools.',
    myRole: [
      'Started the project and built the breakout scanner and the precomputed-dataset approach',
      'Built the AI layer: bilingual insights, provider fallback and DRHP/RHP prospectus analysis',
      'Led the work on sign-in, role-based access in edge middleware and the MongoDB data layer',
      'Built the institutional-activity research engine and the team workspace',
      'Cut the /ipo page HTML from 12.3 MB to 0.14 MB',
      'Worked on the GitHub Actions data pipelines, IPO Center, news and blog with my teammate',
    ],
  },

  architecture: [
    {
      label: 'Clients',
      nodes: [
        {
          id: 'web',
          label: 'Web app',
          tech: 'Next.js 16 · React 19',
          description: 'Public pages for IPOs, news, blog, calculators and mock tests, plus a members-only area for market tools.',
        },
        {
          id: 'android',
          label: 'Android app',
          tech: 'Expo · React Native',
          description: 'Five-tab app on the same public APIs, with an offline-first cache and local IPO deadline alarms.',
        },
      ],
    },
    {
      label: 'Edge',
      nodes: [
        {
          id: 'middleware',
          label: 'Edge middleware',
          tech: 'Next.js middleware · jose',
          description: 'Checks the session JWT without a database call, gates private pages and APIs by role, and enforces the canonical host.',
        },
        {
          id: 'headers',
          label: 'Security headers',
          tech: 'next.config headers()',
          description: 'Sets HSTS, frame and permission policies, an enforced CSP subset and a report-only CSP on every response.',
        },
      ],
    },
    {
      label: 'Application',
      nodes: [
        {
          id: 'rsc',
          label: 'Server-rendered pages',
          tech: 'App Router · ISR',
          description: 'Pages read the committed datasets and regenerate on per-route intervals. Detail pages are prebuilt from the dataset.',
        },
        {
          id: 'api',
          label: 'API route handlers',
          tech: 'Node.js runtime',
          description: 'Serve market data, IPOs, news, AI, auth and workspace. Each handler checks auth again after the middleware.',
        },
        {
          id: 'ai-router',
          label: 'AI router',
          tech: 'Gemini → Groq',
          description: 'One entry point that picks a provider per request, falls back based on the error class, and skips providers whose circuit breaker is open.',
        },
      ],
    },
    {
      label: 'Data & cache',
      nodes: [
        {
          id: 'json',
          label: 'Committed datasets',
          tech: 'JSON in git',
          description: 'Scanner signals, IPO center, fundamentals, markets, F&O, option chain, filings and research data, all versioned in the repository.',
        },
        {
          id: 'mongo',
          label: 'Database',
          tech: 'MongoDB Atlas',
          description: 'Users and sessions, workspace, AI and prospectus caches, news articles, blog CMS, desk-entered GMP and analytics.',
        },
        {
          id: 'redis',
          label: 'Rate limits',
          tech: 'Upstash Redis',
          description: 'Shared rate-limit windows across serverless instances, with an in-memory fallback when Redis is not configured.',
        },
      ],
    },
    {
      label: 'Pipelines & services',
      nodes: [
        {
          id: 'actions',
          label: 'Scheduled scrapers',
          tech: 'GitHub Actions · Node 22',
          description: 'Scrape NSE, Yahoo and RSS feeds, validate the output, commit datasets, deploy and check the live site.',
        },
        {
          id: 'llm',
          label: 'LLM providers',
          tech: 'Google Gemini · Groq',
          description: 'Return structured JSON. Gemini also reads prospectus PDFs directly.',
        },
        {
          id: 'messaging',
          label: 'Email & push',
          tech: 'Resend · Firebase Cloud Messaging',
          description: 'Meeting invites and reminders by email, and data-only push messages that wake the Android app.',
        },
      ],
    },
  ],

  techStack: [
    { category: 'Frontend', items: ['Next.js 16 (App Router)', 'React 19', 'TypeScript (strict)', 'Tailwind CSS v4', 'Zustand', 'Recharts'] },
    { category: 'Backend / API', items: ['Next.js Route Handlers', 'Edge Middleware', 'jose (JWT)', 'bcryptjs', 'Resend', 'Vercel Blob'] },
    { category: 'Data', items: ['MongoDB Atlas', 'Upstash Redis', 'Committed JSON datasets'] },
    { category: 'AI', items: ['Google Gemini (structured JSON, PDF input)', 'Groq (fallback)', 'Multi-provider router'] },
    { category: 'Data pipelines', items: ['GitHub Actions cron', 'Node.js 22 scripts', 'yahoo-finance2', 'p-limit'] },
    { category: 'Mobile', items: ['Expo', 'React Native', 'expo-router', 'TanStack Query + MMKV', 'expo-notifications', 'Firebase Cloud Messaging'] },
    { category: 'Testing & CI', items: ['Vitest', 'React Native Testing Library', 'GitHub Actions', 'EAS Build'] },
  ],

  database: {
    engine: 'MongoDB Atlas, plus file-based JSON datasets for market data',
    summary:
      'MongoDB holds data that changes at runtime: accounts, the workspace, AI caches, news, CMS content and desk-entered GMP. Market, IPO, calculator and mock-test data are committed files that are read-only at runtime.',
    entities: [
      {
        name: 'User',
        description: 'Account with an admin or member role, an active flag and a session-version counter used to revoke sign-ins. Also holds org-chart fields.',
        access: 'Admin-managed · no self sign-up',
      },
      {
        name: 'Task & meeting',
        description: 'Workspace tasks with comments and an audit trail. Meetings store attendees, attendance and per-reminder flags so each reminder is sent once.',
        access: 'Members only',
      },
      {
        name: 'IPO record',
        description: 'Committed JSON per issue: NSE calendar, subscription, filing details and a fundamentals overlay, joined by slug.',
        access: 'File-based · read at build and regeneration',
      },
      {
        name: 'GMP reading',
        description: 'Append-only, desk-entered grey-market premium readings. A newer reading supersedes the previous one and is merged into IPO pages at render time.',
        access: 'Public read · admin write',
      },
      {
        name: 'Prospectus analysis',
        description: 'Structured DRHP/RHP extraction, AI summary and page-cited references, stored with a fingerprint of the source document.',
        access: 'Public read from cache only',
      },
      {
        name: 'AI response cache',
        description: 'Per-feature AI output keyed by input and model, expiring after 6 hours, with the provider and model that produced it.',
        access: 'Server-only',
      },
      {
        name: 'News article',
        description: 'Ingested story with relevance and index flags, an optional linked IPO, and an AI-written bilingual body.',
        access: 'Public read',
      },
      {
        name: 'Blog post',
        description: 'CMS-managed article, so publishing needs no deploy. Imported from reviewed packs or drafted in an admin studio.',
        access: 'Public read · admin write',
      },
    ],
    relationships: [
      { from: 'Task & meeting', to: 'User', kind: 'Assignee and creator; meetings have many attendees' },
      { from: 'User', to: 'User', kind: 'Reporting manager (org chart)' },
      { from: 'GMP reading', to: 'IPO record', kind: 'Many-to-one by slug' },
      { from: 'Prospectus analysis', to: 'IPO record', kind: 'One-to-one by slug' },
      { from: 'News article', to: 'IPO record', kind: 'Optional many-to-one by slug' },
    ],
  },

  dataFlows: [
    {
      title: 'Scheduled market-data refresh',
      steps: [
        { label: 'Cron', detail: 'Separate GitHub Actions schedules for IPOs and markets, option chain, scanner, research and news' },
        { label: 'Scrape', detail: 'Fails soft: an empty scrape keeps the previous data instead of overwriting good files' },
        { label: 'Validate', detail: 'A benchmark IPO regression check blocks the commit and deploy if the data breaks its rules' },
        { label: 'Commit', detail: 'Each job overlays only its own files on the latest main and retries the push' },
        { label: 'Deploy & verify', detail: 'Production deploy, point the domain, then poll a public API until the new data is live' },
      ],
    },
    {
      title: 'AI insight request',
      steps: [
        { label: 'Open an AI card', detail: 'Unknown symbols or slugs get a 404' },
        { label: 'Cache check', detail: 'A MongoDB hit returns right away and costs no rate limit or model quota' },
        { label: 'Rate limit', detail: 'Per IP on a cache miss, backed by Upstash Redis' },
        { label: 'Route to provider', detail: 'Gemini first, then Groq; auth, quota and transient errors fall through' },
        { label: 'Cache & return', detail: 'Bilingual JSON cached for 6 hours, with disclaimer, source and timestamp' },
      ],
    },
    {
      title: 'IPO prospectus analysis',
      steps: [
        { label: 'Daily pre-warm', detail: 'Runs for IPOs that have not listed yet' },
        { label: 'Fingerprint', detail: 'An unchanged filing is skipped' },
        { label: 'Guarded fetch', detail: 'HTTPS only; no IP literals or private addresses' },
        { label: 'Gemini reads the PDF', detail: 'Business, proceeds, risks, promoters and litigation, with page citations' },
        { label: 'Store & serve', detail: 'The public page reads the cache only and never triggers generation' },
      ],
    },
  ],

  features: [
    {
      name: 'Breakout scanner & market dashboards',
      description: 'Daily scan of NSE stocks scoring breakouts 0–100 from resistance, volume expansion and momentum. Members also get F&O scanners, an option chain, FII/DII, results and filings.',
      tech: ['TypeScript', 'yahoo-finance2', 'GitHub Actions'],
    },
    {
      name: 'IPO Center',
      description: 'NSE calendar, subscription and filing details joined with a fundamentals overlay, with P/E, P/B, premium versus listed peers, a 0–100 opportunity score and side-by-side comparison.',
      tech: ['Next.js ISR', 'TypeScript'],
    },
    {
      name: 'Prospectus intelligence',
      description: 'Gemini reads DRHP/RHP PDFs directly and returns structured sections with page-cited sources, plus a bilingual company explainer.',
      tech: ['Google Gemini', 'MongoDB'],
    },
    {
      name: 'Bilingual AI insights',
      description: 'Stock, chart, IPO, news and research summaries in English and Hindi. Outputs are schema-constrained and labelled educational only.',
      tech: ['Gemini', 'Groq', 'Upstash Redis'],
    },
    {
      name: 'Institutional-activity research',
      description: 'Computes average shares per trade from NSE bhavcopy data, detects patterns and produces a 0–100 Institutional Activity Score.',
      tech: ['Node.js', 'Recharts'],
    },
    {
      name: 'News pipeline',
      description: 'RSS ingest with relevance filtering, duplicate collapse and IPO matching. A budgeted cron job writes bilingual article pages; page renders never call the model.',
      tech: ['MongoDB', 'GitHub Actions', 'Gemini'],
    },
    {
      name: 'Learning & tools',
      description: 'Financial calculators (including Black-Scholes and implied volatility), NISM practice papers and a blog with a CMS and an AI drafting studio.',
      tech: ['TypeScript', 'MongoDB'],
    },
    {
      name: 'Android app',
      description: 'Expo app that reuses the site’s IPO logic, with an offline-first cache, Hindi UI, a home-screen widget and local IPO deadline alerts.',
      tech: ['Expo', 'React Native', 'TanStack Query', 'FCM'],
    },
    {
      name: 'Team workspace',
      description: 'Internal tasks, members, org chart and meetings with a calendar, attendance and email reminders sent once each.',
      tech: ['MongoDB', 'Resend'],
    },
  ],

  challenges: [
    {
      title: 'Data sources block cloud IPs',
      challenge: 'Yahoo Finance and NSE block datacenter IPs, so the app cannot scan the market from its own serverless functions.',
      solution: 'Scrapers run on GitHub Actions runners and commit precomputed JSON that the app serves statically. Where a live feed is reachable, routes layer live, cached and fallback tiers on top.',
    },
    {
      title: 'Bots and people pushing generated data',
      challenge: 'Several cron jobs and developers push to the same branch, and line-merging generated JSON risks invalid or duplicated data.',
      solution: 'Generated datasets are marked never to be line-merged. Each job overlays only its own files on the latest main and retries the push, and a regression gate runs before any commit or deploy.',
    },
    {
      title: 'LLM quota and provider failures',
      challenge: 'Free-tier quotas, retired models and revoked keys could quietly take AI features down. One revoked key came back as HTTP 400, was read as a bad request, and stopped the fallback chain.',
      approach: 'Classify errors by type rather than status code alone, and track provider health per instance.',
      solution: 'A provider router that falls back by error class, with a circuit breaker. PDF features are pinned to the provider that can read PDFs, so they never get an answer from a model that cannot.',
    },
    {
      title: 'Oversized IPO page',
      challenge: 'Featured-banner images stored as data URLs were inlined into the /ipo HTML twice: once in the render and once in the RSC payload.',
      solution: 'Banner images moved to a cacheable image route with cache-busting, pages switched from force-dynamic to ISR, and the valuation loop was memoized.',
      impact: '/ipo HTML went from 12.3 MB to 0.14 MB (per the commit).',
    },
    {
      title: 'Pre-warm jobs hitting the time limit',
      challenge: 'The prospectus pre-warm jobs ran until the platform killed them and returned 504.',
      solution: 'Each run now has a wall-clock budget that ends before the limit, keeps reserves for download and generation, and stops as soon as quota runs out.',
    },
    {
      title: 'Sparse research time series',
      challenge: 'Windows were picked by position, but most stocks had only a few data points, so 1M, 2M and 3M averages came out identical.',
      solution: 'Windows are now picked by calendar date, and a metric is empty when there is no real reference point instead of showing a confident wrong number.',
    },
    {
      title: 'Reliable deadline alerts on Android',
      challenge: 'Android may deliver inexact alarms late and the phone clock can be wrong, so an alert could land after the IPO cut-off.',
      solution: 'A planning engine arms a guaranteed earlier alert when exact alarms are unavailable, and corrects for clock skew using server time.',
    },
  ],

  performance: {
    metrics: [
      {
        label: '/ipo page HTML size',
        value: '12.3 → 0.14 MB',
        source: 'IPO page performance commit',
        measuredAt: 'Jul 2026',
      },
    ],
    techniques: [
      { name: 'Precomputed datasets', description: 'Market data is scraped in CI and committed, so no page request fetches data from an exchange.' },
      { name: 'ISR with per-route windows', description: 'Pages regenerate on intervals from 60 seconds to a day; admin edits trigger targeted revalidation.' },
      { name: 'Prebuilt detail pages', description: 'Every IPO page is generated at build time from the dataset.' },
      { name: 'Persistent AI cache', description: 'A 6-hour MongoDB cache is checked before any rate limit or model call; prospectus analyses rerun only when the filing changes.' },
      { name: 'Memoized scoring', description: 'Valuation and opportunity scores are computed once per set of inputs.' },
      { name: 'Connection reuse', description: 'The MongoDB client is reused across warm serverless invocations.' },
      { name: 'Lean bundles and images', description: 'Chart components are lazy-loaded, icon imports are optimized, and images are served as AVIF/WebP.' },
      { name: 'Offline-first mobile cache', description: 'The Android app shows the last good data with its timestamp when offline.' },
    ],
  },

  security: [
    { name: 'Layered access control', description: 'Edge middleware gates private pages and APIs by role, and route handlers check auth again.' },
    { name: 'Hardened sessions', description: 'Signed JWTs in an httpOnly, host-prefixed secure cookie with a pinned algorithm; a per-user version lets all sessions be revoked.' },
    { name: 'Login protection', description: 'bcrypt password hashing, brute-force lockout, a uniform failure path and same-origin checks.' },
    { name: 'Abuse limits', description: 'Per-IP rate limits on AI and ingest endpoints, shared across instances through Redis.' },
    { name: 'Security headers', description: 'HSTS, nosniff, frame protection, Permissions-Policy, COOP, and a Content Security Policy.' },
    { name: 'SSRF guard', description: 'Server-side PDF fetches allow HTTPS only and reject IP literals and private addresses.' },
    { name: 'Safe AI output', description: 'Visitors see fixed, generic error messages, never provider errors; AI output is schema-constrained and labelled educational only.' },
  ],

  deployment: {
    steps: [
      { label: 'Pull request CI', detail: 'Vitest suites, the IPO regression check, and a separate mobile pipeline' },
      { label: 'Scheduled data jobs', detail: 'Scrape, validate and commit datasets on cron' },
      { label: 'Production deploy', detail: 'Vercel CLI build, then the domain is pointed at the new deployment' },
      { label: 'Verify live', detail: 'Polls a public API on the live domain and alerts on failure' },
      { label: 'Android builds', detail: 'EAS build profiles for internal APK and AAB builds' },
    ],
    facts: [
      { label: 'Web hosting', value: 'Vercel' },
      { label: 'Runtime', value: 'Node.js 22' },
      { label: 'Database', value: 'MongoDB Atlas' },
      { label: 'CI workflows', value: '14 (9 scheduled)' },
      { label: 'API route handlers', value: '110' },
    ],
    note: 'Deploys run from the CLI rather than on every push, and each one is checked against the live domain before it counts.',
  },

  timeline: {
    source: 'From the git history: 1,437 commits between June and September 2026.',
    milestones: [
      { date: 'Jun 2026', title: 'Breakout scanner prototype', description: 'Scan tool and Next.js frontend; signals served as precomputed JSON with a daily GitHub Actions refresh.' },
      { date: 'Jun 2026', title: 'Team workspace', description: 'Tasks and members on MongoDB.' },
      { date: 'Jul 2026', title: 'IPO Center and markets data', description: 'Live NSE data, fundamentals overlay, valuation scorecard, and meetings with email reminders.' },
      { date: 'Jul 2026', title: 'AI layer and CAPITA1 brand', description: 'Bilingual Gemini insights, prospectus engine, abuse protection and the research engine.' },
      { date: 'Jul 2026', title: 'Members tier and SEO', description: 'Gated screener and F&O dashboard, analytics, structured data and sitemap.' },
      { date: 'Aug 2026', title: 'Public launch and content platform', description: 'Blog CMS, calculators, a security hardening pass, the news pipeline and NISM mock tests.' },
      { date: 'Sep 2026', title: 'Multi-provider AI and Android app', description: 'Provider router, and the Expo Android app with IPO deadline alerts and push.' },
    ],
  },
}

export default engineering
