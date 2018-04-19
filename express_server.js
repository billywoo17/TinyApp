const express = require('express')
const cookieParser = require('cookie-parser')

const app = express()
app.use(cookieParser())
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function addHTTP(url, shortURL){
  if(url.includes(`http`) === true){
    return urlDatabase[shortURL] = url;

  } else{
    url = "http://" + url;
    return urlDatabase[shortURL] = url;
  }
}

function RegenIDIfSame(Database, myGenID, value){
  while(Database.hasOwnProperty(myGenID) === true){
    myGenID = generateRandomString(value);
    console.log(`key already exsisted. generating new key ${myGenID}`);
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    username:JSON.stringify(users[req.cookies['user_id']])
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase,
    username:JSON.stringify(users[req.cookies['user_id']])
  }

  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) =>{
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls/:id", (req, res) => {
  addHTTP(req.body.longURL, req.params.id);
  res.redirect('/urls/');
});

app.post("/urls", (req, res) => {
  let short = generateRandomString(6);
  RegenIDIfSame(urlDatabase, short, 6)
  addHTTP(req.body.longURL, short);
  res.send(`${short} ${req.body.longURL}`);
});

app.post("/urls/:id/delete",(req, res) =>{
  console.log(req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.post("/logout", (req, res) =>{
  res.clearCookie('user_id', req.body.username);
  res.redirect('/urls');
});

app.post("/register", (req, res) =>{
  let myID = generateRandomString(6);
  let myEmail = req.body.email;
  let myPassword = req.body.password;

  for(databaseID in users){
    if(users[databaseID].email === myEmail){
      res.status(400);
      res.send('Email already in use.')
    }
  }

  RegenIDIfSame(users, myID, 6)
    users[myID] = {
    id:myID,
    email: myEmail,
    password: myPassword
  }

  if(!myPassword || !myEmail){
    res.status(400);
    res.send('Email and Password is required.');
  } else{

  res.cookie('user_id', myID);
  res.redirect('/urls');
  }
});


app.post("/login", (req, res) =>{
  let myEmail = req.body.email;
  let myPassword = req.body.password;
  for(databaseID in users){

    let databaseEmail = users[databaseID].email
    let databasePassword = users[databaseID].password
    console.log("Compare: ",databaseEmail, myEmail)
    console.log("Compare: ", databasePassword,myPassword)
    console.log(databaseID)
    if((databaseEmail == myEmail) &&(databasePassword == myPassword)){
      console.log('my if statement works')
      res.cookie('user_id', databaseID);
      res.redirect('/urls');
    // } else{
    //   res.status(400);
    //   res.send('Incorrect Email or Password')
    }
  }
  res.status(400);
  res.send('Email and/or Password is incorrect.');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});