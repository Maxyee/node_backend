# Redis Cache With Node

- At first we need to install Linuxbrew for linux OS
- Follow this website for installing https://www.how2shout.com/linux/how-to-install-brew-ubuntu-20-04-lts-linux/
- we have to run some command which will install Linux

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

brew doctor

```

- after installing homebrew, we can install the redis.

```bash
brew install redis
```

- Now for Commandline interface just type

```bash
redis-cli
redis-server
```

- Lets write code for redis in node.

- Initialize the npm `package.json` file

- then install some packages in it

```bash
npm install express node-fetch redis
```

- made the gitignore file

- need to install nodemon deb dependencies

```bash
npm i -D nodemon
```

- rewrite the scripts from `package.json` file

```json
"scripts": {
    "start": "nodemon index"
  },
```

- Now we have to write some code in `index.js` file

```js
const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);
const app = express();

// Make request to github for request data.
async function getRepos(req, res, next) {
  try {
    console.log("Fetching repositories");

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

app.get("/repos/:username", getRepos);

app.listen(5000, () => {
  console.log(`App listening of port ${PORT}`);
});
```

- finised the primary stage.

## Add Redis Code

```js
// index.js
const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

// Set response
function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

// Make request to Github for data
async function getRepos(req, res, next) {
  try {
    console.log("Fetching Data...");

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);

    const data = await response.json();

    const repos = data.public_repos;

    // Set data to Redis
    client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  const { username } = req.params;

  client.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get("/repos/:username", cache, getRepos);

app.listen(5000, () => {
  console.log(`App listening on port ${PORT}`);
});
```

- Finally check the response time from google chrome network section

- When we put middleware `cache` in request api. we see that it took less time.

- on the other hand, if we don't use the `cache` middleware it took a lot's of time.
