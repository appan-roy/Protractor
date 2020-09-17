const { browser, element, by } = require("protractor")

describe('Non Angular JS Application Suite', ()=>{

    it('Verify Orange HRM Login', ()=>{

        //to handle non angular js app
        browser.waitForAngularEnabled(false)

        browser.manage().window().maximize()
        browser.get('https://opensource-demo.orangehrmlive.com/')

        element(by.id('txtUsername')).clear().sendKeys('Admin')
        element(by.id('txtPassword')).clear().sendKeys('admin123')
        element(by.id('btnLogin')).click()

        element(by.id('welcome')).click()
        element(by.xpath('//*[@id="welcome-menu"]/ul/li[3]/a')).click()

    })

})
