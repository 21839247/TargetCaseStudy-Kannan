var mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db;
var fs = require('fs');
var server = new Server('localhost', 27017, {
    auto_reconnect: true
});
var db = new Db('my_database_name', server);
var onErr = function(err, callback) {
    db.close();
    callback(err);
};

exports.getProduct = function(fields, err, callback) {
    // Use connect method to connect to the Server
    db.open(function(err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            //We are connected
            console.log('Connection established');
            console.log('Product Id in Mongo JS File: ' + fields.productId);
            console.log('Price in Mongo JS File: ' + fields.price);
            db.collection('products', function(err, collection) {
                if (!err) {
                    if (!(fields.price == "")) {
                        console.log('Update Price' + fields.price);
                        var strPrice = "";
                        var strCc = "USD";
                        var strJson = "";
						//Remove the old Price entry in the DB
                        collection.remove({
                            item: fields.productId
                        });
						//Add the new Price entry in the DB
                        collection.save({
                            item: fields.productId,
                            price: fields.price,
                            currency_code: "USD"
                        })
                        db.close();
                        strJson = '{"Price":"' + fields.price + '","CC":"' + strCc + '"}'
						//returns the DB output After updating price
                        callback(strJson);

                    } else {
						//Perform select on DB
                        collection.find({
                            'item': fields.productId
                        }).toArray(function(err, docs) {
                            if (!err) {
                                db.close();
                                var intCount = docs.length;
                                console.log(intCount);
								// Product exists in DB
                                if (intCount > 0) {
                                    var strPrice = "";
                                    var strCc = "";
                                    var strJson = "";

                                    strPrice = docs[0].price;
                                    strCc = docs[0].currency_code;
                                    strJson = '{"Price":"' + strPrice + '","CC":"' + strCc + '"}'
									//returns the DB output After perform Select
                                    callback(strJson);
                                } 
								// Product doesnt exists in DB & No Price update called, in this case setting up default price as 0.00
								else {
                                    var strPrice = "0.00";
                                    var strCc = "USD";
                                    var strJson = "";
                                    collection.save({
                                        item: fields.productId,
                                        price: "0.00",
                                        currency_code: "USD"
                                    });
									db.close();
                                    strJson = '{"Price":"' + strPrice + '","CC":"' + strCc + '"}'
									//returns the DB output After updating price as default
                                    callback(strJson);
                                }
                            } else {
                                onErr(err, callback);
                            }
                        }); //end collection.find
                    }
                } else {
                    onErr(err, callback);
                }
            }); //end db.collection                                      
        }
    });
};