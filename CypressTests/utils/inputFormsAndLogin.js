export function inputFormsAndLogin(userName, password){
    cy.get('#email').should('be.visible').type(userName);
    cy.get('#password').should('be.visible').type(password);
    cy.get('button[type=submit]').should('contain.text', 'Log In 2').click();
    cy.wait('@request').then((req) => {
        if (req.response.statusCode === 200){
            cy.url().should('contain', '/calendar');
        } else {
            expect(req.response.statusCode).to.eq(400);
        };
    });
    cy.go('back');
};