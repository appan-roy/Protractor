const { browser, element, by } = require("protractor")

describe('Calculator Suite', ()=>{

    it('Validate addition result', ()=>{

        //navigate to url
        browser.get('http://juliemr.github.io/protractor-demo/')

        //maximize browser
        browser.manage().window().maximize()

        //enter first number
        element(by.model('first')).sendKeys('7')
        
        //enter second number
        element(by.model('second')).sendKeys('5')

        //click on go button
        element(by.css('[ng-click="doAddition()"]')).click()

        //validate result
        result = element(by.className('ng-binding')).getText()
        expect(result).toEqual('12')

    })

    it('Validate subtraction result', ()=>{

        //navigate to url
        browser.get('http://juliemr.github.io/protractor-demo/')

        //maximize browser
        browser.manage().window().maximize()

        //enter first number
        element(by.model('first')).sendKeys('7')
        
        //enter second number
        element(by.model('second')).sendKeys('5')

        //click on go button
        element(by.css('[ng-click="doAddition()"]')).click()

        //validate result
        result = element(by.className('ng-binding')).getText()
        expect(result).toEqual('2')

    })

})