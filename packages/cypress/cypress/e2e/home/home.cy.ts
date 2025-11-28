import Home from "../../pages/home"

describe('Home Test', () => {
  const home: Home = new Home()
  
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      if (err.message.includes('Minified React error #418')) {
        return false
      }
      if (
        /hydrat/i.test(err.message) ||
        /Minified React error #418/.test(err.message) ||
        /Minified React error #423/.test(err.message)
      ) {
        return false;
      }
      
      return true
    })

  })

  it('should change theme colors from light to dark', () => {
    cy.visit(home.url)

    cy.get('div.min-h-screen').should('exist')

    home.closeWelcomeModal().check()
    home.closeWelcomeModal().should('not.exist')

    cy.get('html').should('have.class', 'light');
    cy.getLocalStorage("theme").should("equal", "light")

    home.themeToggleDesktop().click()
    
    cy.get('html').should('have.class', 'dark');
    cy.getLocalStorage("theme").should("equal", "dark")
  })

  it('should change theme colors from dark to light', () => {
    cy.setLocalStorage("theme", "dark")
    cy.visit(home.url)
    cy.get('div.min-h-screen').should('exist')

    home.closeWelcomeModal().then(($el) => {
      if ($el.length) {
        cy.wrap($el).check();
        home.closeWelcomeModal().should('not.exist');
      } else {
        cy.log('Modal already closed');
      }
    });

    cy.get('html').should('have.class', 'dark');
    cy.getLocalStorage("theme").should("equal", "dark")

    home.themeToggleDesktop().click()
    
    cy.get('html').should('have.class', 'light');
    cy.getLocalStorage("theme").should("equal", "light")
  })

  it('Default i18n', () => {
    cy.visit(home.url)
    cy.get('div.min-h-screen').should('exist')
    
    // Default language is English
    cy.getLocalStorage("i18nextLng").should("equal", "en")
  })

  it("Footer Links are correct", () => {
    cy.visit(home.url)
    cy.get('div.min-h-screen').should('exist')

    home.closeWelcomeModal().then(($el) => {
      if ($el.length) {
        cy.wrap($el).check();
        home.closeWelcomeModal().should('not.exist');
      } else {
        cy.log('Modal already closed');
      }
    });

    home.footerLinks.forEach(link => {
      cy.get(`#${link.id}`).should('have.attr', 'href', link.href).should('contain.text', link.text);
    });

  })
})