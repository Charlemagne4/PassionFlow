const express = require("express");
const router = express.Router();
const catchAsync = require('../Utility/catchAsync');
const passport = require('passport');
const user = require('../controllers/user');
const { getFriendProfile } = require('../controllers/profile');
const { ReturnTo, isLoggedIn, trimFields } = require('../middleware');

// Registration and Login Routes
router.route('/register')
    .get(user.registerForm)
    .post(ReturnTo, catchAsync(user.registerUser));

router.route('/login')
    .get(user.loginForm)
    .post(ReturnTo, trimFields, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.loginUser);

router.delete('/logout', user.logout);

// Friend Routes
router.post('/friends/request/:id', isLoggedIn, catchAsync(user.sendFriendRequest));
router.post('/friends/accept/:id', isLoggedIn, catchAsync(user.acceptFriendRequest));
router.post('/friends/reject/:id', isLoggedIn, catchAsync(user.rejectFriendRequest));
router.get('/friends', isLoggedIn, catchAsync(user.viewFriendsList));
router.get('/friends/profile/:userId', isLoggedIn, catchAsync(getFriendProfile));

//TEST the user/friendManagement Controler
router.get('/users', isLoggedIn, catchAsync(user.listAllUsers));

router.get('/users/search', user.searchUsers);
module.exports = router;
