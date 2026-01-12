const express = require("express");
const session = require("cookie-session");
const dotenv = require("dotenv");
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
  port: process.env.DB_PORT,
});

app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
    }
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

        obj = { print: results };
        res.render("pages/home", obj);
        res.end();
      },
    );
  } else {
    // Not logged in
    res.render("pages/index");
  }
});

app.post("/submit", (req, res) => {
  const quote = req.body.quote;
  const author = req.body.author;

  if (!quote || !author) {
    return res.status(400).json({ error: 'Quote and Author are required' });
  }

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
});

app.post("/delete/:id/:quote/:author", (req, res) => {
  const id = req.params.id;
  const quote = req.params.quote.toString();
  const author = req.params.author.toString();
  
  if (!id || !quote || !author) {
    return res.status(400).json({ error: 'ID, Quote, Author are required' });
  }

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
});

app.post("/update/:id", (req, res) => {
  const uid = req.params.id;
  const quote = req.body.quote;
  const author = req.body.author;

  if (!uid || !quote || !author) {
    return res.status(400).json({ error: 'UID, Quote, Author are required' });
  }

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
});

app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

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
});

app.get("/login", function (req, res) {
  res.render("pages/login");
});

app.get('/logout', (req, res) => {
  if (req.session) {
    req.session = null
    res.redirect('/');
  } else {
    res.end()
  }
});

app.get("/create", function (req, res) {
  res.render("pages/create");
});

function checkUserExists(email, username, callback) {
  const query = 'SELECT * FROM accounts WHERE email=? OR username=?';
  connection.query(query, [email, username], (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (results.length > 0) {
      callback(null, true); // User exists
    } else {
      callback(null, false); // User does not exist
    }
  });
}

app.post("/new_user", function (req, res) {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  checkUserExists(email, username, (err, userExists) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (userExists) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const insertQuery = "INSERT INTO accounts (email, username, password) VALUES (?, ?, ?)";
    connection.query(insertQuery, [email, username, password], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      req.session.loggedin = true;
      req.session.username = username;
      id = results.insertId;
      // Redirect to home page
      res.redirect("/home");
    });
  });
});

app.listen(port, () => {
  console.log(
    `Server listening on port ${port}`,
  );
});
