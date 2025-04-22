const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up the uploads directory
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Gallery endpoint
app.get('/api/gallery', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to fetch gallery.');
        }
        const fileUrls = files.map((file) => `/uploads/${file}`);
        res.status(200).json({ gallery: fileUrls });
    });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'secret-key', // Replace with a secure secret key
        resave: false,
        saveUninitialized: true,
    })
);

// Owner credentials (plain text)
const ownerUsername = 'owner'; // Replace with your desired username
const ownerPassword = 'password123'; // Replace with your desired password

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate username and password
    if (username === ownerUsername && password === ownerPassword) {
        req.session.loggedIn = true; // Set session variable
        return res.redirect('/gallery.html'); // Redirect to gallery page
    } else {
        return res.send('<h1>Invalid username or password. <a href="/index4.html">Try again</a></h1>');
    }
});

// Middleware to protect gallery route
app.use('/gallery.html', (req, res, next) => {
    if (req.session.loggedIn) {
        next(); // Allow access if logged in
    } else {
        res.redirect('/index4.html'); // Redirect to login page if not logged in
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});