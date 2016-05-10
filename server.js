/**
 * Created by Engin.Diri on 10.05.2016.
 */
var express = require('express');
var app = express();

var port = 8080;

app.get('/', function (req, res) {
    res.send('Hello '+req.query.name+' !')
})

app.post('/', function (req, res) {
    res.send('Hello '+req.query.name+' !')
})

app.listen(process.env.PORT || port);
console.log('Running on http://localhost:' + port);