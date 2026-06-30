import { useDocumentHead } from '../../hooks/useDocumentHead';

const SITE_NAME = 'Vyom Shelter Pvt. Ltd.';
const SITE_URL  = 'https://vyomshelter.com'; // update if the live domain differs
const DEFAULT_IMAGE = `${SITE_URL}/VSicon.png`;

/**
 * Per-page SEO tags — title, meta description, canonical URL, Open Graph,
 * Twitter Card, and optional JSON-LD structured data.
 *
 * IMPORTANT CAVEAT (read before assuming this "solves" social previews):
 * this app is a client-rendered React SPA. Google's crawler executes
 * JavaScript and WILL see these tags correctly for search indexing. Most
 * social-media link-preview bots (Facebook, WhatsApp, Twitter/X, LinkedIn,
 * Slack) do NOT execute JavaScript — they only read the raw, pre-render
 * HTML. That means when someone shares a specific property listing link
 * on WhatsApp, the preview card will show the generic site-wide OG tags
 * baked into index.html, not this page's dynamic title/image/description.
 * The only real fix for that is server-side rendering or prerendering
 * (e.g. Next.js, or a prerender service) — a bigger architectural change,
 * not something this component can patch around. Search ranking is fine
 * as-is; social link-preview cards are the limitation.
 */
export default function Seo({ title, description, path = '', image = DEFAULT_IMAGE, noindex = false, jsonLd = null }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = `${SITE_URL}${path}`;

  useDocumentHead({
    title: fullTitle,
    description,
    canonical,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    og: { title: fullTitle, description, url: canonical, image, type: 'website' },
    twitter: { title: fullTitle, description, image },
    jsonLd,
  });

  return null;
}

export { SITE_NAME, SITE_URL };
