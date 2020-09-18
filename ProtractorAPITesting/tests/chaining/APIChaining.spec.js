const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("API Chaining Suite", function () {

    var apiClient, serviceEnpoints = {
        getStudent: {
            path: "/students/:Id:",
            method: "GET"
        },
        postUser: {
            path: "/users",
            method: "POST"
        }
    };

    beforeAll(function () {
        apiClient = new apiResource("http://localhost:3000");
        apiClient.registerService(serviceEnpoints);
    });

    it("Validate request response chaining", function (done) {

        //declare expected response for GET
        var expectedResponseGET = {
            "firstName": "Divyangana",
            "lastName": "Sarkar",
            "mobileNo": 7654321098,
            "id": 3,
            "subjects": [
                "Chemistry",
                "Biology",
                "Maths"
            ]
        };

        //GET request for Id 3
        apiClient.getStudent({ Id: 3 }).toJSON().then(function (actualResponseGET) {

            //log GET response to console
            console.log(actualResponseGET);

            //validate GET response
            expect(actualResponseGET).toEqual(expectedResponseGET);

            //validate json data from GET response
            expect(expectedResponseGET.firstName).toEqual('Divyangana')
            expect(expectedResponseGET.lastName).toEqual('Sarkar')
            expect(expectedResponseGET.mobileNo).toEqual(7654321098)
            expect(expectedResponseGET.id).toEqual(3)
            expect(expectedResponseGET.subjects[0]).toEqual('Chemistry')
            expect(expectedResponseGET.subjects[1]).toEqual('Biology')
            expect(expectedResponseGET.subjects[2]).toEqual('Maths')

            //declare fideRating array for POST call
            var fideRatingArr = [1645]

            //payload for POST
            var payLoad = {
                "firstName": expectedResponseGET.firstName,
                "lastName": expectedResponseGET.lastName,
                "fideRating": fideRatingArr[0]
            };

            //declare expected response for POST
            var expectedResponsePOST = {
                "firstName": expectedResponseGET.firstName,
                "lastName": expectedResponseGET.lastName,
                "fideRating": fideRatingArr[0],
                "id": 27
            };

            //POST request into users
            apiClient.postUser({}, payLoad).toJSON().then(function (actualResponsePOST) {

                //log POST response to console
                console.log(actualResponsePOST);

                //validate POST response
                expect(actualResponsePOST).toEqual(expectedResponsePOST);

                //validate json data from GET response
                expect(expectedResponsePOST.firstName).toEqual(expectedResponseGET.firstName)
                expect(expectedResponsePOST.lastName).toEqual(expectedResponseGET.lastName)
                expect(expectedResponsePOST.fideRating).toEqual(fideRatingArr[0])
                expect(expectedResponsePOST.id).toEqual(27)

                //invoke this method always to terminate the program
                done();

            })

        });

    });

});
