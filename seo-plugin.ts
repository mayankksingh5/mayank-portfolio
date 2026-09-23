import type { HtmlTagDescriptor, Plugin } from 'vite'

/**
 * Build-time SEO files that need the site's public URL (VITE_SITE_URL):
 * robots.txt (always), sitemap.xml, canonical link, og:url and an absolute
 * og:image pointing at public/og-image.png. Without a URL only robots.txt is
 * emitted, so nothing points at a wrong domain.
 */
export function seoPlugin(siteUrl: string | undefined): Plugin {
  const url = siteUrl?.trim().replace(/\/+$/, '') || null
  if (url && !/^https:\/\/[^/\s]+$/.test(url)) {
    throw new Error(`VITE_SITE_URL must look like https://example.com (got "${siteUrl}")`)
  }

  return {
    name: 'portfolio-seo',
    apply: 'build',
    transformIndexHtml() {
      if (!url) return []
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'canonical', href: `${url}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${url}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: `${url}/og-image.png` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${url}/og-image.png` }, injectTo: 'head' },
      ]
      return tags
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin', url ? `Sitemap: ${url}/sitemap.xml` : '']
        .filter(Boolean)
        .join('\n')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots}\n` })

      if (url) {
        const today = new Date().toISOString().slice(0, 10)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
        })
      }
    },
  }
}
