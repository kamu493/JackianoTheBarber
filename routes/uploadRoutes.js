const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig'); // make sure this file is set up
const router = express.Router();

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jakiano-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Upload Endpoint
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.status(200).json({
    url: req.file.path,             // This is the Cloudinary image URL
    public_id: req.file.filename,   // This is the Cloudinary public ID (needed to delete)
  });
});

module.exports = router;