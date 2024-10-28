const axios = require('axios');

// Define your headers
const headers = {
    'Client-ID': process.env.ClientID,           // Replace with your actual Client ID
    'Authorization': process.env.Authorization,  // Replace with your actual token
    'Content-Type': 'text/plain'                 // Specify JSON content type
};

const url = 'https://api.igdb.com/v4/games';

module.exports.index = async (req, res, next) => {
    try {
        // Validate query parameters
        let name = req.query.game?.name;
        let data;
        if (!name) {
            data = `
                fields name, cover.url, cover.image_id, rating;
                where rating > 95;
                limit 10;
            `;
        } else {

            data = `
                search "${name}"; fields name, cover.image_id, rating;
                limit 10;
            `;
        }
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

module.exports.show = async (req, res, next) => {
    const gameId = req.params.id;
    const data = `
        fields name, genres.name, cover.image_id, rating; where id = ${gameId};
    `;
    try {
        // Make the Axios request
        const response = await axios.post(url, data, { headers });

        // Extract the game data from the response
        const game = response.data;

        // Render the view with the game data
        res.render('games/show', { game, imageSize: "720p" });
    } catch (err) {
        console.error('Error fetching data from IGDB:', err.response ? err.response.data : err.message);
        next(err);
    }
}
