#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const demoDistPath = path.join(__dirname, '..', 'demo', 'dist');
const demoHtmlPath = path.join(demoDistPath, 'index.html');

if (!fs.existsSync(demoHtmlPath)) {
  console.error('--------------------------------------------------');
  console.error('ERROR: Demo files not found.');
  console.error('--------------------------------------------------');
  console.error('To run the demo, you must first build it.');
  console.error('From within the a2a-react-ui package directory, run:');
  console.error('\n  npm install');
  console.error('  npm run build:demo\n');
  console.error(`Then, you can start the demo server by running:`);
  console.error('\n  npx a2a-react-ui-demo\n');
  process.exit(1);
}

app.use(express.static(demoDistPath));

app.get('*', (req, res) => {
  res.sendFile(demoHtmlPath);
});

app.listen(port, () => {
  console.log(`A2A-React-UI demo server running at http://localhost:${port}`);
  console.log('Navigate to this URL in your browser to see the demo.');
});
