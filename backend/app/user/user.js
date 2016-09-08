var express = require('express');
var jwt = require('jwt-simple');
var passport = require('passport');
var config = require('../../config/database');

var router = express.Router({
    mergeParams: true,
});

var User = require('./model');

function getToken(headers) {
    if(headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if(parted.length == 2) {
            return parted[1];
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
}

router.post('/sign_up', function(request, response) {
    if(!request.body.username || !request.body.password) {
        response.json({
            success: false,
            message: 'You must provide username and password',
        });
    }
    else {
        var user = new User({
            username: request.body.username,
            password: request.body.password,
            favMovies: [],
        });

        user.save(function(err) {
            if(err) {
                return response.json({
                    success: false,
                    message: 'Username already exists',
                });
            }
            var token = jwt.encode(user, config.secret);
            response.json({
                success: true,
                message: 'User created successfully',
                token: 'JWT ' + token,
            });
        });
    }
});

router.post('/sign_in', function(request, response) {
    User.findOne({ username: request.body.username }, function(err, user) {
        if(err) {
            throw err;
        }

        if(!user) {
            response.json({
                success: false,
                message: 'The username or password not match.'
            });
        }
        else {
            user.comparePassword(request.body.password, function(err, match) {
                if(match && !err) {
                    var token = jwt.encode(user, config.secret);
                    return response.json({
                        success: true,
                        token: 'JWT ' + token,
                        message: 'Sign in successfully',
                    });
                }
                else {
                    response.json({
                        success: false,
                        message: 'The username or password not match.'
                    });
                }
            });
        }
    });
});

router.post('/favourites_movies', passport.authenticate('jwt', {session: false}), function(request, response) {
    var token = getToken(request.headers);
    if(token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({username: decoded.username}, function(err, user) {
            if(err) {
                throw err;
            }
            if(!user) {
                response.status(403).json({
                    success: false,
                    message: 'Authentication failed'
                });
            }
            else {
                if(!request.body.imdbID) {
                    return response.json({
                        success: false,
                        message: 'You must select a movie',
                    })
                }
                else {
                    if(user.favMovies.indexOf(request.body.imdbID) == -1) {
                        user.favMovies.push(request.body.imdbID);
                    }
                    user.save(function(err) {
                        if(err) {
                            throw err;
                            return response.json({
                                success: false,
                                message: 'Could not add the movie',
                            });
                        }
                        response.json({
                            success: true,
                            message: 'Movie added to your favourites successfully',
                        });
                    });
                }
            }

        });
    }
});

router.get('/favourites_movies', passport.authenticate('jwt', {session: false}), function(request, response) {
    var token = getToken(request.headers);
    if(token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({username: decoded.username}, function(err, user) {
            if(err) {
                throw err;
            }
            if(!user) {
                response.status(403).json({
                    success: false,
                    message: 'Authentication failed'
                });
            }
            else {
                response.json({
                    success: true,
                    movies: user.favMovies
                });
            }
        });
    }
});

router.delete('/favourites_movies/:imdbID', passport.authenticate('jwt', {session: false}), function(request, response) {
    var token = getToken(request.headers);
    if(token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({username: decoded.username}, function(err, user) {
            if(err) {
                throw err;
            }
            if(!user) {
                response.status(403).json({
                    success: false,
                    message: 'Authentication failed'
                });
            }
            else {
                if(!request.params.imdbID) {
                    return response.json({
                        success: false,
                        message: 'You must select a movie',
                    })
                }
                else {
                    index = user.favMovies.indexOf(request.params.imdbID)
                    if(index != -1) {
                        user.favMovies.splice(index, 1);
                    }
                    user.save(function(err) {
                        if(err) {
                            throw err;
                            return response.json({
                                success: false,
                                message: 'Could not delete the movie',
                            });
                        }
                        response.json({
                            success: true,
                            message: 'Movie deleted from your favourites successfully',
                        });
                    });
                }
            }

        });
    }
});

module.exports = router;
