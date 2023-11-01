export function checkRequestData(pageNum, statusCode) {
    cy.request('GET',`https://reqres.in/api/users?page=${pageNum}`).then(($response) => {
        
        const body = $response.body;
        expect($response.status).eql(statusCode);
        if($response.status === statusCode){
            expect(body.page).eq(pageNum);
            expect(body.total).eq(body.total_pages * body.per_page);
            expect(body.total_pages).eq(body.total / body.per_page);
            expect(body.per_page).to.eq(body.total / body.total_pages);
            const supportUrl = body.support.url;
            expect(supportUrl).to.eq('https://reqres.in/#support-heading');
            cy.request('GET', supportUrl).then(($res) => {
                expect($res.status).to.eq(200)
            });
            expect(body.support.text).to.contain('To keep ReqRes free, contributions towards server costs are appreciated!');
            
            const data = body.data;
            
            if( data.length && pageNum > 0){
                expect(body.per_page).to.be.equal(body.data.length);
                expect(body.data).have.length(body.per_page);
                data.forEach((users, idx) => {
                    expect(users).to.have.property('email').to.be.a('string').and.to.match(/^.+@.+$/)
                    expect(users).to.have.property('id').to.be.a('number');
                    expect(users).to.have.property('first_name').to.be.a('string').to.not.be.empty;
                    expect(users).to.have.property('last_name').to.be.a('string').to.not.be.empty;
                    expect(users).to.have.property('avatar').to.be.a('string').and.to.match(/^https?:\/\/.+$/);
                    const avatar = $response.body.data[idx].avatar;
                    cy.request('GET', avatar).then(($res) => {
                        expect($res.status).eq(200);
                        expect($res.headers).to.have.property('content-type', 'image/jpeg')
                    });
                });
            } else {
                expect(body.data).to.be.empty
            };
        } else return;
    });
};