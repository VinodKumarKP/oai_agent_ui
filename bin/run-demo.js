#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const port = 3000;

const demoDistPath = path.join(__dirname, '..', 'demo', 'dist');
const demoHtmlPath = path.join(demoDistPath, 'index.html');

function startServer() {
  app.use(express.static(demoDistPath));

  app.get('*', (req, res) => {
    res.sendFile(demoHtmlPath);
  });

  app.listen(port, () => {
    console.log(`A2A-React-UI demo server running at http://localhost:${port}`);
    console.log('Navigate to this URL in your browser to see the demo.');
  });
}

// Check if the demo is already built
if (fs.existsSync(demoHtmlPath)) {
  console.log('Found pre-built demo. Starting server...');
  startServer();
} else {
  console.log('Demo not built. Building now, this may take a moment...');
  
  const packageRoot = path.join(__dirname, '..');
  const buildCommand = `npx parcel build ${path.join('demo', 'index.html')} --dist-dir ${path.join('demo', 'dist')}`;

  exec(buildCommand, { cwd: packageRoot }, (error, stdout, stderr) => {
    if (error) {
      console.error('--------------------------------------------------');
      console.error('ERROR: Failed to build the demo.');
      console.error('--------------------------------------------------');
      console.error(`exec error: ${error.message}`);
      if (stdout) {
        console.log('--- STDOUT ---');
        console.log(stdout);
      }
      if (stderr) {
        console.error('--- STDERR ---');
        console.error(stderr);
      }
      console.error('--------------------------------------------------');
      console.error('Please try running the build manually inside the package directory.');
      return;
    }
    console.log('Demo built successfully!');
    startServer();
  });
}
