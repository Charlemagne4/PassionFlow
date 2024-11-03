const axios = require('axios');
const UserGameList = require('../models/UserGameList')

// Define your headers
const headers = {
    'Client-ID': process.env.ClientID,           // Replace with your actual Client ID
    'Authorization': process.env.Authorization,  // Replace with your actual token
    'Content-Type': 'text/plain'                 // Specify JSON content type
};

const url = 'https://api.igdb.com/v4/games';

module.exports.index = async (req, res, next) => {
    try {

        const data = `
                fields name, cover.url, cover.image_id, rating;
                where rating > 95;
                limit 10;
            `;
        // Make the Axios request
        const response = await axios.post(url, data, { headers });

        // Extract the games data from the response
        const games = response.data;

        // Render the view with the games data
        res.render('games/index', { games, imageSize: "logo_med" });
    } catch (err) {
        console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
        next(err);
    }
}

module.exports.gameSearch = async (req, res, next) => {
    try {
        // Validate query parameters
        let name = req.query.game?.name?.trim(); // Trim whitespace from input
        let data;

        // Check if name is empty after trimming
        if (!name) {
            req.flash('error', 'Please enter a game name to search.'); // Optional: flash an error message
            return res.redirect('/games'); // Redirect to the games page or wherever you prefer
        }

        // If a valid name is provided, construct the search query
        data = `
            search "${name}"; fields name, cover.image_id, rating;
            limit 10;
        `;

        // Make the Axios request and Extract the games data from the response
        const response = await axios.post(url, data, { headers });
        const games = response.data;

        // Render the view with the games data
        res.render('games/search', { games, imageSize: "logo_med" });
    } catch (err) {
        console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
        next(err);
    }
}


module.exports.show = async (req, res, next) => {
    const gameId = req.params.id;
    const currentUser = req.user?.id;
    const data = `
        fields name, platforms.abbreviation, cover.image_id, 
        rating, rating_count, release_dates.date, release_dates.platform.abbreviation,
        screenshots.image_id, storyline, summary, themes.slug; 
        where id = ${gameId};
    `;

    try {
        // Make the Axios request
        const response = await axios.post(url, data, { headers });

        // Extract the game data from the response
        const game = response.data[0];

        let userGameList = null; // Initialize userGameList

        // Get status of the game for the current user
        if (currentUser) {
            userGameList = await UserGameList.findOne({ userId: currentUser, gameId: gameId });
            if (userGameList) {
                console.log(userGameList.status); // Log the status if userGameList is defined
            } else {
                console.log('User game list not found for this game.');
            }
        }

        // Render the view with the game data
        res.render('games/show', { game, status: userGameList ? userGameList.status : null, imageSize: "720p" });
    } catch (err) {
        console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
        next(err);
    }
}


module.exports.addToList = async (req, res, next) => {
    const gameId = req.params.id;
    const status = req.params.status;
    const userId = req.user?.id; // Use optional chaining to avoid errors if req.user is undefined

    try {
        // Check if the user is defined
        if (!userId) {
            req.flash('error', 'User not authenticated.'); // Optional: flash an error message
            return res.redirect(`/games/${gameId}`); // Redirect to the games page or wherever you prefer
        } // or redirect to a login page


        // Proceed with adding the game to the user's list
        await UserGameList.updateOne(
            { userId: userId, gameId: gameId },
            { $set: { status } },
            { upsert: true }
        );

        res.redirect(`/games/${gameId}`);
    } catch (err) {
        console.error(`Error adding game to ${status} list`, err.response ? err.response.data : err.message);
        next(err);
    }
};
