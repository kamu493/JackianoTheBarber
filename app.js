const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
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
    api_secret: 'SyuVSFSCXN8JZazE6giS_FSoOOk'
});

// Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'jakiano-gallery',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const upload = multer({ storage });

// Admin credentials
const bcrypt = require('bcrypt');

const ownerUsername = 'owner';
const hashedPassword = '$2b$10$jAXiUn0ElAx8IkEisYMuJemysjCOgRI2Ib.6xEZ8BvJjWUJAk6IF2'; // hashed version of 'phoofolo'

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === ownerUsername) {
        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
            req.session.loggedIn = true;
            return res.redirect('/gallery.html');
        }
    }

    res.status(401).send('Invalid login');
});

// Upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.status(200).json({ filePath: req.file.path });
});

// Gallery route
app.get('/api/gallery', async (req, res) => {
    try {
        const result = await cloudinary.search
            .expression('folder:jakiano-gallery')
            .sort_by('created_at', 'desc')
            .max_results(50)
            .execute();
        const gallery = result.resources.map(file => file.secure_url);
        res.json({ gallery });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch gallery.' });
    }
});

// Root route
app.get('/', (req, res) => res.send('Backend is running...'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));