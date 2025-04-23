const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jakiano-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage: storage });

const galleryFile = path.join(__dirname, '../gallery.json');

// Upload image to Cloudinary
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.status(200).json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

// Save uploaded image info
router.post('/save-image', (req, res) => {
  const { url, public_id } = req.body;
  if (!url || !public_id) return res.status(400).json({ error: 'Missing fields' });

  fs.readFile(galleryFile, 'utf8', (err, data) => {
    const images = err ? [] : JSON.parse(data);
    images.push({ url, public_id });

    fs.writeFile(galleryFile, JSON.stringify(images, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to save image' });
      res.status(200).json({ message: 'Image saved' });
    });
  });
});

// Fetch gallery
router.get('/', (req, res) => {
  fs.readFile(galleryFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch gallery' });
    const images = JSON.parse(data || '[]');
    res.json({ gallery: images });
  });
});

// Delete image
router.delete('/delete/:public_id', (req, res) => {
  const publicId = req.params.public_id;

  cloudinary.uploader.destroy(publicId, (err, result) => {
    if (err) return res.status(500).json({ error: 'Cloudinary deletion failed' });

    // Remove from gallery.json
    fs.readFile(galleryFile, 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: 'Error reading gallery data' });
      let images = JSON.parse(data || '[]');
      images = images.filter(img => img.public_id !== publicId);

      fs.writeFile(galleryFile, JSON.stringify(images, null, 2), err => {
        if (err) return res.status(500).json({ error: 'Failed to update gallery' });
        res.status(200).json({ message: 'Image deleted' });
      });
    });
  });
});

module.exports = router;