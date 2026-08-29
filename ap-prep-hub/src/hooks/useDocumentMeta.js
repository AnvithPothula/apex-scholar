import { useEffect } from 'react';

/**
 * Writes title / description / canonical for the current route.
 *
 * A SPA keeps whatever <title> index.html shipped with, so every page looked
 * identical to a crawler. Restores nothing on unmount on purpose — the next
 * route sets its own, and blanking in between would leave a flash of the
 * generic title in the tab.
 */
export default function useDocumentMeta({ title, description, canonical }) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, canonical]);
}
