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

}

module.exports = new library()
