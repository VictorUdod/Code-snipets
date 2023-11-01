export function createRandomInteger(upperBound: number = 1_000_000*10000): number {
    return Math.round(Math.random() * upperBound);
  }
 const gestOne = createRandomInteger();
 const gestTwo = createRandomInteger();
 const gestThree = createRandomInteger();
    const guestList = [
       gestOne,
       gestTwo,
       gestThree]
 
 
 export function createCSVFile(){
    cy.writeFile('cypress/fixtures/guestList.csv', [guestList])
 };

 //////////////////////////////////////////////////////

export function selectdayfromCurent(plusDay: number){
    let date = new Date();
    date.setDate(date.getDate() + plusDay);
    let futureDay = date.getDate();
    return futureDay;
};

export function twoDigits(num: number) {
    if (num < 10) {
    return ('0' + num);
    } 
    else {
    return num
    }
}

export class selectDateFromCurent{
    selectdayfromCurent(plusDay: number){
        
        let date = new Date();
        date.setDate(date.getDate() + plusDay);
        let futureDay = date.getDate();
        
        return twoDigits(futureDay);
    };
    selectDateFromCurent(plusDay: number, isYearLong?: boolean ){
        let date = new Date();
        date.setDate(date.getDate() + plusDay);
        let futureDay = date.getDate();
        let futuremonth = date.getMonth() + 1;

        const stringYear = isYearLong 
        ?  date.getFullYear().toString()
        :  date.getFullYear().toString().substr(-2);
         

        let dateassert = twoDigits(futuremonth) +'/'+ twoDigits(futureDay)+'/'+stringYear;
        return dateassert;
    }
    setTime(plusHours: number, istimeLong?: boolean){
        let date = new Date(2023, 0, 20, 0);
        date.setHours(date.getHours() + plusHours);
        //const options = { hour: "2-digit", minute: "2-digit" }
        const timeShort = istimeLong
        ? date.toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit"})
        : date.toLocaleTimeString("en-US", {timeStyle: "short"});
        
        let untilHour = timeShort;
        return untilHour;
    }
} 
export const dateFromCurent = new selectDateFromCurent();

///////////////////////////////////////////////////////////////////////////////////////////////

export function visitPayUiEventPage(){
    cy.readFile('cypress/fixtures/qrCodeData.json').then(({qrCodeData}) =>{
        cy.visit(qrCodeData, {failOnStatusCode: false});
    });
};

//////////////////////////////////////////////////////////////////////////////////////////////

export function selectPickerDayFromCurent(day: number){
    let date = new Date()
    date.setDate(date.getDate() + day)
    let futureDay = date.getDate()
    let futuremonth = date.toLocaleDateString('default')
    
    cy.get('.datepicker__current-month').children().invoke('text').then(dateattr =>{
            if(!dateattr.includes(futuremonth)){
                cy.get('.datepicker__navigation--next').click()
                selectPickerDayFromCurent(day)
                    } else {cy.get('.datepicker__month-container').contains(futureDay).click()}
                })
                return futuremonth
            }

//////////////////////////////////////////////////////////////////////////////////////////////

import {Decoder} from '@nuintun/qrcode'


export function scanQrCode (eventQrCode: string, folder: string ,cypressRun?: boolean){ 
    const cypressMode = cypressRun
    ? `cypress/screenshots/${folder}/qrCode.png`
    : 'cypress/screenshots/qrCode.png';
    
    cy.getTestEl(`${eventQrCode}`).screenshot('qrCode', {overwrite: true, padding: 10})
    .readFile(cypressMode, 'base64', {timeout: 2000})
    .then((base64) => `data: image/png;base64, ${base64}`)
    .then((imageScr) => {
        const dec  = new Decoder
        return dec.scan(imageScr)
    })
    .its('data').then((qrCodeData) =>{
    cy.wrap(qrCodeData)
    .writeFile('cypress/fixtures/qrCodeData.json', {qrCodeData});
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////

export function getToken(
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
    });
  };

  ////////////////////////////////////////////////////////////////////////////////////////////

  cy.intercept(`**/v2/${fromDate}&toDate=${toDate}`).as('cardRequest');
  cy.intercept('**/v2/table').as('typeRequest');
  cy.intercept('**/v2/table?skip=0&take=10').as('historyRequest');




it('Checks Widgets, Trend Chart, Validation Type Table', () => {

  cy.wait('@cardRequest').then(($intercep) => {
      const response = $intercep.response?.body;
      const amount: number = response.Balance;
      const totalNo = response.Count;
  
      cy.getEl('name', 'nameOfTable').then(($revenue) => {
          cy.wrap($revenue).find('div').eq(1).should('contain', 'nameOfTable');
              cy.wrap($revenue).find('div').eq(2).should('include.text', `$ ${(amount / 100).toLocaleString()}`);
          cy.wrap($revenue).find('div').eq(3).should('contain', monthYear);
      });
      cy.getEl('name', 'totalN').then(($totalVal) => {
          cy.wrap($totalVal).find('div').eq(1).should('contain', 'totalN');
              cy.wrap($totalVal).find('div').eq(2).should('include.text', `${totalNo}`);
          cy.wrap($totalVal).find('div').eq(3).should('contain', monthYear);
      });
  });
  const detailModalHeaders = ['Name of Header', 'Name of Header', 'Name of Header', 'Name of Header', 'Name of Header', 'Name of Header'];

  cy.wait('@monthlyDetail').then(($monthlyDetail) => {
    const monthlyDetailValidations = $monthlyDetail.response?.body.rows;
    const typeName = monthlyDetailValidations?.map((data: any) => data.typeName);
    const timestamp = monthlyDetailValidations?.map((data: any) => data.timestamp);
    const note = monthlyDetailValidations?.map((data: any) => data.note);
    const createdBy = monthlyDetailValidations?.map((data: any) => data.createdBy);
    const amount = monthlyDetailValidations?.map((data: any) => data.amount);
    const totalAmount = monthlyDetailValidations?.map((data: any) => data.totalAmount);
    
    cy.getTestEl('nameOfTable').should('be.visible').then(($detailTbl) => {
        cy.wrap($detailTbl).find('thead').find('th').each(($th, index) => {
            cy.wrap($th).should('contain.text', detailModalHeaders[index]);
        });

        cy.wrap($detailTbl).find('tbody').find('tr').each(($tblRow, index) => {
            cy.wrap($tblRow).find('td').each(($tblTd, idx) => {
                const detail = [
                    formatFullDate(timestamp[index]), 
                    validationTypeName[index], 
                    note[index] === null ? '' : note[index], 
                    createdBy[index] === null ? '' : createdBy[index], 
                    formatPrice(amount[index]), 
                    formatPrice(totalAmount[index])
                ];
                cy.wrap($tblTd).should('contain.text', detail[idx]);

            });
        });
    });
});


cy.wait('@byRequest').then(($monthlyReq) => {
    const monthly = $monthlyReq.response?.body;
    const rows = monthly?.rows;
    cy.wrap($table).find('tbody').find('tr').each(($tblRow, index) => {
        const timeStamp = rows[index]?.timestamp;
        const total = rows[index]?.total;
        const types = rows[index]?.types;
        cy.wrap($tblRow).find('td').eq(0).should('include.text', formatMonthYear(timeStamp));
        if (types && types.length > 0) {
            cy.wrap($tblRow).find('td').eq(1).find('span').eq(0).should('contain.text', formatPrice(types[0].totalAmount));
            cy.wrap($tblRow).find('td').eq(1).find('span').eq(1).should('contain.text', types[0].validationTypeName);
            if (types.length > 1){
                cy.wrap($tblRow).find('td').eq(1).find('span').eq(2).should('contain.text', formatPrice(types[1].totalAmount));
                cy.wrap($tblRow).find('td').eq(1).find('span').eq(3).should('contain.text', types[1].validationTypeName);
            }; 
            if (types.length > 2){
                cy.wrap($tblRow).find('td').eq(1).find('span').eq(4).should('contain.text', formatPrice(types[2].totalAmount));
                cy.wrap($tblRow).find('td').eq(1).find('span').eq(5).should('contain.text', types[2].validationTypeName);
            };      
        };   
        cy.wrap($tblRow).find('td').eq(2).should('include.text', formatPrice(total));
        cy.wait(2000);
    });
    cy.getTestEl('table').find('tbody').find('tr').eq(0).find('button').click({force: true});
});

/////////////////////////////////////////////////////////////////////////////////////////////

cy.wait('@monthlySummary').then(($monthySummary) => {
    const monthlySum = $monthySummary.response?.body.rows;
    monthlySum.sort((a: any, b: any) => b.totalAmount - a.totalAmount);
    const amounts = monthlySum?.map((data: any) => data.totalAmount);
    const totalAmount = amounts?.reduce((sum: any, amount: any) => sum + amount, 0);
    const typeName = monthlySum?.map((data: any) => data.validationTypeName);
    typeName.unshift({});
    typeName.push('Total');
    const count = monthlySum?.map((data: any) => data.count);
    count.push(count?.reduce((sum: any, amount: any) => sum + amount, 0));
    count.unshift('No. of Validations');
    const price = monthlySum?.map((data: any) => data.price);
    price.push(price?.reduce((sum: any, amount: any) => sum + amount, 0))
    price.unshift('Validation Price');
    amounts.push(totalAmount);
    amounts.unshift('Total Amount');

    cy.getTestEl('modal-table').should('be.visible').then(($sumTable) => {
        cy.wrap($sumTable).find('thead').find('th').each(($th, index) => {
            if(index !==0){
                cy.wrap($th).should('contain.text', typeName[index]);
            };
        });
        cy.wrap($sumTable).find('tr').each(($tblRow, index) => {
            cy.wrap($tblRow).find('td').each(($tblTd, idx) => {
                if(idx !== 0){
                const detail = [count[idx], formatPrice(price[idx]), formatPrice(amounts[idx])];
                cy.wrap($tblTd).should('contain.text', detail[index]);
                };
            });
            const detail = [count[0] ,price[0], amounts[0]];
            cy.wrap($tblRow).find('td').eq(0).should('contain.text', detail[index]);
        });
    });

});

///////////////////////////////////////////////////////////////////////////////////////////


const endPoint = 'endPoint';
const topic = 'topic'
const AWS = require('aws-sdk');
const region = 'region';
const qos = 1;
let lpCounter = 1;
const numOfAcivities = 5;
const delaySendActivity = 1000;
const publishMqttMessage = (endPoint, topic, qos) => {
const lpNum = `TEST00${lpCounter++}`;
const timeStamp = Date.now();

  const payLoad = {
    meta: {
      event_time: timeStamp
    },
    data: {
      data: lpNum,
      data2: lpNum,
      event_time: timeStamp,
      activity_id: `activity${timeStamp}`,
    }
  };

  AWS.config.update({ region: region });

  const iotdata = new AWS.IotData({ endpoint: endPoint });

  const params = {
    topic: topic,
    payload: JSON.stringify(payLoad),
    qos: qos 
  };

  iotdata.publish(params, function(err, data) {
    if (err) {
      console.log('Error sending message:', err);
    } else {
      console.log('Message sent successfully:', data);
    };
  });
};

for (let i = 0; i < numOfAcivities; i++) {
  setTimeout(() => {
    publishMqttMessage(endPoint, topic, qos);
  }, i * delaySendActivity);
};
  
/////////////////////////////////////////////////////////////////////////////////////////
