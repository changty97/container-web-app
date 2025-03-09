const express = require('express');
// const bodyParser = require('body-parser');
// const connection = require('./connection');
// const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  // res.send('Hello, World!');
  res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${path.join(__dirname + '/public/login.html')}`);
});