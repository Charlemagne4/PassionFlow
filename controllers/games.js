const axios = require('axios')

module.exports.index = async (req, res) => {
    const url = 'https://api.igdb.com/v4/games';
    // Define your headers
    const headers = {
        'Client-ID': process.env.ClientID,           // Replace with your actual Client ID
        'Authorization': process.env.Authorization, // Replace with your actual token
        'Content-Type': 'text/plain'       // Specify JSON content type
    };

    // Define the custom request body
    const data = `
    search "nier"; fields name;
`;

    axios.post(url, data, { headers })
        .then(response => {
            res.send(response.data); // Process the response data as needed
        })
        .catch(error => {
            console.error('Error fetching data from IGDB:', error.response ? error.response.data : error.message);
        });
}