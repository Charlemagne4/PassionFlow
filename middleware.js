
module.exports.isLoggedIn = (req, res, next) => {
    console.log('User: ', req.user);
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Lzm tkoun loggedIn')
        return res.redirect('/login')
    }
    next()
}
