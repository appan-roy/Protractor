const { browser, element, by } = require("protractor")

describe('Web Elements Handling Suite', () => {

    it('Verify checkbox operations', () => {

        browser.manage().window().maximize()
        browser.get('http://www.way2automation.com/angularjs-protractor/checkboxes/')

        //capture all checkbox elements
        let inside = element.all(by.repeater('division in data')).get(0)
        let home_improvement = inside.all(by.repeater('cat in division')).get(0)
        let painting = inside.all(by.repeater('cat in division')).get(1)

        let outside = element.all(by.repeater('division in data')).get(1)
        let garage_improvement = outside.all(by.repeater('cat in division')).get(0)
        let car = outside.all(by.repeater('cat in division')).get(1)
        
        let boxCutter = home_improvement.all(by.repeater('prod in cat')).get(0).element(by.css('input[type="checkbox"]'))
        let hammer = home_improvement.all(by.repeater('prod in cat')).get(1).element(by.css('input[type="checkbox"]'))
        let screwDriver = home_improvement.all(by.repeater('prod in cat')).get(2).element(by.css('input[type="checkbox"]'))

        let redPaint = painting.all(by.repeater('prod in cat')).get(0).element(by.css('input[type="checkbox"]'))
        let greenPaint = painting.all(by.repeater('prod in cat')).get(1).element(by.css('input[type="checkbox"]'))
        let bluePaint = painting.all(by.repeater('prod in cat')).get(2).element(by.css('input[type="checkbox"]'))
        let coarseBrush = painting.all(by.repeater('prod in cat')).get(3).element(by.css('input[type="checkbox"]'))

        let axe = garage_improvement.all(by.repeater('prod in cat')).get(0).element(by.css('input[type="checkbox"]'))
        let chainsaw = garage_improvement.all(by.repeater('prod in cat')).get(1).element(by.css('input[type="checkbox"]'))
        let leafBlower = garage_improvement.all(by.repeater('prod in cat')).get(2).element(by.css('input[type="checkbox"]'))

        let spareTires = car.all(by.repeater('prod in cat')).get(0).element(by.css('input[type="checkbox"]'))
        let exhaustionPipe = car.all(by.repeater('prod in cat')).get(1).element(by.css('input[type="checkbox"]'))
        let gearBox = car.all(by.repeater('prod in cat')).get(2).element(by.css('input[type="checkbox"]'))
        let firstAidKit = car.all(by.repeater('prod in cat')).get(3).element(by.css('input[type="checkbox"]'))

        //verify boxcutter checkbox is selected, deselect it
        if (boxCutter.isSelected()) {
            boxCutter.click()
        }

        //verify hammer checkbox is disabled
        if (hammer.isEnabled()) {
            console.log('Hammer checkbox is disabled')
        }

        //verify screwdriver checkbox is not selected, select it
        if (screwDriver.isSelected() !== true) {
            screwDriver.click()
        }

        //verify redpaint checkbox is not selected, select it
        if (redPaint.isSelected() !== true) {
            redPaint.click()
        }

        //verify greenpaint checkbox is selected, deselect it
        if (greenPaint.isSelected()) {
            greenPaint.click()
        }

        //verify bluepaint checkbox is disabled
        if (bluePaint.isEnabled()) {
            console.log('Blue paint checkbox is disabled')
        }

        //verify coarse brush checkbox is selected, deselect it
        if (coarseBrush.isSelected()) {
            coarseBrush.click()
        }

        //verify axe checkbox is selected, deselect it
        if (axe.isSelected()) {
            axe.click()
        }

        //verify chainsaw checkbox is selected, deselect it
        if (chainsaw.isSelected()) {
            chainsaw.click()
        }

        //verify leaf blower checkbox is not selected, select it
        if (leafBlower.isSelected() !== true) {
            leafBlower.click()
        }

        //verify spare tires checkbox is not selected, select it
        if (spareTires.isSelected() !== true) {
            spareTires.click()
        }

        //verify exhaustion pipe checkbox is selected, deselect it
        if (exhaustionPipe.isSelected()) {
            exhaustionPipe.click()
        }

        //verify gearbox checkbox is disabled
        if (gearBox.isEnabled()) {
            console.log('Gearbox checkbox is disabled')
        }

        //verify first aid kit checkbox is not selected, select it
        if (firstAidKit.isSelected() !== true) {
            firstAidKit.click()
        }

    })

})
