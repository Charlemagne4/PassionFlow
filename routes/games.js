const express = require("express");
const router = express.Router();
const games = require('../controllers/games.js')
const catchAsync = require('../Utility/catchAsync');

router.route('/')
    .get(catchAsync(games.index));

module.exports = router;