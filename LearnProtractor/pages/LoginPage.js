const { element, by } = require("protractor")

const loginPage = function(){

    const uname1 = element(by.model("Auth.user.name"))

    const pwd = element(by.model("Auth.user.password"))

    const uname2 = element(by.model("model[options.key]"))

    const loginBtn = $('[ng-click="Auth.login()"]')     //$() is the shortcut for css selector

    this.enterUsername1 = function(userName1){
        uname1.sendKeys(userName1)
    }

    this.enterPassword = function(password){
        pwd.sendKeys(password)
    }

    this.enterUsername2 = function(userName2){
        uname2.sendKeys(userName2)
    }

    this.clickOnLoginButton = function(){
        loginBtn.click()
    }

}

module.exports = new loginPage()
