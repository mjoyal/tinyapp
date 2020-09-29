const express = require('express'); 
const app = express(); 
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 
const generateRandomString = function () {
  let random = ''; 
  const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  for(let i = 0; i < 6; i++) {
    random += options.charAt(Math.floor(Math.random() * options.length)); 
  }
  return random; 
}; 

app.set("view engine", "ejs"); 

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//render urls_new.ejs - show a POST form with one input (for the long URL) and button
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// render urls_index - show a table of all the long & short URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('./urls_index', templateVars); 
});

// render urls_short - a page with the individual tiny URL id and corresponding long URL, the tiny URL id is a link to the long URL site
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}; 
  res.render('./urls_short', templateVars); 
});

// calls generateRandomString() to make a short URL, adds the short URL as a key to the urlDatabase 
// (uses body parser to make the info into object)
// posts the form information from urls/new (urls_new) to the /urls (urls_index)

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`);
});

// tells the server to redirect to the long URL when routed to /u/:shortURL (link setup in urls_short)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; 
  res.redirect(longURL);
});

// asks the server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
}); 