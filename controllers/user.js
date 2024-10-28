const User = require("../models/User")
const bcrypt = require('bcrypt');

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}
module.exports.loginForm = (req, res) => {
    console.log(req.path, req.originalUrl);
    res.render('users/login')
}

module.exports.registerUser = (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        console.log(email, username, password);
        // Send response once, no further execution of code
        return res.redirect('/');
    } catch (err) {
        console.error('Registration error:', err); // Use `err` instead of `error`
        req.flash('error', 'Something went wrong. Please try again.');
        return next(err); // Make sure to return after next() call
    }
}
