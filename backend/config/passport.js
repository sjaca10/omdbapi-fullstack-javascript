var strategy = require('passport-jwt').Strategy;
var extract = require('passport-jwt').ExtractJwt;

var User = require('../app/user/model');
var database = require('../config/database');

function passportJwtStrategy(passport) {
    var opts = {};
    opts.secretOrKey = database.secret;
    opts.jwtFromRequest = extract.fromAuthHeader();

    passport.use(new strategy(opts, function(jwtPayload, done) {
        User.findOne({id: jwtPayload.id}, function(err, user) {
            if(err) {
                return done(err, false);
            }
            if(user) {
                done(null, user);
            }
            else {
                done(null, false);
            }
        });
    }));
}

module.exports = passportJwtStrategy;
