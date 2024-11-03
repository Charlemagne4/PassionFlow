const express = require("express");
const router = express.Router();
const games = require('../controllers/games.js');
const catchAsync = require('../Utility/catchAsync');

router.route('/')
    .get(catchAsync(games.index));

router.route('/search')
    .post(catchAsync(games.gameSearch))
    .get(games.searchRealTime);

router.route('/:id')
    .get(games.show);


// Route to add a game to a specific status
router.post('/:id/add-to-list/:status', games.addToList);

router.post('/:id/favorite', games.addToFavorite);
router.post('/:id/unfavorite', games.removeFromFavorite);

module.exports = router;
