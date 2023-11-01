export function login(username: string, password: string): void {
    cy.visit("/");
    cy.getTestEl("signin_email").type(username);
    cy.getTestEl("signin_password").type(password);
    cy.getTestEl("signin_button").click();
  };
  