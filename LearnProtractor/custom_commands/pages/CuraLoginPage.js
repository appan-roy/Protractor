const { element, by } = require("protractor")

const curaLoginPg = function(){

    let make_appointment = element(by.id('btn-make-appointment'))
    let username = element(by.name('username'))
    let password = element(by.name('password'))
    let loginBtn = element(by.id('btn-login'))

    this.makeAppointment = function(){
        make_appointment.click()
    }

    this.enterUsername = function(uname){
        username.clear()
        username.sendKeys(uname)
    }

    this.enterPassword = function(pwd){
        password.clear()
        password.sendKeys(pwd)
    }

    this.clickOnLoginButton = function(){
        loginBtn.click()
    }

}

module.exports = new curaLoginPg()
