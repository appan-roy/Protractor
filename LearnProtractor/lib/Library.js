const excel = require('xlsx')

const library = function(){

    //dropdown selection method
    this.selectDropdownbyIndex = function (element, index) {
        if (index) {
            var options = element.all(by.tagName('option'))
                .then(function (options) {
                    options[index].click();
                })
        }
    }

    //excel data reader
    this.readExcelData = function(filePath, sheetName){
        let workbook = excel.readFile(filePath)
        let worksheet = workbook.Sheets[sheetName]
        return excel.utils.sheet_to_json(worksheet)
    }

}

module.exports = new library()
