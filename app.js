const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS and static folder
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Cloudinary config
cloudinary.config({
    cloud_name: 'dkwl93p8f',
    api_key: '859149683439439',
    api_secret: 'SyuVSFSCXN8JZazE6giS_FSoOOk',
});

// Multer storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jakiano-gallery',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const upload = multer({ storage });

// Hardcoded owner credentials
const ownerUsername = 'owner';
const ownerPassword = 'password123';

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ownerUsername && password === ownerPassword) {
        req.session.loggedIn = true;
        return res.redirect('/gallery.html');
    }
    res.status(401).send('Invalid login');
});

// Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    res.status(200).json({
        filePath: req.file.path,
        public_id: req.file.filename // Needed for deletion
    });
});

// Fetch gallery images from Cloudinary
app.get('/api/gallery', async (req, res) => {
    try {
        const result = await cloudinary.search
            .expression('folder:jakiano-gallery')
            .sort_by('created_at', 'desc')
            .max_results(50)
            .execute();

        const gallery = result.resources.map(file => ({
            url: file.secure_url,
            public_id: file.public_id
        }));

        res.json({ gallery });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch gallery.' });
    }
});

// Delete image from Cloudinary
app.delete('/api/gallery/delete/:public_id', async (req, res) => {
    try {
        const result = await cloudinary.uploader.destroy(req.params.public_id);
        if (result.result !== 'ok') {
            throw new Error('Delete failed');
        }
        res.json({ message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Deletion failed' });
    }
});

// Root
app.get('/', (req, res) => res.send('Backend is running...'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));