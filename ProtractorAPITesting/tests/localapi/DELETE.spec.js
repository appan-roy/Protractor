const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("DELETE Suite", function () {

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

    it("Delete a user", function (done) {

        //DELETE request
        apiClient.deleteRequest({ userId: 26 }).toJSON().then(function (actualResponse) {

            //log response to console
            console.log(actualResponse);

            //invoke this method always to terminate the program
            done();

        });

    });

});
