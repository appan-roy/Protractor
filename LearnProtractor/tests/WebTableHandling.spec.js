const { browser, element, by } = require("protractor")

describe('Web Table Handling Suite', ()=>{

    beforeAll(()=>{
        
        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('https://dassdevarajan.github.io/demo-app/')

    })

    it('Validate product info', ()=>{
        
        //expected product info
        var productName = 'HP 14 Core i3 Laptop'
        var description = 'Processor: 7th Generation Intel core i3-7020U processor, 2.3GHz base processor speed. Operating System: Pre-loaded Windows 10 Home with lifetime validity. Display: 14-inch HD (1366x768) display'
        var category = 'Electronics'
        var quantity = '10'
        var unitPrice = '450'
        var supplier = 'HP'
        var returnable = 'true'

        //navigate to product view
        element.all(by.tagName('tr')).get(2).element(by.id('view')).click()
        expect(element(by.tagName('h3')).getText()).toBe('Product View')

        //validate product info
        expect(element.all(by.tagName('tr')).get(0).element(by.tagName('td')).getText()).toBe(productName)
        expect(element.all(by.tagName('tr')).get(1).element(by.tagName('td')).getText()).toBe(description)
        expect(element.all(by.tagName('tr')).get(2).element(by.tagName('td')).getText()).toBe(category)
        expect(element.all(by.tagName('tr')).get(3).element(by.tagName('td')).getText()).toBe(quantity)
        expect(element.all(by.tagName('tr')).get(4).element(by.tagName('td')).getText()).toBe(unitPrice)
        expect(element.all(by.tagName('tr')).get(5).element(by.tagName('td')).getText()).toBe(supplier)
        expect(element.all(by.tagName('tr')).get(6).element(by.tagName('td')).getText()).toBe(returnable)

        //navigate back to product list
        element(by.id('list-menu')).click()
        expect(element(by.tagName('h3')).getText()).toBe('Product List')

    })

    it('Delete product', ()=>{

        //delete the last product from the table
        element.all(by.tagName('tr')).last().element(by.id('delete')).click()

    })

})
