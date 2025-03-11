const express = require('express');
// const bodyParser = require('body-parser');
// const connection = require('./connection');
const session = require('express-session');
// const index = require('./src/index');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
  
});

app.set('view engine', 'ejs');

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/home', (req, res) => {
	// If the user is loggedin
	if (req.session.loggedin) {
		// Output username
		// response.send('Welcome back, ' + request.session.username + '!');
    res.render('pages/home')
	} else {
		// Not logged in
		res.send('Please login to view this page!');
	}
	res.end();
});

app.post('/auth', (req, res) => {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				req.session.loggedin = true;
				req.session.username = username;
				// Redirect to home page
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get("/login", function (req, res) {
  res.render('pages/login');
});

app.get("/create", function (req, res) {
  res.render('pages/create');
});

app.listen(port, () => {
  console.log(`Server listening on port ${path.join(__dirname + '/public/home.html')}`);
});