const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors'); // Enable CORS

const app = express();
app.use(cors()); // Allow cross-origin requests

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
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ownerUsername && password === ownerPassword) {
        req.session.loggedIn = true;
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
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

// Default route
app.get('/', (req, res) => {
    res.send('Backend is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});