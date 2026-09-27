import type { ProjectEngineering } from '@/engineering/types'

/**
 * Engineering View for Work Vault, from its source, SECURITY.md, README and
 * git history (Sep 2026). The code is not published yet, so there is no
 * repository link; security is described at the design level only.
 */
const engineering: ProjectEngineering = {
  status: 'active-development',
  tagline: 'Local-only Chrome extension that keeps links, accounts, credentials and notes in an encrypted vault',
  summary:
    'Work Vault is a Manifest V3 Chrome extension for the work details people keep losing: project links, logins, API keys and notes. Everything stays in the local Chrome profile, and every field is encrypted with AES-256-GCM under a random vault key that a master password (or an optional recovery key) unlocks. It makes no network requests, uses no third-party libraries and has no build step.',

  architecture: [
    {
      label: 'Extension pages',
      nodes: [
        {
          id: 'popup',
          label: 'Toolbar popup',
          tech: 'HTML · CSS · ES modules',
          description: 'Unlock, search, favorites and recent items, quick open or copy, and "Save this page".',
        },
        {
          id: 'dashboard',
          label: 'Dashboard tab',
          tech: 'HTML · CSS · <dialog>',
          description: 'Setup or restore, item list, projects, tags, backups and security settings.',
        },
      ],
    },
    {
      label: 'Background',
      nodes: [
        {
          id: 'sw',
          label: 'Service worker',
          tech: 'MV3 · chrome.alarms',
          description: 'Opens the dashboard on install or from a shortcut, and handles the auto-lock and clipboard-clear alarms.',
        },
        {
          id: 'offscreen',
          label: 'Offscreen document',
          tech: 'chrome.offscreen',
          description: 'A short-lived hidden page, opened only to empty the clipboard and then closed.',
        },
      ],
    },
    {
      label: 'Domain logic',
      nodes: [
        {
          id: 'vault',
          label: 'Vault',
          description: 'Setup, unlock and lock, auto-lock, recovery key, password change, and record encryption.',
        },
        {
          id: 'content',
          label: 'Items, projects & search',
          description: 'Validation, URL allow-list, link category detection, tags, projects and in-memory ranked search.',
        },
        {
          id: 'backup',
          label: 'Backup & restore',
          description: 'Builds and verifies encrypted .wvault files and restores them as a new vault or into an existing one.',
        },
      ],
    },
    {
      label: 'Crypto & storage',
      nodes: [
        {
          id: 'crypto',
          label: 'Crypto module',
          tech: 'Web Crypto API',
          description: 'The only file that uses cryptography: key derivation and AES-GCM. It uses no Chrome APIs, so it also runs in Node tests.',
        },
        {
          id: 'store',
          label: 'Storage module',
          tech: 'chrome.storage',
          description: 'The single access point for storage: encrypted records on disk, and unlocked session state in memory only.',
        },
      ],
    },
  ],

  techStack: [
    { category: 'Language', items: ['JavaScript (ES modules)', 'HTML', 'CSS'] },
    { category: 'Browser platform', items: ['Chrome Extensions Manifest V3', 'Service worker', 'chrome.storage', 'chrome.alarms', 'chrome.offscreen', 'activeTab'] },
    { category: 'Cryptography', items: ['Web Crypto API', 'AES-256-GCM', 'PBKDF2-HMAC-SHA-256', 'HKDF-SHA-256'] },
    { category: 'UI', items: ['Native <dialog>', 'CSS custom properties', 'Dark mode', 'ARIA live regions'] },
    { category: 'Testing', items: ['node:test', 'node:assert', 'In-memory Chrome API fake'] },
  ],

  database: {
    engine: 'chrome.storage (key-value: local on disk, session in memory)',
    summary:
      'One encrypted record per item and per project, keyed by type and UUID. There is no search index on disk; search runs over records already decrypted in page memory.',
    entities: [
      {
        name: 'Vault metadata',
        description: 'Format version, key-derivation settings and salt, and the vault key wrapped by the master password and optionally the recovery key.',
        access: 'Local storage',
      },
      {
        name: 'Item',
        description: 'A link, account, credential or note. Every field is encrypted, and the secret itself gets a second layer of its own.',
        access: 'Local storage',
      },
      {
        name: 'Project',
        description: 'Encrypted project name, notes and dates. Names are unique, ignoring case.',
        access: 'Local storage',
      },
      {
        name: 'Settings',
        description: 'Non-sensitive settings such as the auto-lock time and the date of the last backup.',
        access: 'Local storage',
      },
      {
        name: 'Session state',
        description: 'Unlocked-session data and last-activity time. Cleared on lock and when Chrome restarts.',
        access: 'Session storage (memory only)',
      },
    ],
    relationships: [
      { from: 'Item', to: 'Project', kind: 'Optional many-to-one, stored inside the encrypted record' },
      { from: 'Vault metadata', to: 'Item & Project', kind: 'Its wrapped vault key encrypts every record' },
    ],
  },

  dataFlows: [
    {
      title: 'Unlocking the vault',
      steps: [
        { label: 'Master password', detail: 'Normalized so the same password typed another way still works' },
        { label: 'Derive key', detail: 'PBKDF2 with the stored salt' },
        { label: 'Unwrap vault key', detail: 'A failed AES-GCM check means a wrong password; no password hash is stored' },
        { label: 'Start session', detail: 'Auto-lock alarm first, then the key goes to memory-only storage' },
      ],
    },
    {
      title: 'Saving an item',
      steps: [
        { label: 'Validate', detail: 'Required fields, length limits and only http, https or mailto links' },
        { label: 'Resolve project', detail: 'Found by name or created, only after validation passes' },
        { label: 'Encrypt secret', detail: 'Its own AES-GCM layer, bound to the item ID' },
        { label: 'Encrypt record', detail: 'The whole record, written as one entry' },
        { label: 'Refresh pages', detail: 'Open popups and dashboards update from storage change events' },
      ],
    },
    {
      title: 'Copying a secret',
      steps: [
        { label: 'Decrypt on demand', detail: 'Only the secret, only at the moment of copying' },
        { label: 'Write clipboard' },
        { label: 'Schedule clear', detail: 'An alarm about 30 seconds later' },
        { label: 'Clear', detail: 'An offscreen page empties the clipboard and closes' },
      ],
    },
  ],

  features: [
    { name: 'Four item types', description: 'Links, accounts, credentials such as API keys and tokens, and notes that can stay hidden until shown.' },
    { name: 'Link categories', description: 'Detects Google Drive, Docs, Sheets, GitHub, Figma, Supabase, Cloudflare and email links for sidebar sections, without fetching site icons.' },
    { name: 'Search', description: 'Runs in memory, ignores accents and ranks hits in names, tags and projects higher. Passwords and hidden notes are never searched.' },
    { name: 'Favorites, tags & projects', description: 'Star items, tag them, and group them into projects created by typing a name.' },
    { name: 'Save this page', description: 'One click in the popup fills in the current tab’s title and address.', tech: ['activeTab'] },
    { name: 'Clipboard clearing', description: 'Copied passwords and secrets are cleared from the clipboard about 30 seconds later.', tech: ['chrome.alarms', 'chrome.offscreen'] },
    { name: 'Auto-lock', description: 'Locks after 10 minutes without use and whenever Chrome closes.' },
    { name: 'Recovery key', description: 'An optional 256-bit key shown once, which lets the user set a new master password.' },
    { name: 'Encrypted backup & restore', description: 'A single .wvault file that restores onto a new install or merges into an existing vault, with reminders when a backup is overdue.' },
  ],

  challenges: [
    {
      title: 'Clearing the clipboard from Manifest V3',
      challenge: 'The MV3 service worker has no page to write the clipboard from, and Chrome stops it when idle, so it cannot hold a timer.',
      approach: 'Move the timing into chrome.alarms and do the clipboard work in a page.',
      solution: 'Copying a secret schedules an alarm. When it fires, the service worker opens a short-lived offscreen document that empties the clipboard, then closes it.',
    },
    {
      title: 'Auto-lock that fails safe',
      challenge: 'A page closing halfway through unlocking could leave the key in memory with no auto-lock timer, and a clock moved backwards could keep the vault open.',
      solution: 'The auto-lock alarm is created before the key is stored, activity after the limit locks instead of extending the session, and a missing or future timestamp counts as expired.',
    },
    {
      title: 'Backups that cannot be quietly edited',
      challenge: 'A backup file could have records removed, added, swapped or altered.',
      solution: 'Each record is bound to its ID through AES-GCM additional data, and an encrypted index lists every record. Restoring checks the index and every record, and rejects the whole file on any mismatch.',
    },
    {
      title: 'Passing a draft between pages without traces',
      challenge: 'Passing the page being saved from the popup to the dashboard in the URL would leave it in Chrome’s history.',
      solution: 'The draft goes through memory-only session storage, is removed when first read, and is cleared on lock.',
    },
  ],

  performance: {
    techniques: [
      { name: 'Decrypt secrets on demand', description: 'Lists decrypt only the outer record; each secret is decrypted only when shown, copied or edited.' },
      { name: 'Throttled activity tracking', description: 'Clicks and key presses update the last-activity time at most once every 15 seconds.' },
      { name: 'Batched writes', description: 'Dashboard redraws run one after another through a queue, and a restore writes all records in one storage call.' },
    ],
  },

  security: [
    { name: 'Envelope encryption', description: 'A random 256-bit vault key encrypts the data and is wrapped by a key derived from the master password, which is never stored.' },
    { name: 'AES-256-GCM with bound context', description: 'A fresh IV for every encryption, and additional data that ties each ciphertext to its record so values cannot be swapped.' },
    { name: 'Everything encrypted at rest', description: 'Every item and project field is encrypted, not only passwords; secrets get a second layer.' },
    { name: 'Memory-only session', description: 'While unlocked, the key lives only in session storage as a non-extractable key. Locking or restarting Chrome clears it.' },
    { name: 'Locked-down extension', description: 'The Content Security Policy allows only packaged scripts and blocks all network connections. No remote code, libraries, host permissions or content scripts.' },
    { name: 'Safe rendering and links', description: 'User data is written as text only, and only http, https and mailto links can be saved or opened.' },
    { name: 'Documented threat model', description: 'A security document lists what the design protects against and what it cannot.' },
  ],

  deployment: {
    steps: [
      { label: 'Load unpacked', detail: 'Developer mode in Chrome; no build step' },
      { label: 'Set up', detail: 'The dashboard opens on first install to create a vault or restore a backup' },
      { label: 'Test', detail: 'node --test on Node 22' },
    ],
    facts: [
      { label: 'Manifest', value: 'V3' },
      { label: 'Minimum Chrome', value: '116' },
      { label: 'Runtime dependencies', value: 'None' },
      { label: 'Network access', value: 'Blocked by CSP' },
      { label: 'Tests', value: '86 passing (node:test)' },
    ],
    note: 'Not published to the Chrome Web Store yet. A security review is planned before it is ready for daily use.',
  },

  timeline: {
    source: 'From the git history, September 2026.',
    milestones: [
      { title: 'Design documents', description: 'README, security design and privacy policy draft.' },
      { title: 'Extension shell', description: 'Popup, dashboard, service worker and a CSP that blocks the network.' },
      { title: 'Encrypted vault', description: 'Master password, recovery key, lock and auto-lock, first unit tests.' },
      { title: 'Encrypted items', description: 'Links, accounts, credentials and notes, with clipboard clearing.' },
      { title: 'Search and organization', description: 'Search, favorites, tags and projects.' },
      { title: 'Save the current page', description: 'One-click save from the popup.' },
      { title: 'Encrypted backup and restore', description: '.wvault files with integrity checks.' },
      { title: 'Security review', description: 'Planned next.' },
    ],
  },
}

export default engineering
