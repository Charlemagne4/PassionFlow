const express = require("express");
const router = express.Router();
const games = require('../controllers/games.js');
const catchAsync = require('../Utility/catchAsync');
const { isLoggedIn } = require('../middleware');

router.route('/')
    .get(catchAsync(games.index));

router.route('/search')
    .post(catchAsync(games.gameSearch))
    .get(games.searchRealTime);

router.route('/myGames')
    .get(isLoggedIn, games.myGames);

router.route('/userGames/:id')
    .get(games.userGames);

router.route('/advancedSearch')
    .post(games.advancedSearchJSON)
    .get(games.advancedSearch);

router.route('/:id')
    .get(games.show);

// Route to add a game to a specific status
router.post('/:id/add-to-list/:status', isLoggedIn, games.addToList);

router.post('/:id/favorite', isLoggedIn, games.addToFavorite);
router.post('/:id/unfavorite', isLoggedIn, games.removeFromFavorite);

module.exports = router;
