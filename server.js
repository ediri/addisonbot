/**
 * Created by Engin.Diri on 10.05.2016.
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('lodash');
var Wit = require('node-wit').Wit;
var async = require('async');

var app = express();


var invoiceEndPoint = "http://addison-lunchbox.herokuapp.com/invoice"

var friends = require(__dirname + '/config/friends.json').friends;
var paypal = require(__dirname + '/config/paypal.json');
var message = require(__dirname + '/config/message.json');
var receipt = require(__dirname + '/config/receipt.json');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var port = 8080;


app.get('/', function (req, res) {
    getPaymentDetails(req, res);
    createPayment();
});

app.post('/', function (req, res) {
    res.render('home', {
        param: req.query.testparam
    });
});


app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if (event.message.text === 'Hi') {
                getUserDetails(event.sender.id);
            } else {
                _(friends).forEach(function (friend) {
                    receipt.attachment.payload.elements.push({
                        title: friend.name,
                        subtitle: "Summe " + Math.floor(Math.random() * 11) + " €"
                    });
                });
                sendMessage(event.sender.id, receipt, function () {
                    createPayment(event.sender.id);
                });
            }
        }
    }
    res.sendStatus(200);
});

app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === process.env.PAGE_ACCESS_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});


function getPaymentDetails(req, res) {
    request({
        method: 'GET',
        uri: invoiceEndPoint + "/invoice/" + req.query.paymentId
    }, function (error, response, body) {
        if (response.statusCode === 200) {
            var json = JSON.parse(body);
            console.log(json);
            res.render('home', {
                payment: json
            });
        }
    });
}

function createPayment(userId) {
    console.log("createPayment");
    async.waterfall([
        function (callback) {
            request({
                method: 'GET',
                uri: "https://graph.facebook.com/v2.6/" + userId,
                qs: {
                    fields: "first_name,last_name,profile_pic,locale,timezone,gender",
                    access_token: process.env.PAGE_ACCESS_TOKEN
                },
            }, function (error, response, body) {
                if (response.statusCode === 200) {
                    var json = JSON.parse(body);
                    callback(null, json)
                    //sendTextMessage(userId, {text: "Hello " + json.first_name + "! How can I help you today?"});
                }
            });
        }, function (userjson, callback) {
            _(friends).forEach(function (friend) {
                paypal.payer.push(friend);
            });
            request({
                method: 'POST',
                uri: invoiceEndPoint,
                json: paypal
            }, function (error, response, body) {
                if (response.statusCode === 200) {
                    var json = JSON.parse(body);
                    _(json).forEach(function (payer) {
                        console.log(payer);
                       // console.log(payer.payer.referenceId + " " + payer.payer.name + " " + payer.payer.paymentId);
                        //sendNotification(userjson.first_name, payer.payer.referenceId, payer.payer.name, payer.payer.paymentId)
                    });
                }
            });
        }], function (err, result) {

    });
}


function getFriendsList(id) {
    request({
        method: 'GET',
        uri: "https://graph.facebook.com/v2.6/121226858290893/friends?limit=25",
        headers: {"authorization": "Bearer 1147997221899426|fd96c6a7258691eb0a4347e5069ddf1a"}
    }, function (error, response, body) {
        console.log("getFriendsList " + body);
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            if (response.statusCode === 200) {
                var json = JSON.parse(body);
                console.log("getFriendsList");
                console.log(json);
            }
        }
    });
}

function sendNotification(biller, referenceId, name, paymentId) {
    request({
        method: 'POST',
        uri: "https://graph.facebook.com/v2.6/" + referenceId + "/notifications",
        headers: {"Authorization": "Bearer 1147997221899426|fd96c6a7258691eb0a4347e5069ddf1a"},
        qs: {
            href: "?paymentId=" + paymentId,
            template: "Hi " + name + "! " + biller + " send you a lunchbox invoice"
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            if (response.statusCode === 200) {
                var json = JSON.parse(body);
                console.log("getFriendsList");
                console.log(json);
            }
        }
    });
}

function getUserDetails(userId) {
    request({
        method: 'GET',
        uri: "https://graph.facebook.com/v2.6/" + userId,
        qs: {
            fields: "first_name,last_name,profile_pic,locale,timezone,gender",
            access_token: process.env.PAGE_ACCESS_TOKEN
        },
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            if (response.statusCode === 200) {
                var json = JSON.parse(body);
                return json;
                //sendTextMessage(userId, {text: "Hello " + json.first_name + "! How can I help you today?"});
            }
        }
    });
}

function sendTextMessage(recipientId, messageText) {
    sendMessage(recipientId, messageText.text, null)
}

function sendMessage(recipientId, messageText, cb) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: messageText
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            if (cb !== null) {
                cb();
            }
        }
    });
}

app.listen(process.env.PORT || port);
console.log('Running on http://localhost:' + port);