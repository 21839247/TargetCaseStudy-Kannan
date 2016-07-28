var http = require('http');
var util = require('util');
var fs = require('fs');
var request = require('request');

module.exports = {

    performServiceCall: function(fields, req, fn) {

        console.log('Call Target for Product Id:' + fields.productId);
        var url = 'https://api.target.com/products/v3/' + fields.productId + '?fields=descriptions&id_type=TCIN&key=43cJWpLjH8Z8oR18KdrZDBKAgLLQKJjz';

        //Request Target API to get Product informations
        request(url, function(error, response, productResponse) {
            if (error) {
                return console.log('Error:', error);
            }
            //Check for right status code
            if (response.statusCode !== 200) {
                return console.log('Invalid Status Code Returned:', response.statusCode);
            }
            //return the API response to server.
            fn(productResponse);
        });

    }
}