const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig'); // adjust the path as needed
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jakiano-gallery', // your Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.status(200).json({ url: req.file.path });
});

module.exports = router;

// Gallery Endpoint
router.get('/', (req, res) => {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to fetch gallery.');
        }
        const fileUrls = files.map(file => `/uploads/${file}`);
        res.status(200).json({ gallery: fileUrls });
    });
});

module.exports = router;