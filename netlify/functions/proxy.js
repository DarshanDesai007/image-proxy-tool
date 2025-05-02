const axios = require('axios');

exports.handler = async function(event, context) {
  // Get the image URL from the query parameters
  const imageUrl = event.queryStringParameters.url;
  
  if (!imageUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Image URL is required' })
    };
  }

  try {
    // Fetch the image using axios instead of fetch
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    
    // Get the image data and content type
    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'];
    
    // Return the image with appropriate headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
};