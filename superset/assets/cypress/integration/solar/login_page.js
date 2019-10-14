
export default () => describe('login page test', () => {


  beforeEach(function () {
    cy.visit('/login/')


  })
  afterEach(function () {
    cy.visit('/logout/')
    cy.visit('/login/')
  })

  it('Sign in form', function () {
    cy.visit('/register/form')

  })


  it('Check password difficulty', function () {
    cy.visit('/register/form')
    cy.get('#password').trigger('mouseover')
    cy.get('.tooltip-inner').should('be.visible')
    cy.get('#password').type('123')
    cy.contains('×')
  })

  it('To reset password', function () {
    cy.contains('Forgot Password').click()
    cy.contains('Send request')
  })

  it('Check password same', function () {
    cy.visit('/register/form')
    cy.get('#password').type('1234abcd')
    cy.get('#conf_password').type('2345abda')
    cy.contains('×')
  })

  it('Login', function () {
    cy.get('#username').type('e2')
    cy.get('#password').type('1234abcd')
    cy.contains('Login').click()
    cy.contains('Get Started')
  })

  it('strategy #1: parse token from HTML', function () {
    // if we cannot change our server code to make it easier
    // to parse out the CSRF token, we can simply use cy.request
    // to fetch the login page, and then parse the HTML contents
    // to find the CSRF token embedded in the page
    cy.request('/login/')
      .its('body')
      .then((body) => {
        // we can use Cypress.$ to parse the string body
        // thus enabling us to query into it easily
        const $html = Cypress.$(body)
        const csrf = $html.find("input[name=csrf_token]").val()
        console.log(csrf)
        cy.loginByCSRF(csrf)
          .then((resp) => {
            cy.visit('/solar/add')
            cy.contains('Get Started')
          })
      })
  })

})
