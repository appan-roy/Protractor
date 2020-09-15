const { browser } = require("protractor")

const testConfiguration = function(){

    this.initAllSettings = function(){
        browser.waitForAngularEnabled(false)
    }

    this.startApplication = function(url){
        browser.manage().window().maximize()
        browser.get(url)
    }

}

module.exports = new testConfiguration()
