const express = require('express')
var cookieSession = require('cookie-session')

const app = express()
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function addHTTP(url, shortURL, myID) {
  if (url.includes(`http`) == true) {
    return urlDatabase[shortURL] = {
      url: url,
      id: myID
    };

  }
  url = "http://" + url;
  return urlDatabase[shortURL] = {
    url: url,
    id: myID
  };
}

function RegenIDIfSame(Database, myGenID, value) {
  while (Database.hasOwnProperty(myGenID) === true) {
    myGenID = generateRandomString(value);
    console.log(`key already exsisted. generating new key ${myGenID}`);
  }
}
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    id: "user2RandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    id: "user2RandomID"
  }
};

const users = {
  "userRandomID": {

    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "123123",
    password: "123"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: JSON.stringify(users[req.session.user_id]),
    id: req.session.user_id
  };
  console.log(req.session.user_id)
  console.log(urlDatabase)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: JSON.stringify(users[req.session.user_id])
  };
  res.render("urls_new", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].url);
});

app.get("/urls/:id", (req, res) => {
  if (users[req.session.user_id]) {;
    let templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase,
      username: JSON.stringify(users[req.session.user_id].email),
      id: req.session.user_id
    }
    res.render("urls_show", templateVars);
    return;
  }
  res.redirect("/register");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls/:id", (req, res) => {
  if (users[req.session.user_id]) {
    addHTTP(req.body.longURL, req.params.id, users[req.session.user_id].id);
    res.redirect('/urls/');
    return;
  }
  res.redirect("/register");
});

app.post("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    let short = generateRandomString(6);
    RegenIDIfSame(urlDatabase, short, 6)
    let newHTTP = addHTTP(req.body.longURL, short, users[req.session.user_id].id);
    urlDatabase[short] = {
      url: newHTTP.url,
      id: req.session.user_id
    };
    res.redirect('/urls/');
    return;
  }
  res.redirect("/register")
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].id === req.session.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
  res.send('You are not the creator of this link')
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let myID = generateRandomString(6);
  let myEmail = req.body.email;
  let myPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(myPassword, 10);

  for (databaseID in users) {
    if (users[databaseID].email === myEmail) {
      res.status(400);
      res.send('Email already in use.')
      return;
    }
  }

  RegenIDIfSame(users, myID, 6)
  users[myID] = {
    id: myID,
    email: myEmail,
    password: hashedPassword
  }

  if (!myPassword || !myEmail) {
    res.status(400);
    res.send('Email and Password is required.');
    return;
  }
  req.session.user_id = myID;
  res.redirect('/urls');

});

app.post("/login", (req, res) => {
  let myEmail = req.body.email;
  let myPassword = req.body.password;
  for (databaseID in users) {
    let databaseEmail = users[databaseID].email
    let databasePassword = users[databaseID].password
    if ((databaseEmail == myEmail) &&
      (bcrypt.compareSync(myPassword, databasePassword))) {
      req.session.user_id = databaseID;
      res.redirect('/urls');
      return;
    }
  }
  res.status(400);
  res.send('Email and/or Password is incorrect.');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
