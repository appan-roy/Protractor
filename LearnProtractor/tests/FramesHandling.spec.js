const { browser, element, by } = require("protractor")

describe('Frames Handling Suite', ()=>{

    beforeAll(()=>{
        
        browser.waitForAngularEnabled(false)

        browser.manage().window().maximize()

        browser.get('https://www.selenium.dev/selenium/docs/api/java/index')

    })

    it('Validate frame 1 object accessibility', ()=>{

        //move to frame 1
        browser.switchTo().frame('packageListFrame')

        //perform click inside frame 1
        element(by.linkText('org.openqa.selenium')).click()

        //switch back to default content
        browser.switchTo().defaultContent()

    })

    it('Validate frame 2 object accessibility', ()=>{

        //move to frame 2
        browser.switchTo().frame('packageFrame')

        //perform click inside frame 2
        element(by.xpath('/html/body/div/ul[1]/li[2]/a/span')).click()

        //switch back to default content
        browser.switchTo().defaultContent()

    })

    it('Validate frame 3 object accessibility', ()=>{

        //move to frame 3
        browser.switchTo().frame('classFrame')

        //perform click inside frame 3
        element(by.linkText('DesiredCapabilities')).click()

        //switch back to default content
        browser.switchTo().defaultContent()

    })

})
