import { login } from "../utils"
import { dateFromCurent } from "../utils/formsInputs";
import { navigateTo, visitPayUiSearch, visitPayUiValidVisitors } from "../utils/navigation";
import { CreateValidationForCustomer, ValidationOnPayUI, checkValidationOnHistoryPage, checkWrongSixDigitCode } from "../utils/validation";



const username = Cypress.env("TEST_USERNAME");
const password = Cypress.env("TEST_USER_PASSWORD");
const userPhone = '79999999999';
const date = dateFromCurent.selectDateFromCurent(0);

const validationType = ['Auto Test', '6-digit Auto Test'];
const typeSettings = ['3 hr, Holidays', '1 hr, Holidays'];
const createdBy = 'Test User';
const amount = ['36', '12'];
const lpNumber = ['TEST001', 'TEST003'];
const chooseHours = [3, 1];
const garageId =  Cypress.env('garageId');
const digitCode = ['', '980029'];
const tblRow = [1, 2];
const wrongDigitCode = ['307864', '980076'];




describe('Create Validation For Customer', () => {


  beforeEach('Login', () => {
    login(username, password);
    navigateTo.validationPage();

  });

  it('Create Validation for Customer by Phone Number', () => {
    CreateValidationForCustomer.byPhoneNum(
      validationType[0],
      chooseHours[0],
      userPhone,
      digitCode[0],
    );
  });

  it('Check Created Validation on the Validation History Page', () => {
    navigateTo.validationHistoryPage();
    checkValidationOnHistoryPage(
      date,
      validationType[0],
      typeSettings[0],
      createdBy,
      amount[0],
      tblRow[0]
    );
  });

  it('Attach LP Number to Validation by Pay UI', () => {
    visitPayUiValidVisitors();
    ValidationOnPayUI.createValidation(lpNumber[0])
  });

  it('Check Validation URL it Should Be Inactive ', () => {
    visitPayUiValidVisitors();
    cy.getTestEl('error-page-icon').should('be.visible');
    cy.getTestEl('error-text').should('contain', `Validation was attached to car: ${lpNumber[0]}`)
  });

  it('Create Validation for Customer by LP number', () => {
    CreateValidationForCustomer.byLpNum(
      validationType[0],
      chooseHours[1],
      lpNumber[1],
      digitCode[0]
    );
  });

  it('Check Created Validation on the Validation History Page', () => {
    navigateTo.validationHistoryPage();
    checkValidationOnHistoryPage(
      date,
      validationType[0],
      typeSettings[1],
      createdBy,
      amount[1],
      tblRow[0]
    );
  });

  it('Check Created Validation on Pay-UI', () => {
    visitPayUiSearch(garageId);
    ValidationOnPayUI.checkValidation(lpNumber[1])
  });

  it('Create Validations With 6-digit Code', () => {
    CreateValidationForCustomer.byPhoneNum(
      validationType[1],
      chooseHours[1],
      userPhone,
      digitCode[1]
    );

    CreateValidationForCustomer.byLpNum(
      validationType[1],
      chooseHours[0],
      lpNumber[1],
      digitCode[1]
    );

    // Check Validation on Validation-History Page

    navigateTo.validationHistoryPage();
    cy.reload();
    checkValidationOnHistoryPage(
      date,
      validationType[1],
      typeSettings[0].slice(0, 3),
      createdBy,
      amount[0],
      tblRow[0]
    );

    checkValidationOnHistoryPage(
      date,
      validationType[1],
      typeSettings[1].slice(0, 3),
      createdBy,
      amount[1],
      tblRow[1]
    );
  });

  it('Wrong 6-digit code', () => {
    cy.getTestEl('validation-type').type(`${validationType[1]}{enter}`);
    // 6-digit code from Admin UI
    checkWrongSixDigitCode(wrongDigitCode[0]);
    // 6-digit code from another Tenant 
    checkWrongSixDigitCode(wrongDigitCode[1]);
  });
});