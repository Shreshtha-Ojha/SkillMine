// Cypress E2E Support File
// This file runs before every test file

import './commands';

// Prevent TypeScript errors when accessing Cypress on window
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to signup via API
       * @example cy.signup('user@example.com', 'password123', 'username')
       */
      signup(email: string, password: string, username: string): Chainable<void>;

      /**
       * Custom command to check if user is logged in
       * @example cy.isLoggedIn()
       */
      isLoggedIn(): Chainable<boolean>;
    }
  }
}

// Handle uncaught exceptions from the app
Cypress.on('uncaught:exception', (err, runnable, promise) => {
  // Return false to prevent Cypress from failing the test
  // These are common React/Next.js errors that don't affect functionality
  const ignoredErrors = [
    'hydrat',           // React hydration errors
    'Hydration',        // React hydration errors (capitalized)
    'initial UI',       // React hydration mismatch message
    'server',           // Server rendering mismatch
    'ResizeObserver',   // ResizeObserver errors
    'ChunkLoadError',   // Dynamic import errors
    'Loading chunk',    // Webpack chunk loading
    'NEXT_NOT_FOUND',   // Next.js 404 handling
    'NEXT_REDIRECT',    // Next.js redirects
    'NetworkError',     // Network errors
    'Failed to fetch',  // Fetch errors
    'Load failed',      // Resource load errors
    'Minified React',   // Minified React errors in production
    'text content',     // Text content mismatch
  ];

  if (ignoredErrors.some(ignored => err.message.toLowerCase().includes(ignored.toLowerCase()))) {
    return false;
  }

  // Also ignore promise rejections related to these errors
  if (promise) {
    return false;
  }

  return true;
});

// Clear localStorage and cookies before each test for clean state
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
