import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  // the server tests run in a plain Node environment, where there is no page to clean up
  if (typeof document === 'undefined') return;
  cleanup();
  localStorage.clear();
  document.documentElement.className = '';
});
