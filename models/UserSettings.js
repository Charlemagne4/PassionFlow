const mongoose = require('mongoose');
const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    theme: {
        type: String,
        default: 'light'
    },
    language: {
        type: String,
        default: 'en'
    },
    publicGameList: {
        type: Boolean,
        default: 'false'
    },
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
});

// Create the UserSettings model
const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings;
