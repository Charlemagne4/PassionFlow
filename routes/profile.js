const express = require("express");
const router = express.Router();
const catchAsync = require('../Utility/catchAsync');
const passport = require('passport')
const profile = require('../controllers/profile');
const Multer = require('multer')
const { ReturnTo, trimFields } = require('../middleware');
const { storage, cloudinary } = require('../cloudinary')
const upload = Multer({ storage })



router.route('/')
    .get(catchAsync(profile.getUserProfile));

router.route('/edit')
    .get(profile.getEditProfilePage);

// Update profileImage
router.put('/profileImage', upload.single('profileImage[images]'), profile.updateprofileImage);

// Update username
router.put('/username', profile.updateUsername);

// Update email
router.put('/email', profile.updateEmail);

// Update bio
router.put('/bio', profile.updateBio);

router.put('/favoriteGenres', profile.updateFavoriteGenres);


router.put('/settings/publicGameList', profile.updatePublicGamesList);

module.exports = router;