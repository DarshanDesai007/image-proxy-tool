const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static('.'));

// Image proxy endpoint
app.get('/proxy-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        
        if (!imageUrl) {
            return res.status(400).send('Image URL is required');
        }
        
        // Fetch the image
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        
        // Set the content type to match the original image
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        
        // Send the image data
        res.send(response.data);
    } catch (error) {
        console.error('Error proxying image:', error.message);
        res.status(500).send('Error fetching image');
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});