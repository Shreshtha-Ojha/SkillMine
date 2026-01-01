import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
    // Test user credentials (create a test user for this)
    TEST_USER_EMAIL: 'cypress-test@skillmine.tech',
    TEST_USER_PASSWORD: 'TestPass123!',
    TEST_USER_USERNAME: 'cypresstest',
  },
});
