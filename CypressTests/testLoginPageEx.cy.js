/// <reference types="cypress" />

const { inputFormsAndLogin } = require("../utils/login");

const userName = Cypress.env('userName');
const password = Cypress.env('password');

const arrayOfUsers = [
    {
        email: 'user1@gmail.com', 
        password: 'password'
    },
    {
        email: 'user2@gmail.com', 
        password: 'password'
    },
    {
        email: 'user3@gmail.com', 
        password: 'password'
    },
    {
        email: 'user4@gmail.com', 
        password: 'password'
    },
    {
        email: 'user5@gmail.com', 
        password: 'password'
    },

]


describe('Login Page', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.intercept('https://').as('request')
    });

    it('Correct Login', () => {
        cy.get('h6').should('contain.text', 'SCREENTRAILS').and('be.visible');
        cy.get('a').should('contain.text', 'Forgot Password?').and('be.visible');
        inputFormsAndLogin(userName, password);

    });

    it('Incorrect User Name', () => {
        inputFormsAndLogin(userName+'a', password);
    });

    it('Inccorect Password', () => {
        inputFormsAndLogin(userName, password+'a');
    });

    it('Inccorect User Name And Password', () => {
        inputFormsAndLogin(userName+'a', password+'a');
    });

    it('Check 5 Users', () => {
        for(let user of arrayOfUsers){
            inputFormsAndLogin(user.email, user.password)
        };
    });
});