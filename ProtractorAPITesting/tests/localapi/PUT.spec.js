const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("PUT Suite", function () {

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

    it("Update a user", function (done) {

        //payload
        var payLoad = {
            "firstName": "Aaron",
            "lastName": "Nimschowitz",
            "fideRating": 2678
        };

        //declare expected response
        var expectedResponse = {
            "firstName": "Aaron",
            "lastName": "Nimschowitz",
            "fideRating": 2678,
            "id": 26
        };

        //PUT request
        apiClient.putRequest({ userId: 26 }, payLoad).toJSON().then(function (actualResponse) {

            //log response to console
            console.log(actualResponse);

            //validate response
            expect(actualResponse).toEqual(expectedResponse);

            //validate json data from response
            expect(actualResponse.firstName).toEqual('Aaron')
            expect(actualResponse.lastName).toEqual('Nimschowitz')
            expect(actualResponse.fideRating).toEqual(2678)
            expect(actualResponse.id).toEqual(26)

            //invoke this method always to terminate the program
            done();

        });

    });

});
