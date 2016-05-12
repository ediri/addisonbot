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



/*
function contactBackendServerAndCreateSPA(req, res) {

    var sq1 = {
        method: 'GET',
        uri: "https://addison-lunchbox.herokuapp.com/invoice/invoice/test" // put user id in here
        // headers: {"authorization": "Bearer 1147997221899426|fd96c6a7258691eb0a4347e5069ddf1a"}
    };

    var sq2 = {
        method: 'GET',
        uri: "https://addison-lunchbox.herokuapp.com/invoice/getAllBillInvoice/id" // put invoice id in here
    };


    request(req.query.page === 1 ? sq1 : sq2, function (error, response, body) {
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

                createSPA(req, res, json);
            }
        }
    });
}
*/


/**
 *
 * @param {{}} res
 * @param {{amount, description, paypalLink, name}} json
 */
function createSPA(req, res, json) {
    if (!res) {
        console.log('createSPA() - Missing res argument');
        return;
    }

    if (!json) {
        console.log('createSPA() - Missing JSON argument');
        return;
    }

    var spa = ''; // SinglePageApplication

    spa += '<!DOCTYPE html>';
    spa += '<html><head>';
    spa += '<title>LUNCHBOX</title>';
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
    spa += '<style> body { margin: 20px;} .jumbotron { padding: 10px;} .turkis, .form-control[readonly] { background-color: /*darkturquoise #009CDE */ lightblue;} ';
    spa += '#paypal-button { background: url("https://www.paypalobjects.com/webstatic/de_DE/i/de-pp-logo-150px.png") no-repeat; width:150px; height:38px; border:none; } ';
    spa += '#amount-label {font-size:44px;} </style>';
    spa += '</head>';
    spa += '<body>';
    // Bootstrap-grid-layout - start
    spa += '<div class="row"><div class="col-md-4">&nbsp;</div><div class="col-md-4">';

    if (req.query.page === '1') {

        spa += '<div class="jumbotron turkis">';
        spa += '  <h1>LunchBox</h1>';
        spa += '  <p>Mobile payment on the fly</p>';
        spa += '</div>';

        // Fix the input values
        json.amount = getGermanNumberWithEUR(json.amount);
        if (!json.paypalLink) {
            json.paypalLink = 'http://www.paypal.com';
        }
        if (!json.name) {
            json.name = '';
        }

        // Evtl. noch hinzufügen: Rechnung (als Bild)

        spa += '<form class="form-horizontal"><div class="form-group">';

            spa += '<label for="host-label" class="col-sm-2 control-label">Host</label>';
            spa += '<div class="input-group col-sm-10">';
            spa += '  <input type="text" class="form-control" readonly id="host-label" value="' + json.name + '">';
            spa += '</div>';

            spa += '<hr />';

            spa += '<label for="amount-label" class="col-sm-2 control-label">Amount</label>';
            spa += '<div class="input-group col-sm-10">';
            spa += '  <input type="text" class="form-control" readonly id="amount-label" value="' + json.amount + '">';
            spa += '</div>';

            spa += '<hr />';

            spa += '<label for="x-label" class="col-sm-2 control-label">Description</label>';
            spa += '<div class="input-group col-sm-10">';
            spa += '  <textarea class="form-control" rows="3" readonly id="x-label">' + json.description + '</textarea>';
            //spa += '  <input type="text" class="form-control turkis" readonly id="x-label" value="' + json.description + '">';
            spa += '</div>';

            spa += '<hr />';

            spa += '<label for="paypal-button" class="col-sm-2 control-label">Checkout</label>';
            spa += '<div class="input-group col-sm-10">';
            spa += '  <a href="' + json.paypalLink + '"><button id="paypal-button" class="btn btn-default" type="button"></button></a>';
            spa += '</div>';

        spa += '</div></form>';

    } else if (req.query.page === '2') {

        spa += '<div class="jumbotron turkis">';
        spa += '  <h1>LunchBox</h1>';
        spa += '  <p>Admin-area</p>';
        spa += '</div>';

        // Fix the input values
        json.amount = getGermanNumberWithEUR(json.amount);
        if (json.state === 'OPEN') {
            json.state = 'No payments yet';
        }
        if (json.state === 'PARTIALLY_COLLECTED') {
            json.state = 'Some payments received';
        }
        if (json.state === 'COMPLETELY_COLLECTED') {
            json.state = 'All payments received';
        }
        if (json.state === 'TRANSFERRED_TO_BILLER') {
            json.state = 'All payments received';
        }
        if (!json.state) {
            json.state = 'unknown';
        }

        spa += '<form class="form-horizontal"><div class="form-group">';

        spa += '<label for="host-label" class="col-sm-2 control-label">Host</label>';
        spa += '<div class="input-group col-sm-10">';
        spa += '  <input type="text" class="form-control" readonly id="host-label" value="' + json.biller.name + '">';
        spa += '</div>';

        spa += '<hr />';

        spa += '<label for="amount-label" class="col-sm-2 control-label">Amount altogether</label>';
        spa += '<div class="input-group col-sm-10">';
        spa += '  <input type="text" class="form-control" readonly id="amount-label" value="' + json.amount + '">';
        spa += '</div>';

        spa += '<hr />';

        spa += '<label for="participants-label" class="col-sm-2 control-label">Number of participants</label>';
        spa += '<div class="input-group col-sm-10">';
        spa += '  <input type="text" class="form-control" readonly id="participants-label" value="' + (Array.isArray(json.invoices) ? json.invoices.length : 0) + '">';
        spa += '</div>';

        spa += '<hr />';

        spa += '<label for="x-label" class="col-sm-2 control-label">Description</label>';
        spa += '<div class="input-group col-sm-10">';
        spa += '  <textarea class="form-control" rows="3" readonly id="x-label">' + json.description + '</textarea>';
        //spa += '  <input type="text" class="form-control" readonly id="x-label" value="' + json.description + '">';
        spa += '</div>';

        spa += '<hr />';

        if (Array.isArray(json.invoices)) {
            spa += '<table class="table table-striped">';
            spa += '<thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>';

            json.invoices.forEach(function(el) {
                spa += '<tr><td>';
                spa += el.payer.name;
                spa += '</td><td>';
                spa += el.state;
                spa += '</td></tr>';
            });
            spa += '</tbody></table>';
        }

        spa += '<hr />';

        spa += '<label for="state-label" class="col-sm-2 control-label">Overall&nbsp;state:</label>';
        spa += '<div class="input-group col-sm-10">';
        spa += '  <input type="text" class="form-control" readonly id="state-label" value="' + json.state + '">';
        spa += '</div>';

        spa += '</div></form>';
    } else {
        spa += 'Please choose a page via page-parameter. E. g. "?page=1" or "?page=2"';
    }

    // Bootstrap-grid-layout - end
    spa += '</div><div class="col-md-4">&nbsp;</div></div>';
    spa += '</body>';
    spa += '</html>';


    res.send(spa)
}



/**
 * Okay, wire up the server
 */
app.get('/', function (req, res) {
    // contactBackendServerAndCreateSPA(req, res);
    var json = {"name":"<Name Billder>","description":"This is a Description","amount":42.0,"paypalLink":null};

    if (req.query.page === '2') {
        json = {"id":"id","biller":{"referenceId":"f31c8c69-8a14-454a-a539-084ed078c057","name":"Julian"},"amount":10.0,"description":null,"state":"PARTIALLY_COLLECTED","paymentServiceData":null,"timestamp":null,"invoices":[{"payer":{"referenceId":null,"name":"DönerTier"},"state":"OPEN"},{"payer":{"referenceId":null,"name":"Salat"},"state":"PAYED"}]};
    }

    createSPA(req, res, json);
});

app.post('/', function (req, res) {
    res.send('Hello From NodeJS ' + req.query.name + ' !')
});

app.listen(process.env.PORT || port);

console.log('Running on http://localhost:' + port);