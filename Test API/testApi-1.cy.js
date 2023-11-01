

describe('Test API', () => {
    it('Test api page one', () => {
        checkRequestData(1, 200)
    });

    it('Test Page Two', () => {
        checkRequestData(2, 200)
    });

    it('Test Page Three', () => {
        checkRequestData(3, 200);
    });

    it('Test wrong page', () => {
        checkRequestData(-1, 200)
    });

    it('Test Wrong Page Two', () => {
        checkRequestData(-2, 200)
    });
});

