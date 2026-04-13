#!/usr/bin/env node

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the demo/dist directory
app.use(express.static(path.join(__dirname, '../demo/dist')));

// For any other request, serve the index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../demo/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send(`
        <h1>Error: Demo files not found.</h1>
        <p>Please make sure the demo has been built correctly.</p>
        <p>You might need to run a build command within the package directory.</p>
        <p>Looking for: ${indexPath}</p>
      `);
    }
  });
});

app.listen(port, () => {
  console.log(`A2A-React-UI demo server running at http://localhost:${port}`);
  console.log('Navigate to this URL in your browser to see the demo.');
});
