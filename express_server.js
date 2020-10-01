const express = require('express'); 
const app = express(); 
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser'); 
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); 
app.use(cookieParser());

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

const generateRandomString = function () {
  let random = ''; 
  const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  for(let i = 0; i < 6; i++) {
    random += options.charAt(Math.floor(Math.random() * options.length)); 
  }
  return random; 
}; 

const checkEmail = function (emailToCheck) {
  if (Object.keys(users).length === 0){
    return false; 
  }
  for(const user in users) {
    if(users[user].email === emailToCheck) { 
      return user; 
    }
  }
    return false; 
}

// const checkPassword = function (userid, passwordInput) {
//   if(users[userid].password === passwordInput) {
//     return true; 
//   }
//   return false; 
// }; 

const urlsForUser = (currentUserID, database) =>  {
  const userURLs = {}; 
  for(const url in database) {
    if(database[url].userID === currentUserID) {
      userURLs[url] = database[url].longURL; 
    }
  }
  return userURLs;
}; 


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//render urls_new.ejs - show a POST form with one input (for the long URL) and button
app.get("/urls/new", (req, res) => {

  if(req.cookies['user_id'] === undefined) { 
    res.redirect("/login"); 
  } else {
    const templateVars = {user: users[req.cookies['user_id']]};
    res.render("urls_new", templateVars);
  }

});

// render urls_index - show a table of all the long & short URLS
app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id']; 
  const userURLs = urlsForUser(userID, urlDatabase); 
  const templateVars = { urls: userURLs, user: users[req.cookies['user_id']]};
  res.render('./urls_index', templateVars); 
});

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('./urls_registration', templateVars); 
});

// register for app 
app.post("/register", (req, res) => {
  if(req.body.email === '' || req.body.password === '') {
    res.status('400').json({message: 'Please enter valid email or password'});
    return; 
  }  else if (checkEmail(req.body.email)) {
    res.status('400').json({message: 'Email already exists'});; 
    return; 
  }
  const id = generateRandomString(); 
  const newUser = {
    id, 
    email: req.body.email, 
    password: bcrypt.hashSync(req.body.password, 10),
  }
  res.cookie('user_id', id);
  users[id] = newUser; 
  console.log('users object', users); 
  res.redirect(`/urls/`);
});

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('./urls_login', templateVars); 
});

// authenticates user 
app.post('/login', (req, res) => {
  const email = req.body.email; 
  const givenPassword = req.body.password; 
  const userID = checkEmail(email); 
  const hashedPassword = users[userID].password; 
  const passwordValidated = bcrypt.compareSync(givenPassword, hashedPassword);
  if(userID) {
    if(passwordValidated) {
      res.cookie('user_id', checkEmail(email)); 
      res.redirect(`/urls/`);
    } else {
      res.status('400').json({message: 'Incorrect password!'})
    }
  } else {
    res.status('403').json({message: 'Email cannot be found'});
  }
  
}); 

// allows users to logout (clears user_id cookie)
app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); 
  res.redirect(`/urls/`);
}); 

// render urls_short - a page with the individual tiny URL id and corresponding long URL, the tiny URL id is a link to the long URL site
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies['user_id']]}; 
  res.render('./urls_show', templateVars); 
});

// calls generateRandomString() to make a short URL, adds the short URL as a key to the urlDatabase 
// (uses body parser to make the info into object)
// posts the form information from urls/new (urls_new) to the /urls (urls_index)

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString(); 
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies['user_id']}; 
  res.redirect(`/urls/${shortURL}`);
});



// tells the server to redirect to the long URL when routed to /u/:shortURL (link setup in urls_short)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; 
  res.redirect(longURL);
});

// Deletes individual shortURL/longURL pair from urlDatabase, redirects to /urls to show updates. 
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.cookies['user_id']; 
  const userURLs = urlsForUser(userID, urlDatabase); 
  const shortURL = req.params.shortURL; 
  if(userURLs[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  } else {
    res.status('403').json({message: 'Cannot delete this short URL, belongs to another user'});
  }
});

// allow users to edit their longURL
app.post('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_id']; 
  const userURLs = urlsForUser(userID, urlDatabase); 
  const shortURL = req.params.shortURL; 
  if(userURLs[shortURL]) {
    const newlongURL = req.body.editedURL; 
    urlDatabase[shortURL].longURL = newlongURL; 
    res.redirect(`/urls/`);
  } else {
    res.status('403').json({message: 'Cannot edit this short URL, belongs to another user'});
  }
  
});



// asks the server to listen for requests
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
}); 