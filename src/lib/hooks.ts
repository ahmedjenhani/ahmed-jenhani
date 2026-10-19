import { useEffect, useRef, useState, type RefObject } from 'react';
import { SECTION_IDS, type SectionId } from '../site';

const reducedMotion = (): boolean => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Fades an element in the first time it scrolls into view. Without IntersectionObserver, or for visitors who prefer
 * reduced motion, the content is simply shown at once, so nobody is ever left with an invisible page.
 */
export function useReveal<T extends HTMLElement>(): { ref: RefObject<T | null>; shown: boolean } {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(() => reducedMotion() || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (shown || !node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return { ref, shown };
}

/** Which section is under the top of the screen, so the navigation can highlight it. */
export function useScrollSpy(): SectionId {
  const [active, setActive] = useState<SectionId>('home');

  useEffect(() => {
    const update = (): void => {
      // the section whose top has passed a line a third of the way down the screen
      const line = window.innerHeight * 0.33;
      let current: SectionId = 'home';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) {
          current = id;
        }
      }
      // the last section may never reach the line, so the very bottom of the page counts as the last one
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = SECTION_IDS[SECTION_IDS.length - 1] as SectionId;
      }
      setActive(current);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return active;
}

/** True once the page has been scrolled a little, to give the navigation bar a background. */
export function useScrolled(threshold = 16): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = (): void => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);
  return scrolled;
}
