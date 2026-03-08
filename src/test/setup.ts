import '@testing-library/jest-dom/vitest';

// Clean localStorage between tests to prevent test pollution
beforeEach(() => {
  localStorage.clear();
});
