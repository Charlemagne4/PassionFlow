const User = require("../models/User")

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}
module.exports.loginForm = (req, res) => {
    console.log(req.path, req.originalUrl);
    res.render('users/login')
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({
            email: email.trim(),
            username: username.trim()
        });

        const registeredUser = await User.register(newUser, password)
        req.login(registeredUser, function (err) {
            if (err) { return next() }
            req.flash('success', 'Welcome to PassionFlow')
            const urlRedirect = res.locals.returnTo || '/games'
            delete res.locals.returnTo
            res.redirect(urlRedirect)
        })
    } catch (err) {
        console.error('Registration error:', err); // Use `err` instead of `error`
        req.flash('error', 'Something went wrong. Please try again.');
        return next(err); // Make sure to return after next() call
    }
}

module.exports.loginUser = async (req, res) => {
    //console.log("res.locals.returnTo: ", res.locals.returnTo);
    const loggedUser = req.user
    req.flash('success', `Welcome back ${loggedUser.username}`)
    const urlRedirect = res.locals.returnTo || '/games'
    delete res.locals.returnTo
    res.redirect(urlRedirect)
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Athala El jeune')
        res.redirect('/')
    })
}

module.exports.sendFriendRequest = async (req, res) => {
    const { id: friendId } = req.params;
    const userId = req.user._id;

    if (userId.equals(friendId)) {
        return res.status(400).json({ error: "You cannot send a friend request to yourself." });
    }

    const user = await User.findById(userId)
        .populate('friendRequests.userId')
        .populate('friends.userId');
    const friend = await User.findById(friendId)
        .populate('friendRequests.userId')
        .populate('friends.userId');

    if (!friend) {
        return res.status(404).json({ error: "User not found." });
    }

    // Check if userId exists in friend requests
    const existingRequest = user.friendRequests.find(request =>
        request.userId && request.userId._id && String(request.userId._id) === String(friendId) && request.status === 'pending'
    );

    const alreadyFriends = user.friends.some(friend =>
        friend.userId && friend.userId._id && String(friend.userId._id) === String(friendId)
    );

    if (existingRequest) {
        return res.status(400).json({ error: "Friend request already sent." });
    }

    if (alreadyFriends) {
        return res.status(400).json({ error: "User is already a friend." });
    }

    // Add the friend request to the target user
    friend.friendRequests.push({
        userId: userId,
        status: 'pending',
        sentAt: new Date() // Add timestamp for when the request was sent
    });

    await friend.save();

    res.redirect(`/friends/profile/${friendId}`);///friends/profile/<%= friend.userId._id %>
};

module.exports.acceptFriendRequest = async (req, res) => {
    const { id: friendId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
        return res.status(404).json({ error: "User not found." });
    }

    const friendRequest = user.friendRequests.find(request => request.userId.equals(friendId) && request.status === 'pending');

    if (!friendRequest) {
        return res.status(400).json({ error: "No pending friend request from this user." });
    }

    // Update status to accepted, add the user to the other's friends list
    friendRequest.status = 'accepted';
    friendRequest.acceptedAt = new Date(); // Timestamp when request is accepted

    user.friends.push({
        userId: friendId,
        acceptedAt: new Date() // Add timestamp for when the friend request was accepted
    });

    friend.friends.push({
        userId: userId,
        acceptedAt: new Date() // Add timestamp for when the friend request was accepted
    });

    // Remove the request from the friend's pending list
    user.friendRequests = user.friendRequests.filter(request => !request.userId.equals(friendId));
    friend.friendRequests = friend.friendRequests.filter(request => !request.userId.equals(userId));

    await user.save();
    await friend.save();

    res.redirect(`/friends/profile/${friendId}`);
};

module.exports.rejectFriendRequest = async (req, res) => {
    const { id: friendId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
        return res.status(404).json({ error: "User not found." });
    }

    const friendRequest = user.friendRequests.find(request => request.userId.equals(friendId) && request.status === 'pending');

    if (!friendRequest) {
        return res.status(400).json({ error: "No pending friend request from this user." });
    }

    // Remove the friend request from both user and friend
    user.friendRequests = user.friendRequests.filter(request => !request.userId.equals(friendId));
    friend.friendRequests = friend.friendRequests.filter(request => !request.userId.equals(userId));

    await user.save();
    await friend.save();

    res.redirect(`/friends/profile/${friendId}`);
};

module.exports.viewFriendsList = async (req, res) => {
    try {
        const userId = req.user._id;

        // Retrieve user and populate friend details (only username, profileImage, and email)
        const user = await User.findById(userId).populate('friends.userId', 'username profileImage email');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.render("users/friends", { friends: user.friends });
    } catch (error) {
        console.error("Error retrieving friends list:", error);
        res.status(500).json({ error: "An error occurred while retrieving friends list" });
    }
};

module.exports.searchUsers = async (req, res, next) => {
    try {
        const query = req.query.q || ''; // Get the search query from the query parameters
        const regex = new RegExp(query, 'i'); // Create a case-insensitive regex for the search term

        const excludeUserId = req.user.id; // Replace with the actual ID you want to exclude

        // Find users whose username or email matches the search query
        const users = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: regex } },
                        { email: { $regex: regex } }
                    ]
                },
                { _id: { $ne: excludeUserId } } // Exclude the user with this ID
            ]
        }).lean({ virtuals: true }).select('username email profileImage _id');


        // Debug: log the users to check profileImage
        // console.log(JSON.stringify(users, null, 2)); // This will log the full structure of the users

        // Send the filtered users as a JSON response
        res.json({ users });
    } catch (err) {
        console.error("Error searching users:", err);
        next(err);  // Forward the error to the next middleware (error handler)
    }
};

module.exports.listAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('friends.userId', 'username profileImage email');
        res.render('users/index', { users });
    } catch (error) {
        res.status(500).json({ error: "Error fetching users." });
    }
};


