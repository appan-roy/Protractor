const loginpage = require('../pages/LoginPage')
const homepage = require('../pages/HomePage')
const { browser } = require('protractor')

describe('POM Suite', ()=>{

    beforeAll(()=>{
        browser.manage().window().maximize()
        browser.get("http://www.way2automation.com/angularjs-protractor/registeration/#/login")
        browser.manage().timeouts().implicitlyWait(30000)
    })

    it('Verify login', ()=>{

        //login page operations
        loginpage.enterUsername1('angular')
        loginpage.enterPassword('password')
        loginpage.enterUsername2('description')
        loginpage.clickOnLoginButton()

        //home page operations
        homepage.verifyLoginMessage("You're logged in!!")
        homepage.clickOnLogoutLink()

    })

})
