// An example configuration file.
var HtmlReporter = require('protractor-beautiful-reporter');

exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    shardTestFiles: true
  },

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine',

  // Spec patterns are relative to the current working directory when
  // protractor is called.
  specs: ['../tests/*.spec.js'],

  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },

  // Assign the test reporter to each running instance
  onPrepare: function () {
    
    var AllureReporter = require('jasmine-allure-reporter');
    jasmine.getEnv().addReporter(new AllureReporter({
      resultsDir: './target/allure-results'
    }));

    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: 'target/beautiful-results/screenshots'
    }).getJasmine2Reporter());

  }

};
