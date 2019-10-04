

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

    cy.get('#inputBox').type('163')
  })

  it('Data page', function () {
    cy.visit('localhost:8088/solar/list/')
    cy.contains('My Data').click()
  })

  it('Team page', function () {
    cy.contains('Team')

  })

})