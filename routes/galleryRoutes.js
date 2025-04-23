const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig'); // make sure this file exports configured cloudinary object

const router = express.Router();

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jakiano-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
  },
});

const upload = multer({ storage: storage });

// Upload Route
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  res.status(200).json({
    url: req.file.path,
    public_id: req.file.filename, // important for deleting
  });
});

// Fetch all images (you’ll need to store them somewhere or load from DB in real app)
let uploadedImages = []; // Temporary in-memory array (not for production)

// Add uploaded image to list
router.post('/save-image', (req, res) => {
  const { url, public_id } = req.body;
  if (url && public_id) {
    uploadedImages.push({ url, public_id });
    res.status(200).json({ message: 'Image saved' });
  } else {
    res.status(400).json({ error: 'Invalid image data' });
  }
});

// Get gallery
router.get('/', (req, res) => {
  res.status(200).json({ gallery: uploadedImages });
});

// Delete image
router.delete('/delete/:public_id', async (req, res) => {
  const publicId = req.params.public_id;

  try {
    await cloudinary.uploader.destroy(`jakiano-gallery/${publicId}`);
    // Remove from array
    uploadedImages = uploadedImages.filter(img => img.public_id !== publicId);
    res.status(200).json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;