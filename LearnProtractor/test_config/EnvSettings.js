const { browser } = require("protractor")

const testConfiguration = function(){

    this.initAllSettings = function(){
        browser.waitForAngularEnabled(false)
    }

    this.startApplication = function(url){
        browser.manage().window().maximize()
        browser.manage().timeouts().implicitlyWait(60000)
        browser.get(url)
    }

}

module.exports = new testConfiguration()
