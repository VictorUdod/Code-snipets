export function getTokenFromTenant(
  apiUrlGetToken: string,
  userEmailTen: string,
  apiPasswordTen: string,
  apiUrlSendInvite: string,
  driverId: string,
  permitTypeId: string
){
cy.getToken(
  apiUrlGetToken, 
  userEmailTen, 
  apiPasswordTen)
 cy.readFile('token.json').then(({token}) =>{
   cy.request({
     method: 'POST',
     url: apiUrlSendInvite,
     auth: {
      bearer: token
     },
      headers: {
      'x-zero5-garage-id': "lovett-post_htx"
     },
      body: {
      "driverId": driverId,
      "permitTypeId": permitTypeId
     }
    })
    .then(response =>{
    expect(response.status).to.eq(200)
    })
  })
}