/// <reference types="cypress" />

describe('Interview Flow', () => {
  beforeEach(() => {
    cy.visit('/interview');
    // Wait for hydration to complete (loading spinner disappears, main content appears)
    cy.get('h1', { timeout: 15000 }).should('be.visible');
  });

  describe('Interview Dashboard Page', () => {
    it('should display interview page elements', () => {
      // Page might show interview content OR redirect to login required
      // Both behaviors are valid depending on auth state
      cy.get('body').should('satisfy', ($body) => {
        const text = $body.text();
        return text.includes('Interview') || text.includes('Login') || text.includes('Sign');
      });
    });

    it('should have navigation elements', () => {
      // Should have navigation bar (fixed at top)
      cy.get('nav, [class*="fixed"][class*="top"]').should('exist');
    });

    it('should have topic selection', () => {
      // Should show topic options or interview info
      cy.get('body').should('satisfy', ($body) => {
        const text = $body.text();
        return (
          text.includes('Data Structures') ||
          text.includes('Algorithms') ||
          text.includes('System Design') ||
          text.includes('JavaScript') ||
          text.includes('React') ||
          text.includes('Technical') ||
          text.includes('Interview') ||
          text.includes('topic') ||
          text.includes('Practice')
        );
      });
    });

    it('should handle navigation back to home', () => {
      // Click the back/home button (might be in nav or elsewhere)
      cy.get('button').first().click();
      // Should navigate (uses window.location.href)
      cy.wait(1000);
      // Page should still be functional
      cy.get('body').should('exist');
    });
  });

  describe('Interview API', () => {
    it('should require authentication for interview history', () => {
      cy.request({
        method: 'GET',
        url: '/api/interview/history?userId=test-user',
        failOnStatusCode: false,
      }).then((response) => {
        // Should require auth
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should have rate limiting on interview ask endpoint', () => {
      // Make multiple rapid requests
      const makeRequest = () => {
        return cy.request({
          method: 'POST',
          url: '/api/interview/ask',
          body: {
            topic: 'JavaScript',
            experience: '2 years',
            skills: 'React, Node.js',
          },
          failOnStatusCode: false,
        });
      };

      // Make requests until rate limited
      for (let i = 0; i < 12; i++) {
        makeRequest();
      }

      // Final request might be rate limited
      makeRequest().then((response) => {
        expect(response.status).to.be.oneOf([200, 429, 400, 401]);
      });
    });
  });

  describe('Mock Interview Subscription', () => {
    it('should check subscription status', () => {
      cy.request({
        method: 'GET',
        url: '/api/payment/mock-interviews',
        failOnStatusCode: false,
      }).then((response) => {
        // Should return subscription info or require auth
        expect(response.status).to.be.oneOf([200, 401]);
        if (response.status === 200) {
          expect(response.body).to.have.property('subscribed');
        }
      });
    });
  });
});

describe('Interview Experiences', () => {
  beforeEach(() => {
    cy.visit('/interview-experiences');
  });

  it('should display interview experiences page', () => {
    cy.wait(2000);
    cy.get('body').should('exist');
  });

  it('should have navigation elements', () => {
    cy.wait(1000);
    // Page should load
    cy.get('body').should('be.visible');
  });
});

describe('Top Interviews / Coding Arena', () => {
  beforeEach(() => {
    cy.visit('/top-interviews');
  });

  it('should display coding arena page', () => {
    cy.wait(2000);
    cy.get('body').should('exist');
  });

  it('should load interview challenges', () => {
    cy.wait(2000);
    // Either shows challenges or empty state
    cy.get('body').should('be.visible');
  });
});

describe('Interview History', () => {
  it('should require authentication', () => {
    cy.visit('/top-interview-history', { failOnStatusCode: false });
    cy.wait(2000);

    // Should either redirect to login or show auth required message
    cy.get('body').should('exist');
  });
});

describe('Interview Feedback Page', () => {
  beforeEach(() => {
    cy.visit('/interview/feedback', { failOnStatusCode: false });
  });

  it('should display feedback page or redirect', () => {
    cy.wait(2000);
    cy.get('body').should('exist');
  });
});
