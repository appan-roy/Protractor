const libmethods = require("../lib/Library")
const { browser, element, by } = require("protractor")

describe('Calculator Suite', () => {

    beforeAll(()=>{

        //navigate to url
        browser.get('http://juliemr.github.io/protractor-demo/')

        //maximize browser
        browser.manage().window().maximize()

    })

    it('Validate addition result', () => {

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

    it('Validate subtraction result', () => {

        //enter first number
        element(by.model('first')).sendKeys('7')

        //select operator for subtraction
        libmethods.selectDropdownbyIndex(element(by.model('operator')), 4)

        //enter second number
        element(by.model('second')).sendKeys('5')

        //click on go button
        element(by.css('[ng-click="doAddition()"]')).click()

        //validate result
        result = element(by.className('ng-binding')).getText()
        expect(result).toEqual('2')

    })

    it('Validate multiplication result', () => {

        //enter first number
        element(by.model('first')).sendKeys('7')

        //select operator for multiplication
        libmethods.selectDropdownbyIndex(element(by.model('operator')), 3)

        //enter second number
        element(by.model('second')).sendKeys('5')

        //click on go button
        element(by.css('[ng-click="doAddition()"]')).click()

        //validate result
        result = element(by.className('ng-binding')).getText()
        expect(result).toEqual('35')

    })

    it('Validate division result', () => {

        //enter first number
        element(by.model('first')).sendKeys('7')

        //select operator for division
        libmethods.selectDropdownbyIndex(element(by.model('operator')), 1)

        //enter second number
        element(by.model('second')).sendKeys('5')

        //click on go button
        element(by.css('[ng-click="doAddition()"]')).click()

        //validate result
        result = element(by.className('ng-binding')).getText()
        expect(result).toEqual('1.4')

    })

    it('Validate modulo result', () => {

        //enter first number
        element(by.model('first')).sendKeys('7')

        //select operator for modulo
        libmethods.selectDropdownbyIndex(element(by.model('operator')), 2)

        //enter second number
        element(by.model('second')).sendKeys('5')

        //click on go button
        element(by.css('[ng-click="doAddition()"]')).click()

        //validate result
        result = element(by.className('ng-binding')).getText()
        expect(result).toEqual('2')

    })

    it('Get number of history records', ()=>{

        //fetch number of history records
        const numOfRecords = element.all(by.repeater('result in memory')).count()

        //assertion
        expect(numOfRecords).toEqual(5)

    })

})
