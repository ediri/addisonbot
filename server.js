/**
 * Created by Engin.Diri on 10.05.2016.
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('lodash');
var app = express();


var friends = require(__dirname + '/config/friends.json');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var port = 8080;


app.get('/', function (req, res) {
    res.render('home');
});

app.post('/', function (req, res) {
    res.render('home');
});


app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log(event.sender);
        if (event.message && event.message.text) {
            if (event.message.text === 'Hi') {
                getUserDetails(event.sender.id);
            } else {
                sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
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

function getFriendsList(id) {
    request({
        method: 'GET',
        uri: "https://graph.facebook.com/v2.6/121226858290893/friends?limit=25",
        headers: {"authorization": "Bearer 1147997221899426|fd96c6a7258691eb0a4347e5069ddf1a"}
    }, function (error, response, body) {
        console.log("getFriendsList " +body);
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

function sendNotification() {
    _(friends).forEach(function (friend) {
       console.log(friend.displayName)
    }).value();

   /*
    request({
        method: 'GET',
        uri: "https://graph.facebook.com/v2.6/121226858290893/friends?limit=25",
        headers: {"authorization": "Bearer 1147997221899426|fd96c6a7258691eb0a4347e5069ddf1a"}
    }, function (error, response, body) {
        console.log("getFriendsList " +body);
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
    });*/
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
                //console.log(json);
                sendNotification();
                sendMessage(userId, {text: "Hello " + json.first_name + "! How can I help you today?"});
            }
        }
    });
}

function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.listen(process.env.PORT || port);
console.log('Running on http://localhost:' + port);