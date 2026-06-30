import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Loads Google Analytics 4 only if VITE_GA_MEASUREMENT_ID is set in the
 * environment — completely inert otherwise, so nothing tracks anyone until
 * you've actually created a GA4 property and added the ID. Also fires a
 * page_view on every route change, since GA's default snippet only does
 * that automatically for full page loads (which never happen again after
 * the first one in an SPA).
 */
export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || window.gtag) return; // not configured, or already loaded
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false }); // we send page_view manually below, per route
  }, []);

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);

  return null;
}
