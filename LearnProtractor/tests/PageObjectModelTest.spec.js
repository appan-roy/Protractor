const loginpage = require('../pages/LoginPage')
const LoginPage = require('../pages/LoginPage')
const homepage = require('../pages/HomePage')
const { browser } = require('protractor')

describe('POM Suite', ()=>{

    it('Verify login', ()=>{

        browser.manage().window().maximize()
        browser.get("http://www.way2automation.com/angularjs-protractor/registeration/#/login")

        loginpage.enterUsername1('angular')
        loginpage.enterPassword('password')
        loginpage.enterUsername2('description')
        loginpage.clickOnLoginButton()

        homepage.verifyLogin("You're logged in!!")
        homepage.clickOnLogoutLink()

    })

})