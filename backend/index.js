var express = require('express');
var cors = require('cors');
var app = express(cors());
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var config = require('./config/database');

app.use(function(request, response, next) {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.json());

app.use(passport.initialize())

mongoose.connect(config.database);

require('./config/passport')(passport);

var apiRoutes = express.Router();
var userRouter = require('./app/user/user');

app.use('/api', apiRoutes);
app.use('/api/users', userRouter);

var server = app.listen(3000, function() {
    console.log('Server running at http://localhost:' + server.address().port);
});
