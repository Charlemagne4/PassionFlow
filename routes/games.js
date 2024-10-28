const express = require("express");
const router = express.Router();
const games = require('../controllers/games.js')
const catchAsync = require('../Utility/catchAsync');

router.route('/')
    .get(catchAsync(games.index));

router.route('/search')
    .get(catchAsync(games.gameSearch));

router.route('/:id')
    .get(games.show)
module.exports = router;