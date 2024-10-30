const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.APIkey,
    api_secret: process.env.APIsecret // Click 'View API Keys' above to copy your API secret
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'PassionFlow',
        allowerFormats: ['jpeg', 'png', 'jpg', 'webh']
    }

});

module.exports = {
    cloudinary,
    storage
}