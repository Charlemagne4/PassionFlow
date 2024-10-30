const User = require('../models/User'); // Adjust the path as necessary

exports.getUserProfile = async (req, res, next) => {
    const userId = req.user.id; // Assuming you're using Passport.js for authentication

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.render('users/Profile', { user });
    } catch (err) {
        return next(err);
    }
};


exports.getEditProfilePage = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId).populate('profileImage');
        console.log(user);
        res.render("users/profileEdit", { user });
    } catch (err) {
        return next(err)
    }
}

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
exports.updateFavoriteGenres = async (req, res, next) => {
    const userId = req.user.id;
    const { genre, newGenre } = req.body;

    try {
        if (genre) {
            // Remove genre
            const user = await User.findByIdAndUpdate(userId, {
                $pull: { favoriteGenres: genre },
                updatedAt: Date.now() // Update the updatedAt field
            }, { new: true })
            await user.save();
            req.flash('success', "genre deleted? Successfully")
            res.redirect('/profile');

        } else if (newGenre) {
            // Add new genre
            const user = await User.findByIdAndUpdate(userId, {
                $addToSet: { favoriteGenres: newGenre },
                updatedAt: Date.now() // Update the updatedAt field
            }, { new: true })
            await user.save();
            req.flash('success', "genre updated?  Successfully")
            res.redirect('/profile');

        }
    } catch (err) {
        return next(err)
    }
};


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