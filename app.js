const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials
const ownerUsername = 'owner';
const ownerPassword = 'password123';

// Upload directory setup
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ownerUsername && password === ownerPassword) {
        req.session.loggedIn = true;
        return res.redirect('/gallery.html');
    }
    res.send(`
        <html>
            <head><title>Login Failed</title></head>
            <body style="background:#f8d7da; color:#721c24; text-align:center; padding:2rem;">
                <h2>Invalid username or password.</h2>
                <p><a href="/login.html">Try again</a></p>
            </body>
        </html>
    `);
});

// Upload route (admin only)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = '/uploads/' + req.file.filename;
    res.status(200).json({ filePath });
});

// Delete image (admin only)
app.delete('/api/delete/:filename', (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting file' });
        }
        res.json({ message: 'File deleted successfully' });
    });
});

// Get gallery images
app.get('/api/gallery', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read uploads.' });
        }

        const gallery = files.map(file => '/uploads/' + file);
        res.json({ gallery });
    });
});

// Root route
app.get('/', (req, res) => {
    res.send('Backend is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});