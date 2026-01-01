// Custom Cypress Commands

/**
 * Login command - authenticates user via API
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/users/login',
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.token) {
      // Store token in localStorage like the app does
      window.localStorage.setItem('token', response.body.token);
    }
  });
});

/**
 * Logout command - clears auth state
 */
Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'GET',
    url: '/api/users/logout',
    failOnStatusCode: false,
  }).then(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });
});

/**
 * Signup command - creates new user via API
 */
Cypress.Commands.add('signup', (email: string, password: string, username: string) => {
  cy.request({
    method: 'POST',
    url: '/api/users/signup',
    body: { email, password, username },
    failOnStatusCode: false,
  });
});

/**
 * Check if user is logged in
 */
Cypress.Commands.add('isLoggedIn', () => {
  return cy.request({
    method: 'GET',
    url: '/api/users/me',
    failOnStatusCode: false,
  }).then((response) => {
    return response.status === 200 && response.body.user;
  });
});
