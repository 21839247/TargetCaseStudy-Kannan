var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var service = require('./service');
var database = require('./mongo');
var prettyjson = require('prettyjson');
var open = require('open');

var server = http.createServer(function(req, res) {
    if (req.method.toLowerCase() == 'get') {
        userInput(res);


    } else if (req.method.toLowerCase() == 'post') {
        processAllFieldsOfTheForm(req, res);
        userInput(res);


    }

});

//Front end to get User input.
function userInput(res) {
    fs.readFile('getProductDetail.html', function(err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

//Get Product Details based on the input SKU id
function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();
    var serviceResponse = '';
    var mongoResponse = '';
    form.parse(req, function(err, fields) {
        //Perform Target API Call
        service.performServiceCall(fields, req, function(resp) {
            serviceResponse = resp;
			//Perform Mongo DB call
            database.getProduct(fields, err, function(response) {
                mongoResponse = response;
				//Converts string into Json object
                var serviceresp = JSON.parse(serviceResponse);
                var mongoresp = JSON.parse(mongoResponse);
				//Merging Target API Json and Mongo output Json into Single json object
                var productResponse = Object.assign(serviceresp, mongoresp);
                var options = {
                    noColor: false
                };
                //To print the result in the console
                console.log(prettyjson.render(productResponse, options));
                //To write the JSON into the output File in JSON format
                var outputFilename = 'C:/data/nodejs/ProductResponse.json';
                fs.writeFile(outputFilename, JSON.stringify(productResponse, null, 4), function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Product JSON saved to " + outputFilename);
                    }
                });
				//To write the JSON into the output File into HTML Format
                var outputFilename1 = 'C:/data/nodejs/ProductResponse.html';
                fs.open(outputFilename1, 'w+', 666, function(e, id) {
                    fs.write(id, '<html>', null, 'utf8', function() {
                        fs.write(id, '<body>', null, 'utf8', function() {
                            fs.write(id, '<pre>', null, 'utf8', function() {
                                fs.write(id, '<code>', null, 'utf8', function() {
                                    fs.write(id, JSON.stringify(productResponse, null, 4), null, 'utf8', function() {
                                        fs.write(id, '</code>', null, 'utf8', function() {
                                            fs.write(id, '</pre>', null, 'utf8', function() {
                                                fs.write(id, '</body>', null, 'utf8', function() {
                                                    fs.write(id, '</html>', null, 'utf8', function() {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            console.log("Product JSON saved to " + outputFilename1);
                                                            fs.close(id, function() {
                                                                console.log('file closed');
																//Open output files.
                                                                open(outputFilename1);
                                                                open(outputFilename);
                                                                res.end();


                                                            });
                                                        }

                                                    });
                                                });
                                            });

                                        });

                                    });

                                });

                            });

                        });

                    });
                });
            });
        });
    });
}

server.listen(1185);
console.log("server listening on 1185");