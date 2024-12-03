const express = require("express");
const router = express.Router();
const catchAsync = require('../Utility/catchAsync');
const passport = require('passport')
const profile = require('../controllers/profile');
const Multer = require('multer')
const { ReturnTo, isLoggedIn, trimFields } = require('../middleware');
const { storage, cloudinary } = require('../cloudinary')
const upload = Multer({ storage })



router.route('/')
    .get(isLoggedIn, catchAsync(profile.getUserProfile));

router.route('/edit')
    .get(isLoggedIn, profile.getEditProfilePage);

// Update profileImage
router.put('/profileImage', isLoggedIn, upload.single('profileImage[images]'), profile.updateprofileImage);

// Update username
router.put('/username', isLoggedIn, profile.updateUsername);

// Update email
router.put('/email', isLoggedIn, profile.updateEmail);

// Update bio
router.put('/bio', isLoggedIn, profile.updateBio);

router.put('/favoriteGenres', isLoggedIn, profile.updateFavoriteGenres);


router.put('/settings/publicGameList', isLoggedIn, profile.updatePublicGamesList);

module.exports = router;