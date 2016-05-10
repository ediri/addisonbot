/**
 * Created by Engin.Diri on 10.05.2016.
 */
var express = require('express');
var app = express();

var port = 8080;

app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
    }
    res.sendStatus(200);
});

app.get('/', function (req, res) {
    res.send('Hello ' + req.query.name + ' !')
})

app.post('/', function (req, res) {
    res.send('Hello From NodeJS ' + req.query.name + ' !')
})



app.listen(process.env.PORT || port);
console.log('Running on http://localhost:' + port);