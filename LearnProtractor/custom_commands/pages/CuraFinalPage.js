const { element, by } = require("protractor")

const curaFinalPg = function(){

    let menu = element(by.css('i[class="fa fa-bars"]'))
    let sidebar = element(by.id('sidebar-wrapper'))

    this.clickOnMenu = function(){
        menu.click()
    }

    this.clickOnLogoutLink = function(){
        sidebar.element(by.tagName('ul')).all(by.tagName('li')).get(4).element(by.tagName('a')).click()
    }

}

module.exports = new curaFinalPg()
