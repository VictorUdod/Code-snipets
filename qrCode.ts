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
    .writeFile('cypress/fixtures/qrCodeData.json', {qrCodeData})
    })
}