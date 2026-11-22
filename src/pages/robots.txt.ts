import type { APIRoute } from 'astro';

/** Allow every crawler and publish the sitemap index. No per-bot blocks. */
export function robotsTxt(site: URL): string {
  const sitemapURL = new URL('sitemap-index.xml', site);
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`;
}

export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error(
      'robots.txt requires the Astro site URL. Set SITE_URL or PUBLIC_SITE_URL.'
    );
  }

  return new Response(robotsTxt(site), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
