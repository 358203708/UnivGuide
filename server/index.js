var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var _ = require('lodash');
//Create a proxy for front-end api query
var request = require('request');
var router = express.Router();
var app = express();
var username = 'QY24UB2HCMHH4940GGWG';
var password = 'test'
var authenticationHeader = "Basic " + new Buffer(username + ":" + password).toString("base64");
// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
// CORS Support
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.get('/hello/:pubukprn/Course/:kisCourseId/:kisMode', function (req, res, next) {
    //res.send('Hello World!');
    request({
        url: "https://data.unistats.ac.uk/api/v3/KIS/Institution/" + req.params.pubukprn + "/Course/" + req.params.kisCourseId + "/" + req.params.kisMode + ".json"
            ///Institution/{pubukprn}/Course/{kisCourseId}/{kisMode}.{format}
            ///hello/:pubukprn/Course/:kisCourseId/:kisMode
        , headers: {
            "Authorization": authenticationHeader
        }
    }, function (error, response, body) {
        console.log(body);
        res.send(body);
    });
    // next();
});

app.get('/hello/:pubukprn/Course/:kisCourseId/:kisMode/Locations', function (req, res, next) {
    //res.send('Hello World!');
    request({
        url: "https://data.unistats.ac.uk/api/v3/KIS/Institution/" + req.params.pubukprn + "/Course/" + req.params.kisCourseId + "/" + req.params.kisMode + "/Locations"+".json",
            ///Institution/{pubukprn}/Course/{kisCourseId}/{kisMode}.{format}
            ///hello/:pubukprn/Course/:kisCourseId/:kisMode

         headers: {
            "Authorization": authenticationHeader
        }
    }, function (error, response, body) {
        console.log(body);
        res.send(body);
    });
    //next();
});

app.get('/hello/:pubukprn/Course/:kisCourseId/:kisMode/Stages', function (req, res, next) {
    //res.send('Hello World!');
    request({
        url: "https://data.unistats.ac.uk/api/v3/KIS/Institution/" + req.params.pubukprn + "/Course/" + req.params.kisCourseId + "/" + req.params.kisMode + "/Stages"+".json",
            ///Institution/{pubukprn}/Course/{kisCourseId}/{kisMode}.{format}
            ///hello/:pubukprn/Course/:kisCourseId/:kisMode

         headers: {
            "Authorization": authenticationHeader
        }
    }, function (error, response, body) {
        console.log(body);
        res.send(body);
    });
    //next();
});

app.get('/hello/:pubukprn/Course/:kisCourseId/:kisMode/Statistics', function (req, res, next) {
    //res.send('Hello World!');
    request({
        url: "https://data.unistats.ac.uk/api/v3/KIS/Institution/" + req.params.pubukprn + "/Course/" + req.params.kisCourseId + "/" + req.params.kisMode + "/Statistics"+".json",
            ///Institution/{pubukprn}/Course/{kisCourseId}/{kisMode}.{format}
            ///hello/:pubukprn/Course/:kisCourseId/:kisMode

         headers: {
            "Authorization": authenticationHeader
        }
    }, function (error, response, body) {
        console.log(body);
        res.send(body);
    });
    //next();
});


console.log('Listening on port 3000...');
app.listen(3000);
// Connect to MongoDB
// mongoose.connect('mongodb://localhost/meanapp');
// mongoose.connection.once('open', function () {
//     // Load the models.
//     app.models = require('./models/index');
//
//     // Load the routes.
//     var routes = require('./routes');
//     _.each(routes, function (controller, route) {
//         app.use(route, controller(app, route));
//     });
//     console.log('Listening on port 3000...');
//     app.listen(3000);
// });
