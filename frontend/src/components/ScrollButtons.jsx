import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollButtons = () => {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show floating slide buttons when page content is scrollable
      if (documentHeight > windowHeight + 80) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      setAtTop(scrollY < 40);
      setAtBottom(scrollY + windowHeight >= documentHeight - 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Collect landmark section & product row offsets for smooth step-by-step sliding
  const getLandmarkTops = () => {
    const selector = [
      '.hero-banner',
      '.section-promo-slider-wrapper',
      '.section-trending-carousel',
      '.section-categories',
      '.section-featured',
      '.section-recommended',
      '.section-popular',
      '.section-recently-viewed',
      '.products-grid',
      '.product-grid-container',
      '.admin-table-container',
      'main',
      'footer'
    ].join(',');

    const elements = Array.from(document.querySelectorAll(selector));
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    const tops = new Set();
    tops.add(0); // Top of page

    const navOffset = 75; // Offset to keep titles visible below sticky navbar

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const top = Math.round(rect.top + window.scrollY - navOffset);
      if (top >= 0) tops.add(top);
    });

    // Detect distinct product rows in grids
    let lastRowTop = -999;
    productCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const top = Math.round(rect.top + window.scrollY - navOffset);
      if (top >= 0 && Math.abs(top - lastRowTop) > 140) {
        tops.add(top);
        lastRowTop = top;
      }
    });

    return Array.from(tops).sort((a, b) => a - b);
  };

  // Smooth slide down to the next product section or row
  const slideDown = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const landmarkTops = getLandmarkTops();
    const threshold = 60;

    // Find the next landmark below current scroll position
    const nextTop = landmarkTops.find((top) => top > scrollY + threshold);

    if (nextTop !== undefined) {
      window.scrollTo({
        top: nextTop,
        behavior: 'smooth'
      });
    } else {
      // Fallback: smooth step slide down
      const step = Math.min(window.innerHeight * 0.75, 550);
      window.scrollBy({
        top: step,
        behavior: 'smooth'
      });
    }
  };

  // Smooth slide up to the previous product section or row
  const slideUp = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const landmarkTops = getLandmarkTops();
    const threshold = 60;

    // Find landmarks above current scroll position
    const prevTops = landmarkTops.filter((top) => top < scrollY - threshold);

    if (prevTops.length > 0) {
      const prevTop = prevTops[prevTops.length - 1];
      window.scrollTo({
        top: Math.max(0, prevTop),
        behavior: 'smooth'
      });
    } else {
      if (scrollY <= 140) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const step = Math.min(window.innerHeight * 0.75, 550);
        window.scrollBy({
          top: -step,
          behavior: 'smooth'
        });
      }
    }
  };

  if (!visible) return null;

  return (
    <aside className="app-floating-scroll-controls" aria-label="Product and section slide controls">
      <button
        type="button"
        className={`scroll-ctrl-btn scroll-up-btn ${atTop ? 'disabled' : ''}`}
        onClick={slideUp}
        title="Slide Up (Previous products / section)"
        aria-label="Slide up to previous products"
        disabled={atTop}
      >
        <ChevronUp size={22} />
      </button>

      <button
        type="button"
        className={`scroll-ctrl-btn scroll-down-btn ${atBottom ? 'disabled' : ''}`}
        onClick={slideDown}
        title="Slide Down (Next products / section)"
        aria-label="Slide down to next products"
        disabled={atBottom}
      >
        <ChevronDown size={22} />
      </button>
    </aside>
  );
};

export default ScrollButtons;
