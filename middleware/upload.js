const multer = require('multer');
const path = require('path');

// Where to store uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // e.g.  profileImage-1722700000000.png
        const uniqueName = `profileImage-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg\+xml|svg/;
    const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowedTypes.test(file.mimetype);
    if (extValid && mimeValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (SVG, PNG, JPG, GIF)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

module.exports = upload;
