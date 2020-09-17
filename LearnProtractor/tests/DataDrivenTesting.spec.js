const xlsx = require('../lib/Library')
const prop = require('../test_config/properties.json')
const init = require('../test_config/EnvSettings')
const loginPage = require('../custom_commands/pages/CuraLoginPage')
const homePage = require('../custom_commands/pages/CuraHomePage')
const finalPage = require('../custom_commands/pages/CuraFinalPage')
const { element, by } = require("protractor")

describe('Data Driven Suite', () => {

    beforeAll(() => {

        //initialize all settings
        init.initAllSettings()

        //open application
        init.startApplication(prop.appUrl)

    })

    beforeEach(() => {

        //click on make appointment button
        loginPage.makeAppointment()

        //login to application
        loginPage.enterUsername(prop.username)
        loginPage.enterPassword(prop.password)
        loginPage.clickOnLoginButton()

    })

    afterEach(() => {

        //logout from application
        finalPage.clickOnMenu()
        finalPage.clickOnLogoutLink()

    })

    //iterate test cases through each data sets
    let data_sets = xlsx.readExcelData('./test_data/CURA Appointment Data.xlsx', 'Data Sets')

    data_sets.forEach(function(data){

        it('Validate appointment booking in CURA Healthcare Service', () => {

            //book appointment
            homePage.selectFacility(data.FacilityName)
            homePage.applyReadmission(data.Readmission)
            homePage.chooseProgram(data.ProgramName)
            homePage.enterVisitDate(data.VisitDate)
            homePage.enterComment(data.FacilityName + ' center booked')
            homePage.clickOnBookAppointmentButton()
    
            //validate appointment info
            let summary = element(by.css('section[id="summary"]')).element(by.tagName('div')).element(by.tagName('div'))
                .all(by.tagName('div'))
    
            summary.get(0).element(by.tagName('h2')).getText().then(function (conf_msg) {
                expect(conf_msg).toBe('Appointment Confirmation')
            })
    
            element(by.id('facility')).getText().then(function (facilityName) {
                expect(facilityName).toBe(data.FacilityName + ' CURA Healthcare Center')
            })
    
            element(by.id('hospital_readmission')).getText().then(function (readmission) {
                expect(readmission).toBe(data.Readmission)
            })
    
            element(by.id('program')).getText().then(function (programName) {
                expect(programName).toBe(data.ProgramName)
            })
    
            element(by.id('visit_date')).getText().then(function (visitDate) {
                expect(visitDate).toBe(data.VisitDate)
            })
    
            element(by.id('comment')).getText().then(function (commentText) {
                expect(commentText).toBe(data.FacilityName + ' center booked')
            })
    
        })

    })

})
