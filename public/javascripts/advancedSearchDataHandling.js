let debounceTimer;

// Function to log the current state of form inputs
function logFormData() {
    const formData = {};

    // Get start and end year values
    const startYearInput = document.getElementById('startValueInput');
    const endYearInput = document.getElementById('endValueInput');

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
                console.log('Response:', data); // Handle response data here
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
    button.addEventListener('click', event => {
        event.preventDefault(); // Prevent default form submission
        logFormData();
    });
});
