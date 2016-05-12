/**
 * Created by Team "Cloud Number 9" on 12.05.2016 and 13.05.2016
 */
var express = require('express');
var request = require('request');
var app = express();

var port = 8080;

/* old code

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
*/



/**
 * Formatiert eine Zahl immer in ein Format mit 2 NKS und Tausendertrennzeichen
 *
 * @param {*} t - Wert der angepasst werden soll
 * @param {boolean} [removeMinus] - Minus kann entfernt werden, wenn gewünscht
 * @return {string}
 **/
function convertToGermanNumber(t,removeMinus) {
    if (!t) return '0,00';

    if (typeof t === 'number') {
        // t = t.toString();
        // Nein, bricht, falls mehr als 2 NKS vorhanden, deswegen:
        t = t.toFixed(2); // Jetzt ist es ein String mit genau 2 NKS
    }

    // Wenn gar kein '.' vorhanden dann ist es eine glatte Zahl, dann '.00' ergänzen
    if (t.indexOf('.') == -1) {
        t = t + '.00';
    }

    // Wenn '.' an vorletzter Stelle, z. B. '1234.1', dann fehlende letzte Ziffer ergänzen
    if (t.charAt(t.length-2) == '.') {
        t = t + '0';
    }

    // Ab hier ist t nun einheitlich ein String im Format '1234.00'.


    // Minus-zeichen kurzfristig entfernen, damit 1.000er-Trennzeichen nicht irrtümlich dahinter gesetzt wird
    var zahlHatteMinus = false;
    if (t.startsWith('-')) {
        t = t.substring(1);
        zahlHatteMinus = true;
    }


    // . mit , ersetzen
    t = t.replace('.',',');

    // 1. 1.000er-Trennzeichen ergänzen
    if (t.length > 6)
        t = t.substring(0,t.length-6) + '.' + t.substring(t.length-6);
    // 2. 1.000er-Trennzeichen ergänzen
    if (t.length > 10)
        t = t.substring(0,t.length-10) + '.' + t.substring(t.length-10);
    // 3. 1.000er-Trennzeichen ergänzen
    if (t.length > 14)
        t = t.substring(0,t.length-14) + '.' + t.substring(t.length-14);


    if ((!removeMinus) && zahlHatteMinus) {
        t = '-' + t;
    }

    return t;
}
/**
 * Get a number with appended €-currency
 *
 * @param {string|number} v
 **/
function getGermanNumberWithEUR(v) {
    return convertToGermanNumber(v) + ' €';
}






function contactBackendServerAndCreateSPA(res) {

    request({
        method: 'GET',
        uri: "https://addison-lunchbox.herokuapp.com/invoice/invoice/test"
        // headers: {"authorization": "Bearer 1147997221899426|fd96c6a7258691eb0a4347e5069ddf1a"}
    }, function (error, response, body) {
        // console.log("contactServer " + body);

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        } else {
            if (response.statusCode === 200) {
                var json = JSON.parse(body);
                console.log("Answer from server:");
                console.log(json);

                createSPA(res, json);
            }
        }
    });
}

/**
 *
 * @param {{}} res
 * @param {{amount, description, paypalLink}} json
 */
function createSPA(res, json) {
    if (!res) {
        console.log('createSPA() - Missing res argument');
        return;
    }

    if (!json) {
        console.log('createSPA() - Missing JSON argument');
        return;
    }

    // Fix the input values
    json.amount = getGermanNumberWithEUR(json.amount);
    if (!json.paypalLink) {
        json.paypalLink = 'http://www.paypal.com';
    }



    var spa = ''; // SinglePageApplication

    spa += '<!DOCTYPE html>';
    spa += '<html><head>';
    spa += '<title>Title of the document</title>';
    // Latest compiled and minified bootstrap CSS
    spa += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">';
    // Use flatly theme
    spa += '<link rel="stylesheet" href="http://blackrockdigital.github.io/startbootstrap-freelancer/css/bootstrap.min.css">';
    spa += '<link rel="stylesheet" href="http://blackrockdigital.github.io/startbootstrap-freelancer/css/freelancer.css">';

    // Custom Fonts
    spa += '<link rel="stylesheet" href="http://blackrockdigital.github.io/startbootstrap-freelancer/font-awesome/css/font-awesome.min.css" type="text/css">';
    spa += '<link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">';
    spa += '<link href="https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic" rel="stylesheet" type="text/css">';

    // Latest compiled and minified bootstrap JavaScript
    spa += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>';
    spa += '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>';
    spa += '<style> body { margin: 20px;} .jumbotron { padding: 10px;} </style>';
    spa += '</head>';
    spa += '<body>';

    if (true || req.query.page === '2') {
        // Nötige Felder: 1) Grid mit Freunden schon bezahlt oder nicht
        // 4) Rechnung (als Bild)
        spa += '<div class="jumbotron">';
        spa += '  <h1>LunchBox</h1>';
        spa += '  <p>Mobile payment on the fly</p>';
        spa += '</div>';

        spa += '<label for="amount-label">Amount</label>';
        spa += '<div class="input-group">';
        spa += '  <input type="text" class="form-control" readonly id="amount-label" value="' + json.amount + '">';
        spa += '</div>';

        spa += '<hr />';

        spa += '<label for="x-label">Description</label>';
        spa += '<div class="input-group">';
        spa += '  <input type="text" class="form-control" readonly id="x-label" value="' + json.description + '">';
        spa += '</div>';

        spa += '<hr />';

        spa += '<div class="input-group">';
        spa += '  <a href="' + json.paypalLink + '"><button class="btn btn-default" type="button">Checkout to PayPal!</button></a>';
        spa += '</div>';


    } else if (req.query.page === '1') {
        // Example to get a query param
        spa += 'The content of the document... Hello World: ' + req.query.name;

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
}



/**
 * Okay, wire up the server
 */
app.get('/', function (req, res) {
    contactBackendServerAndCreateSPA(res);
});

app.post('/', function (req, res) {
    res.send('Hello From NodeJS ' + req.query.name + ' !')
});

app.listen(process.env.PORT || port);

console.log('Running on http://localhost:' + port);