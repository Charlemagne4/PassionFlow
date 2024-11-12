let debounceTimer;

document.getElementById('userSearch').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();

    // Clear the previous timer if the user types again before 300ms
    clearTimeout(debounceTimer);

    // Set a new timer for 300ms
    debounceTimer = setTimeout(function () {
        // Send an AJAX request to the search route
        fetch(`/users/search?q=${searchValue}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then(data => {
                const usersList = document.getElementById('usersList');
                usersList.innerHTML = ''; // Clear previous results

                if (data.users.length > 0) {
                    // Loop through the users and display them as Bootstrap cards
                    data.users.forEach(user => {
                        const userCard = `
                            <div class="col-md-3 user-card">
                                <a href="/friends/profile/${user._id}" class="text-decoration-none">
                                    <div class="card mb-4">
                                        <img src="${user.profileImage[0]?.thumbnail || 'default-thumbnail.jpg'}" 
                                             alt="Profile Image" 
                                             class="card-img-top user-profile-image" style="max-height:170px" />
                                        <div class="card-body text-center">
                                            <h5 class="card-title user-name">${user.username}</h5>
                                            <p class="card-text text-muted">${user.email}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                        usersList.insertAdjacentHTML('beforeend', userCard);
                    });
                } else {
                    usersList.innerHTML = '<p>No users found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching search results:', error);
                const usersList = document.getElementById('usersList');
                usersList.innerHTML = '<p>An error occurred while fetching users. Please try again later.</p>';
            });
    }, 300);  // 300ms delay after the user stops typing
});