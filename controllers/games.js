const axios = require('axios');
const UserGameList = require('../models/UserGameList');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const themesById = require('../themes').themesById;


// Define your headers
const headers = {
    'Client-ID': process.env.ClientID,           // Replace with your actual Client ID
    'Authorization': process.env.Authorization,  // Replace with your actual token
    'Content-Type': 'text/plain'                 // Specify JSON content type
};

const url = 'https://api.igdb.com/v4/games';

module.exports.index = async (req, res, next) => {
    if (req.user && req.user.favoriteGenres.length !== 0) {
        try {
            // Define the current year and other date ranges
            const currentYear = new Date().getFullYear();
            const currentDate = Math.floor(new Date().getTime() / 1000); // current time in Unix timestamp
            const upcomingDate = Math.floor(new Date(currentYear - 5, 0, 1).getTime() / 1000); // 10 years ago

            // Get user favorite themes
            const userFavorites = req.user.favoriteGenres || [];

            if (userFavorites.length === 0) {
                throw new Error("No favorite themes provided.");
            }

            // Translate userFavorites IDs to themes
            const themeQueries = userFavorites.map(themeId => {
                const themeName = themesById[themeId] || res.send('themeUnknown');
                return {
                    themeName,
                    query: `
                fields name,
                       cover.url,
                       cover.image_id,
                       themes.slug,
                       rating,
                       first_release_date;
                where themes.slug = "${themeName}"
                & first_release_date >= ${upcomingDate}
                & first_release_date <= ${currentDate}
                & rating_count > 40
                & rating <99;
                sort rating_count desc;
                limit 16;
            `
                };
            });


            // Send multiple requests in parallel
            const requests = themeQueries.map(themeQuery =>
                axios.post(url, themeQuery.query, { headers }).then(response => ({
                    theme: themeQuery.themeName,
                    games: response.data
                }))
            );

            const results = await Promise.all(requests);

            // Combine results into an object
            const combinedResults = results.reduce((acc, { theme, games }) => {
                acc[theme] = games;
                return acc;
            }, {});


            // Render the view with the games data
            res.render('games/index', { combinedResults, imageSize: "logo_med" });
        } catch (err) {
            console.error('Error fetching data from IGDB:",', err.response ? err.response.data : err.message);
            next(err);
        }

    } else {
        try {

            // Define the current year
            const currentYear = new Date().getFullYear();

            // Define start and end of the year (Unix timestamps)
            const startOfYear = Math.floor(new Date(currentYear, 0, 1).getTime() / 1000);
            const endOfYear = Math.floor(new Date(currentYear, 11, 31, 23, 59, 59).getTime() / 1000);

            // Define current and upcoming dates (Unix timestamps)
            const currentDate = Math.floor(new Date().getTime() / 1000); // current time in Unix timestamp
            const upcomingDate = Math.floor(new Date(currentYear, new Date().getMonth() + 2, 1).getTime() / 1000);


            const popData = `fields game_id,value,popularity_type; sort value desc; limit 50; where popularity_type = 1;`
            // Make the Axios request to popularity api
            let popResponse = await axios.post("https://api.igdb.com/v4/popularity_primitives", popData, { headers });

            // Extract the games data from the response
            let popGames = popResponse.data;
            const gameIdsString = popGames.map(entry => entry.game_id).join(',');


            // Assuming you have variables startOfYear, endOfYear, currentDate, and upcomingDate defined
            const queries = [
                {
                    query: `
                fields name,
                    cover.url,
                    cover.image_id,
                    rating,
                    first_release_date;
                where first_release_date >= ${startOfYear} & first_release_date <= ${endOfYear} & rating >= 1;
                sort total_rating desc;
            limit 16;
            `,
                    category: 'newReleases'
                },
                {
                    query: `
                fields name,
                    cover.url,
                    cover.image_id,
                    rating,
                    first_release_date;
                where first_release_date > ${currentDate} & first_release_date <= ${upcomingDate} ;
                limit 16;
            `,
                    category: 'upcomingGames'
                },
                {
                    query: `
                fields name,
                    cover.url,
                    cover.image_id,                
                    rating,               
                    first_release_date;                              
                where id = (${gameIdsString}) &
                rating >= 1 &
                first_release_date >= ${startOfYear} &
                first_release_date <= ${endOfYear} &
                total_rating>40;
                limit 16;
            `,
                    category: 'mostPopularGames'
                }
            ];

            // Use axios to send multiple requests
            const requests = queries.map(query =>
                axios.post(url, query.query, { headers })
            );

            const responses = await Promise.all(requests);

            // Combine the results into a single object or array
            const combinedResults = {
                mostPopularGames: responses[2].data,
                newReleases: responses[0].data,
                upcomingGames: responses[1].data,
            };

            // Render the view with the games data
            res.render('games/index', { combinedResults, imageSize: "logo_med" });
        } catch (err) {
            console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
            next(err);
        }
    }
}

module.exports.gameSearch = async (req, res, next) => {
    try {
        // Validate query parameters
        let name = req.body.game?.name?.trim(); // Trim whitespace from input
        let data;
        // console.log(name);

        // Check if name is empty after trimming
        if (!name) {
            req.flash('error', 'Please enter a game name to search.'); // Optional: flash an error message
            return res.redirect('/games'); // Redirect to the games page or wherever you prefer
        }

        // If a valid name is provided, construct the search query
        data = `
            search "${name}"; fields name,
                        cover.url,
                        cover.image_id,
                        themes.slug,
                        rating,
                        storyline,
                        summary,
                        first_release_date,
                        total_rating,
                        total_rating_count;
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
        }

        // Find the user's current game status
        const userGameList = await UserGameList.findOne({ userId: userId, gameId: gameId });

        // If the game is already in the list and the status hasn't changed, do nothing
        if (userGameList && userGameList.status === status) {
            req.flash('info', 'Game status is already set to this value.'); // Optional: flash an info message
            return res.redirect(`/games/${gameId}`);
        }

        // Proceed with adding/updating the game to the user's list
        await UserGameList.updateOne(
            { userId: userId, gameId: gameId },
            { $set: { status } },
            { upsert: true }
        );

        req.flash('success', `Game status updated to ${status}.`); // Optional: flash a success message
        res.redirect(`/games/${gameId}`);
    } catch (err) {
        console.error(`Error adding game to ${status} list`, err.response ? err.response.data : err.message);
        next(err);
    }
};

module.exports.addToFavorite = async (req, res, next) => {
    const gameId = req.params.id;
    const userId = req.user?.id;

    try {
        if (!userId) {
            req.flash('error', 'User not authenticated.'); // Optional: flash an error message
            return res.redirect(`/games/${gameId}`); // Redirect to the games page or wherever you prefer
        }

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error', 'User not found.'); // Handle case where user doesn't exist
            return res.redirect(`/games/${gameId}`);
        }

        // Check if the game is already in the favorites
        if (!user.favoriteGames.includes(gameId)) {
            user.favoriteGames.push(gameId);
            await user.save();
            req.flash('success', 'Game added to favorites successfully.');
        } else {
            req.flash('info', 'Game is already in favorites.');
        }

        res.redirect(`/games/${gameId}`);
    } catch (err) {
        console.error(`Error adding game to favorites`, err.response ? err.response.data : err.message);
        next(err);
    }
}

module.exports.removeFromFavorite = async (req, res, next) => {
    const gameId = req.params.id;
    const userId = req.user?.id;

    try {
        if (!userId) {
            req.flash('error', 'User not authenticated.'); // Optional: flash an error message
            return res.redirect(`/games/${gameId}`); // Redirect to the games page or wherever you prefer
        }

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error', 'User not found.'); // Handle case where user doesn't exist
            return res.redirect(`/games/${gameId}`);
        }

        // Check if the game is in the favorites
        const gameIndex = user.favoriteGames.indexOf(gameId);
        if (gameIndex !== -1) {
            user.favoriteGames.splice(gameIndex, 1); // Remove the game from favorites
            await user.save();
            req.flash('success', 'Game removed from favorites successfully.');
        } else {
            req.flash('info', 'Game is not in favorites.');
        }

        res.redirect(`/games/${gameId}`);
    } catch (err) {
        console.error(`Error removing game from favorites`, err.response ? err.response.data : err.message);
        next(err);
    }
}

module.exports.searchRealTime = async (req, res, next) => {
    try {
        let name = req.query.q; // Get the search query
        if (!name) {
            return res.status(400).json([]); // Return empty array if no query
        }

        // Construct your search query (update according to your actual search logic)
        const data = `
            search "${name}"; fields name, cover.image_id;
            limit 8;
        `;

        const response = await axios.post(url, data, { headers });
        const games = response.data;

        res.json(games); // Send the games as JSON response
    } catch (err) {
        console.error('Error fetching games:', err.message);
        console.error('Error details:', err.response.data);
    }
};

module.exports.myGames = async (req, res, next) => {
    try {
        const currentUser = req.user;
        const myGamesCategory = req.query.category;
        let gamesArray = [];
        let games = [];
        let headMessage = ""

        // Fetch games based on the category
        let data;
        switch (myGamesCategory) {
            case 'completed':
                userGameList = await UserGameList.find({
                    userId: currentUser.id,
                    status: 'completed'
                });
                gamesArray = userGameList.map(game => game.gameId); // Replace with your actual data source
                headMessage = "Completed Games";
                break;
            case 'favorites':
                gamesArray = currentUser.favoriteGames;
                headMessage = "My Favorite Games";
                break;
            case 'ToPlay':
                userGameList = await UserGameList.find({
                    userId: currentUser.id,
                    status: 'ToPlay'
                });
                gamesArray = userGameList.map(game => game.gameId); // Replace with your actual data source
                headMessage = "next, I want to play...";
                break;
            case 'playing':
                userGameList = await UserGameList.find({
                    userId: currentUser.id,
                    status: 'playing'
                });
                gamesArray = userGameList.map(game => game.gameId);
                headMessage = "What I'm currently Playing";
                break;
            case 'dropped':
                userGameList = await UserGameList.find({
                    userId: currentUser.id,
                    status: 'dropped'
                });
                gamesArray = userGameList.map(game => game.gameId);
                headMessage = "I won't touch it again...";
                break;
            case 'allGames':
                userGameList = await UserGameList.find({
                    userId: currentUser.id
                });
                gamesArray = userGameList.map(game => game.gameId);
                gamesArray = [...gamesArray, ...currentUser.favoriteGames]
                headMessage = "All My Games";
                break;
            case 'onHold':
                userGameList = await UserGameList.find({
                    userId: currentUser.id,
                    status: 'onHold'
                });
                gamesArray = userGameList.map(game => game.gameId);
                headMessage = "I need a break";
                break;
            default:
                data = []; // Default to an empty array or a fallback
        }
        if (!gamesArray.length) {
            res.render('games/myGames', { user: currentUser, games, myGamesCategory, headMessage });
            return;
        }
        data = `
                        fields name,
                        cover.url,
                        cover.image_id,
                        themes.slug,
                        rating,
                        storyline,
                        summary,
                        first_release_date,
                        total_rating,
                        total_rating_count;
                        where id = (${gamesArray.join(',')});
                        sort rating desc;
                        limit ${gamesArray.length};
                    `;
        // Make the Axios request
        const response = await axios.post(url, data, { headers });

        // Extract the games data from the response
        games = response.data;
        // Render the view with the game data
        res.render('games/myGames', { user: currentUser, games, imageSize: "logo_med", myGamesCategory, headMessage });
    } catch (err) {
        console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
        next(err);
    }
}

module.exports.userGames = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const myGamesCategory = req.query.category;
        let gamesArray = [];
        let games = [];
        let headMessage = ""

        // Fetch games based on the category
        let data;
        switch (myGamesCategory) {
            case 'completed':
                userGameList = await UserGameList.find({
                    userId: user.id,
                    status: 'completed'
                });
                gamesArray = userGameList.map(game => game.gameId); // Replace with your actual data source
                headMessage = `${user.username} has Completed these Games`;
                break;
            case 'favorites':
                gamesArray = user.favoriteGames;
                headMessage = `${user.username}'s Favorite Games`;
                break;
            case 'ToPlay':
                userGameList = await UserGameList.find({
                    userId: user.id,
                    status: 'ToPlay'
                });
                gamesArray = userGameList.map(game => game.gameId); // Replace with your actual data source
                headMessage = `next, ${user.username} want to play...`;
                break;
            case 'playing':
                userGameList = await UserGameList.find({
                    userId: user.id,
                    status: 'playing'
                });
                gamesArray = userGameList.map(game => game.gameId);
                headMessage = `${user.username} is currently Playing...`;
                break;
            case 'dropped':
                userGameList = await UserGameList.find({
                    userId: user.id,
                    status: 'dropped'
                });
                gamesArray = userGameList.map(game => game.gameId);
                headMessage = `${user.username} dropped...`;
                break;
            case 'allGames':
                userGameList = await UserGameList.find({
                    userId: user.id
                });
                gamesArray = userGameList.map(game => game.gameId);
                gamesArray = [...gamesArray, ...user.favoriteGames]
                headMessage = `${user.username}'s Library`;
                break;
            case 'onHold':
                userGameList = await UserGameList.find({
                    userId: user.id,
                    status: 'onHold'
                });
                gamesArray = userGameList.map(game => game.gameId);
                headMessage = `${user.username} needs a break from`;
                break;
            default:
                data = []; // Default to an empty array or a fallback
        }
        if (!gamesArray.length) {
            res.render('games/myGames', { user, games, myGamesCategory, headMessage });
            return;
        }
        // Fetch user settings
        const isPublic = await UserSettings.findOne({ userId: user.id });
        // console.log(`isPublic.publicGameList: ${isPublic?.publicGameList}`);

        if (isPublic && isPublic.publicGameList) {
            // If the publicGameList is true, build the query and fetch data
            data = `
                fields name,
                cover.url,
                cover.image_id,
                themes.slug,
                rating,
                storyline,
                summary,
                first_release_date,
                total_rating,
                total_rating_count;
                where id = (${gamesArray.join(',')});
                sort rating desc;
                limit ${gamesArray.length};
                    `;

            // Make the Axios request
            const response = await axios.post(url, data, { headers });

            // Extract the games data from the response
            games = response.data;

            // Render the view with the game data
            res.render('games/myGames', { user, games, imageSize: "logo_med", myGamesCategory, headMessage });
        } else {
            // If the list is not public or settings are missing
            res.render('games/myGames', { user, games, imageSize: "logo_med", myGamesCategory, headMessage: 'List Not Public' });
        }

    } catch (err) {
        console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
        next(err);
    }
}
