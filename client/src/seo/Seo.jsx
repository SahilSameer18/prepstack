import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageFor, jsonLdFor, absoluteUrl, robotsContent, SITE_NAME, SITE_URL, OG_IMAGE } from './pages';

// Updates the tags the build step already wrote into the page's <head> (title, description, canonical, robots,
// Open Graph, Twitter, JSON-LD) when the user navigates inside the app. It UPDATES existing tags in place instead of
// adding new ones, so a page can never end up with two canonicals or two descriptions.
const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
};
const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
  el.setAttribute('href', href);
};

/** Put this once inside the router; it sets the head for whatever URL is showing. */
const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageFor(pathname);
    const url = page.path ? absoluteUrl(page.path) : null;

    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('name', 'robots', robotsContent(page.noindex));
    if (url && !page.noindex) setLink('canonical', url);
    else document.head.querySelector('link[rel="canonical"]')?.remove(); // noindex pages must not claim a canonical

    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', page.title);
    setMeta('property', 'og:description', page.description);
    setMeta('property', 'og:image', SITE_URL + OG_IMAGE);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('property', 'og:image:alt', 'PrepStack: free interview prep for software engineers');
    setMeta('property', 'og:locale', 'en_US');
    setMeta('property', 'og:url', url || SITE_URL + '/');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', page.title);
    setMeta('name', 'twitter:description', page.description);
    setMeta('name', 'twitter:image', SITE_URL + OG_IMAGE);
    setMeta('name', 'twitter:image:alt', 'PrepStack: free interview prep for software engineers');

    document.head.querySelectorAll('script[data-seo-ld]').forEach((s) => s.remove());
    for (const data of jsonLdFor(page)) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-ld', '');
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    }
  }, [pathname]);

  return null;
};

export default RouteSeo;
