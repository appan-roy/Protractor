const { Workbook } = require('exceljs')
const { browser, element, by } = require('protractor')
const init = require('../test_config/EnvSettings')

describe('Angular Calculator DDT Suite', () => {

    beforeAll(() => {

        //start application
        init.startApplication('http://www.way2automation.com/angularjs-protractor/calc/')

    })

    it('Verify result', () => {

        //capture all elements
        let first_number = element(by.model('first'))
        let operator = element(by.model('operator'))
        let second_number = element(by.model('second'))
        let go_btn = element(by.id('gobutton'))
        let result_text = element(by.css('h2[class="ng-binding"]'))

        //create a workbook object
        let wb = new Workbook()

        //read excel file
        wb.xlsx.readFile('./test_data/Angular Calculator Data.xlsx').then(function () {

            //create a sheet object
            let sheet = wb.getWorksheet('calc')

            //get total rows
            let NumOfRows = sheet.rowCount

            //iterate through each row and operate on the elements
            for (let i = 2; i <= NumOfRows; i++) {

                //initialize test data
                let fNum = sheet.getRow(i).getCell(1).toString()
                let op = sheet.getRow(i).getCell(2).toString()
                let sNum = sheet.getRow(i).getCell(3).toString()

                //enter first number
                browser.wait(first_number.isEnabled(), 5000)
                first_number.clear()
                first_number.sendKeys(fNum)

                //select operator
                browser.wait(operator.isEnabled(), 5000)
                operator.sendKeys(op)

                //enter second number
                browser.wait(second_number.isEnabled(), 5000)
                second_number.clear()
                second_number.sendKeys(sNum)

                //click on go button
                browser.wait(go_btn.isEnabled(), 5000)
                go_btn.click()

                //capture result and validate
                browser.wait(result_text.isDisplayed(), 5000)
                result_text.getText().then(function(result){

                    if(op == '+'){
                        expect(result).toBe((parseInt(fNum) + parseInt(sNum)).toString())
                    }else if(op == '-'){
                        expect(result).toBe((parseInt(fNum) - parseInt(sNum)).toString())
                    }else if(op == '*'){
                        expect(result).toBe((parseInt(fNum) * parseInt(sNum)).toString())
                    }else if(op == '/'){
                        expect(result).toBe((parseInt(fNum) / parseInt(sNum)).toString())
                    }else if(op == '%'){
                        expect(result).toBe((parseInt(fNum) % parseInt(sNum)).toString())
                    }else{
                        console.log('Selected operator is out of scope. Please check and try again !!')
                    }
                    
                })

                //update the status in excel
                sheet.getRow(i).getCell(4).value = 'Done'

            }

            //write the updated file
            wb.xlsx.writeFile('./test_data/Angular Calculator Data.xlsx')

        })

    })

})
