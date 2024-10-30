const mongoose = require('mongoose');
const passportLM = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: 'https://i.redd.it/yvw9wi1q3yi41.jpg'
    },
    favoriteGenres: [{
        type: String
    }],
    favoriteGames: [{
        type: String // Store IGDB game IDs
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create User model
userSchema.plugin(passportLM)
const User = mongoose.model('User', userSchema);

module.exports = User;
