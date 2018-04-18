var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.end("Hello!");
});

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username:req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL]
  console.log(longURL)
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase,
    username:req.cookies["username"]
  }

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  addHTTP(req.body.longURL, req.params.id)
  res.redirect('/urls/');
});

app.post("/urls", (req, res) => {
  let short = generateRandomString(6);
  while(urlDatabase.hasOwnProperty(short) === true){
    short = generateRandomString(6);
    console.log(`key already exsisted. generating new key ${short}`);
  }
  addHTTP(req.body.longURL, short)
  res.send(`${short} ${req.body.longURL}`);
});

app.post("/urls/:id/delete",(req, res) =>{
  console.log(req.params.id)
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) =>{
  res.cookie('username', req.body.username)
  res.redirect('/urls')
});

app.post("/logout", (req, res) =>{
  res.clearCookie('username', req.body.username)
  res.redirect('/urls')
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
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