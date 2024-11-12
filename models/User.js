const mongoose = require('mongoose');
const passportLM = require('passport-local-mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const imageSchema = new mongoose.Schema({
    url: String,
    fileName: String
});

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300');
});

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
    friends: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acceptedAt: {
            type: Date
        }
    }], // Array of User IDs representing accepted friends
    friendRequests: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        sentAt: {
            type: Date,
            default: Date.now
        }
    }], // Array to store pending friend requests
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, options);

userSchema.plugin(passportLM);
userSchema.plugin(mongooseLeanVirtuals);
const User = mongoose.model('User', userSchema);

module.exports = User;

// userSchema.post('findOneAndDelete', async (data) => {
//     if (data) {
//         await Review.deleteMany({
//             _id: { $in: data.reviews }
//         })
//     }
// })