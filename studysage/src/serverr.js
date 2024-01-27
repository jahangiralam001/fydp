const path = require('path');
const express = require('express');
const app = express();

// Serve static files from the 'enhance-chatai/build' folder
app.use(express.static(path.join(__dirname, './ai_bot/build')));

// Serve the React app for any route
app.get('/ai', function (req, res) {
  res.sendFile(path.join(__dirname, './ai_bot/build', 'index.html'));
});

// Start the server on port 9000
app.listen(9000, () => {
  console.log('Server is running on http://localhost:9000');
});