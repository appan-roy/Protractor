const param = require('../../test_data/complex.json')
const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("POST Suite", function () {

    var apiClient, serviceEnpoints = {
        getRequest: {
            path: "/students/:Id:",
            method: "GET"
        },
        postRequest: {
            path: "/students",
            method: "POST"
        },
        putRequest: {
            path: "/students/:Id:",
            method: "PUT"
        },
        patchRequest: {
            path: "/students/:Id:",
            method: "PATCH"
        },
        deleteRequest: {
            path: "/students/:Id:",
            method: "DELETE"
        },
    };

    beforeAll(function () {
        apiClient = new apiResource("http://localhost:3000");
        apiClient.registerService(serviceEnpoints);
    });

    it("Create a user", function (done) {

        //payload
        var payLoad = {
            "firstName": param.firstName,
            "lastName": param.lastName,
            "mobileNo": param.mobileNo,
            "id": param.id,
            "subjects": [
                param.subjects[0],
                param.subjects[1],
                param.subjects[2]
            ]
        };

        //declare expected response
        var expectedResponse = {
            "firstName": param.firstName,
            "lastName": param.lastName,
            "mobileNo": param.mobileNo,
            "id": param.id,
            "subjects": [
                param.subjects[0],
                param.subjects[1],
                param.subjects[2]
            ]
        };

        //POST request
        apiClient.postRequest({}, payLoad).toJSON().then(function (actualResponse) {

            //log response to console
            console.log(actualResponse);

            //validate response
            expect(actualResponse).toEqual(expectedResponse);

            //validate json data from response
            expect(actualResponse.firstName).toEqual(param.firstName)
            expect(actualResponse.lastName).toEqual(param.lastName)
            expect(actualResponse.mobileNo).toEqual(param.mobileNo)
            expect(actualResponse.id).toEqual(param.id)
            expect(actualResponse.subjects[0]).toEqual(param.subjects[0])
            expect(actualResponse.subjects[1]).toEqual(param.subjects[1])
            expect(actualResponse.subjects[2]).toEqual(param.subjects[2])

            //invoke this method always to terminate the program
            done();

        });

    });

});
