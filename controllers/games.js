const axios = require('axios')
// Define your headers
const headers = {
    'Client-ID': process.env.ClientID,           // Replace with your actual Client ID
    'Authorization': process.env.Authorization, // Replace with your actual token
    'Content-Type': 'text/plain'       // Specify JSON content type
};
const url = 'https://api.igdb.com/v4/games';


module.exports.index = async (req, res) => {
    // Define the custom request body
    const name = req.query.game.name;
    const data = `
    search "${name}"; fields name, genres.name, cover.url, rating;
    limit 10;
`;
    try {
        // Make the Axios request
        const response = await axios.post(url, data, { headers });
        //console.log(response);

        // Extract the games data from the response
        const games = response.data;

        // Render the view with the games data
        res.render('games/index', { games });
    } catch (error) {
        console.error('Error fetching data from IGDB:', error.response ? error.response.data : error.message);
        res.status(500).render('error', { error: error.message }); // Render an error view
    }
}

module.exports.show = async (req, res) => {
    //console.log(req.params);

    const gameId = req.params.id
    const data = `
    fields name, genres.name, cover.url, rating; where id = ${gameId};
`;
    try {
        // Make the Axios request
        const response = await axios.post(url, data, { headers });
        //console.log(response);

        // Extract the games data from the response
        const game = response.data;
        console.log(game);

        // Render the view with the games data
        res.render('games/show', { game });
    } catch (error) {
        console.error('Error fetching data from IGDB:', error.response ? error.response.data : error.message);
        res.status(500).render('error', { error: error.message }); // Render an error view
    }
}