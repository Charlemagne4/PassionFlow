function filterItems(searchQueryId, itemClass, popItems, itemNameClass, itemIdClass) {
    const searchQuery = document.getElementById(searchQueryId).value.toLowerCase();
    const items = document.querySelectorAll(itemClass);

    items.forEach(item => {
        const itemName = item.querySelector(itemNameClass).textContent.toLowerCase();
        const itemId = item.getAttribute(itemIdClass);
        const checkbox = item.querySelector('input[type="checkbox"]');

        if (searchQuery === "") {
            // If search bar is empty, show only popItems or if checkbox is checked
            if (popItems.includes(parseInt(itemId)) || checkbox.checked) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        } else {
            // If search bar has input, show items that match search query
            if (itemName.includes(searchQuery)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}
function resetItems(searchQueryId, itemClass, popItems, itemNameClass, itemIdClass) {
    // Clear the search bar value
    document.getElementById(searchQueryId).value = '';

    const items = document.querySelectorAll(itemClass);

    items.forEach(item => {
        const itemId = item.getAttribute(itemIdClass);
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = false;
        // Show only popItems, reset checkbox state
        if (popItems.includes(parseInt(itemId))) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
// Platform Filter Function
function filterPlatforms() {
    filterItems('platform-search', '.platform-item', popPlatforms, 'label', 'data-platform-id');
}

// Platform Reset Function
function resetPlatforms() {
    resetItems('platform-search', '.platform-item', popPlatforms, 'label', 'data-platform-id');
}
// Theme Filter Function
function filterThemes() {
    filterItems('theme-search', '.theme-item', popThemes, 'label', 'data-theme-id');
}

// Theme Reset Function
function resetThemes() {
    resetItems('theme-search', '.theme-item', popThemes, 'label', 'data-theme-id');
}


// -----------------------------Slider Functionality to show selected value
const startValueInput = document.getElementById('startValueInput');
const endValueInput = document.getElementById('endValueInput');

// // Update the values when the number inputs are changed
// startValueInput.addEventListener('input', () => {
//     if (parseInt(startValueInput.value) > parseInt(endValueInput.value)) {
//         endValueInput.value = startValueInput.value; // Ensure end year is not less than start year
//     }
//     updateRange();
// });

// endValueInput.addEventListener('input', () => {
//     if (parseInt(startValueInput.value) > parseInt(endValueInput.value)) {
//         startValueInput.value = endValueInput.value; // Ensure start year is not greater than end year
//     }
//     updateRange();
// });

// Function to display the selected range
function updateRange() {
    const startYear = startValueInput.value;
    const endYear = endValueInput.value;

    // Log the range (you can send this range to your backend or use it in any way)
    console.log(`Selected range: ${startYear} - ${endYear}`);
}

// Initial call to set the initial range
updateRange();
