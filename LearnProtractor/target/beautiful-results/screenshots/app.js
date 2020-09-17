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
        "instanceId": 4548,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b900b0-00cc-0047-00e2-00aa00d800de.png",
        "timestamp": 1600356523426,
        "duration": 4528
    },
    {
        "description": "Validate valid withdrawal from bank|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 4548,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00f100ca-0024-002c-0067-004800d0003b.png",
        "timestamp": 1600356528674,
        "duration": 2484
    },
    {
        "description": "Validate invalid withdrawal from bank|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 4548,
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
                "timestamp": 1600356533477,
                "type": ""
            }
        ],
        "screenShotFile": "009f005d-0080-0099-0098-002e009a006c.png",
        "timestamp": 1600356531743,
        "duration": 2088
    },
    {
        "description": "Validate transaction history|Banking Test Suite - Customer Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 4548,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00c00088-0043-0004-00ad-00d000ef0008.png",
        "timestamp": 1600356534410,
        "duration": 3462
    },
    {
        "description": "Validate add customer|Banking Test Suite - Manager Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7860,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009400b1-0014-0052-00ce-0055004f009c.png",
        "timestamp": 1600356550223,
        "duration": 5717
    },
    {
        "description": "Validate open account|Banking Test Suite - Manager Activities",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7860,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b6004b-0080-00ca-0045-00cd005a004c.png",
        "timestamp": 1600356556739,
        "duration": 2727
    },
    {
        "description": "Verify result|Angular Calculator DDT Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7960,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00100006-00d8-0014-00ae-00bd00220016.png",
        "timestamp": 1600356573504,
        "duration": 22
    },
    {
        "description": "Validate appointment in Seoul CURA Healthcare Center|CURA Healthcare Service - Book Appointment",
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
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://katalon-demo-cura.herokuapp.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1600356607762,
                "type": ""
            }
        ],
        "screenShotFile": "004d0066-00f5-009f-0054-009c00a800e1.png",
        "timestamp": 1600356602217,
        "duration": 15603
    },
    {
        "description": "Validate appointment booking in CURA Healthcare Service|Data Driven Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 4272,
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
                "timestamp": 1600356637887,
                "type": ""
            }
        ],
        "screenShotFile": "002e003a-0064-00e9-006f-00ef00ae0008.png",
        "timestamp": 1600356637603,
        "duration": 12057
    },
    {
        "description": "Validate appointment booking in CURA Healthcare Service|Data Driven Suite",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 4272,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Failed: No element found using locator: By(css selector, *[id=\"combo_facility\"])",
            "Failed: Index out of bound. Trying to access element at index: 4, but there are only 3 elements that match locator By(css selector, li)"
        ],
        "trace": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"combo_facility\"])\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at curaHomePg.selectFacility (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\custom_commands\\pages\\CuraHomePage.js:18:55)\n    at UserContext.<anonymous> (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:49:22)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run it(\"Validate appointment booking in CURA Healthcare Service\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at Timeout.<anonymous> (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4283:11)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)\nFrom asynchronous test: \nError\n    at E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:46:9\n    at Array.forEach (<anonymous>)\n    at Suite.<anonymous> (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:44:15)\n    at addSpecsToSuite (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:9:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)",
            "NoSuchElementError: Index out of bound. Trying to access element at index: 4, but there are only 3 elements that match locator By(css selector, li)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:274:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at curaFinalPg.clickOnLogoutLink (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\custom_commands\\pages\\CuraFinalPage.js:13:97)\n    at UserContext.<anonymous> (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:37:19)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run afterEach in control flow\n    at UserContext.<anonymous> (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at Timeout.<anonymous> (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4283:11)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:33:5)\n    at addSpecsToSuite (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\Softwares\\My PC Apps\\Protractor\\Workspace\\LearnProtractor\\tests\\DataDrivenTesting.spec.js:9:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "00cd008d-004d-00d6-0094-00d3009d007a.png",
        "timestamp": 1600356651894,
        "duration": 108081
    },
    {
        "description": "Validate appointment booking in CURA Healthcare Service|Data Driven Suite",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 4272,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL."
        ],
        "trace": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\APPAN\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)"
        ],
        "browserLogs": [],
        "screenShotFile": "00ca007a-0009-0093-00e7-009200380029.png",
        "timestamp": 1600356760765,
        "duration": 120042
    },
    {
        "description": "Validate frame 1 object accessibility|Frames Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10916,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356898462,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356898582,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356898852,
                "type": ""
            }
        ],
        "screenShotFile": "009800e0-0067-001a-0064-008900860067.png",
        "timestamp": 1600356899165,
        "duration": 925
    },
    {
        "description": "Validate frame 2 object accessibility|Frames Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10916,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356900720,
                "type": ""
            }
        ],
        "screenShotFile": "00350073-00a6-0077-00f8-00f0000200ed.png",
        "timestamp": 1600356900865,
        "duration": 572
    },
    {
        "description": "Validate frame 3 object accessibility|Frames Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 10916,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356902036,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.selenium.dev/selenium/docs/api/java/resources/fonts/dejavu.css - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356903378,
                "type": ""
            }
        ],
        "screenShotFile": "00d300e1-0024-00a2-0023-0083002e0008.png",
        "timestamp": 1600356902259,
        "duration": 1421
    },
    {
        "description": "Verify mouse hover|Mouse Actions Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8096,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/ - [DOM] Found 2 elements with non-unique id #csrf_token: (More info: https://goo.gl/9p2vKq) %o %o",
                "timestamp": 1600356917223,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/webres_5f61a473615588.75870608/js/jquery/jquery-3.4.1.min.js 1 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1600356922154,
                "type": ""
            }
        ],
        "screenShotFile": "00c5009c-0032-00e3-0077-00ce00fe00a2.png",
        "timestamp": 1600356911058,
        "duration": 15445
    },
    {
        "description": "Verify double click|Mouse Actions Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8096,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600356928748,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600356930675,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600356931636,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600356932119,
                "type": ""
            }
        ],
        "screenShotFile": "009c00ba-00d8-0078-00df-0073001800e9.png",
        "timestamp": 1600356927363,
        "duration": 5004
    },
    {
        "description": "Verify right click|Mouse Actions Suite",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 8096,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Temporarily disabled with xit",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600356932574,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://testautomationpractice.blogspot.com/ - Refused to apply style from 'http://testautomationpractice.blogspot.com/resources/demos/style.css' because its MIME type ('text/html') is not a supported stylesheet MIME type, and strict MIME checking is enabled.",
                "timestamp": 1600356933181,
                "type": ""
            }
        ],
        "screenShotFile": "00af0097-006e-00cf-0030-00ef00d6009e.png",
        "timestamp": 1600356933288,
        "duration": 1
    },
    {
        "description": "Verify drag and drop|Mouse Actions Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8096,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://codef0rmer.github.io/angular-dragdrop/#!/ - Mixed Content: The page at 'https://codef0rmer.github.io/angular-dragdrop/#!/' was loaded over HTTPS, but requested an insecure stylesheet 'http://twitter.github.io/bootstrap/assets/js/google-code-prettify/prettify.css'. This request has been blocked; the content must be served over HTTPS.",
                "timestamp": 1600356934166,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://codef0rmer.github.io/favicon.ico - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1600356945072,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js 2 Mixed Content: The page at 'https://codef0rmer.github.io/angular-dragdrop/#!/' was loaded over HTTPS, but requested an insecure frame 'http://ghbtns.com/github-btn.html?user=codef0rmer&repo=angular-dragdrop&type=watch&count=true'. This request has been blocked; the content must be served over HTTPS.",
                "timestamp": 1600356945073,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js 2 Mixed Content: The page at 'https://codef0rmer.github.io/angular-dragdrop/#!/' was loaded over HTTPS, but requested an insecure frame 'http://ghbtns.com/github-btn.html?user=codef0rmer&repo=angular-dragdrop&type=fork&count=true'. This request has been blocked; the content must be served over HTTPS.",
                "timestamp": 1600356945073,
                "type": ""
            }
        ],
        "screenShotFile": "006c0028-0065-0025-0086-004a00e100c0.png",
        "timestamp": 1600356933395,
        "duration": 12058
    },
    {
        "description": "Validate multi form inputs|Multi Form Test Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 6260,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d8002d-00bb-0079-00cb-00ce002b004b.png",
        "timestamp": 1600356953051,
        "duration": 10314
    },
    {
        "description": "Verify Orange HRM Login|Non Angular JS Application Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 4500,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/ - [DOM] Found 2 elements with non-unique id #csrf_token: (More info: https://goo.gl/9p2vKq) %o %o",
                "timestamp": 1600356978284,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/webres_5f61a473615588.75870608/js/jquery/jquery-3.4.1.min.js 1 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1600356983469,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "https://opensource-demo.orangehrmlive.com/index.php/auth/login - [DOM] Found 2 elements with non-unique id #csrf_token: (More info: https://goo.gl/9p2vKq) %o %o",
                "timestamp": 1600356986847,
                "type": ""
            }
        ],
        "screenShotFile": "00e1001d-007e-0049-0029-00b40037004d.png",
        "timestamp": 1600356971062,
        "duration": 15883
    },
    {
        "description": "Verify login|POM Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 3060,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004b00de-00fc-0089-0032-008c00ab00e3.png",
        "timestamp": 1600356998335,
        "duration": 5170
    },
    {
        "description": "Verify checkbox operations|Web Elements Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9792,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "001a0088-0069-00f6-0030-00fd00f00070.png",
        "timestamp": 1600357011087,
        "duration": 11844
    },
    {
        "description": "Validate product info and delete a product|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7860,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0057006b-0012-0085-00a6-008a00f10023.png",
        "timestamp": 1600357032476,
        "duration": 8723
    },
    {
        "description": "Validate user info after adding a user|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7860,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006f00e7-007a-0076-00bd-005500710030.png",
        "timestamp": 1600357041943,
        "duration": 9529
    },
    {
        "description": "Validate web table iteration and data elements accessibility|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7860,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "0070009d-0017-00c0-0058-00b300fa00b6.png",
        "timestamp": 1600357052124,
        "duration": 18948
    },
    {
        "description": "Validate email and cell number of a particular user|Web Table Handling Suite",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7860,
        "browser": {
            "name": "chrome",
            "version": "85.0.4183.102"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d60028-008e-006f-00bf-007700f30099.png",
        "timestamp": 1600357071669,
        "duration": 5354
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
