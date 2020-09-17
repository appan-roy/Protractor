const apiResource = require("protractor-api-resource").ProtractorApiResource

describe("Test response for all REST API methods", function () {

    var apiClient, serviceEnpoints = {
        getPosts: {
            path: "/posts/:postId:"
        },
        createPost: {
            path: "/posts",
            method: "POST"
        },
        updatePost: {
            path: "/posts/:postId:",
            method: "PUT"
        },
        patchPost: {
            path: "/posts/:postId:",
            method: "PATCH"
        },
    };

    beforeAll(function () {
        apiClient = new apiResource("https://jsonplaceholder.typicode.com/");
        apiClient.registerService(serviceEnpoints);
    });

    it("Test GET method", function (done) {
        var expectedResponse = {
            "userId": 1,
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
        };

        apiClient.getPosts({ postId: 1 }).toJSON().then(function (actualResponse) {
            console.log(actualResponse);
            expect(actualResponse).toEqual(expectedResponse);
            done();
        });
    });

    it("Test POST method", function (done) {
        var payLoad = {
            title: 'foo',
            body: 'bar',
            userId: 1
        };
     
        var expectedResponse = {
            id: 101,
            title: 'foo',
            body: 'bar',
            userId: 1
        };
        //First parameter is for query params and second parameter is for request payload.
        apiClient.createPost({}, payLoad).toJSON().then(function (actualResponse) {
            expect(actualResponse).toEqual(expectedResponse);
            done();
        });
    });

});