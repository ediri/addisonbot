/**
 * Created by Engin.Diri on 10.05.2016.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var port = 8080;

app.get('/', function (req, res) {
    res.send('Hello ' + req.query.name + ' !')
});

app.post('/', function (req, res) {
    res.send('Hello From NodeJS ' + req.query.name + ' !')
});

app.post('/webhook', function (req, res) {
    console.log(req.body);
    getFriendsList();
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

function getFriendsList() {
    request({
        method: 'GET',
        uri: "https://graph.facebook.com/v2.6/me/invitable_friends?access_token=EAAQUGO6dTKIBAK3YxLdBzngDR8KlgDKjR4Vi1ySz5kW4SlW1eY3xawU8oT1aZA2xyJBPhYVynaWkHtE0YS95rA3B3mx4EJwaYcT66O0BfgxbuLkZADxorxsb9YuP3HZABNFLQ759N0UpktoAHL6xNCndZC3ALFRfmZCaiP1g1NoMzFGM8pbC7&debug=all&format=json&method=get&pretty=0&suppress_http_code=1",
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
                console.log(json);
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