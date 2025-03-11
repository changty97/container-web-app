const express = require('express');
// const bodyParser = require('body-parser');
// const connection = require('./connection');
const session = require('express-session');
// const index = require('./src/index');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;
let id = 0;

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
  // res.render('pages/navbar', {loggedin: false})
  res.render('pages/index');
});

app.get('/home', (req, res) => {
  console.log(id)
	// If the user is loggedin
	if (req.session.loggedin && id > 0) {
    // res.render('pages/navbar', {loggedin: true})
    // res.render('pages/home')
    
    connection.query('SELECT * FROM quotes where user_id = ? ORDER BY date_time DESC', id, function(err, results) {
      if (err) throw err;

      if (results.length > 0) {
        obj = {print: results};
        res.render('pages/home', obj); 
      }

      res.end();
    });
    
	} else {
		// Not logged in
    // res.render('pages/navbar', {loggedin: false})
    res.render('pages/index');
	}
});

app.post('/submit', (req, res) => {
  let quote = req.body.quote;
  let author = req.body.author;

  if (quote && author) {
		connection.query("INSERT INTO quotes (user_id, quote, author) VALUES (?, ?, ?)", [id, quote, author], function(err, result){
      if (err) {
        res.status(500).send('Error inserting data');
        throw err;
      } else {
          res.status(201).send('Item created successfully');
          res.render('pages/home'); 
      }
			res.end();
		});
	} else {
		res.send('Please enter a Quote and Author!');
		res.end();
	}
});

app.post('/delete', (req, res) => {
  let quote = req.body.quote;
  let author = req.body.author;
  console.log(req.body)
  // if (quote && author) {
	// 	connection.query("DELETE FROM quotes WHERE user_id = ? AND quote = ? AND author = ?", [req.body], function(err, result){
  //     if (err) throw err;
  //     res.render('pages/home'); 
	// 		res.end();
	// 	});
	// }
});

app.get('/update', (req, res) => {
  // let quote = req.body.quote;
  // let author = req.body.author;
  console.log("UPdating")
  // if (quote && author) {
	// 	connection.query("UPDATE quotes SET quote = ?, author = ? WHERE user_id = ?", [quote, author, id], function(err, result){
  //     if (err) throw err;
  //     res.render('pages/home'); 
	// 		res.end();
	// 	});
	// } else {
	// 	res.send('Please enter a Quote and Author!');
	// 	res.end();
	// }
});

app.post('/auth', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

  if (username && password) {
    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {

      if (error) throw error;

      if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
        id = results[0].id;
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