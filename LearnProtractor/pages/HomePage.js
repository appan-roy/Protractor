const { element } = require("protractor")

const homePage = function(){

    const loginText = $("body > div.jumbotron > div > div > div > p:nth-child(2)")

    const logoutLink = element(by.css("body > div.jumbotron > div > div > div > p:nth-child(3) > a"))

    this.verifyLoginMessage = function(welcomemsg){
        expect(loginText.getText()).toEqual(welcomemsg)
    }

    this.clickOnLogoutLink = function(){
        logoutLink.click()
    }

}

module.exports = new homePage()
