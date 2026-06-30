import { useEffect } from 'react';

/**
 * Tiny, dependency-free replacement for react-helmet-async — that package's
 * peer dependency caps at React 18 and conflicts with this project's React
 * 19, the same class of problem we hit with multer-storage-cloudinary
 * earlier. This hook does the same job (title, meta tags, canonical link,
 * one JSON-LD script) directly via the DOM, with zero dependency risk.
 *
 * Tags are marked with data-seo="true" so each navigation cleanly removes
 * the previous page's tags before adding the new ones — without that,
 * meta tags would just keep accumulating as the user navigates around an SPA.
 */
export function useDocumentHead({ title, description, canonical, robots, og = {}, twitter = {}, jsonLd }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const created = [];

    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        el.setAttribute('data-seo', 'true');
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('name', 'robots', robots || 'index, follow');
    setMeta('property', 'og:title', og.title || title);
    setMeta('property', 'og:description', og.description || description);
    setMeta('property', 'og:url', og.url);
    setMeta('property', 'og:image', og.image);
    setMeta('property', 'og:type', og.type || 'website');
    setMeta('name', 'twitter:card', twitter.card || 'summary_large_image');
    setMeta('name', 'twitter:title', twitter.title || title);
    setMeta('name', 'twitter:description', twitter.description || description);
    setMeta('name', 'twitter:image', twitter.image || og.image);

    let canonicalEl;
    if (canonical) {
      canonicalEl = document.head.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        canonicalEl.setAttribute('data-seo', 'true');
        document.head.appendChild(canonicalEl);
        created.push(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonical);
    }

    let jsonLdEl;
    if (jsonLd) {
      jsonLdEl = document.createElement('script');
      jsonLdEl.type = 'application/ld+json';
      jsonLdEl.setAttribute('data-seo', 'true');
      jsonLdEl.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdEl);
      created.push(jsonLdEl);
    }

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
    };
  }, [title, description, canonical, robots, JSON.stringify(og), JSON.stringify(twitter), JSON.stringify(jsonLd)]);
}
