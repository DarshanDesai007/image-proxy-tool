document.addEventListener('DOMContentLoaded', function() {
    const imageUrlInput = document.getElementById('imageUrl');
    const checkButton = document.getElementById('checkButton');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const errorMessage = document.getElementById('errorMessage');
    const jpegButton = document.getElementById('jpegButton');
    const pngButton = document.getElementById('pngButton');
    const proxyUrl = '/.netlify/functions/proxy?url=';
    // Check image when button is clicked
    checkButton.addEventListener('click', checkImage);
    
    // Also check image when Enter key is pressed in the input field
    imageUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkImage();
        }
    });
    
    // Function to check if the URL contains a valid image
    function checkImage() {
        const originalUrl = imageUrlInput.value.trim();
        
        if (!originalUrl) {
            showError('Please enter an image URL');
            return;
        }
        
        // Reset UI
        imagePreview.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Show loading state
        checkButton.textContent = 'Checking...';
        checkButton.disabled = true;
        
        // Create a proxied URL
        const proxiedUrl = `http://localhost:3000/proxy-image?url=${encodeURIComponent(originalUrl)}`;
        
        // Create a new image object to test the URL
        const img = new Image();
        
        img.onload = function() {
            // Image loaded successfully
            previewImage.src = proxiedUrl;
            previewImage.dataset.originalUrl = originalUrl; // Store original URL for reference
            imagePreview.classList.remove('hidden');
            resetButton();
        };
        
        img.onerror = function() {
            // Failed to load image
            showError('No valid image found at the provided URL. Please check the URL and try again.');
            resetButton();
        };
        
        // Set the source to trigger loading
        img.src = proxiedUrl;
    }
    
    function resetButton() {
        checkButton.textContent = 'Check Image';
        checkButton.disabled = false;
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Download as JPEG
    jpegButton.addEventListener('click', function() {
        downloadImage('jpeg');
    });
    
    // Download as PNG
    pngButton.addEventListener('click', function() {
        downloadImage('png');
    });
    
    // Function to download the image in the specified format
    function downloadImage(format) {
        try {
            const imageUrl = previewImage.src;
            
            // Create a new image with crossOrigin set
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Set up onload handler to process the image after it loads
            img.onload = function() {
                // Create a canvas element
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions to match the image
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0);
                
                // Get the image data URL in the specified format
                let dataURL;
                try {
                    if (format === 'jpeg') {
                        dataURL = canvas.toDataURL('image/jpeg', 1.0); // 1.0 is maximum quality
                    } else {
                        dataURL = canvas.toDataURL('image/png');
                    }
                    
                    // Create a temporary link element
                    const downloadLink = document.createElement('a');
                    
                    // Get original filename from the original URL if available
                    // In downloadImage function, replace these lines:
                    // const originalUrl = previewImage.dataset.originalUrl || imageUrl;
                    // const originalFilename = originalUrl.split('/').pop().split('?')[0] || 'image';
                    // const filenameWithoutExtension = originalFilename.split('.')[0] || 'image';
                    
                    // With:
                    const originalUrl = previewImage.dataset.originalUrl || imageUrl;
                    const filenameWithoutExtension = extractFilename(originalUrl);
                    downloadLink.download = `${filenameWithoutExtension}.${format}`;
                    
                    // Set the href attribute to the data URL
                    downloadLink.href = dataURL;
                    
                    // Append the link to the document
                    document.body.appendChild(downloadLink);
                    
                    // Trigger the download
                    downloadLink.click();
                    
                    // Remove the link from the document
                    document.body.removeChild(downloadLink);
                } catch (canvasError) {
                    // If toDataURL fails, try direct download as fallback
                    console.warn('Canvas export failed, trying direct download:', canvasError);
                    directDownload(imageUrl, format);
                }
            };
            
            // Set the source to trigger loading
            img.src = imageUrl;
            
            // Handle load errors
            img.onerror = function() {
                showError('Error loading image for download');
            };
        } catch (error) {
            // Handle errors
            showError('Error downloading image: ' + error.message);
            console.error('Download error:', error);
        }
    }
  
    // Add this new function for direct download fallback
    // In the directDownload function, remove the extractFilename function definition
    function directDownload(imageUrl, format) {
        // Create a temporary link element
        const downloadLink = document.createElement('a');
        
        // Get original filename from the URL
        const originalUrl = previewImage.dataset.originalUrl || imageUrl;
        const filenameWithoutExtension = extractFilename(originalUrl);
        downloadLink.download = `${filenameWithoutExtension}.${format}`;
        
        // Set the href to the proxied image URL
        downloadLink.href = imageUrl;
        
        // Append the link to the document
        document.body.appendChild(downloadLink);
        
        // Trigger the download
        downloadLink.click();
        
        // Remove the link from the document
        document.body.removeChild(downloadLink);
    }
    
    // Move the extractFilename function outside both functions so it's accessible to both
    // Add this function before the downloadImage function
    function extractFilename(url) {
        // Remove query parameters
        const urlWithoutQuery = url.split('?')[0];
        
        // Get the last part of the path
        let filename = urlWithoutQuery.split('/').pop();
        
        // Handle wikia/fandom URLs with /revision/ in the path
        if (filename === 'latest' || filename.startsWith('revision')) {
            // Go back one more segment to get the actual filename
            const segments = urlWithoutQuery.split('/');
            // Find the index of 'revision' or 'latest'
            const revIndex = segments.findIndex(seg => seg === 'latest' || seg === 'revision');
            if (revIndex > 0) {
                filename = segments[revIndex - 1];
            }
        }
        
        // If filename still contains periods, extract the name part
        const filenameWithoutExtension = filename.split('.')[0] || 'image';
        
        return filenameWithoutExtension;
    }
});