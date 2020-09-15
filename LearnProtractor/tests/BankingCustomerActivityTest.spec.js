const { browser, element, by } = require("protractor")

describe('Banking Test Suite - Customer Activities', () => {

    beforeAll(() => {

        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login')

        //click on customer login button
        element(by.css('[ng-click="customer()"]')).click()

    })

    it('Validate bank deposit', () => {

        //select name from dropdown
        element(by.model('custId')).element(by.css('option[value="2"]')).click()

        //click on login button
        element(by.className('btn btn-default')).click()

        //validate the customer name
        const custName = element(by.className('fontBig ng-binding')).getText()
        expect(custName).toEqual('Harry Potter')

        //click on deposit tab
        element(by.css('button[ng-class="btnClass2"]')).click()

        //enter amount in textbox
        element(by.model('amount')).clear().sendKeys('1000')

        //click on deposit button
        element(by.className('btn btn-default')).click()

        //validate bank deposit successful
        const sMsg = element(by.className('error ng-binding')).getText()
        expect(sMsg).toEqual('Deposit Successful')

        //click on logout button
        element(by.className('btn logout')).click()

    })

    it('Validate valid withdrawal from bank', () => {

        //select name from dropdown
        element(by.model('custId')).element(by.css('option[value="2"]')).click()

        //click on login button
        element(by.className('btn btn-default')).click()

        //validate the customer name
        const custName = element(by.className('fontBig ng-binding')).getText()
        expect(custName).toEqual('Harry Potter')

        //click on withdrawal tab
        element(by.css('button[ng-class="btnClass3"]')).click()

        //enter amount in textbox
        element(by.model('amount')).clear().sendKeys('678')

        //click on withdraw button
        element(by.className('btn btn-default')).click()

        //validate withdrawal is successful
        const sMsg = element(by.className('error ng-binding')).getText()
        expect(sMsg).toEqual('Transaction successful')

        //click on logout button
        element(by.className('btn logout')).click()

    })

    it('Validate invalid withdrawal from bank', () => {

        //select name from dropdown
        element(by.model('custId')).element(by.css('option[value="2"]')).click()

        //click on login button
        element(by.className('btn btn-default')).click()

        //validate the customer name
        const custName = element(by.className('fontBig ng-binding')).getText()
        expect(custName).toEqual('Harry Potter')

        //click on withdrawal tab
        element(by.css('button[ng-class="btnClass3"]')).click()

        //enter amount in textbox
        element(by.model('amount')).clear().sendKeys('422')

        //click on withdraw button
        element(by.className('btn btn-default')).click()

        //validate withdrawal is not successful and error message is displayed
        const sMsg = element(by.className('error ng-binding')).getText()
        expect(sMsg).toEqual('Transaction Failed. You can not withdraw amount more than the balance.')

        //click on logout button
        element(by.className('btn logout')).click()

    })

    it('Validate transaction history', ()=>{

        //select name from dropdown
        element(by.model('custId')).element(by.css('option[value="2"]')).click()

        //click on login button
        element(by.className('btn btn-default')).click()

        //validate the customer name
        const custName = element(by.className('fontBig ng-binding')).getText()
        expect(custName).toEqual('Harry Potter')

        //click on transactions tab
        element(by.css('button[ng-class="btnClass1"]')).click()

        //validate transaction history and display account balance
        let totalAcctBalance = 0

        let rows = element(by.css('table[class="table table-bordered table-striped"]'))
        .element(by.tagName('tbody')).all(by.tagName('tr'))

        rows.count().then(function(NoOfRows){

            for(let i = 0; i < NoOfRows; i++){
                
                rows.get(i).all(by.tagName('td')).get(2).getText().then(function(TxnType){

                    if(TxnType == 'Credit'){
                        
                        rows.get(i).all(by.tagName('td')).get(1).getText().then(function(creditAmt){
                            expect(creditAmt).toBe('1000')
                            totalAcctBalance += parseInt(creditAmt)
                            console.log("The updated account balance is : " + totalAcctBalance)
                        })

                    }else if(TxnType == 'Debit'){

                        rows.get(i).all(by.tagName('td')).get(1).getText().then(function(debitAmt){
                            expect(debitAmt).toBe('678')
                            totalAcctBalance -= parseInt(debitAmt)
                            console.log("The updated account balance is : " + totalAcctBalance)
                        })

                    }

                })

            }

        })

        //click on back button
        element(by.css('[ng-click="back()"]')).click()

        //click on logout button
        element(by.className('btn logout')).click()

        //click on home button
        element(by.css('[ng-click="home()"]')).click()

    })

})
