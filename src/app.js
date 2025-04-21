const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Owner credentials (replace with env vars if needed)
const ownerUsername = 'owner';
const ownerPassword = 'password123';

// Set up uploads directory
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Gallery endpoint
app.get('/api/gallery', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) return res.status(500).send('Unable to fetch gallery.');
        const fileUrls = files.map(file => `/uploads/${file}`);
        res.status(200).json({ gallery: fileUrls });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ownerUsername && password === ownerPassword) {
        req.session.loggedIn = true;
        return res.redirect('/gallery.html');
    }
    res.send('<h1>Invalid username or password. <a href="/index4.html">Try again</a></h1>');
});

// Protect gallery
app.use('/gallery.html', (req, res, next) => {
    if (req.session.loggedIn) return next();
    res.redirect('/index4.html');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});