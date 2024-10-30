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
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    }
});

// Create Settings model
const UserSettings = mongoose.model('Settings', userSettingsSchema);
