import Property from '../models/Property.model.js';
import Service from '../models/Service.model.js';

const SITE_URL = process.env.SITE_URL || 'https://vyomshelter.com';

const STATIC_PAGES = [
  { path: '/',                         changefreq: 'weekly',  priority: '1.0' },
  { path: '/properties',               changefreq: 'daily',   priority: '0.9' },
  { path: '/properties?listingType=rent', changefreq: 'daily', priority: '0.9' },
  { path: '/sell',                     changefreq: 'weekly',  priority: '0.7' },
  { path: '/services',                 changefreq: 'weekly',  priority: '0.6' },
];

const urlEntry = ({ path, changefreq, priority, lastmod }) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// GET /api/sitemap.xml — dynamically includes every approved property and
// active service, not just a handful of static pages. This is what actually
// makes individual listings discoverable by search engines — the old
// hand-written sitemap.xml only ever listed 5 fixed URLs.
export const getSitemap = async (req, res, next) => {
  try {
    const [properties, services] = await Promise.all([
      Property.find({ status: 'approved' }).select('propertyId updatedAt').limit(5000),
      Service.find({ status: 'active' }).select('serviceId updatedAt').limit(2000),
    ]);

    const propertyUrls = properties.map((p) => urlEntry({
      path: `/properties/${p.propertyId}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: p.updatedAt?.toISOString().split('T')[0],
    }));

    // Services don't have their own detail route today (handled in a modal
    // on the listing page), so they're intentionally not included as
    // separate sitemap entries — only the /services listing page is.
    void services;

    const staticUrls = STATIC_PAGES.map(urlEntry);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls.join('')}${propertyUrls.join('')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) { next(err); }
};
