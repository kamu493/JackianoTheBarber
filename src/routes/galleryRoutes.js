const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Gallery Endpoint
router.get('/', (req, res) => {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to fetch gallery.');
        }
        const fileUrls = files.map(file => `/uploads/${file}`);
        res.status(200).json({ gallery: fileUrls });
    });
});

module.exports = router;