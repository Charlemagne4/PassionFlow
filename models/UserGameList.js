const mongoose = require('mongoose');

const userGameListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameId: {
        type: String, // Store the IGDB game ID
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'ongoing', 'dropped', 'playing', 'on hold'],
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create UserGameList model
const UserGameList = mongoose.model('UserGameList', userGameListSchema);

module.exports = UserGameList;
