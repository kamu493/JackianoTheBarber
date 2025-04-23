const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dkwl93p8f',
  api_key: '859149683439439',
  api_secret: 'SyuVSFSCXN8JZazE6giS_FSoOOk',
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jakiano-gallery',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// Upload Endpoint
app.post('/api/gallery/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.status(200).json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

// Fetch Gallery Images
app.get('/api/gallery', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:jakiano-gallery')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const gallery = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    res.json({ gallery });
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch gallery.' });
  }
});

// Delete Image
app.delete('/api/gallery/delete/:publicId', async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

app.get('/', (req, res) => res.send('Gallery backend running.'));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));