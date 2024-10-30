const mongoose = require('mongoose');
const passportLM = require('passport-local-mongoose');

const imageSchema = new mongoose.Schema({
    url: String,
    fileName: String
});

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300')
})
const options = { toJSON: { virtuals: true } };
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
    profileImage: [imageSchema],
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

// userSchema.post('findOneAndDelete', async (data) => {
//     if (data) {
//         await Review.deleteMany({
//             _id: { $in: data.reviews }
//         })
//     }
// })

// Create User model
userSchema.plugin(passportLM)
const User = mongoose.model('User', userSchema);

module.exports = User;
