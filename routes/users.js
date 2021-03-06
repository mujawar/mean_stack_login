/**
 * Created by arif on 27/11/16.
 */

var express = require('express');
var router = express.Router();
var User = require('../models/users')
var passport = require('passport');
var localStrategy = require('passport-local'), Strategy;

//register
router.get('/register', function (req, res) {
    res.render('register');
})

//login ROUTE
router.get('/login', function (req, res) {
    res.render('login');
})

//register post
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    console.log(name)
    //validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password);

    var errors = req.validationErrors()
    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        var newUser = new User({
            name: name,
            password: password,
            email: email,
            username: username
        });
        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log('user>>>>' + JSON.stringify(user));
        })
        req.flash('success_msg', 'you are registerd and can now login');
        res.redirect('/users/login')
    }
});

passport.use(new localStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Unknown user'});
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }

            });

        });


    }));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});
router.post('/login',
    passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}),
    function (req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'you are logged out');
    res.redirect('/users/login');
});


module.exports = router;
