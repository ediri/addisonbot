/**
 * Created by Team "Cloud Number 9" on 12.05.2016 and 13.05.2016
 */
var express = require('express');
var http = require('http');
var app = express();

var port = 8080;

app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
    }
    res.sendStatus(200);
});

function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

app.get('/', function (req, res) {
    var spa = ''; // SinglePageApplication

    spa += '<!DOCTYPE html>';
    spa += '<html><head>';
    spa += '<title>Title of the document</title>';
    // Latest compiled and minified bootstrap CSS
    spa += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">';
    // Use flatly theme
    spa += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/flatly/bootstrap.min.css">';
    // Latest compiled and minified bootstrap JavaScript
    spa += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>';
    spa += '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>';
    spa += '</head>';
    spa += '<body>';

    if (true || req.query.page === '2') {
        // Nötige Felder: 1) Grid mit Freunden schon bezahlt oder nicht
        // 2) Betrag
        // 3) Description
        // 4) Rechnung (als Bild)
        // 5) Link zu Paypal
        spa += '<div class="jumbotron">';
        spa += '  <h1>LaunchBot</h1>';
        spa += '  <p>Checkout to PayPal</p>';
        spa += '</div>';

        spa += '<label for="amount-label">Amount</label>';
        spa += '<div class="input-group">';
        spa += '  <span class="input-group-addon" id="amount-description">€</span>';
        spa += '  <input type="text" class="form-control" id="amount-label" aria-describedby="amount-description">';
        spa += '</div>';


        spa += '<label for="x-label">Description</label>';
        spa += '<div class="input-group">';
        spa += '  <span class="input-group-addon" id="x-description">€</span>';
        spa += '  <input type="text" class="form-control" id="x-label" aria-describedby="x-description">';
        spa += '</div>';

        var options = {
            host: 'https://addison-lunchbox.herokuapp.com',
            path: '/invoice/invoice/test'
        };

        var req = http.get(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));

            // Buffer the body entirely for processing as a whole.
            var bodyChunks = [];
            res.on('data', function(chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            }).on('end', function() {
                var body = Buffer.concat(bodyChunks);
                console.log('BODY: ' + body);
                // ...and/or process the entire body here.
            })
        });

        req.on('error', function(e) {
            console.log('ERROR: ' + e.message);
        });

    } else if (req.query.page === '1') {
        // Example to get a query param
        spa += 'The content of the document...... Not Hello World: ' + req.query.name;

        // Example to test bootstrap
        // Falls doch noch page1 erforderlich sein sollte: Betrag, description, Auswahlliste Freundesliste, Senden-button, Upload-Button-Rechnung
        spa += '<div class="alert alert-danger" role="alert">';
        spa += '  <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>';
        spa += '  <span class="sr-only">Error:</span>';
        spa += 'Enter a valid email address';
        spa += '</div>';
    } else {
        spa += 'Please choose a page via page-parameter. Example: "?page=1" or "?page=2"';
    }

    spa += '</body>';
    spa += '</html>';




    res.send(spa)
});

app.post('/', function (req, res) {
    res.send('Hello From NodeJS ' + req.query.name + ' !')
});



app.listen(process.env.PORT || port);
console.log('Running on http://localhost:' + port);