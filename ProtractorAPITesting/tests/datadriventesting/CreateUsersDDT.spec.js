const data = require('../../test_data/ddtpost.json')
const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("Data Driven POST Suite", function () {

    var apiClient, serviceEnpoints = {
        getRequest: {
            path: "/users/:userId:",
            method: "GET"
        },
        postRequest: {
            path: "/users",
            method: "POST"
        },
        putRequest: {
            path: "/users/:userId:",
            method: "PUT"
        },
        patchRequest: {
            path: "/users/:userId:",
            method: "PATCH"
        },
        deleteRequest: {
            path: "/users/:userId:",
            method: "DELETE"
        },
    };

    beforeAll(function () {
        apiClient = new apiResource("http://localhost:3000");
        apiClient.registerService(serviceEnpoints);
    });

    it("Validate data driven user creation", function (done) {

        for (var i = 0; i < data.firstName.length; i++) {

            //payload
            var payLoad = {
                "firstName": data.firstName[i],
                "lastName": data.lastName[i],
                "fideRating": data.fideRating[i]
            };

            //POST request
            apiClient.postRequest({}, payLoad).toJSON().then(function (actualResponse) {

                //log response to console
                console.log(actualResponse);

            });

        }

        //invoke this method always to terminate the program
        done();

    });

});
