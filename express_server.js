// outside requirements
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// helper functions
const {getUserByEmail, generateRandomString, urlsForUser} = require('./helpers');

// setup
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  keys: [
    'supersecretsecret', 'anotherreallylongrandomstring', 'knockknockwhosthereshhhitsasecret'
  ]
}));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "idk768": {longURL: "http://www.google.com", userID: "DZtoes"},
};

const users = {
  'DZtoes': {
    id: 'DZtoes',
    email: 'mackenzie.joyal@gmail.com',
    password: bcrypt.hashSync('SOS', 10),
  },
};

const errors = {
}; 

//render urls_new.ejs - show a POST form with one input (for the long URL) and button
app.get("/urls/new", (req, res) => {

  if (req.session.userID === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = {user: users[req.session.userID]};
    res.render("urls_new", templateVars);
  }

});

// render urls_index - show a table of all the long & short URLS
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  if(!userID) {
    res.redirect(`/login`);
    return; 
  }
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLs, user: users[req.session.userID]};
  res.render('./urls_index', templateVars);
});

app.get("/register", (req, res) => {
  if(req.session.userID) {
    res.redirect(`/urls/`);
    return; 
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('./urls_registration', templateVars);
});

// register for app
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    const templateVars = {user: users[req.session.userID], message: "Please enter valid email or password"};
    res.status('400')
    res.render('./urls_error', templateVars); 
    return;
  }  else if (getUserByEmail(req.body.email, users)) {
    const templateVars = {user: users[req.session.userID], message: "Email already exists"};
    res.status('400')
    res.render('./urls_error', templateVars); 
    return;
  }
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.userID = userID;
  users[userID] = newUser;
  console.log(newUser); 
  res.redirect(`/urls/`);
});

app.get("/login", (req, res) => {
  if(req.session.userID) {
    res.redirect(`/urls/`);
    return; 
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('./urls_login', templateVars);
});

// authenticates user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const givenPassword = req.body.password;
  const userID = getUserByEmail(email, users);
  if (userID) {
    const hashedPassword = users[userID].password;
    const passwordValidated = bcrypt.compareSync(givenPassword, hashedPassword);
    if (passwordValidated) {
      req.session.userID = userID;
      res.redirect(`/urls/`);
    } else {
      const templateVars = {user: users[req.session.userID], message: "Incorrect password!"};
      res.status('400');
      res.render('./urls_error', templateVars); 
    }
  } else {
    const templateVars = {user: users[req.session.userID], message: "Email not found, please register for a new account."};
    res.status('403');
    res.render('./urls_error', templateVars); 
  }
  
});

// allows users to logout (clears userIDcookie)
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls/`);
});

// render urls_short - a page with the individual tiny URL id and corresponding long URL, the tiny URL id is a link to the long URL site
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userID]};
  res.render('./urls_show', templateVars);
});

// calls generateRandomString() to make a short URL, adds the short URL as a key to the urlDatabase
// posts the form information from urls/new (urls_new) to the /urls (urls_index)

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.userID};
  res.redirect(`/urls/${shortURL}`);
});

// tells the server to redirect to the long URL when routed to /u/:shortURL (link setup in urls_short)
app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL] === undefined) {
    const templateVars = {user: users[req.session.userID], message: "Short URL does not exist."};
    res.status('403');
    res.render('./urls_error', templateVars); 
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Deletes individual shortURL/longURL pair from urlDatabase, redirects to /urls to show updates.
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  if (userURLs[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  } else {
    const templateVars = {user: users[req.session.userID], message: "Cannot delete this short URL, belongs to another user."};
    res.status('403');
    res.render('./urls_error', templateVars); 
  }
});

// allow users to edit their longURL
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  if (userURLs[shortURL]) {
    const newlongURL = req.body.editedURL;
    urlDatabase[shortURL].longURL = newlongURL;
    res.redirect(`/urls/`);
  } else {
    const templateVars = {user: users[req.session.userID], message: "Cannot edit this short URL, belongs to another user."};
    res.status('403');
    res.render('./urls_error', templateVars); 
  }
  
});

// asks the server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});