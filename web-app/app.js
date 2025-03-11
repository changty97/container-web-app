const express = require("express");
const session = require("express-session");
const dotenv = require('dotenv');
const rateLimit = require("express-rate-limit");
const mysql = require("mysql");
const path = require("path");
const app = express();
const port = 3000;

// Set global id per user
let id = 0;

// Set up rate limiter: maximum of 1 requests per 1 minutes per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 1, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
  message: "Too many requests from this IP, please try again after 1 minutes",
});

app.use("/submit", limiter);

// import ENV configuration
dotenv.config();

// Connect to MySQL Database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

// Default Landing page
app.get("/", (req, res) => {
  res.render("pages/index");
});

// Logged In User Page
app.get("/home", (req, res) => {
  // If the user is loggedin
  if (req.session.loggedin && id > 0) {
    connection.query(
      "SELECT * FROM quotes where user_id = ? ORDER BY date_time DESC",
      id,
      function (err, results) {
        if (err) throw err;

        if (results.length > 0) {
          obj = { print: results };
          res.render("pages/home", obj);
        }

        res.end();
      },
    );
  } else {
    // Not logged in
    res.render("pages/index");
  }
});

app.post("/submit", (req, res) => {
  let quote = req.body.quote;
  let author = req.body.author;
  if (quote && author) {
    connection.query(
      "INSERT INTO quotes (user_id, quote, author) VALUES (?, ?, ?)",
      [id, quote, author],
      function (err, result) {
        if (err) {
          res.status(500).send("Error inserting data");
          throw err;
        } else {
          res.status(201).send("Item created successfully");
        }
        res.end();
      },
    );
  } else {
    res.send("Please enter a Quote and Author!");
    res.end();
  }
});

app.post("/delete/:id/:quote/:author", (req, res) => {
  let id = req.params.id;
  let quote = req.params.quote.toString();
  let author = req.params.author.toString();
  if (id && quote && author) {
    connection.query(
      "DELETE FROM quotes WHERE id=? AND quote=? AND author=?",
      [id, quote, author],
      function (err, results) {
        if (err) {
          res.status(500).send("Error deleting data");
          throw err;
        } else {
          res.status(201).send("Item deleted successfully");
        }
        res.end();
      },
    );
  }
});

app.post("/update/:id", (req, res) => {
  let uid = req.params.id;
  let quote = req.body.quote;
  let author = req.body.author;
  if (uid && quote && author) {
    connection.query(
      "UPDATE quotes SET quote=?, author=? WHERE id=? AND user_id=?",
      [quote, author, uid, id],
      function (err, results) {
        if (err) {
          res.status(500).send("Error updating data");
          throw err;
        } else {
          res.status(201).send("Item updated successfully");
        }
        res.end();
      },
    );
  }
});

app.post("/auth", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
          id = results[0].id;
          // Redirect to home page
          res.redirect("/home");
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      },
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

app.get("/login", function (req, res) {
  res.render("pages/login");
});

app.get("/create", function (req, res) {
  res.render("pages/create");
});

app.listen(port, () => {
  console.log(
    `Server listening on port ${port}`,
  );
});
