
import { login } from "../utils";
import { dateFromCurent } from "../utils/formsInputs";
import { navigateTo } from "../utils/navigation";
import { z5DateModule } from '@/time-module';
import { formatPrice } from '@/ui/lib/utils/formatters/formatPrice';
import { 
    formatFullDate, 
    formatMonthYear, 
    getTimestampOfCurrentMonthEnd, 
    getTimestampOfCurrentMonthStart 
} from '@/ui/lib/utils/date/helpers';

z5DateModule.setTimezone('America/Chicago');

const username = Cypress.env("TEST_USERNAME");
const password = Cypress.env("TEST_USER_PASSWORD");
const monthYear = dateFromCurent.showDateMonthText();
const plusDay = -60;
const startDate = dateFromCurent.selectDateFromCurent(plusDay);
const endDate = dateFromCurent.selectDateFromCurent(0);
const typeTableHeaders = ['Type Name', 'This Week’s Usage', 'Validation Price', 'Info'];
const historyTableHeaders = ['Date', 'Type', 'Note', 'Created By', 'Charge Amount', 'Info'];
const tenantHistoryTableHeaders = ['Date', 'Account', 'Account Type', 'No. of Validations', 'Total Amount', 'Info']
const validationDetailInfo = ['Date', 'Created By', 'Type', 'Created For', 'License Plate'];
const validationSummaryInfo = ['Item', 'For', 'Price'];
const validationTenantForecactedHeders = ['Date', 'Validation Type', 'Note', 'Amount', 'Total Amount'];
const validationMonthlyHeaders = ['Date', 'Top 3 Validation Types', 'Total', 'Info'];
const validationMonthlyDetailModalHeaders = ['Date', 'Validation Type', 'Note', 'Created By', 'Amount', 'Total Amount'];
const fromDate =  getTimestampOfCurrentMonthStart();
const toDate = getTimestampOfCurrentMonthEnd();

describe('Validation History Page', () => {

    beforeEach('Login', () => {
        login(username, password);
        cy.intercept(`**/v2/cards?fromDate=${fromDate}&toDate=${toDate}`).as('cardRequest');
        cy.intercept('**/v2/table').as('typeRequest');
        cy.intercept('**/v2/table?skip=0&take=10').as('historyRequest');


        navigateTo.validationHistoryPage();
    });

    it('Checks Widgets, Trend Chart, Validation Type Table', () => {

        cy.wait('@cardRequest').then(($intercep) => {
            const response = $intercep.response?.body;
            const revenueAmount: number = response.validationBalance;
            const totalNoValidations = response.validationCount;
        
            cy.getEl('name', 'totalValidationRevenue').then(($revenue) => {
                cy.wrap($revenue).find('div').eq(1).should('contain', 'Total Validation Revenue');
                    cy.wrap($revenue).find('div').eq(2).should('include.text', `$ ${(revenueAmount / 100).toLocaleString()}`);
                cy.wrap($revenue).find('div').eq(3).should('contain', monthYear);
            });
            cy.getEl('name', 'totalNoValidation').then(($totalVal) => {
                cy.wrap($totalVal).find('div').eq(1).should('contain', 'Total No. of Validation');
                    cy.wrap($totalVal).find('div').eq(2).should('include.text', `${totalNoValidations}`);
                cy.wrap($totalVal).find('div').eq(3).should('contain', monthYear);
            });
        });

        cy.getTestEl('validation-trend').should('be.visible').and('contain', 'Validation Trend').then(($valTrend) => {
            cy.getTestEl('validation-ternd-graph').should('be.visible');
            cy.wrap($valTrend).find('input').first().type(`{selectAll}${startDate} - ${endDate}{enter}`);
            cy.getTestEl('validation-ternd-graph').should('be.visible');
            cy.wrap($valTrend).find('input').first().should('have.value',`${startDate} - `);
            cy.wrap($valTrend).find('input').eq(1).click({force: true});
            cy.wrap($valTrend).should('contain', 'Daily').and('contain', 'Weekly').and('contain', 'Monthly');
            cy.wrap($valTrend).find('input').eq(1).type('Weekly{enter}');
            cy.getTestEl('validation-ternd-graph').should('be.visible');
            cy.wrap($valTrend).find('input').eq(1).type('Monthly{enter}');
            cy.getTestEl('validation-ternd-graph').should('be.visible');
        });

        cy.getTestEl('validation-types-tbl').should('be.visible').and('contain', 'Validation Types').then(($valTypes) => {
            cy.wrap($valTypes).findTestEl('tableContent').should('be.visible').then(($tableCont) => {
                cy.wrap($tableCont).find('table').then(($table) => {
                    cy.wrap($table).find('tr').eq(0).then(($row) => {
                        cy.wrap($row).find('th').each(($header, index) => {
                            cy.wrap($header).should('contain', typeTableHeaders[index]);
                        });
                    });
                    cy.wait('@typeRequest').then(($typeReq) => {
                        const validationTypes = $typeReq.response?.body.validationTypes;
                        const names = validationTypes?.map((validationData: any) => validationData.validationType.name);
                        const userType = validationTypes?.map((validationData: any) => validationData.validationType.userType);
                        const pricingType = validationTypes?.map((validationData: any) => validationData.validationType.pricingType);
                        const requiresCode = validationTypes?.map((validationData: any) => validationData.validationType.requiresCodee);
                        const eligibleTenantTypes = validationTypes[0].validationType.eligibleTenantTypes;
                        const costCents = validationTypes?.map((validationData: any) => validationData.validationType.costCents);
                        const validationCount = validationTypes?.map((validationData: any) => validationData.validationCount);
                        const weeklyLimit = validationTypes?.map((validationData: any) => validationData.weeklyLimit);
                        const price = costCents.map((cents: number) => (cents / 100).toFixed(2));

                        cy.wrap($table).find('tbody').find('tr').each(($tblRow, index) => {
                            cy.wrap($tblRow).find('td').eq(0).invoke('text').should('eq', names[index]);

                            const countLimit: string = weeklyLimit[index] === 0 
                            ? validationCount[index].toString() 
                            : `${validationCount[index]} / ${weeklyLimit[index]}`;
                            cy.wrap($tblRow).find('td').eq(1).invoke('text').should('eq', countLimit);

                            const priceText: string = price[index] === '0.00' 
                            ? '-' 
                            : `$ ${price[index]}`;
                            cy.wrap($tblRow).find('td').eq(2).invoke('text').should('eq', priceText);
                        });
                        
                        cy.wrap($table).find('tr').eq(1).find('button').click();
                        cy.getTestEl('validation-type-modal').should('be.visible').then(($validationModal) => {
                            cy.wrap($validationModal).findEl('name', 'validationTypeName').should('have.value', names[0]);
                            cy.wrap($validationModal).findEl('name', 'userType').should('have.value', userType[0]);
                            cy.wrap($validationModal).findEl('name', 'pricingType').should('have.value', pricingType[0]);

                            const codeReq = requiresCode === true
                            ? 'be.checked'
                            : 'not.be.checked';

                            cy.wrap($validationModal).findEl('name', 'requiresCode').should(codeReq);
                            cy.wrap($validationModal).find('li').each(($li) => {
                                const liText = $li.text();
                                if (eligibleTenantTypes.includes(liText)) {
                                    cy.wrap($li).find('input').should('be.checked');
                                };
                            });
                            cy.getTestEl('close-btn').click();
                        });
                    });
                });
            });
        });
    });
    
    it('Check Validation Hystory Table', () => {
        cy.intercept('**/v2/byTenant?skip=0&take=10').as('byTenantHystoryRequest1');
        cy.intercept('**/v2/byTenant?skip=0&take=10').as('byTenantHystoryRequest2');
        cy.intercept('**/v2/monthly?take=10&skip=0&aggregationPeriod=monthly').as('byMonthlyRequest');
        cy.intercept(`**/v2/summary?fromDate=${fromDate}&toDate=${toDate}&aggregationPeriod=monthly`).as('monthlySummary');
        cy.intercept(`**/v2/details?fromDate=${fromDate}&toDate=${toDate}&take=10&skip=0&aggregationPeriod=monthly`).as('monthlyDetail')

        
        cy.getTestEl('validation-history-table').should('be.visible').and('contain', 'Validation History').then(($histotyTable) => {
            cy.wrap($histotyTable).findTestEl('tableContent').should('be.visible').then(($tableCont) => {
                cy.wrap($tableCont).find('table').then(($table) => {
                    cy.wrap($table).find('tr').eq(0).then(($row) => {
                        cy.wrap($row).find('th').each(($header, index) => {
                            cy.wrap($header).should('contain', historyTableHeaders[index]);
                        });
                    });
                    cy.wait('@historyRequest').then(($historyReq) => {
                        const validations = $historyReq.response?.body.rows
                        const type = validations?.map((validationData: any) => validationData.type);
                        const note = validations?.map((validationData: any) => validationData.note);
                        const tenantName = validations?.map((validationData: any) => validationData.tenantName);
                        const amount = validations?.map((validationData: any) => validationData.amount);
                        const price = amount.map((cents: number) => (cents / 100).toFixed(2));
                        const validationId = validations[0].validationId

                        cy.wrap($table).find('tbody').find('tr').each(($tblRow, index) => {
                            cy.wrap($tblRow).find('td').eq(1).invoke('text').should('eq', type[index]);
                            cy.wrap($tblRow).find('td').eq(2).invoke('text').should('eq', note[index]);
                            cy.wrap($tblRow).find('td').eq(3).invoke('text').should('eq', tenantName[index]);

                            const priceText: string = price[index] === '0.00' 
                            ? '-' 
                            : `$ ${price[index]}`;

                            cy.wrap($tblRow).find('td').eq(4).invoke('text').should('eq', priceText);
                        });

                        cy.intercept(`**/v2/${validationId}`).as('validationInfoReq')
                        cy.wrap($table).find('tr').eq(1).find('button').click();
                        cy.getTestEl('validation-detail-modal').should('be.visible').then(($modal) => {
                            cy.wait('@validationInfoReq').then(($infoReq) => {
                                const validationInfo = $infoReq.response?.body
                                const createdTime  = formatFullDate(validationInfo.validation.created);
                                const createdBy = validationInfo.company.name;
                                const valType = validationInfo.validation.type.name;
                                const createdFor = validationInfo.validation.email;
                                const licensPlate = validationInfo.validation.lpNum;
                                const garage = validationInfo.garage.label;
                                const price = validationInfo.costCents;

                                const priceText = price === 0
                                ? '-'
                                : `$ ${(price / 100).toFixed(2)}`

                                const summary = [valType, garage, priceText];
                                const detail = [
                                    createdTime, 
                                    createdBy, 
                                    valType, 
                                    createdFor || '-', 
                                    licensPlate || '-'
                                ];

                                cy.wrap($modal).find('h4').first().should('contain', 'Validation Detail');
                                cy.wrap($modal).find('table').eq(0).then(($table) => {
                                    cy.wrap($table).find('th').each(($header, index) => {
                                        cy.wrap($header).should('contain', validationDetailInfo[index]);
                                    });
                                    cy.wrap($table).find('td').each(($detail, index) => {
                                        cy.wrap($detail).should('contain', detail[index]);
                                    });
                                });
                                cy.wrap($modal).find('table').eq(1).then(($table) => {
                                    cy.wrap($table).find('th').each(($header, index) => {
                                        cy.wrap($header).should('contain', validationSummaryInfo[index]);
                                    });
                                    cy.wrap($table).find('td').each(($summary, index) => {
                                        cy.wrap($summary).should('contain', summary[index]);
                                    });    
                                });
                            });
                            cy.wrap($modal).find('button').contains('Close').click();
                        });
                    });  
                });
            });
            
            cy.wrap($histotyTable).find('input').eq(0).type('By Tenant{enter}', {force: true});
          
            cy.wait('@byTenantHystoryRequest1').then(($tenantReq) => {
                const tenantValidations = $tenantReq.response?.body.rows
                const companyId: string = tenantValidations[0].companyId;
            
                cy.intercept(`**/v2/${companyId}?fromDate=${fromDate}&toDate=${toDate}&companyId=${companyId}&take=10&skip=0`).as('tenantForecastedRequest')
                cy.wait(5000);    

                cy.wrap($histotyTable).findTestEl('tableContent').should('be.visible').then(($tableCont) => {
                    cy.wrap($tableCont).find('table').then(($table) => {
                        cy.wrap($table).find('th').each(($th, index) => {
                            cy.wrap($th).should('contain', tenantHistoryTableHeaders[index]);
                        });
                        cy.wait('@byTenantHystoryRequest2').then(($tenantReq) => {
                            const tenantValidations = $tenantReq.response?.body.rows
                            const account = tenantValidations?.map((validationData: any) => validationData.tenantName);
                            const accounType = tenantValidations?.map((validationData: any) => validationData.tenantType);
                            const validationCount = tenantValidations?.map((validationData: any) => validationData.validationCount);
                            const amount = tenantValidations?.map((validationData: any) => validationData.amount);
                            const price = amount.map((cents: number) => (cents / 100).toLocaleString());
                            const companyId: string = tenantValidations[0].companyId;
                            

                            cy.wrap($table).find('tbody').find('tr').each(($tblRow, index) => {
                                cy.wrap($tblRow).find('td').eq(1).invoke('text').should('eq', account[index]);
                                cy.wrap($tblRow).find('td').eq(2).invoke('text').should('eq', accounType[index]);
                                cy.wrap($tblRow).find('td').eq(3).invoke('text').should('eq', validationCount[index].toString());
                                const priceText = price[index] === '0.00' 
                                ? '-' 
                                : `$ ${price[index]}`;
                                cy.wrap($tblRow).find('td').eq(4).invoke('text').should('include', priceText);
                            });
                            
                            cy.intercept(`**/v2/owner-garage/validation/table/byTenant/summary/${companyId}?fromDate=${fromDate}&toDate=${toDate}`).as('tenantSummaryRequest');

                            cy.wrap($table).find('tr').eq(1).find('button').click();
                            
                            cy.wait(5000)
                            cy.getTestEl('validation-history-modal-export-btn').should('be.visible');
                            cy.getTestEl('tenant-validation-detail-modal').should('be.visible');
                            cy.getTestEl('tenant-name-type')
                            .find('div')
                            .eq(1)
                            .should('include.text', `${account?.[0]}`)
                            .next()
                            .should('include.text', `${accounType?.[0]}`);
                            cy.getTestEl('date-period').should('include.text', monthYear);
                            
                            cy.wait('@tenantSummaryRequest').then(($tenantSumary) => {
                                const tenantSum = $tenantSumary.response?.body.rows
                                const validationTypeName = tenantSum?.map((validationData: any) => validationData.validationTypeName);
                                const validationCount = tenantSum?.map((validationData: any) => validationData.validationCount);
                                const unitPrice = tenantSum?.map((validationData: any) => validationData.unitPrice);
                                const totalAmount = tenantSum?.map((validationData: any) => validationData.totalAmount);

                                cy.getTestEl('modal-revenue-table').find('tbody').find('tr').each(($tblRow, index) => {
                                    cy.wrap($tblRow).find('td').each(($tblTd, idx) => {
                                        const unitPriceShow = unitPrice[index] === 0 ? '-' : formatPrice(unitPrice[index]);
                                        const totalAmountShow = totalAmount[index] === 0 ? '-' : formatPrice(totalAmount[index]);
                                        const detail = [
                                            validationTypeName[index], 
                                            validationCount[index], 
                                            unitPriceShow, 
                                            totalAmountShow
                                        ];
                                        cy.wrap($tblTd).should('include.text', detail[idx]);
                                    });
                                });
                            });


                            cy.wait('@tenantForecastedRequest').then(($tenantForecasted) => {
                                const tenantForecacted = $tenantForecasted.response?.body.rows
                                const timestamp = tenantForecacted?.map((validationData: any) => validationData.timestamp);
                                const type = tenantForecacted?.map((validationData: any) => validationData.type);
                                const note = tenantForecacted?.map((validationData: any) => validationData.note);
                                const amount = tenantForecacted?.map((validationData: any) => validationData.amount);
                                const totalAmount = tenantForecacted?.map((validationData: any) => validationData.totalAmount);


                                cy.getTestEl('forecasted-report-modal-details').scrollIntoView().should('be.visible').then(($forecactedTbl) => {
                                    cy.wrap($forecactedTbl).find('thead').find('th').each(($th, index) => {
                                        cy.wrap($th).should('contain', validationTenantForecactedHeders[index]);
                                    });
                                    cy.wrap($forecactedTbl).find('tbody').find('tr').each(($tblRow, index) => {
                                        cy.wrap($tblRow).find('td').each(($tblTd, idx) => {
                                            const amountShow = amount[index] === 0 ? '-' : formatPrice(amount[index]);
                                            const totalShow = totalAmount[index] === 0 ? '-' : formatPrice(totalAmount[index])
                                            const detail = [
                                                formatFullDate(timestamp[index]), 
                                                type[index], 
                                                note[index], 
                                                amountShow, 
                                                totalShow
                                            ];
                                            cy.wrap($tblTd).should('include.text', detail[idx])
                                        });
                                    });
                                });
                            });
                            cy.getTestEl('tenant-validation-detail-modal').find('button').contains('Close').click();
                        });
                    });
                });
                cy.wrap($histotyTable).find('input').eq(0).type('Monthly{enter}', {force: true});
                cy.wait(5000);
                cy.wrap($histotyTable).findTestEl('tableContent').should('be.visible').then(($tableCont) => {
                    cy.wrap($tableCont).find('table').then(($table) => {
                        cy.wrap($table).find('thead').find('th').each(($th, index) => {
                            cy.wrap($th).should('contain', validationMonthlyHeaders[index]);
                        });
                        cy.wait('@byMonthlyRequest').then(($monthlyReq) => {
                            const monthlyValidations = $monthlyReq.response?.body;
                            const rows = monthlyValidations?.rows;
                            cy.wrap($table).find('tbody').find('tr').each(($tblRow, index) => {
                                const timeStamp = rows[index]?.timestamp;
                                const total = rows[index]?.total;
                                const validationTypes = rows[index]?.validationTypes;
                                cy.wrap($tblRow).find('td').eq(0).should('include.text', formatMonthYear(timeStamp));
                                if (validationTypes && validationTypes.length > 0) {
                                    cy.wrap($tblRow).find('td').eq(1).find('span').eq(0).should('contain.text', formatPrice(validationTypes[0].totalAmount));
                                    cy.wrap($tblRow).find('td').eq(1).find('span').eq(1).should('contain.text', validationTypes[0].validationTypeName);
                                    if (validationTypes.length > 1){
                                        cy.wrap($tblRow).find('td').eq(1).find('span').eq(2).should('contain.text', formatPrice(validationTypes[1].totalAmount));
                                        cy.wrap($tblRow).find('td').eq(1).find('span').eq(3).should('contain.text', validationTypes[1].validationTypeName);
                                    }; 
                                    if (validationTypes.length > 2){
                                        cy.wrap($tblRow).find('td').eq(1).find('span').eq(4).should('contain.text', formatPrice(validationTypes[2].totalAmount));
                                        cy.wrap($tblRow).find('td').eq(1).find('span').eq(5).should('contain.text', validationTypes[2].validationTypeName);
                                    };      
                                };   
                                cy.wrap($tblRow).find('td').eq(2).should('include.text', formatPrice(total));
                                cy.wait(2000);
                            });
                            cy.getTestEl('validation-history-table').find('tbody').find('tr').eq(0).find('button').click({force: true});
                        });
                        cy.getTestEl('monthly-validation-detail-modal').should('be.visible').then(($monthlyModal) => {
                            cy.wait('@monthlySummary').then(($monthySummary) => {
                                const monthlySumValidation = $monthySummary.response?.body.rows;
                                monthlySumValidation.sort((a: any, b: any) => b.totalAmount - a.totalAmount);
                                const amounts = monthlySumValidation?.map((validationData: any) => validationData.totalAmount);
                                const totalAmount = amounts?.reduce((sum: any, amount: any) => sum + amount, 0);
                                const validationTypeName = monthlySumValidation?.map((validationData: any) => validationData.validationTypeName);
                                validationTypeName.unshift({});
                                validationTypeName.push('Total');
                                const validationCount = monthlySumValidation?.map((validationData: any) => validationData.validationCount);
                                validationCount.push(validationCount?.reduce((sum: any, amount: any) => sum + amount, 0));
                                validationCount.unshift('No. of Validations');
                                const validationPrice = monthlySumValidation?.map((validationData: any) => validationData.validationPrice);
                                validationPrice.push(validationPrice?.reduce((sum: any, amount: any) => sum + amount, 0))
                                validationPrice.unshift('Validation Price');
                                amounts.push(totalAmount);
                                amounts.unshift('Total Amount');
                                cy.wrap($monthlyModal).find('h4').should('contain.text', 'Validation History');
                                cy.getTestEl('validation-history-modal-export-btn').should('be.visible');
                                cy.getTestEl('name-section').find('div').eq(1).should('contain.text', 'zero5');
                                cy.getTestEl('name-section').find('div').eq(2).should('contain.text', monthYear);
                                cy.getTestEl('validation-summary').find('div').eq(1).should('contain.text', 'Validation Summary');
                                cy.getTestEl('validation-summary').find('div').eq(3).should('contain.text', formatPrice(totalAmount));

                                cy.getTestEl('modal-daily-validation-table').should('be.visible').then(($sumTable) => {
                                    cy.wrap($sumTable).find('thead').find('th').each(($th, index) => {
                                        if(index !==0){
                                            cy.wrap($th).should('contain.text', validationTypeName[index]);
                                        };
                                    });
                                    cy.wrap($sumTable).find('tr').each(($tblRow, index) => {
                                        cy.wrap($tblRow).find('td').each(($tblTd, idx) => {
                                            if(idx !== 0){
                                            const detail = [validationCount[idx], formatPrice(validationPrice[idx]), formatPrice(amounts[idx])];
                                            cy.wrap($tblTd).should('contain.text', detail[index]);
                                            };
                                        });
                                        const detail = [validationCount[0] ,validationPrice[0], amounts[0]];
                                        cy.wrap($tblRow).find('td').eq(0).should('contain.text', detail[index]);
                                    });
                                });
                            });
                            cy.wait('@monthlyDetail').then(($monthlyDetail) => {
                                const monthlyDetailValidations = $monthlyDetail.response?.body.rows;
                                const validationTypeName = monthlyDetailValidations?.map((validationData: any) => validationData.validationTypeName);
                                const timestamp = monthlyDetailValidations?.map((validationData: any) => validationData.timestamp);
                                const note = monthlyDetailValidations?.map((validationData: any) => validationData.note);
                                const createdBy = monthlyDetailValidations?.map((validationData: any) => validationData.createdBy);
                                const amount = monthlyDetailValidations?.map((validationData: any) => validationData.amount);
                                const totalAmount = monthlyDetailValidations?.map((validationData: any) => validationData.totalAmount);
                                
                                cy.getTestEl('forecasted-report-modal-details').should('be.visible').then(($detailTbl) => {
                                    cy.wrap($detailTbl).find('thead').find('th').each(($th, index) => {
                                        cy.wrap($th).should('contain.text', validationMonthlyDetailModalHeaders[index]);
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
                        });
                    });
                });
            });
        });
    });
});