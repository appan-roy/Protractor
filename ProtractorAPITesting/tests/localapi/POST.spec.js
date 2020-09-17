const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("POST Suite", function () {

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

    it("Create a user", function (done) {

        //payload
        var payLoad = {
            "firstName": "Frank",
            "lastName": "Marshall",
            "fideRating": 2784
        };

        //declare expected response
        var expectedResponse = {
            "firstName": "Frank",
            "lastName": "Marshall",
            "fideRating": 2784,
            "id": 26
        };

        //POST request
        apiClient.postRequest({}, payLoad).toJSON().then(function (actualResponse) {

            //log response to console
            console.log(actualResponse);

            //validate response
            expect(actualResponse).toEqual(expectedResponse);

            //validate json data from response
            expect(actualResponse.firstName).toEqual('Frank')
            expect(actualResponse.lastName).toEqual('Marshall')
            expect(actualResponse.fideRating).toEqual(2784)
            expect(actualResponse.id).toEqual(26)

            //invoke this method always to terminate the program
            done();

        });

    });

});
