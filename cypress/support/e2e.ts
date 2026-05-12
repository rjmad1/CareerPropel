// Import commands.ts
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in the command log
const app = window.top;

if (app) {
  Object.defineProperty(app, 'fetch', {
    configurable: true,
    value: fetch,
  });
}

// Disable uncaught exception handling for tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the test from failing
  return false;
});
