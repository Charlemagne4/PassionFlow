const User = require("../models/User")
const bcrypt = require('bcrypt');

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}
module.exports.loginForm = (req, res) => {
    console.log(req.path, req.originalUrl);
    res.render('users/login')
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({
            email: email.trim(),
            username: username.trim()
        });

        const registeredUser = await User.register(newUser, password)
        req.login(registeredUser, function (err) {
            if (err) { return next() }
            req.flash('success', 'Welcome to PassionFlow')
            const urlRedirect = res.locals.returnTo || '/games'
            delete res.locals.returnTo
            res.redirect(urlRedirect)
        })
    } catch (err) {
        console.error('Registration error:', err); // Use `err` instead of `error`
        req.flash('error', 'Something went wrong. Please try again.');
        return next(err); // Make sure to return after next() call
    }
}

module.exports.loginUser = async (req, res) => {
    //console.log("res.locals.returnTo: ", res.locals.returnTo);
    const loggedUser = req.user
    req.flash('success', `Welcome back ${loggedUser.username}`)
    const urlRedirect = res.locals.returnTo || '/games'
    delete res.locals.returnTo
    res.redirect(urlRedirect)
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Athala El jeune')
        res.redirect('/')
    })
}
