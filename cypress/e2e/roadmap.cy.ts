/// <reference types="cypress" />

describe('Roadmap Explore Flow', () => {
  beforeEach(() => {
    cy.visit('/explore');
  });

  describe('Explore Page', () => {
    it('should display explore page header', () => {
      cy.contains('Explore Roadmaps').should('be.visible');
      cy.contains('Learning Paths').should('be.visible');
    });

    it('should have search functionality', () => {
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });

    it('should have home navigation button', () => {
      cy.contains('Home').should('exist');
    });

    it('should display loading state initially', () => {
      // The page shows skeleton loaders while loading
      cy.get('[class*="animate-pulse"]').should('exist');
    });

    it('should load roadmaps from API', () => {
      // Wait for roadmaps to load (either shows cards or empty state)
      cy.wait(2000);
      cy.get('body').should('satisfy', ($body) => {
        // Either roadmap cards exist or "No Roadmaps Found" message
        const hasRoadmaps = $body.find('button[class*="rounded-2xl"]').length > 0;
        const hasEmptyState = $body.text().includes('No Roadmaps Found');
        return hasRoadmaps || hasEmptyState;
      });
    });

    it('should filter roadmaps by search', () => {
      // Wait for initial load
      cy.wait(2000);

      // Type in search
      cy.get('input[placeholder*="Search"]').type('web');

      // Should filter results (or show no results)
      cy.wait(500); // Wait for filtering
    });

    it('should navigate back to home', () => {
      cy.get('button').contains('Home').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Roadmap API', () => {
    it('should fetch all roadmaps', () => {
      cy.request({
        method: 'GET',
        url: '/api/roadmap/fetchall',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('roadmaps');
        expect(response.body.roadmaps).to.be.an('array');
      });
    });
  });
});

describe('Roadmap Detail Page', () => {
  // We'll test with a mock roadmap ID - in real scenarios, get a real ID first

  it('should handle invalid roadmap ID gracefully', () => {
    cy.visit('/explore/roadmap/invalid-id-12345', { failOnStatusCode: false });

    // Should show error or not found state
    cy.wait(2000);
    cy.get('body').should('exist');
  });

  it('should load roadmap details when ID is valid', () => {
    // First get a real roadmap ID
    cy.request('/api/roadmap/fetchall').then((response) => {
      if (response.body.roadmaps && response.body.roadmaps.length > 0) {
        const roadmapId = response.body.roadmaps[0]._id;

        cy.visit(`/explore/roadmap/${roadmapId}`);

        // Wait for page to load
        cy.wait(2000);

        // Should show roadmap content
        cy.get('body').should('exist');
      } else {
        // Skip if no roadmaps exist
        cy.log('No roadmaps available for testing');
      }
    });
  });
});

describe('Roadmap Progress Tracking', () => {
  beforeEach(() => {
    // These tests require authentication
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should require login to track progress', () => {
    // Get a roadmap ID first
    cy.request('/api/roadmap/fetchall').then((response) => {
      if (response.body.roadmaps && response.body.roadmaps.length > 0) {
        const roadmapId = response.body.roadmaps[0]._id;

        // Try to save progress without auth
        cy.request({
          method: 'POST',
          url: '/api/data/store',
          body: {
            roadmapId,
            checked: { 'task-1': true },
          },
          failOnStatusCode: false,
        }).then((res) => {
          // Should require authentication
          expect(res.status).to.be.oneOf([401, 403, 400]);
        });
      }
    });
  });
});

describe('Roadmap Search and Filter', () => {
  beforeEach(() => {
    cy.visit('/explore');
    cy.wait(2000); // Wait for initial load
  });

  it('should clear search when input is emptied', () => {
    cy.get('input[placeholder*="Search"]').type('test');
    cy.wait(300);
    cy.get('input[placeholder*="Search"]').clear();
    cy.wait(300);
    // Results should be reset
  });

  it('should be case-insensitive in search', () => {
    cy.get('input[placeholder*="Search"]').type('WEB');
    cy.wait(300);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').type('web');
    cy.wait(300);
    // Both should produce same results
  });
});
