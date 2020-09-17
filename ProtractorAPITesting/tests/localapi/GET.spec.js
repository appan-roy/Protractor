const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("GET Suite", function () {

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

    it("Get a particular user", function (done) {

        //declare expected response
        var expectedResponse = {
            "firstName": "Garry",
            "lastName": "Kasparov",
            "fideRating": 2739,
            "id": 1
        };

        //GET request for userId 1
        apiClient.getRequest({ userId: 1 }).toJSON().then(function (actualResponse) {

            //log response to console
            console.log(actualResponse);

            //validate response
            expect(actualResponse).toEqual(expectedResponse);

            //validate json data from response
            expect(actualResponse.firstName).toEqual('Garry')
            expect(actualResponse.lastName).toEqual('Kasparov')
            expect(actualResponse.fideRating).toEqual(2739)

            //invoke this method always to terminate the program
            done();

        });

    });

});
