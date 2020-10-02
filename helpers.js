const getUserByEmail = function(emailToCheck, database) {
  if (Object.keys(database).length === 0) {
    return undefined;
  }
  for (const user in database) {
    if (database[user].email === emailToCheck) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = function() {
  let random = '';
  const options = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    random += options.charAt(Math.floor(Math.random() * options.length));
  }
  return random;
};

const urlsForUser = (currentUserID, database) =>  {
  const userURLs = {};
  for (const url in database) {
    if (database[url].userID === currentUserID) {
      userURLs[url] = database[url].longURL;
    }
  }
  return userURLs;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};