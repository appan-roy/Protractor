const { browser, element, by } = require("protractor")

describe('Multi Form Test Suite', ()=>{

    it('Validate multi form inputs', ()=>{

        //maximize the browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('http://www.way2automation.com/angularjs-protractor/multiform/#/form/profile')

        //enter name in textbox
        element(by.model('formData.name')).clear().sendKeys('John')

        //enter email in textbox
        element(by.model('formData.email')).clear().sendKeys('abc@xyz.com')

        //click on next section button
        element(by.className('btn btn-block btn-info')).click()

        //click on i like xbox radio button
        element(by.model('formData.type')).click()

        //click on next section button
        element(by.className('btn btn-block btn-info')).click()

        //click on submit button
        element(by.xpath('//*[@id="form-views"]/div/button')).click()

        //validate alert message is present and accept
        const alert = browser.switchTo().alert()
        if(alert){
            expect(alert.getText()).toEqual('awesome!')
            alert.accept()
        }

        //validate test completed message
        expect(element(by.xpath('//*[@id="form-views"]/div/h3')).getText()).toEqual('Test Completed, WooHoo!')
        
    })

})
