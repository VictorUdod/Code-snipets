export function SelectGroupItems(groupName: string) {
  cy.contains(groupName).click()
  }


export class NavigationPage{

  myAccountPage(){
    
      SelectGroupItems('My Account')
      cy.url().should('include', '/user/account')
      
  }
  paymentMethodPage(){
    
      SelectGroupItems('Payment Method')
      cy.url().should('include', '/user/payment')
    }

  permitsPage(){
      SelectGroupItems('Permits')
      cy.url().should('include', '/user/permits')
    }

  paymentHistoryPage(){
      SelectGroupItems('Payment History')
      cy.url().should('include', '/user/payment-history')
    }

  
}

export const navigateTo = new NavigationPage()