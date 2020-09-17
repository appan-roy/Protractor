const { browser, element, by, protractor } = require("protractor")

describe('Mouse Actions Suite', ()=>{

    it('Verify mouse hover', ()=>{

        browser.waitForAngularEnabled(false)
        browser.manage().window().maximize()
        browser.get('https://opensource-demo.orangehrmlive.com/')

        element(by.id('txtUsername')).clear().sendKeys('Admin')
        element(by.id('txtPassword')).clear().sendKeys('admin123')
        element(by.id('btnLogin')).click()

        //capture elements on which mouse over needs to be performed
        var admin = element(by.id('menu_admin_viewAdminModule'))
        var user_management = element(by.id('menu_admin_UserManagement'))
        var users = element(by.id('menu_admin_viewSystemUsers'))

        //perform nested mouse hover
        browser.actions().mouseMove(admin).mouseMove(user_management).mouseMove(users).click().perform()

    })

    it('Verify double click', ()=>{

        browser.waitForAngularEnabled(false)
        browser.manage().window().maximize()
        browser.get('http://testautomationpractice.blogspot.com/')

        //capture element on which double click needs to be performed
        var button = element(by.css("button[ondblclick='myFunction1()']"))

        //perform double click
        browser.actions().doubleClick(button).perform()

    })

    //disable this test with xit
    xit('Verify right click', ()=>{

        browser.waitForAngularEnabled(false)
        browser.manage().window().maximize()
        browser.get('https://www.google.com/')

        //capture element on which right click needs to be performed
        var luckyBtn = element(by.xpath('//*[@id="tsf"]/div[2]/div[1]/div[3]/center/input[2]'))

        //perform right click
        browser.actions().click(luckyBtn, protractor.Button.RIGHT).perform()

    })

    it('Verify drag and drop', ()=>{

        browser.manage().window().maximize()
        browser.get('https://codef0rmer.github.io/angular-dragdrop/#!/')
        browser.sleep(10000)

        //capture source and destination elements for drag and drop operation
        let src = element(by.model('list1'))
        let dest = element(by.model('list2'))

        //perform drag and drop operation
        browser.actions().dragAndDrop(src, dest).perform()

    })

})
