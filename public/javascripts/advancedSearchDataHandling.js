// This function will be called when the page reloads
window.onload = function () {
    // Clear all text inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"], textarea');
    inputs.forEach(input => {
        input.value = ''; // Clear value
    });

    let endYearInputs = '';
    let startYearInputs = '';

    endYearInputs = document.querySelector('input[name="endYear"]');
    endYearInputs.value = new Date().getFullYear();

    startYearInputs = document.querySelector('input[name="startYear"]');
    startYearInputs.value = 1958;

    // Uncheck all checkboxes and radio buttons
    const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; // Uncheck checkbox or radio button
    });


    logFormData()
};
let debounceTimer;

// Function to log the current state of form inputs
function logFormData() {
    const formData = {};

    // Get start and end year values
    const startYearInput = document.getElementById('startValueInput');
    const endYearInput = document.getElementById('endValueInput');

    // Get the search input
    const searchQuery = document.querySelector('input[name="nameSearch"]');
    if (searchQuery) {
        formData.searchQuery = searchQuery.value;
    }

    // Check if inputs exist and retrieve values
    formData.startYear = startYearInput ? startYearInput.value : '';
    formData.endYear = endYearInput ? endYearInput.value : '';

    // Get the checked status of themes checkboxes
    const themeCheckboxes = document.querySelectorAll('input[name="themes[]"]:checked');
    formData.themes = Array.from(themeCheckboxes).map(cb => cb.value);

    // Get the checked status of platforms checkboxes
    const platformCheckboxes = document.querySelectorAll('input[name="platforms[]"]:checked');
    formData.platforms = Array.from(platformCheckboxes).map(cb => cb.value);

    // Log the data to check what is being captured
    console.log('Form data:', formData);

    // Clear the previous timer if the user types again before 300ms
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        let query = JSON.stringify(formData)
        // Send an AJAX request to the search route
        fetch('/games/advancedSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: query,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch games. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const gameResults = document.getElementById('game-results');
                gameResults.innerHTML = '';
                if (data.games.length > 0) {
                    data.games.forEach(game => {
                        let reviewLabel = '';
                        let reviewClass = '';

                        if (game.rating >= 95) {
                            reviewLabel = 'Overwhelmingly Positive';
                            reviewClass = 'overwhelmingly-positive';
                        } else if (game.rating >= 85) {
                            reviewLabel = 'Very Positive';
                            reviewClass = 'very-positive';
                        } else if (game.rating >= 70) {
                            reviewLabel = 'Positive';
                            reviewClass = 'positive';
                        } else if (game.rating >= 50) {
                            reviewLabel = 'Mostly Positive';
                            reviewClass = 'mostly-positive';
                        } else if (game.rating >= 40) {
                            reviewLabel = 'Mixed';
                            reviewClass = 'mixed';
                        } else if (game.rating >= 20) {
                            reviewLabel = 'Mostly Negative';
                            reviewClass = 'mostly-negative';
                        } else if (game.rating >= 10) {
                            reviewLabel = 'Negative';
                            reviewClass = 'negative';
                        } else {
                            reviewLabel = 'Overwhelmingly Negative';
                            reviewClass = 'overwhelmingly-negative';
                        }
                        const gamesCard = `
        <a href="/games/${game.id}" class="game-card">
            <img src="${game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : 'https://i.ytimg.com/vi/m8i5JuwI_V0/hqdefault.jpg'}" alt="Elden Ring">
            <div class="game-info">
                <h2 class="game-title" data-title="${game.name}">${game.name}</h2>
                <span class="game-rating">
                <span class="rating-score ${reviewClass}">${Math.floor(game.rating)}</span>
                - ${reviewLabel}
                </span>
            </div>
        </a>
                        `;
                        gameResults.insertAdjacentHTML('beforeend', gamesCard);
                    })

                } else {
                    gameResults.innerHTML = '<p>No games found.</p>';
                }

            })
            .catch(error => {
                console.error('Error fetching games:', error);
            });
    }, 300); // Debounce time of 300ms
}

// Attach event listeners to all inputs to log data on change
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', logFormData);
});

// Attach event listeners to buttons to log data on click
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', event => { // Prevent default form submission
        logFormData();
    });
});
