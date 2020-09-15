const { browser, element, by } = require("protractor")

describe('Web Table Handling Suite', ()=>{

    it('Validate product info and delete a product', ()=>{
        
        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('https://dassdevarajan.github.io/demo-app/')

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

        //delete the last product from the table
        element.all(by.tagName('tr')).last().element(by.id('delete')).click()

    })

    it('Validate user info after adding a user', ()=>{

        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('http://www.way2automation.com/angularjs-protractor/webtables/')

        //click on add user
        element(by.css('button[type="add"]')).click()

        //fill user details
        element(by.name('FirstName')).sendKeys('Robert')
        element(by.name('LastName')).sendKeys('Fischer')
        element(by.name('UserName')).sendKeys('bobby')
        element(by.name('Password')).sendKeys('chess123')
        element.all(by.css('input[type="radio"]')).first().click()
        element(by.name('RoleId')).element(by.css('option[value="1"]')).click()
        element(by.name('Email')).sendKeys('bobby@xyz.com')
        element(by.name('Mobilephone')).sendKeys('9988776655')

        //click on save button
        element(by.css('button[ng-click="save(user)"]')).click()

        //validate user info
        expect(element.all(by.exactRepeater('dataRow in displayedCollection')).first()
        .all(by.exactRepeater('column in columns')).get(0).getText()).toBe('Robert')

        expect(element.all(by.exactRepeater('dataRow in displayedCollection')).first()
        .all(by.exactRepeater('column in columns')).get(1).getText()).toBe('Fischer')

        expect(element.all(by.exactRepeater('dataRow in displayedCollection')).first()
        .all(by.exactRepeater('column in columns')).get(2).getText()).toBe('bobby')

        expect(element.all(by.exactRepeater('dataRow in displayedCollection')).first()
        .all(by.exactRepeater('column in columns')).get(5).getText()).toBe('Customer')

        expect(element.all(by.exactRepeater('dataRow in displayedCollection')).first()
        .all(by.exactRepeater('column in columns')).get(6).getText()).toBe('bobby@xyz.com')

        expect(element.all(by.exactRepeater('dataRow in displayedCollection')).first()
        .all(by.exactRepeater('column in columns')).get(7).getText()).toBe('9988776655')

    })

    it('Validate web table iteration and data elements accessibility', ()=>{

        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('http://www.way2automation.com/angularjs-protractor/webtables/')

        let rows = element(by.css('table[table-title="Smart Table example"]')).element(by.tagName('tbody')).all(by.tagName('tr'))

        rows.count().then(function(NoOfRows){

            for(let i = 0; i < NoOfRows; i++){

                let columns = rows.get(i).all(by.tagName('td'))

                columns.count().then(function(NoOfColumns){

                    for(let j = 0; j < NoOfColumns; j++){

                        columns.get(j).getText().then(function(data){

                            process.stdout.write(data+"\t")

                        })

                        console.log()

                    }

                })

            }

        })

    })

    it('Validate email and cell number of a particular user', ()=>{

        //maximize browser
        browser.manage().window().maximize()

        //navigate to url
        browser.get('http://www.way2automation.com/angularjs-protractor/webtables/')

        let rows = element(by.css('table[table-title="Smart Table example"]')).element(by.tagName('tbody')).all(by.tagName('tr'))

        rows.count().then(function(NoOfRows){

            for(let i = 0; i < NoOfRows; i++){

                let columns = rows.get(i).all(by.tagName('td'))

                columns.get(0).getText().then(function(fname){

                    if(fname == 'Mark'){

                        columns.get(6).getText().then(function(email){

                            columns.get(7).getText().then(function(cellNo){
                                
                                console.log(fname+"'s email id : "+email)
                                console.log(fname+"'s cell number : "+cellNo)

                                expect(email).toBe('asa@asd.cz')
                                expect(cellNo).toBe('777888444')

                            })

                        })

                    }

                })

            }

        })

    })

})
