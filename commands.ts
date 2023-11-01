function getTestEl(dataTestValue: string, options: any): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[data-test="${dataTestValue}"]`, options);
}

function getEl(testAttribute: string, testValue: string, options: any): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`[${testAttribute}="${testValue}"]`, options);
}

function findEl(subject: JQuery<HTMLElement> ,testAttribute: string, testValue: string, options: any): Cypress.Chainable<JQuery<HTMLElement>> | undefined {
  return cy.wrap(subject).find(`[${testAttribute}="${testValue}"]`, options);
}

function findTestEl(subject: JQuery<HTMLElement>, dataTestValue: string, options: any):
  Cypress.Chainable<JQuery<HTMLElement>> | undefined {
  return cy.wrap(subject).find(`[data-test="${dataTestValue}"]`, options);
}

function getTestElContains(subject: unknown, dataTestValue: string, text: string, options: any)
  : void {
  if (subject) {
    cy.wrap(subject).contains(
      `[data-test~="${dataTestValue}"]`,
      text,
      options
    );
  } else {
    cy.contains(`[data-test~="${dataTestValue}"]`, text, options);
  }
}

function getToken(
  apiUrlGetToken: string,
  userEmailTen: string,
  apiPasswordTen: string){
  cy.request({
    method: 'POST', 
    url: apiUrlGetToken,
    body: {
      "email": userEmailTen,
      "password": apiPasswordTen,
    }}).then(response =>{
      expect(response.status).to.eq(200)
    })
    .its('body').then(body =>{
    const token = body.tokens.access
    cy.wrap(token, {log: false}).writeFile('token.json', {token})
  })
}


Cypress.Commands.add('getTestEl', getTestEl);
Cypress.Commands.add('getEl', getEl);
Cypress.Commands.add('findEl', { prevSubject: 'element' }, findEl);
Cypress.Commands.add('findTestEl', { prevSubject: 'element' }, findTestEl);
Cypress.Commands.add('getTestElContains', { prevSubject: 'optional' }, getTestElContains);
Cypress.Commands.add('getToken', getToken);
