const { browser, element, by } = require("protractor")

describe('Banking Test Suite - Manager Activities', () => {

    beforeAll(() => {

        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login')

        //click on manager login button
        element(by.css('[ng-click="manager()"]')).click()

    })

    it('Validate add customer', () => {

        //click on add customer tab
        element(by.css('button[ng-class="btnClass1"]')).click()

        //enter first name in textbox
        element(by.model('fName')).clear().sendKeys('Robert')

        //enter last name in textbox
        element(by.model('lName')).clear().sendKeys('Fischer')

        //enter post code in textbox
        element(by.model('postCd')).clear().sendKeys('E12345')

        //click on add customer button
        element(by.className('btn btn-default')).click()

        //validate customer add successful
        var alert = browser.switchTo().alert()
        var sMsg = alert.getText()
        expect(sMsg).toContain('Customer added successfully')
        alert.accept()

        //click on customer tab
        element(by.css('button[ng-class="btnClass3"]')).click()

        //validate the added customer is displayed at the last
        let rows = element(by.css('table[class="table table-bordered table-striped"]'))
        .element(by.tagName('tbody')).all(by.tagName('tr'))
        
        rows.count().then(function(NoOfRows){

            rows.get(NoOfRows-1).all(by.tagName('td')).get(0).getText().then(function(firstName){
                expect(firstName).toBe('Robert')
            })

            rows.get(NoOfRows-1).all(by.tagName('td')).get(1).getText().then(function(lastName){
                expect(lastName).toBe('Fischer')
            })

            rows.get(NoOfRows-1).all(by.tagName('td')).get(2).getText().then(function(postCode){
                expect(postCode).toBe('E12345')
            })

        })

    })

    it('Validate open account', ()=>{

        //click on open account tab
        element(by.css('button[ng-class="btnClass2"]')).click()

        //select customer name from dropdown
        element(by.model('custId')).element(by.css('option[value="6"]')).click()

        //select currency from dropdown
        element(by.model('currency')).element(by.css('option[value="Dollar"]')).click()

        //click on process button
        element(by.css('button[type="submit"]')).click()

        //validate account creation successful
        var alert = browser.switchTo().alert()
        var sMsg = alert.getText()
        expect(sMsg).toContain('Account created successfully')
        alert.accept()

        //click on customer tab
        element(by.css('button[ng-class="btnClass3"]')).click()

        //validate the newly added account is displayed
        let rows = element(by.css('table[class="table table-bordered table-striped"]'))
        .element(by.tagName('tbody')).all(by.tagName('tr'))
        
        rows.count().then(function(NoOfRows){

            let allAccounts = rows.get(NoOfRows-1).all(by.tagName('td')).get(3).all(by.tagName('span'))

            allAccounts.get(0).getText().then(function(firstAcctNo){
                expect(firstAcctNo).toBe('1016')
            })

        })

        //click on home
        element(by.css('[ng-click="home()"]')).click()

    })

})
