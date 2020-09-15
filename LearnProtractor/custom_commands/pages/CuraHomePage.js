const { element, by } = require("protractor")

const curaHomePg = function(){

    let facility = element(by.id('combo_facility'))
    let hospital_readmission = element(by.id('chk_hospotal_readmission'))
    let medicare_program = element(by.id('radio_program_medicare'))
    let medicaid_program = element(by.id('radio_program_medicaid'))
    let none_program = element(by.id('radio_program_none'))
    let visit_date = element(by.id('txt_visit_date'))
    let txt_comment = element(by.id('txt_comment'))
    let book_appointment = element(by.id('btn-book-appointment'))

    this.selectFacility = function(facility_name){
        if(facility_name == 'Tokyo'){
            facility.all(by.tagName('option')).get(0).click()
        }else if(facility_name == 'Hongkong'){
            facility.all(by.tagName('option')).get(1).click()
        }else{
            facility.all(by.tagName('option')).get(2).click()
        }
    }

    this.applyReadmission = function(opinion){
        if(opinion == 'Yes'){
            hospital_readmission.click()
        }
    }

    this.chooseProgram = function(program){
        if(program == 'Medicare'){
            medicare_program.click()
        }else if(program == 'Medicaid'){
            medicaid_program.click()
        }else{
            none_program.click()
        }
    }

    this.enterVisitDate = function(date){
        visit_date.clear()
        visit_date.sendKeys(date)
    }

    this.enterComment = function(comment){
        txt_comment.clear()
        txt_comment.sendKeys(comment)
    }

    this.clickOnBookAppointmentButton = function(){
        book_appointment.click()
    }

}

module.exports = new curaHomePg()
