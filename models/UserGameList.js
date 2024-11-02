const mongoose = require('mongoose');

const userGameListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameId: {
        type: String, // Stores the unique IGDB game ID
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'ongoing', 'dropped', 'playing', 'on hold'],
        required: true
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Add a unique compound index on userId and gameId to prevent duplicates
userGameListSchema.index({ userId: 1, gameId: 1 }, { unique: true });

// Create UserGameList model
const UserGameList = mongoose.model('UserGameList', userGameListSchema);

module.exports = UserGameList;
