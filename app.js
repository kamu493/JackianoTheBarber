const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Owner credentials
const ownerUsername = 'owner';
const ownerPassword = 'password123';

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Uploads directory setup
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ownerUsername && password === ownerPassword) {
        req.session.loggedIn = true;
        res.redirect('/gallery.html');
    } else {
        res.send(`
            <html>
                <head>
                    <title>Login Failed</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f8d7da;
                            color: #721c24;
                            padding: 2rem;
                            text-align: center;
                        }
                        a {
                            color: #721c24;
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <h2>Invalid username or password.</h2>
                    <p><a href="/login.html">Try again</a></p>
                </body>
            </html>
        `);
    }
});

// Upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = '/uploads/' + req.file.filename;
    res.status(200).json({ filePath });
});

// Import and use gallery route
const galleryRoute = require('./routes/galleryRoute');
app.use('/api/gallery', galleryRoute);

// Default route
app.get('/', (req, res) => {
    res.send('Backend is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});