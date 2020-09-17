var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "Validate bank deposit|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 11012,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00cc0054-007b-0052-009e-005900bc002e.png",
        "timestamp": 1600342070588,
        "duration": 4234
    },
    {
        "description": "Validate valid withdrawal from bank|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 11012,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "008d00fb-00a1-0004-00be-007500240017.png",
        "timestamp": 1600342076127,
        "duration": 2595
    },
    {
        "description": "Validate invalid withdrawal from bank|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 11012,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.way2automation.com/angularjs-protractor/banking/account.service.js 33:18 \"Can not perform this transaction\"",
                "timestamp": 1600342081673,
                "type": ""
            }
        ],
        "screenShotFile": "009300ff-0008-0071-004e-00160035009a.png",
        "timestamp": 1600342079909,
        "duration": 2122
    },
    {
        "description": "Validate transaction history|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 11012,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0039008f-00be-00a4-0007-0080009e005a.png",
        "timestamp": 1600342083165,
        "duration": 3611
    },
    {
        "description": "Validate add customer|Banking Test Suite - Manager Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8700,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006000d3-0087-0076-00eb-00c40010005d.png",
        "timestamp": 1600342100561,
        "duration": 5594
    },
    {
        "description": "Validate open account|Banking Test Suite - Manager Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8700,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a70032-00d6-00e5-0047-004600eb00e9.png",
        "timestamp": 1600342107467,
        "duration": 2806
    },
    {
        "description": "Verify result|Angular Calculator DDT Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8312,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00cb0058-005a-0014-00d4-00e600930080.png",
        "timestamp": 1600342124968,
        "duration": 27
    },
    {
        "description": "Validate appointment in Seoul CURA Healthcare Center|CURA Healthcare Service - Book Appointment",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7920,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://katalon-demo-cura.herokuapp.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1600342159432,
                "type": ""
            }
        ],
        "screenShotFile": "005a008b-00a6-00f0-002a-0031001e0081.png",
        "timestamp": 1600342154183,
        "duration": 15095
    },
    {
        "description": "Validate appointment booking in CURA Healthcare Service|Data Driven Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10368,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://katalon-demo-cura.herokuapp.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1600342188641,
                "type": ""
            }
        ],
        "screenShotFile": "002a0048-00ff-0002-00c9-0093004a0032.png",
        "timestamp": 1600342188345,
        "duration": 13106
    },
    {
        "description": "Validate appointment booking in CURA Healthcare Service|Data Driven Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10368,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b70033-002e-000f-0014-00df003f001f.png",
        "timestamp": 1600342205940,
        "duration": 19112
    },
    {
        "description": "Validate appointment booking in CURA Healthcare Service|Data Driven Suite",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 10368,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL."
        ],
        "trace": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "00420014-00d3-008d-00f6-005e003b0074.png",
        "timestamp": 1600342229466,
        "duration": 85945
    },
    {
        "description": "Validate frame 1 object accessibility|Frames Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10444,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342376253,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342376598,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342376599,
                "type": ""
            }
        ],
        "screenShotFile": "006100a2-0065-0063-0047-0067009e000b.png",
        "timestamp": 1600342376923,
        "duration": 878
    },
    {
        "description": "Validate frame 2 object accessibility|Frames Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10444,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342379044,
                "type": ""
            }
        ],
        "screenShotFile": "00c10068-0023-00b3-0062-007a001e0036.png",
        "timestamp": 1600342379201,
        "duration": 592
    },
    {
        "description": "Validate frame 3 object accessibility|Frames Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10444,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342381118,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342382833,
                "type": ""
            }
        ],
        "screenShotFile": "004c003d-0010-001d-0091-00b0009300a9.png",
        "timestamp": 1600342381105,
        "duration": 2062
    },
    {
        "description": "Verify mouse hover|Mouse Actions Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9084,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/ - [DOM] Found 2 elements with non-unique id #csrf_token: (More info: https://goo.gl/9p2vKq) %o %o",
                "timestamp": 1600342400245,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/webres_5f61a473615588.75870608/js/jquery/jquery-3.4.1.min.js 1 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1600342406431,
                "type": ""
            }
        ],
        "screenShotFile": "0094003a-00ca-00b7-0001-0049006200ca.png",
        "timestamp": 1600342393029,
        "duration": 17925
    },
    {
        "description": "Verify double click|Mouse Actions Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9084,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342414023,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342415689,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342416408,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342416927,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342417404,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342418224,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600342418284,
                "type": ""
            }
        ],
        "screenShotFile": "00f5001b-00a5-00fb-009e-00fb007e00d7.png",
        "timestamp": 1600342412475,
        "duration": 4850
    },
    {
        "description": "Verify right click|Mouse Actions Suite",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9084,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Temporarily disabled with xit",
        "browserLogs": [],
        "screenShotFile": "0089005b-0030-00cc-00c4-00ab007b00e8.png",
        "timestamp": 1600342419927,
        "duration": 0
    },
    {
        "description": "Verify drag and drop|Mouse Actions Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9084,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://codef0rmer.github.io/angular-dragdrop/#!/ - Mixed Content: The page at 'https://codef0rmer.github.io/angular-dragdrop/#!/' was loaded over HTTPS, but requested an insecure stylesheet 'http://twitter.github.io/bootstrap/assets/js/google-code-prettify/prettify.css'. This request has been blocked; the content must be served over HTTPS.",
                "timestamp": 1600342420883,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://codef0rmer.github.io/favicon.ico - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600342431738,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js 2 Mixed Content: The page at 'https://codef0rmer.github.io/angular-dragdrop/#!/' was loaded over HTTPS, but requested an insecure frame 'http://ghbtns.com/github-btn.html?user=codef0rmer&repo=angular-dragdrop&type=watch&count=true'. This request has been blocked; the content must be served over HTTPS.",
                "timestamp": 1600342431738,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js 2 Mixed Content: The page at 'https://codef0rmer.github.io/angular-dragdrop/#!/' was loaded over HTTPS, but requested an insecure frame 'http://ghbtns.com/github-btn.html?user=codef0rmer&repo=angular-dragdrop&type=fork&count=true'. This request has been blocked; the content must be served over HTTPS.",
                "timestamp": 1600342431738,
                "type": ""
            }
        ],
        "screenShotFile": "005200c2-0003-006e-003c-0002003d00e7.png",
        "timestamp": 1600342420018,
        "duration": 12161
    },
    {
        "description": "Validate multi form inputs|Multi Form Test Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8760,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "008500e0-00d8-008c-00df-00fe00ef00c7.png",
        "timestamp": 1600342441249,
        "duration": 9824
    },
    {
        "description": "Verify Orange HRM Login|Non Angular JS Application Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 6244,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/ - [DOM] Found 2 elements with non-unique id #csrf_token: (More info: https://goo.gl/9p2vKq) %o %o",
                "timestamp": 1600342469467,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/webres_5f61a473615588.75870608/js/jquery/jquery-3.4.1.min.js 1 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1600342474271,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/index.php/auth/login - [DOM] Found 2 elements with non-unique id #csrf_token: (More info: https://goo.gl/9p2vKq) %o %o",
                "timestamp": 1600342478354,
                "type": ""
            }
        ],
        "screenShotFile": "006e0031-0087-00b6-00fe-008c00cb0065.png",
        "timestamp": 1600342460886,
        "duration": 17556
    },
    {
        "description": "Verify login|POM Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 6664,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006c0045-00ec-00d4-0000-00700075002f.png",
        "timestamp": 1600342491288,
        "duration": 4628
    },
    {
        "description": "Verify checkbox operations|Web Elements Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 11076,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00cb0087-00b0-0032-002b-00d200bc0006.png",
        "timestamp": 1600342505917,
        "duration": 11571
    },
    {
        "description": "Validate product info and delete a product|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9788,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005b0063-00e1-001e-0097-00e000710037.png",
        "timestamp": 1600342527244,
        "duration": 10074
    },
    {
        "description": "Validate user info after adding a user|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9788,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c100f1-00f2-0088-00e3-004e00fa0016.png",
        "timestamp": 1600342538661,
        "duration": 11274
    },
    {
        "description": "Validate web table iteration and data elements accessibility|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9788,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "002a00b2-00d3-008b-00dc-0083007700d5.png",
        "timestamp": 1600342551099,
        "duration": 20085
    },
    {
        "description": "Validate email and cell number of a particular user|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9788,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0005003c-0022-002c-005f-0003007f00c4.png",
        "timestamp": 1600342572303,
        "duration": 5099
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
