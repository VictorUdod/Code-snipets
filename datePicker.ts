export function selectPickerDayFromCurent(day: number){
    let date = new Date()
    date.setDate(date.getDate() + day)
    let futureDay = date.getDate()
    let futuremonth = date.toLocaleDateString('default')
    //let dateassert = futuremonth+' '+futureDay+', '+date.getFullYear()
    
    cy.get('.react-datepicker__current-month').children().invoke('text').then(dateattr =>{
            if(!dateattr.includes(futuremonth)){
                cy.get('.react-datepicker__navigation--next').click()
                selectPickerDayFromCurent(day)
                    } else {cy.get('.react-datepicker__month-container').contains(futureDay).click()}
                })
                return futuremonth
            }