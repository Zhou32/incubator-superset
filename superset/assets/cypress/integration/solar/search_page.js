

export default () => describe('Search page test', () => {


  beforeEach(function () {
    cy.request('/login/')
      .its('body')
      .then((body) => {
        const $html = Cypress.$(body)
        const csrf = $html.find("input[name=csrf_token]").val()
        console.log(csrf)
        cy.loginByCSRF(csrf)
      })
  })

  afterEach(function () {
    cy.visit('/logout/')
  })

  it('search test', function () {
    cy.visit('localhost:8088/solar/add')

    cy.get('#inputBox').type('163 Collins Street')
    cy.wait(1000)
    cy.get('.pac-matched').first().click()
    cy.contains('SEARCH').click()
    cy.wait(5000)
  })

  it('Data page', function () {
    cy.visit('localhost:8088/solar/list')
    cy.contains('My Data').click()
    cy.wait(3000)
    cy.contains('Search Data Sets')
  })

  it('Team page', function () {
    cy.visit('localhost:8088/solar/add')
    cy.contains('Team').click()
    cy.wait(3000)
    cy.contains('Team Settings')
    old_name = cy.get('#team_name_input').val
    cy.get('#team_name_input').type(old_name + '_new')
    cy.contains('Update Team').click()
    cy.wait(1000)
    cy.contains('Successfully update the team name')

  })

})