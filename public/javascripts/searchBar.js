$(document).ready(function () {
    let timeout;
    const searchResultItem = '<a href="/games/<%= game.id %>"><div class="game"><h1><%= game.name %></h1><img src="<%= game.cover ? `https://images.igdb.com/igdb/image/upload/t_${imageSize}/${game.cover.image_id}.jpg` : "https://i.ytimg.com/vi/m8i5JuwI_V0/hqdefault.jpg" %>" alt="<%= game.name %>"></div></a>'

    $('#search').on('input', function () {
        const query = $(this).val().trim(); // Trim whitespace

        clearTimeout(timeout); // Clear the previous timeout

        if (query.length > 0) {
            timeout = setTimeout(function () {
                $.ajax({
                    url: '/games/search', // Your search endpoint
                    type: 'GET',
                    data: { q: query },
                    success: function (data) {
                        console.log(data); // Log the data to see the structure
                        $('#search-results').empty(); // Clear previous results

                        if (data.length > 0) {
                            $('#search-results').show(); // Show the results container

                            // Append each game to the results
                            data.forEach(game => {
                                // Construct the HTML for each search result item
                                const searchResultItem = `
                                        <div class="search-result-item">
                                            <a href="/games/${game.id}" class="text-decoration-none">
                                                <div class="d-flex align-items-center">
                                                    <img src="${game.cover ? `https://images.igdb.com/igdb/image/upload/t_thumb/${game.cover.image_id}.jpg` : 'https://i.ytimg.com/vi/m8i5JuwI_V0/hqdefault.jpg'}"  
                                                        class="cover-image me-2">
                                                    <h5 class="mb-0 game-title text-dark">${game.name}</h5>
                                                </div>
                                            </a>
                                        </div>`;
                                $('#search-results').append(searchResultItem);
                            });



                        } else {
                            $('#search-results').empty(); // Show the results container
                        }
                    },
                    error: function (err) {
                        console.error('Error searching for games:', err);
                    }
                });
            }, 300); // Wait for 300 ms after the user stops typing
        } else {
            $('#search-results').empty(); // Clear results if input is empty
            $('#search-results').hide(); // Hide the results container
        }
    });

    // Close results when clicking outside
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#search-form').length) {
            $('#search-results').empty(); // Clear results on click outside
            $('#search-results').hide(); // Hide the results container
        }
    });
});
