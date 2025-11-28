import Privacy from "../../pages/privacy"

describe('Privacy Test', () => {
  const privacy: Privacy = new Privacy()
  
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from failing the test
      if (err.message.includes('Minified React error #418')) {
        return false
      }
      return true
    })

    cy.visit(privacy.url)
  })

  it('should load the privacy policy page', () => {
    privacy.container().should('be.visible')
  })

  it('should display the privacy policy title', () => {
    privacy.title().should('be.visible').and('contain.text', 'Privacy Policy')
  })

  it('should display the effective date', () => {
    privacy.effectiveDate().should('be.visible').and('contain.text', 'June 3, 2025')
  })

  it('should redirect to the correct URL', () => {
    privacy.content().contains('GNU General Public License v3.0').should('have.attr', 'href', 'https://www.gnu.org/licenses/gpl-3.0.html')
    privacy.content().contains('github.com/artifi-labs/open-djed').should('have.attr', 'href', 'https://github.com/artifi-labs/open-djed')
    privacy.content().contains('Discord').should('have.attr', 'href', 'https://discord.gg/MhYP7w8n8p')
  })
})