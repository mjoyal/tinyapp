const express = require('express'); 
const app = express(); 
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser'); 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); 
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com", 
  "DZtoes": "http://www.facebook.com", 
}; 

const generateRandomString = function () {
  let random = ''; 
  const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  for(let i = 0; i < 6; i++) {
    random += options.charAt(Math.floor(Math.random() * options.length)); 
  }
  return random; 
}; 


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//render urls_new.ejs - show a POST form with one input (for the long URL) and button
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies['username']};
  res.render("urls_new", templateVars);
});

// render urls_index - show a table of all the long & short URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username']};
  res.render('./urls_index', templateVars); 
});

// allows users to logout (clears username cookie)
app.post('/urls/login', (req, res) => {
  const username = res.cookie('username', req.body.username); 
  res.redirect(`/urls/`);
}); 

// allows users to setup a username 
app.post('/urls/logout', (req, res) => {
  res.clearCookie('username'); 
  res.redirect(`/urls/`);
}); 



// render urls_short - a page with the individual tiny URL id and corresponding long URL, the tiny URL id is a link to the long URL site
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username']}; 
  res.render('./urls_show', templateVars); 
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

// Deletes individual shortURL/longURL pair from urlDatabase, redirects to /urls to show updates. 
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL; 
  delete urlDatabase[shortURL]
  res.redirect(`/urls/`);
});

// allow users to edit their longURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL; 
  const newlongURL = req.body.editedURL; 
  urlDatabase[shortURL] = newlongURL; 
  res.redirect(`/urls/`);
});



// asks the server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
}); 