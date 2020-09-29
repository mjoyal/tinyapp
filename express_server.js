const express = require('express'); 
const app = express(); 
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}; 

app.set("view engine", "ejs"); 


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(templateVars); 
  res.render('./urls_index', templateVars); 
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}; 
  console.log(templateVars); 
  res.render('./urls_short', templateVars); 
});

app.post('/urls', (req, res) => {
  console.log(req.body); 
  res.send('OK'); 
});

function generateRandomString () {
  let random = ''; 
  const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  for(let i = 0; i < 6; i++) {
    random += options.charAt(Math.floor(Math.random() * options.length)); 
  }
  return random; 
}; 

console.log(generateRandomString()); 


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); 
}); 