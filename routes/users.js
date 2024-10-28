const express = require("express");
const router = express.Router();
const catchAsync = require('../Utility/catchAsync');
const passport = require('passport')
const user = require('../controllers/user');
const { ReturnTo } = require('../middleware');

router.route('/register')
    .get(user.registerForm)
    .post(ReturnTo, catchAsync(user.registerUser));
router.route('/login')
    .get(user.loginForm)
//.post(ReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.loginUser);

//router.delete('/logout', user.logout)



module.exports = router;
