const init = require('../test_config/EnvSettings')
const loginPage = require('../custom_commands/pages/CuraLoginPage')
const homePage = require('../custom_commands/pages/CuraHomePage')
const finalPage = require('../custom_commands/pages/CuraFinalPage')
const { element, by } = require("protractor")

describe('CURA Healthcare Service - Book Appointment', ()=>{

    beforeAll(()=>{
        
        //initialize all settings
        init.initAllSettings()

    })

    beforeEach(()=>{
        
        //open application
        init.startApplication('https://katalon-demo-cura.herokuapp.com/')
        
        //click on make appointment button
        loginPage.makeAppointment()
        
        //login to application
        loginPage.enterUsername('John Doe')
        loginPage.enterPassword('ThisIsNotAPassword')
        loginPage.clickOnLoginButton()

    })

    afterEach(()=>{
        
        //logout from application
        finalPage.clickOnMenu()
        finalPage.clickOnLogoutLink()

    })

    it('Validate appointment in Seoul CURA Healthcare Center', ()=>{

        //book appointment
        homePage.selectFacility('Seoul')
        homePage.applyReadmission('Yes')
        homePage.chooseProgram('Medicaid')
        homePage.enterVisitDate('17/09/2020')
        homePage.enterComment('Please book my appointment')
        homePage.clickOnBookAppointmentButton()

        //validate appointment info
        let summary = element(by.css('section[id="summary"]')).element(by.tagName('div')).element(by.tagName('div'))
        .all(by.tagName('div'))

        summary.get(0).element(by.tagName('h2')).getText().then(function(conf_msg){
            expect(conf_msg).toBe('Appointment Confirmation')
        })

        element(by.id('facility')).getText().then(function(facilityName){
            expect(facilityName).toBe('Seoul CURA Healthcare Center')
        })

        element(by.id('hospital_readmission')).getText().then(function(readmission){
            expect(readmission).toBe('Yes')
        })

        element(by.id('program')).getText().then(function(programName){
            expect(programName).toBe('Medicaid')
        })

        element(by.id('visit_date')).getText().then(function(visitDate){
            expect(visitDate).toBe('17/09/2020')
        })

        element(by.id('comment')).getText().then(function(commentText){
            expect(commentText).toBe('Please book my appointment')
        })

    })

})
