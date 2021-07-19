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
