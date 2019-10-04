import LoginPageTest from './login_page.js'
import SearchPageTest from './search_page.js'


describe('Solar Test', () => {
    const username = 'e2'
    const password = '1234abcd'
    Cypress.Commands.add('loginByCSRF', (csrfToken) => {
        cy.request({
            method: 'POST',
            url: '/login/',
            failOnStatusCode: false, // dont fail so we can make assertions
            form: true, // we are submitting a regular form body
            body: {
                username,
                password,
                csrf_token: csrfToken // insert this as part of form body
            }
        })
    })
    // LoginPageTest();
    SearchPageTest();
})



