const User = require('../models/User'); // Adjust the path as necessary
const { storage, cloudinary } = require('../cloudinary')
const themes = require('../themes').themesById;
const UserSettings = require('../models/UserSettings'); // Path to your UserSettings model


exports.getUserProfile = async (req, res, next) => {
    const userId = req.user.id; // Assuming you're using Passport.js for authentication

    try {
        const user = await User.findById(userId);
        user.favoriteGenres = user.favoriteGenres.map(id => themes[id]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.render('users/Profile', { user });
    } catch (err) {
        return next(err);
    }
};

exports.getFriendProfile = async (req, res, next) => {
    const { userId } = req.params; // Retrieve userId from URL params

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).render("errors/404", { message: 'User not found' });
        }

        res.render('users/profile', { user });
    } catch (err) {
        console.error("Error fetching friend's profile:", err);
        next(err);
    }
};



exports.getEditProfilePage = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('profileImage');
        const userSettings = await UserSettings.findOne({ userId });
        console.log(user);
        res.render("users/profileEdit", { user, userSettings, themes });
    } catch (err) {
        return next(err);
    }
};

// Update Username
exports.updateUsername = async (req, res, next) => {
    const userId = req.user.id;
    const newUsername = req.body.username;

    try {
        const user = await User.findByIdAndUpdate(userId, {
            username: newUsername,
            updatedAt: Date.now() // Update the updatedAt field
        }, { new: true })
        await user.save();
        req.flash('success', `${req.body.username} has become ${user.username}`)
        res.redirect('/profile'); // Redirect back to the profile page

    } catch (err) {
        return next(err)
    }
};

// Update Email
exports.updateEmail = async (req, res, next) => {
    const userId = req.user.id;
    const newEmail = req.body.email;
    try {

        const user = await User.findByIdAndUpdate(userId, {
            email: newEmail,
            updatedAt: Date.now() // Update the updatedAt field
        }, { new: true })
        await user.save();
        req.flash('success', "Email Updated Successfully")
        res.redirect('/profile');
    } catch (err) {
        return next(err)
    }


};

// Update Bio
exports.updateBio = async (req, res, next) => {
    const userId = req.user.id;
    const newBio = req.body.bio;
    try {

        const user = await User.findByIdAndUpdate(userId, {
            bio: newBio,
            updatedAt: Date.now() // Update the updatedAt field
        }, { new: true })
        await user.save();
        req.flash('success', "Bio Updated Successfully")
        res.redirect('/profile');

    } catch (err) {
        return next(err)
    }
};

// Update Favorite Genres
exports.updateFavoriteGenres = async (req, res) => {
    const { selectedThemes } = req.body; // Array of selected theme IDs

    // Map the selected theme IDs to their slugs
    const favoriteGenres = selectedThemes
    // Update the user's favorite genres
    req.user.favoriteGenres = favoriteGenres;

    // Save the user data
    req.user.save();
    res.redirect('/profile');
}


exports.updateprofileImage = async (req, res, next) => {
    console.log("image update in progress");
    const userId = req.user.id;
    const { filename, path } = req.file;
    console.log(req.file);
    const profileImage = {
        fileName: filename,
        url: path
    };
    try {
        if (req.user.profileImage[0]?.fileName) {
            await cloudinary.uploader.destroy(req.user.profileImage[0]?.fileName)
        }
        const user = await User.findByIdAndUpdate(userId, {
            profileImage: profileImage,
            updatedAt: Date.now() // Update the updatedAt field
        }, { new: true })
        await user.save();
        req.flash('success', "Profile image Updated Successfully")
        res.redirect('/profile');

    } catch (err) {
        return next(err)
    }


}

exports.updatePublicGamesList = async (req, res, next) => {
    try {
        const userId = req.user.id;  // Assuming you're using Passport.js for authentication
        const publicGameList = req.body.publicGameList === 'on'; // Checkbox values are sent as strings ('on' or undefined)

        // Find and update the user's settings
        const settings = await UserSettings.findOneAndUpdate(
            { userId },  // Find by userId
            { publicGameList },  // Update the publicGameList field
            { new: true, upsert: true } // Create a new document if it doesn't exist, return the updated document
        );

        // Redirect or respond with success
        res.redirect('/profile'); // Redirect to profile page or wherever you want
    } catch (err) {
        return next(err);
    }
}