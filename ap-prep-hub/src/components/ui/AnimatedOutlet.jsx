import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from '../../utils/animations';

/**
 * Drop-in replacement for <Outlet /> that animates page transitions.
 * Uses the current pathname as a key so AnimatePresence triggers
 * exit/enter on every route change.
 */
export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    // A new page starts at the top. Without this the browser kept the old
    // page's scroll offset, so opening a class or a diagnostic landed mid-page.
    // Done once the old page has faded out, and instantly (the site sets
    // smooth scrolling), so nothing visibly scrolls.
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
